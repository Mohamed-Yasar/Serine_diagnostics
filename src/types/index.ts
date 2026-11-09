export interface LabTest {
  id: string;
  code: string;
  name: string;

  category:
    | 'routine'
    | 'biochemistry'
    | 'hematology'
    | 'immunology'
    | 'endocrinology'
    | 'infectious'
    | 'wellness'
    | 'toxicology';

  categoryLabel: string;
  description: string;
  fastingRequired: boolean;
  fastingHours?: number;
  turnaroundTime: string;
  specimenType: string;
  price: number;
  active: boolean;

  popular?: boolean;
  commonFor?: string[];

  clinicalSignificance: string;
  whyItIsDone?: string;
  whatItHelpsEvaluate?: string;
  abnormalSymptoms?: string;
  specimenVolume?: string;
  collectionKit?: string;
  patientPreparation?: string;
  importantInformation?: string;
  whatIsTested?: string[];
  relatedTests?: string[];

  tags?: string[];
  source?: string;
  itemType?: string;
  bookable?: boolean;
}

export interface LabPackage {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  testCount: number;
  testsIncluded: string[];
  price: number;
  originalValue: number;
  fastingRequired: boolean;
  turnaroundTime: string;
  recommendedFor: string;
  featured?: boolean;
}

export interface LabLocation {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
  hasDrawSite: boolean;
  hasWheelchairAccess: boolean;
  hasParking: boolean;
  transitInfo: string;
  specialNotes?: string;
}

export interface BookingPatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  biologicalSex: 'female' | 'male' | 'other' | '';
  insuranceType:
    | 'private_insurance'
    | 'medicare'
    | 'medicaid'
    | 'self_pay'
    | 'uninsured_assistance';
  insuranceCarrier?: string;
  hasPhysicianOrder:
    | 'yes_paper'
    | 'yes_electronic'
    | 'need_clinical_order'
    | 'wellness_self_request';
  physicianName?: string;
  specialAssistance: string[];
  notes?: string;
}

export interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  selectedTestId: string | null;
  selectedPackageId: string | null;
  customTestRequested?: string;
  selectedLocationId: string;
  selectedDate: string;
  selectedTime: string;
  patientInfo: BookingPatientInfo;
  confirmationNumber?: string;
}

// =========================
// CREATE APPOINTMENT
// =========================

export interface CreateAppointmentRequest {
  appointmentDate: string;
  appointmentTime: string;
  locationId: string;

  firstName: string;
  lastName: string;
  dateOfBirth: string;

  email: string;
  phone: string;

  biologicalSex: string;
  insuranceType: string;

  insuranceCarrier?: string | null;

  hasPhysicianOrder: string;

  physicianName?: string | null;

  specialAssistance: string[];

  notes?: string | null;

selectedTests: {
  type: 'test' | 'package';
  id: string;
}[];
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    confirmationNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
  };
}

// =========================
// APPOINTMENT DASHBOARD
// =========================

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentTest {
  id: string;
  priceAtBooking: string | number;
  appointmentId: string;
  testId: string | null;
  packageId: string | null;

  test: LabTest | null;
  package: LabPackage | null;
}

export interface Appointment {
  id: string;
  confirmationNumber: string;

  appointmentDate: string;
  appointmentTime: string;

  status: AppointmentStatus;

  firstName: string;
  lastName: string;
  dateOfBirth: string;

  email: string;
  phone: string;

  biologicalSex: string;

  insuranceType: string;
  insuranceCarrier: string | null;

  hasPhysicianOrder: string;
  physicianName: string | null;

  specialAssistance: string[];

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  locationId: string;

  location: LabLocation;

  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;

  tests: AppointmentTest[];
}

export interface AppointmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AppointmentsListResponse {
  success: boolean;
  data: Appointment[];
  pagination: AppointmentPagination;
}

export interface SingleAppointmentResponse {
  success: boolean;
  data: Appointment;
}

export interface UpdateAppointmentStatusResponse {
  success: boolean;
  message: string;
  data: Appointment;
}