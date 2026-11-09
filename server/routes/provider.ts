import { Router } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';

import { prisma } from '../prisma';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth';

const router = Router();

// ===============================================
// CREATE PROVIDER LAB ORDER
// ===============================================

const createLabOrderSchema = z.object({
  patientFirstName: z.string().min(1),
  patientLastName: z.string().min(1),
  dateOfBirth: z.string(),
  biologicalSex: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  testIds: z.array(z.string()).min(1),
});

router.post(
  '/orders',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      // 1. Validate request
      const validation =
        createLabOrderSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab order data',
          errors: validation.error.issues,
        });
      }

      const {
        patientFirstName,
        patientLastName,
        dateOfBirth,
        biologicalSex,
        email,
        phone,
        notes,
        testIds,
      } = validation.data;

      // 2. Make sure selected tests exist
      const tests = await prisma.labTest.findMany({
        where: {
          id: {
            in: testIds,
          },
          active: true,
        },
      });

      if (tests.length !== testIds.length) {
        return res.status(400).json({
          success: false,
          message:
            'One or more selected tests are invalid',
        });
      }

      // 3. Generate order number
      const orderNumber = `LO-${Date.now()}`;

      // 4. Create order
      const order = await prisma.labOrder.create({
        data: {
          orderNumber,
          providerId: req.user!.userId,
          patientFirstName,
          patientLastName,
          dateOfBirth: new Date(dateOfBirth),
          biologicalSex,
          email: email || null,
          phone: phone || null,
          notes: notes || null,

          tests: {
            create: tests.map((test) => ({
              testId: test.id,
              price: test.price,
              result: {
                create: {
                  resultStatus: 'PENDING',
                  resultValue: null,
                  units: null,
                  referenceRange: null,
                  comments: null,
                },
              },
            })),
          },
        },
        include: {
          tests: {
            include: {
              test: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Lab order created successfully',
        order,
      });
    } catch (error) {
      console.error(
        'Create provider lab order failed:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Failed to create lab order',
      });
    }
  }
);

// ===============================================
// GET ACTIVE PROVIDERS
// ===============================================

router.get(
  '/providers',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (_req, res) => {
    try {
      const providers =
        await prisma.staffUser.findMany({
          where: {
            role: 'DOCTOR',
            active: true,
          },

          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },

          orderBy: {
            firstName: 'asc',
          },
        });

      return res.status(200).json({
        success: true,
        providers,
      });
    } catch (error) {
      console.error(
        'Failed to fetch providers:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch providers',
      });
    }
  }
);

// ===============================================
// ASSIGN PROVIDER TO APPOINTMENT
// ===============================================

const assignProviderSchema = z.object({
  providerId: z.string().min(1),
});

router.patch(
  '/appointments/:id/assign',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const validation =
        assignProviderSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid provider ID',
          errors: validation.error.issues,
        });
      }

      const { providerId } = validation.data;

      // Check appointment
      const appointment =
        await prisma.appointment.findUnique({
          where: { id },
        });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check provider
      const provider =
        await prisma.staffUser.findFirst({
          where: {
            id: providerId,
            role: 'DOCTOR',
            active: true,
          },
        });

      if (!provider) {
        return res.status(400).json({
          success: false,
          message:
            'Provider not found or inactive',
        });
      }

      // Assign provider
      const updatedAppointment =
        await prisma.appointment.update({
          where: { id },

          data: {
            providerId,
          },

          include: {
            provider: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      return res.status(200).json({
        success: true,
        message:
          'Provider assigned successfully',
        data: updatedAppointment,
      });
    } catch (error) {
      console.error(
        'Failed to assign provider:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to assign provider',
      });
    }
  }
);

// ===============================================
// GET MY ORDERS
// ===============================================

router.get(
  '/orders',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const orders =
        await prisma.labOrder.findMany({
          where: {
            providerId: req.user!.userId,
          },

          orderBy: {
            createdAt: 'desc',
          },

          include: {
            tests: {
              include: {
                test: true,
              },
            },
          },
        });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error(
        'Failed to fetch provider orders:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch provider orders',
      });
    }
  }
);

// ===============================================
// DOWNLOAD MY LAB ORDER PDF
// ===============================================

router.get(
  '/orders/:id/pdf',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ===========================================
      // 1. Find order
      // ===========================================

      const order =
        await prisma.labOrder.findFirst({
          where: {
            id,
            providerId: req.user!.userId,
          },

          include: {
            tests: {
              include: {
                test: true,
              },
            },
          },
        });

      // ===========================================
      // 2. Security check
      // ===========================================

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            'Lab order not found or you do not have access to this order',
        });
      }

      // ===========================================
      // 3. Get provider information
      // ===========================================

      const provider =
        await prisma.staffUser.findUnique({
          where: {
            id: req.user!.userId,
          },

          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        });

      // ===========================================
      // 4. PDF response headers
      // ===========================================

      const safeOrderNumber =
        order.orderNumber.replace(
          /[^a-zA-Z0-9-_]/g,
          '_'
        );

      res.setHeader(
        'Content-Type',
        'application/pdf'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Lab-Order-${safeOrderNumber}.pdf"`
      );

      // ===========================================
      // 5. Create PDF
      // ===========================================

      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50,
      });

      doc.pipe(res);

      // ===========================================
      // HEADER
      // ===========================================

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#103d4a')
        .text('Serine Diagnostics');

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#617d86')
        .text('Laboratory Services');

      doc.moveDown(1);

      doc
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .strokeColor('#168d90')
        .stroke();

      doc.moveDown(1.5);

      // ===========================================
      // TITLE
      // ===========================================

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#103d4a')
        .text('LABORATORY ORDER');

      doc.moveDown(0.8);

      // ===========================================
      // ORDER INFORMATION
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Order Information');

      doc.moveDown(0.4);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#496873');

      doc.text(
        `Order Number: ${order.orderNumber}`
      );

      doc.text(
        `Order Date: ${new Date(
          order.createdAt
        ).toLocaleDateString()}`
      );

      if (order.status) {
        doc.text(
          `Status: ${order.status
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )}`
        );
      }

      doc.moveDown(1);

      // ===========================================
      // PROVIDER INFORMATION
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Ordering Provider');

      doc.moveDown(0.4);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#496873');

      doc.text(
        `Dr. ${
          provider
            ? `${provider.firstName} ${provider.lastName}`
            : 'Provider'
        }`
      );

      if (provider?.email) {
        doc.text(
          `Email: ${provider.email}`
        );
      }

      doc.moveDown(1);

      // ===========================================
      // PATIENT INFORMATION
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Patient Information');

      doc.moveDown(0.4);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#496873');

      doc.text(
        `Name: ${order.patientFirstName} ${order.patientLastName}`
      );

      doc.text(
        `Date of Birth: ${new Date(
          order.dateOfBirth
        ).toLocaleDateString()}`
      );

      doc.text(
        `Biological Sex: ${order.biologicalSex}`
      );

      if (order.email) {
        doc.text(
          `Email: ${order.email}`
        );
      }

      if (order.phone) {
        doc.text(
          `Phone: ${order.phone}`
        );
      }

      doc.moveDown(1);

      // ===========================================
      // ORDERED TESTS
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Ordered Laboratory Tests');

      doc.moveDown(0.5);

      if (
        order.tests &&
        order.tests.length > 0
      ) {
        order.tests.forEach(
          (item, index) => {
            const testName =
              item.test?.name ||
              'Laboratory Test';

            const testCode =
              item.test?.code
                ? ` (${item.test.code})`
                : '';

            doc
              .fontSize(10)
              .font('Helvetica')
              .fillColor('#496873')
              .text(
                `${index + 1}. ${testName}${testCode}`
              );
          }
        );
      } else {
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#496873')
          .text('No tests listed');
      }

      // ===========================================
      // NOTES
      // ===========================================

      if (order.notes) {
        doc.moveDown(1);

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#173f4c')
          .text('Clinical / Order Notes');

        doc.moveDown(0.4);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#496873')
          .text(order.notes, {
            width: 500,
          });
      }

      // ===========================================
      // FOOTER
      // ===========================================

      doc.moveDown(2);

      doc
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .strokeColor('#e2eeee')
        .stroke();

      doc.moveDown(0.7);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#7f959d')
        .text(
          'This document is generated by Serine Diagnostics Provider Portal.'
        );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`
      );

      // ===========================================
      // FINISH PDF
      // ===========================================

      doc.end();
    } catch (error) {
      console.error(
        'Failed to generate lab order PDF:',
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            'Failed to generate lab order PDF',
        });
      }
    }
  }
);

// ===============================================
// DOWNLOAD ASSIGNED APPOINTMENT PDF
// ===============================================

router.get(
  '/appointments/:id/pdf',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ===========================================
      // 1. Find appointment
      // ===========================================

      const appointment =
        await prisma.appointment.findFirst({
          where: {
            id,

            // IMPORTANT:
            // Provider can only download
            // appointments assigned to himself.
            providerId: req.user!.userId,
          },

          include: {
            provider: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      // ===========================================
      // 2. Security check
      // ===========================================

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            'Appointment not found or you do not have access to this appointment',
        });
      }

      // ===========================================
      // 3. Safe appointment number
      // ===========================================

      const appointmentNumber =
        appointment.confirmationNumber ||
        `AP-${appointment.id.slice(0, 8)}`;

      const safeAppointmentNumber =
        appointmentNumber.replace(
          /[^a-zA-Z0-9-_]/g,
          '_'
        );

      // ===========================================
      // 4. PDF response headers
      // ===========================================

      res.setHeader(
        'Content-Type',
        'application/pdf'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Appointment-${safeAppointmentNumber}.pdf"`
      );

      // ===========================================
      // 5. Create PDF
      // ===========================================

      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50,
      });

      doc.pipe(res);

      // ===========================================
      // HEADER
      // ===========================================

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#103d4a')
        .text('Serine Diagnostics');

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#617d86')
        .text('Laboratory Services');

      doc.moveDown(1);

      doc
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .strokeColor('#168d90')
        .stroke();

      doc.moveDown(1.5);

      // ===========================================
      // TITLE
      // ===========================================

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#103d4a')
        .text('APPOINTMENT ORDER');

      doc.moveDown(0.8);

      // ===========================================
      // APPOINTMENT INFORMATION
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Appointment Information');

      doc.moveDown(0.4);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#496873');

      doc.text(
        `Confirmation Number: ${appointmentNumber}`
      );

      if (appointment.status) {
        doc.text(
          `Status: ${appointment.status
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )}`
        );
      }

      if (appointment.appointmentDate) {
        const appointmentDate =
          new Date(
            appointment.appointmentDate
          );

        if (
          !Number.isNaN(
            appointmentDate.getTime()
          )
        ) {
          doc.text(
            `Appointment Date: ${appointmentDate.toLocaleDateString()}`
          );
        }
      }

      if (appointment.appointmentTime) {
        doc.text(
          `Appointment Time: ${appointment.appointmentTime}`
        );
      }

      doc.moveDown(1);

      // ===========================================
      // PROVIDER INFORMATION
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Assigned Provider');

      doc.moveDown(0.4);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#496873');

      if (appointment.provider) {
        doc.text(
          `Dr. ${appointment.provider.firstName} ${appointment.provider.lastName}`
        );

        if (appointment.provider.email) {
          doc.text(
            `Email: ${appointment.provider.email}`
          );
        }
      } else {
        doc.text('Provider information unavailable');
      }

      doc.moveDown(1);

      // ===========================================
      // PATIENT INFORMATION
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Patient Information');

      doc.moveDown(0.4);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#496873');

      doc.text(
        `Name: ${appointment.firstName} ${appointment.lastName}`
      );

      if (appointment.dateOfBirth) {
        const dob =
          new Date(
            appointment.dateOfBirth
          );

        if (
          !Number.isNaN(dob.getTime())
        ) {
          doc.text(
            `Date of Birth: ${dob.toLocaleDateString()}`
          );
        }
      }

      if (appointment.email) {
        doc.text(
          `Email: ${appointment.email}`
        );
      }

      if (appointment.phone) {
        doc.text(
          `Phone: ${appointment.phone}`
        );
      }

      doc.moveDown(1);

      // ===========================================
      // LOCATION
      // ===========================================

      if (appointment.location) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#173f4c')
          .text('Appointment Location');

        doc.moveDown(0.4);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#496873');

        const location =
          appointment.location as Record<
            string,
            unknown
          >;

        const locationName =
          typeof location.name === 'string'
            ? location.name
            : typeof location.title ===
                'string'
              ? location.title
              : null;

        const address =
          typeof location.address === 'string'
            ? location.address
            : null;

        const city =
          typeof location.city === 'string'
            ? location.city
            : null;

        const state =
          typeof location.state === 'string'
            ? location.state
            : null;

        const zipCode =
          typeof location.zipCode ===
          'string'
            ? location.zipCode
            : typeof location.zip ===
                'string'
              ? location.zip
              : null;

        if (locationName) {
          doc.text(
            `Location: ${locationName}`
          );
        }

        if (address) {
          doc.text(
            `Address: ${address}`
          );
        }

        const cityStateZip = [
          city,
          state,
          zipCode,
        ]
          .filter(Boolean)
          .join(', ');

        if (cityStateZip) {
          doc.text(cityStateZip);
        }
      }

      doc.moveDown(1);

      // ===========================================
      // ORDERED TESTS
      // ===========================================

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#173f4c')
        .text('Ordered Laboratory Tests');

      doc.moveDown(0.5);

      if (
        appointment.tests &&
        appointment.tests.length > 0
      ) {
        appointment.tests.forEach(
          (item, index) => {
            const testName =
              item.test?.name ||
              item.package?.name ||
              'Laboratory Test';

            const testCode =
              item.test?.code
                ? ` (${item.test.code})`
                : '';

            doc
              .fontSize(10)
              .font('Helvetica')
              .fillColor('#496873')
              .text(
                `${index + 1}. ${testName}${testCode}`
              );
          }
        );
      } else {
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#496873')
          .text('No tests listed');
      }

      // ===========================================
      // NOTES
      // ===========================================

      if (appointment.notes) {
        doc.moveDown(1);

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#173f4c')
          .text('Appointment Notes');

        doc.moveDown(0.4);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#496873')
          .text(appointment.notes, {
            width: 500,
          });
      }

      // ===========================================
      // FOOTER
      // ===========================================

      doc.moveDown(2);

      doc
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .strokeColor('#e2eeee')
        .stroke();

      doc.moveDown(0.7);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#7f959d')
        .text(
          'This document is generated by Serine Diagnostics Provider Portal.'
        );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`
      );

      // ===========================================
      // FINISH PDF
      // ===========================================

      doc.end();
    } catch (error) {
      console.error(
        'Failed to generate appointment PDF:',
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            'Failed to generate appointment PDF',
        });
      }
    }
  }
);

// ===============================================
// GET MY RESULTS
// ===============================================

router.get(
  '/results',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const results = await prisma.labResult.findMany({
        where: {
          labOrderTest: {
            order: {
              providerId: req.user!.userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          labOrderTest: {
            include: {
              test: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  patientFirstName: true,
                  patientLastName: true,
                  dateOfBirth: true,
                  biologicalSex: true,
                  providerId: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        count: results.length,
        results,
      });
    } catch (error) {
      console.error('Failed to fetch provider results:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch provider results',
      });
    }
  }
);

// ===============================================
// GET RESULT DETAILS
// ===============================================

router.get(
  '/results/:id',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await prisma.labResult.findFirst({
        where: {
          id,
          labOrderTest: {
            order: {
              providerId: req.user!.userId,
            },
          },
        },
        include: {
          labOrderTest: {
            include: {
              test: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  patientFirstName: true,
                  patientLastName: true,
                  dateOfBirth: true,
                  biologicalSex: true,
                  email: true,
                  phone: true,
                  status: true,
                  notes: true,
                  createdAt: true,
                  providerId: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found or you do not have access to this result',
        });
      }

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error('Failed to fetch provider result details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch result details',
      });
    }
  }
);

// ===============================================
// DOWNLOAD DIAGNOSTIC REPORT PDF
// ===============================================

router.get(
  '/results/:id/pdf',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await prisma.labResult.findFirst({
        where: {
          id,
          labOrderTest: {
            order: {
              providerId: req.user!.userId,
            },
          },
        },
        include: {
          labOrderTest: {
            include: {
              test: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  patientFirstName: true,
                  patientLastName: true,
                  dateOfBirth: true,
                  biologicalSex: true,
                  email: true,
                  phone: true,
                  status: true,
                  notes: true,
                  createdAt: true,
                  providerId: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found or you do not have access to this result',
        });
      }

      const provider = await prisma.staffUser.findUnique({
        where: { id: req.user!.userId },
        select: { firstName: true, lastName: true, email: true },
      });

      const order = result.labOrderTest.order;
      const test = result.labOrderTest.test;
      const safeOrderNumber = order.orderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Diagnostic-Report-${safeOrderNumber}.pdf"`
      );

      const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
      doc.pipe(res);

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#103d4a')
        .text('Serine Diagnostics');
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#617d86')
        .text('Laboratory Services');
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#168d90').stroke();
      doc.moveDown(1.5);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#103d4a')
        .text('DIAGNOSTIC LABORATORY REPORT');
      doc.moveDown(1);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#173f4c').text('Report Information');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('#496873');
      doc.text(`Order Number: ${order.orderNumber}`);
      doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);

      if (result.resultStatus) {
        const status = result.resultStatus
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
        doc.text(`Result Status: ${status}`);
      }

      if (result.performedAt) {
        const date = new Date(result.performedAt);
        if (!Number.isNaN(date.getTime())) doc.text(`Performed: ${date.toLocaleString()}`);
      }
      if (result.releasedAt) {
        const date = new Date(result.releasedAt);
        if (!Number.isNaN(date.getTime())) doc.text(`Released: ${date.toLocaleString()}`);
      }
      doc.moveDown(1);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#173f4c').text('Ordering Provider');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('#496873');
      doc.text(`Dr. ${provider ? `${provider.firstName} ${provider.lastName}` : 'Provider'}`);
      if (provider?.email) doc.text(`Email: ${provider.email}`);
      doc.moveDown(1);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#173f4c').text('Patient Information');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('#496873');
      doc.text(`Name: ${order.patientFirstName} ${order.patientLastName}`);
      const dob = new Date(order.dateOfBirth);
      if (!Number.isNaN(dob.getTime())) doc.text(`Date of Birth: ${dob.toLocaleDateString()}`);
      doc.text(`Biological Sex: ${order.biologicalSex}`);
      if (order.email) doc.text(`Email: ${order.email}`);
      if (order.phone) doc.text(`Phone: ${order.phone}`);
      doc.moveDown(1);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#173f4c').text('Laboratory Test');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('#496873');
      doc.text(`Test: ${test?.name || 'Laboratory Test'}`);
      if (test?.code) doc.text(`Test Code: ${test.code}`);
      if (test?.category) doc.text(`Category: ${test.category}`);
      if (test?.specimenType) doc.text(`Specimen Type: ${test.specimenType}`);
      doc.moveDown(1);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#173f4c').text('Result');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('#496873');
      doc.text(`Result Value: ${result.resultValue || 'Pending'}`);
      if (result.units) doc.text(`Units: ${result.units}`);
      if (result.referenceRange) doc.text(`Reference Range: ${result.referenceRange}`);
      if (result.comments) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Comments');
        doc.font('Helvetica').text(result.comments, { width: 500 });
      }

      if (order.notes) {
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#173f4c').text('Clinical / Order Notes');
        doc.moveDown(0.4);
        doc.fontSize(10).font('Helvetica').fillColor('#496873').text(order.notes, { width: 500 });
      }

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#e2eeee').stroke();
      doc.moveDown(0.7);
      doc.fontSize(8).font('Helvetica').fillColor('#7f959d').text(
        'This diagnostic report is generated by Serine Diagnostics Provider Portal.'
      );
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      doc.end();
    } catch (error) {
      console.error('Failed to generate diagnostic report PDF:', error);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate diagnostic report PDF',
        });
      }
    }
  }
);

// ===============================================
// GET MY ASSIGNED APPOINTMENTS / ORDERS
// ===============================================

router.get(
  '/my-appointments',
  authenticateToken,
  authorizeRoles('PROVIDER', 'STAFF', 'DOCTOR'),
  async (req, res) => {
    try {
      const appointments =
        await prisma.appointment.findMany({
          where: {
            providerId: req.user!.userId,
          },

          orderBy: [
            {
              appointmentDate: 'desc',
            },
            {
              appointmentTime: 'desc',
            },
          ],

          include: {
            provider: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            location: true,

            tests: {
              include: {
                test: true,
                package: true,
              },
            },
          },
        });

      return res.status(200).json({
        success: true,
        count: appointments.length,
        appointments,
      });
    } catch (error) {
      console.error(
        'Failed to fetch provider appointments:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch provider appointments',
      });
    }
  }
);

export default router;