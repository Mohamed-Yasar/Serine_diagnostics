import { z } from 'zod';

// =========================
// APPOINTMENT ITEM
// =========================

const appointmentItemSchema = z.object({
  type: z.enum(['test', 'package']),

  id: z.string().min(1, 'Test or package ID is required'),
});

// =========================
// CREATE APPOINTMENT
// =========================

const chicagoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be YYYY-MM-DD')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }, 'Appointment date is invalid');

const chicagoTimeSchema = z
  .string()
  .regex(/^((0?[1-9]|1[0-2]):[0-5]\d) (AM|PM)$/i, 'Appointment time must be a valid Chicago local time');

export const createAppointmentSchema = z.object({
  appointmentDate: chicagoDateSchema,

  appointmentTime: chicagoTimeSchema,

  locationId: z
    .string()
    .min(1, 'Location is required'),

  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(100),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(100),

  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required'),

  email: z
    .string()
    .trim()
    .email('Please provide a valid email address'),

  phone: z
    .string()
    .trim()
    .min(5, 'Please provide a valid phone number')
    .max(30),

  biologicalSex: z
    .string()
    .min(1, 'Biological sex is required'),

  insuranceType: z
    .string()
    .min(1, 'Insurance type is required'),

  insuranceCarrier: z
    .string()
    .trim()
    .optional()
    .nullable(),

  hasPhysicianOrder: z
    .string()
    .min(1, 'Physician order information is required'),

  physicianName: z
    .string()
    .trim()
    .optional()
    .nullable(),

  specialAssistance: z
    .array(z.string())
    .default([]),

  notes: z
    .string()
    .trim()
    .optional()
    .nullable(),

  // IMPORTANT:
  // Must match frontend field name
  selectedTests: z
    .array(appointmentItemSchema)
    .min(1, 'At least one test or package is required')
    .refine(
      (selectedTests) => {
        const identifiers = selectedTests.map(
          (item) => `${item.type}-${item.id}`
        );

        return (
          new Set(identifiers).size ===
          identifiers.length
        );
      },
      {
        message:
          'Duplicate tests or packages are not allowed',
      }
    ),
});

export type CreateAppointmentInput = z.infer<
  typeof createAppointmentSchema
>;

// =========================
// APPOINTMENT LOOKUP
// =========================

export const appointmentLookupSchema = z.object({
  confirmationNumber: z
    .string()
    .trim()
    .min(1, 'Confirmation number is required'),
});

// =========================
// APPOINTMENT CANCELLATION
// =========================

export const cancelAppointmentSchema = z.object({
  confirmationNumber: z
    .string()
    .trim()
    .min(1, 'Confirmation number is required'),
});

// =========================
// APPOINTMENT RESCHEDULING
// =========================

export const rescheduleAppointmentSchema = z.object({
  confirmationNumber: z
    .string()
    .trim()
    .min(1, 'Confirmation number is required'),

  appointmentDate: z
    .string()
    .min(1, 'Appointment date is required'),

  appointmentTime: z
    .string()
    .trim()
    .min(1, 'Appointment time is required'),
});

// =========================
// APPOINTMENT STATUS
// =========================

export const appointmentStatusSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
});

// =========================
// APPOINTMENT LISTING
// =========================

export const appointmentListQuerySchema = z.object({
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
    .enum([
      'CONFIRMED',
      'CHECKED_IN',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ])
    .optional(),
});