import express from 'express';
import { z } from 'zod';
import { Resend } from 'resend';

import { prisma } from '../prisma';

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth';

import {
  createAppointmentSchema,
} from '../validations/appointment';

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================================
// CONSTANTS
// =====================================================

class AppointmentSlotUnavailableError extends Error {
  constructor() {
    super('This appointment slot is no longer available. Please select another time.');
    this.name = 'AppointmentSlotUnavailableError';
  }
}

const appointmentStatuses = [
  'CONFIRMED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const appointmentStatusSchema = z.object({
  status: z.enum(appointmentStatuses),
});

const appointmentListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  status: z
    .enum(appointmentStatuses)
    .optional(),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateConfirmationNumber(): string {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  const randomLetters = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `SER-${randomNumber}-${randomLetters}`;
}

async function getChicagoNow(): Promise<{
  date: string;
  minutes: number;
}> {
  // Use PostgreSQL's clock as the source of truth instead of the
  // patient's browser/server OS clock. This prevents an incorrect
  // device clock from marking valid Chicago slots as past.
  const rows = await prisma.$queryRaw<Array<{
    chicago_date: string;
    chicago_hour: number;
    chicago_minute: number;
  }>>`
    SELECT
      TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago', 'YYYY-MM-DD') AS chicago_date,
      EXTRACT(HOUR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago'))::int AS chicago_hour,
      EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago'))::int AS chicago_minute
  `;

  const now = rows[0];

  if (!now) {
    throw new Error('Unable to determine current Chicago time from database');
  }

  return {
    date: now.chicago_date,
    minutes: now.chicago_hour * 60 + now.chicago_minute,
  };
}

function timeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return -1;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour === 12) {
    hour = 0;
  }

  if (period === 'PM') {
    hour += 12;
  }

  return hour * 60 + minute;
}

async function isPastChicagoSlot(
  appointmentDate: string,
  appointmentTime: string
): Promise<boolean> {
  const chicagoNow = await getChicagoNow();

  if (appointmentDate < chicagoNow.date) {
    return true;
  }

  if (appointmentDate > chicagoNow.date) {
    return false;
  }

  const slotMinutes = timeToMinutes(appointmentTime);
  return slotMinutes >= 0 && slotMinutes <= chicagoNow.minutes;
}

// =====================================================
// CREATE APPOINTMENT
// POST /api/appointments
// =====================================================

router.post('/', async (req, res) => {
  try {
    // =================================================
    // 1. VALIDATE REQUEST BODY
    // =================================================

    const validation =
      createAppointmentSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment data',
        errors: validation.error.issues,
      });
    }

    const data = validation.data;

    // A patient must never be able to book a slot that has
    // already passed in the laboratory's Chicago timezone.
    if (await isPastChicagoSlot(data.appointmentDate, data.appointmentTime)) {
      return res.status(409).json({
        success: false,
        message: 'This appointment time has already passed in Chicago. Please select another time.',
      });
    }

    // =================================================
    // 2. CHECK LOCATION
    // =================================================

    const location =
      await prisma.location.findUnique({
        where: {
          id: data.locationId,
        },
      });

    if (!location || !location.active) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive location',
      });
    }

    // =================================================
    // 3. VALIDATE SELECTED TESTS AND PACKAGES
    // =================================================

    for (
      const selectedItem of data.selectedTests
    ) {
      if (selectedItem.type === 'test') {
        const test =
          await prisma.labTest.findUnique({
            where: {
              id: selectedItem.id,
            },
          });

        if (!test || !test.active) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid or inactive test: ${selectedItem.id}`,
          });
        }
      }

      if (selectedItem.type === 'package') {
        const labPackage =
          await prisma.labPackage.findUnique({
            where: {
              id: selectedItem.id,
            },
          });

        if (
          !labPackage ||
          !labPackage.active
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid or inactive package: ${selectedItem.id}`,
          });
        }
      }
    }

    // =================================================
    // 4. RESERVE SLOT AND CREATE APPOINTMENT
    // =================================================

    const appointmentDate = new Date(
      data.appointmentDate
    );

    const appointment =
      await prisma.$transaction(async (tx) => {
        // PostgreSQL transaction-level advisory locks make the
        // slot check atomic for concurrent booking requests.
        // The lock is released automatically when this transaction
        // commits or rolls back.
        const slotLockKey = [
          data.locationId,
          data.appointmentDate,
          data.appointmentTime,
        ].join('|');

        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtextextended(${slotLockKey}, 0)
          )
        `;

        // A cancelled appointment does not reserve the slot.
        const existingSlot =
          await tx.appointment.findFirst({
            where: {
              locationId: data.locationId,
              appointmentDate,
              appointmentTime: data.appointmentTime,
              status: {
                not: 'CANCELLED',
              },
            },
            select: {
              id: true,
            },
          });

        if (existingSlot) {
          throw new AppointmentSlotUnavailableError();
        }

        // Generate the confirmation number inside the same
        // transaction as the appointment creation.
        let confirmationNumber =
          generateConfirmationNumber();

        let existingAppointment =
          await tx.appointment.findUnique({
            where: {
              confirmationNumber,
            },
          });

        while (existingAppointment) {
          confirmationNumber =
            generateConfirmationNumber();

          existingAppointment =
            await tx.appointment.findUnique({
              where: {
                confirmationNumber,
              },
            });
        }

        return tx.appointment.create({
          data: {
            confirmationNumber,

            appointmentDate,

            appointmentTime:
              data.appointmentTime,

            firstName: data.firstName,

            lastName: data.lastName,

            dateOfBirth: new Date(
              data.dateOfBirth
            ),

            email: data.email,

            phone: data.phone,

            biologicalSex:
              data.biologicalSex,

            insuranceType:
              data.insuranceType,

            insuranceCarrier:
              data.insuranceCarrier || null,

            hasPhysicianOrder:
              data.hasPhysicianOrder,

            physicianName:
              data.physicianName || null,

            specialAssistance:
              data.specialAssistance,

            notes:
              data.notes || null,

            locationId:
              data.locationId,

            tests: {
              create: await Promise.all(
                data.selectedTests.map(
                  async (selectedItem) => {
                    // ===============================
                    // LAB TEST
                    // ===============================

                    if (
                      selectedItem.type === 'test'
                    ) {
                      const test =
                        await tx.labTest.findUniqueOrThrow(
                          {
                            where: {
                              id: selectedItem.id,
                            },
                          }
                        );

                      return {
                        priceAtBooking:
                          test.price,

                        testId:
                          test.id,
                      };
                    }

                    // ===============================
                    // LAB PACKAGE
                    // ===============================

                    const labPackage =
                      await tx.labPackage.findUniqueOrThrow(
                        {
                          where: {
                            id: selectedItem.id,
                          },
                        }
                      );

                    return {
                      priceAtBooking:
                        labPackage.price,

                      packageId:
                        labPackage.id,
                    };
                  }
                )
              ),
            },
          },

          include: {
            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });
      });

    // =================================================
    // 6. SEND PATIENT APPOINTMENT CONFIRMATION EMAIL
    // =================================================

    // The appointment is already safely stored in Prisma at this point.
    // If the email service fails, we keep the appointment successful and
    // only log the email error. This prevents a temporary email outage
    // from causing a duplicate booking when the patient retries.
    if (appointment.email) {
      try {
        const appointmentDateFormatted = new Date(
          appointment.appointmentDate
        ).toLocaleDateString('en-US', {
          timeZone: 'America/Chicago',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const selectedServices = appointment.tests
          .map((item) => item.test?.name || item.package?.name || 'Selected service')
          .map((name) => `<li style=\"margin-bottom: 6px;\">${escapeHtml(name)}</li>`)
          .join('');

        const { data: emailData, error: emailError } =
          await resend.emails.send({
            from: 'Serine Diagnostics <admin@serinediagnostics.com>',
            to: [appointment.email],
            subject: `Appointment Confirmed - ${appointment.confirmationNumber}`,
            html: `
              <div style=\"font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #263238;\">
                <div style=\"background: #103d4a; padding: 24px; text-align: center;\">
                  <h1 style=\"color: #ffffff; margin: 0; font-size: 24px;\">
                    Serine Diagnostics
                  </h1>
                </div>

                <div style=\"padding: 28px 20px;\">
                  <h2 style=\"color: #103d4a; margin-top: 0;\">
                    Appointment Confirmed ✓
                  </h2>

                  <p>
                    Hello <strong>${escapeHtml(appointment.firstName)}</strong>,
                  </p>

                  <p>
                    Your appointment with Serine Diagnostics has been booked successfully.
                    Please keep the confirmation number below for your records.
                  </p>

                  <div style=\"background: #f4f8f9; border: 1px solid #dce8ea; border-radius: 12px; padding: 20px; margin: 24px 0;\">
                    <p><strong>Confirmation Number:</strong> ${escapeHtml(appointment.confirmationNumber)}</p>
                    <p><strong>Patient:</strong> ${escapeHtml(`${appointment.firstName} ${appointment.lastName}`)}</p>
                    <p><strong>Date:</strong> ${escapeHtml(appointmentDateFormatted)}</p>
                    <p><strong>Time:</strong> ${escapeHtml(appointment.appointmentTime)}</p>
                    <p><strong>Location:</strong> ${escapeHtml(appointment.location?.name || 'Serine Diagnostics')}</p>
                    <p><strong>Status:</strong> ${escapeHtml(appointment.status)}</p>
                  </div>

                  <h3 style=\"color: #103d4a;\">Selected Services</h3>
                  <ul style=\"padding-left: 20px;\">
                    ${selectedServices || '<li>Selected appointment services</li>'}
                  </ul>

                  <p style=\"margin-top: 28px;\">
                    If you need assistance with your appointment, please contact Serine Diagnostics.
                  </p>

                  <p style=\"color: #66838d; font-size: 12px; margin-top: 28px;\">
                    This is an automated appointment confirmation from the Serine Diagnostics website.
                  </p>
                </div>
              </div>
            `,
          });

        if (emailError) {
          console.error('Appointment confirmation email error:', emailError);
        } else {
          console.log(
            'Appointment confirmation email sent:',
            emailData?.id
          );
        }
      } catch (emailError) {
        console.error(
          'Failed to send appointment confirmation email:',
          emailError
        );
      }
    }

    // =================================================
    // 7. RETURN SUCCESS RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        'Appointment created successfully',

      data: appointment,
    });
  } catch (error) {
    if (
      error instanceof AppointmentSlotUnavailableError
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      'Error creating appointment:',
      error
    );

    return res.status(500).json({
      success: false,

      message:
        'Failed to create appointment',
    });
  }
});

// =====================================================
// PUBLIC SLOT AVAILABILITY
// GET /api/appointments/availability
// =====================================================

router.get('/availability', async (req, res) => {
  try {
    const locationId = String(req.query.locationId || '').trim();
    const appointmentDate = String(req.query.appointmentDate || '').trim();

    if (!locationId || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'locationId and appointmentDate are required',
      });
    }

    const [appointments, chicagoNow] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          locationId,
          appointmentDate: new Date(appointmentDate),
          status: {
            not: 'CANCELLED',
          },
        },
        select: {
          appointmentTime: true,
        },
      }),
      getChicagoNow(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bookedTimes: appointments.map(appointment => appointment.appointmentTime),
        chicagoNow,
      },
    });
  } catch (error) {
    console.error('Error fetching appointment availability:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load appointment availability',
    });
  }
});

// =====================================================
// LIST APPOINTMENTS
// GET /api/appointments
// =====================================================

router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'STAFF', 'DOCTOR', 'PROVIDER'),
  async (req, res) => {
    try {
      // ===============================================
      // 1. VALIDATE QUERY PARAMETERS
      // ===============================================

      const validation =
        appointmentListQuerySchema.safeParse(
          req.query
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,

          message:
            'Invalid query parameters',

          errors:
            validation.error.issues,
        });
      }

      // ===============================================
      // 2. EXTRACT QUERY VALUES
      // ===============================================

      const {
        page,
        limit,
        status,
        date,
      } = validation.data;

      // ===============================================
      // 3. CALCULATE PAGINATION
      // ===============================================

      const skip =
        (page - 1) * limit;

      // ===============================================
      // 4. BUILD FILTER
      // ===============================================

      const where =
        req.user?.role === 'PROVIDER'
          ? {
              providerId: req.user.userId,
              ...(status ? { status } : {}),
              ...(date ? { appointmentDate: new Date(date) } : {}),
            }
          : {
              ...(status ? { status } : {}),
              ...(date ? { appointmentDate: new Date(date) } : {}),
            };
      // ===============================================
      // 5. FETCH APPOINTMENTS
      // ===============================================

      const appointments =
        await prisma.appointment.findMany({
          where,

          skip,

          take: limit,

          orderBy: {
            appointmentDate: 'desc',
          },

          include: {
            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      // ===============================================
      // 6. COUNT TOTAL APPOINTMENTS
      // ===============================================

      const total =
        await prisma.appointment.count({
          where,
        });

      // ===============================================
      // 7. CALCULATE PAGINATION
      // ===============================================

      const totalPages =
        Math.ceil(total / limit);

      // ===============================================
      // 8. RETURN RESPONSE
      // ===============================================

      return res.status(200).json({
        success: true,

        data: appointments,

        pagination: {
          page,

          limit,

          total,

          totalPages,

          hasNextPage:
            page < totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        'Error fetching appointments:',
        error
      );

      return res.status(500).json({
        success: false,

        message:
          'Failed to fetch appointments',
      });
    }
  }
);

// =====================================================
// GET SINGLE APPOINTMENT
// GET /api/appointments/:id
// =====================================================

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ===============================================
      // 1. VALIDATE ID
      // ===============================================

      if (!id || id.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'Appointment ID is required',
        });
      }

      // ===============================================
      // 2. FIND APPOINTMENT
      // ===============================================

      const appointment =
        await prisma.appointment.findUnique({
          where: {
            id,
          },

          include: {
            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      // ===============================================
      // 3. HANDLE NOT FOUND
      // ===============================================

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            'Appointment not found',
        });
      }

      // ===============================================
      // 4. RETURN APPOINTMENT
      // ===============================================

      return res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      console.error(
        'Error fetching appointment:',
        error
      );

      return res.status(500).json({
        success: false,

        message:
          'Failed to fetch appointment',
      });
    }
  }
);

// =====================================================
// UPDATE APPOINTMENT STATUS
// PATCH /api/appointments/:id/status
// =====================================================

router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('ADMIN', 'STAFF'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ===============================================
      // 1. VALIDATE REQUEST BODY
      // ===============================================

      const validation =
        appointmentStatusSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,

          message:
            'Invalid appointment status',

          errors:
            validation.error.issues,
        });
      }

      const { status } =
        validation.data;

      // ===============================================
      // 2. CHECK APPOINTMENT EXISTS
      // ===============================================

      const existingAppointment =
        await prisma.appointment.findUnique({
          where: {
            id,
          },
        });

      if (!existingAppointment) {
        return res.status(404).json({
          success: false,

          message:
            'Appointment not found',
        });
      }

      // ===============================================
      // 3. UPDATE STATUS
      // ===============================================

      const appointment =
        await prisma.appointment.update({
          where: {
            id,
          },

          data: {
            status,
          },

          include: {
            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      // ===============================================
      // 4. RETURN RESPONSE
      // ===============================================

      return res.status(200).json({
        success: true,

        message:
          'Appointment status updated successfully',

        data: appointment,
      });
    } catch (error) {
      console.error(
        'Error updating appointment status:',
        error
      );

      return res.status(500).json({
        success: false,

        message:
          'Failed to update appointment status',
      });
    }
  }
);

// =====================================================
// CANCEL APPOINTMENT
// PATCH /api/appointments/:id/cancel
// =====================================================

router.patch(
  '/:id/cancel',
  authenticateToken,
  authorizeRoles('ADMIN', 'STAFF'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ===============================================
      // 1. CHECK APPOINTMENT EXISTS
      // ===============================================

      const existingAppointment =
        await prisma.appointment.findUnique({
          where: {
            id,
          },
        });

      if (!existingAppointment) {
        return res.status(404).json({
          success: false,

          message:
            'Appointment not found',
        });
      }

      // ===============================================
      // 2. CHECK IF ALREADY CANCELLED
      // ===============================================

      if (
        existingAppointment.status ===
        'CANCELLED'
      ) {
        return res.status(400).json({
          success: false,

          message:
            'Appointment is already cancelled',
        });
      }

      // ===============================================
      // 3. UPDATE APPOINTMENT
      // ===============================================

      const appointment =
        await prisma.appointment.update({
          where: {
            id,
          },

          data: {
            status: 'CANCELLED',
          },

          include: {
            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      // ===============================================
      // 4. RETURN RESPONSE
      // ===============================================

      return res.status(200).json({
        success: true,

        message:
          'Appointment cancelled successfully',

        data: appointment,
      });
    } catch (error) {
      console.error(
        'Error cancelling appointment:',
        error
      );

      return res.status(500).json({
        success: false,

        message:
          'Failed to cancel appointment',
      });
    }
  }
);

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default router;