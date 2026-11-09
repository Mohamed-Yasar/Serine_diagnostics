import {
  LabTest,
  LabPackage,
  LabLocation,
  CreateAppointmentRequest,
  AppointmentResponse,
  AppointmentStatus,
  AppointmentsListResponse,
  SingleAppointmentResponse,
  UpdateAppointmentStatusResponse,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

type ApiResponse<T> = {
  success: boolean;
  count?: number;
  data: T;
};

// =========================
// AUTH TYPES
// =========================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

// =========================
// TESTS
// =========================

export async function fetchLabTests(): Promise<LabTest[]> {
  const response = await fetch(
    `${API_BASE_URL}/tests`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to fetch lab tests'
    );
  }

  return result.data.map((test: any) => ({
    ...test,
    price: Number(test.price),
  }));
}

// =========================
// FREQUENTLY ORDERED TESTS
// =========================

export async function fetchFrequentlyOrderedTests(): Promise<LabTest[]> {
  const response = await fetch(
    `${API_BASE_URL}/tests/frequently-ordered`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to fetch frequently ordered lab tests'
    );
  }

  return result.data.map((test: any) => ({
    ...test,
    price: Number(test.price),
  }));
}

// =========================
// CREATE LAB TEST
// ADMIN ONLY
// =========================

export async function createLabTest(
  testData: Partial<LabTest>
): Promise<LabTest> {
  const token = localStorage.getItem(
    'serine_auth_token'
  );

  if (!token) {
    throw new Error(
      'Authentication token is required'
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tests`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(testData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to create lab test'
    );
  }

  return {
    ...result.data,
    price: Number(result.data.price),
  };
}

// =========================
// UPDATE LAB TEST
// ADMIN ONLY
// =========================

export async function updateLabTest(
  id: string,
  testData: Partial<LabTest>
): Promise<LabTest> {
  const token = localStorage.getItem(
    'serine_auth_token'
  );

  if (!token) {
    throw new Error(
      'Authentication token is required'
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tests/${id}`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(testData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to update lab test'
    );
  }

  return {
    ...result.data,
    price: Number(result.data.price),
  };
}

// =========================
// DEACTIVATE LAB TEST
// ADMIN ONLY
// =========================

export async function deactivateLabTest(
  id: string
): Promise<LabTest> {
  const token = localStorage.getItem(
    'serine_auth_token'
  );

  if (!token) {
    throw new Error(
      'Authentication token is required'
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tests/${id}`,
    {
      method: 'DELETE',

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to deactivate lab test'
    );
  }

  return {
    ...result.data,
    price: Number(result.data.price),
  };
}

// =========================
// PACKAGES
// =========================

export async function fetchLabPackages(): Promise<LabPackage[]> {
  const response = await fetch(
    `${API_BASE_URL}/packages`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to fetch lab packages'
    );
  }

  return result.data.map((pkg: any) => ({
    ...pkg,
    price: Number(pkg.price),
    originalValue: Number(pkg.originalValue),
    testsIncluded:
      pkg.tests?.map(
        (item: any) => item.test?.name
      ) || [],
  }));
}

// =========================
// ADMIN LAB PACKAGES
// =========================

export type LabPackageAdmin = LabPackage & {
  active: boolean;
  testIds: string[];
};

type LabPackagePayload = {
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  price: number;
  originalValue: number;
  fastingRequired: boolean;
  turnaroundTime: string;
  recommendedFor: string;
  featured: boolean;
  active: boolean;
  testIds: string[];
};

function mapAdminLabPackage(pkg: any): LabPackageAdmin {
  return {
    ...pkg,
    price: Number(pkg.price),
    originalValue: Number(pkg.originalValue),
    testsIncluded:
      pkg.tests?.map((item: any) => item.test?.name).filter(Boolean) || [],
    testIds:
      pkg.tests?.map((item: any) => item.testId).filter(Boolean) || [],
    active: Boolean(pkg.active),
  };
}

export async function fetchAdminLabPackages(): Promise<LabPackageAdmin[]> {
  const token = localStorage.getItem('serine_auth_token');

  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(
    `${API_BASE_URL}/packages/admin`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to fetch admin lab packages'
    );
  }

  return result.data.map(mapAdminLabPackage);
}

export async function createLabPackage(
  packageData: LabPackagePayload
): Promise<LabPackageAdmin> {
  const token = localStorage.getItem('serine_auth_token');

  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(
    `${API_BASE_URL}/packages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(packageData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to create lab package'
    );
  }

  return mapAdminLabPackage(result.data);
}

export async function updateLabPackage(
  id: string,
  packageData: Partial<LabPackagePayload>
): Promise<LabPackageAdmin> {
  const token = localStorage.getItem('serine_auth_token');

  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(
    `${API_BASE_URL}/packages/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(packageData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to update lab package'
    );
  }

  return mapAdminLabPackage(result.data);
}

export async function deactivateLabPackage(
  id: string
): Promise<LabPackageAdmin> {
  const token = localStorage.getItem('serine_auth_token');

  if (!token) {
    throw new Error('Authentication token is required');
  }

  const response = await fetch(
    `${API_BASE_URL}/packages/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to deactivate lab package'
    );
  }

  return mapAdminLabPackage(result.data);
}

// =========================
// LOCATIONS
// =========================

export async function fetchLabLocations(): Promise<LabLocation[]> {
  const response = await fetch(
    `${API_BASE_URL}/locations`
  );

  const result: ApiResponse<LabLocation[]> =
    await response.json();

  if (!response.ok) {
    throw new Error(
      'Failed to fetch lab locations'
    );
  }

  return result.data;
}

export interface AppointmentAvailability {
  bookedTimes: string[];
  chicagoNow: {
    date: string;
    minutes: number;
  };
}

export async function fetchBookedAppointmentTimes(
  locationId: string,
  appointmentDate: string
): Promise<AppointmentAvailability> {
  const params = new URLSearchParams({
    locationId,
    appointmentDate,
  });

  const response = await fetch(
    `${API_BASE_URL}/appointments/availability?${params.toString()}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to load appointment availability'
    );
  }

  return {
    bookedTimes: result.data.bookedTimes || [],
    chicagoNow: result.data.chicagoNow || {
      date: '',
      minutes: -1,
    },
  };
}

// =========================
// CREATE APPOINTMENT
// =========================

export async function createAppointment(
  appointmentData: CreateAppointmentRequest
): Promise<AppointmentResponse> {
  console.log(
    'Creating appointment with payload:',
    appointmentData
  );

  const response = await fetch(
    `${API_BASE_URL}/appointments`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(appointmentData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error(
      'Appointment creation failed:',
      result
    );

    throw new Error(
      result.message ||
        'Failed to create appointment'
    );
  }

  return result;
}

// =========================
// STAFF LOGIN
// =========================

export async function loginStaff(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Failed to log in'
    );
  }

  return result;
}

// =========================
// APPOINTMENT LIST OPTIONS
// =========================

interface FetchAppointmentsOptions {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  date?: string;
}

// =========================
// GET APPOINTMENTS
// =========================

export async function fetchAppointments(
  token: string,
  options: FetchAppointmentsOptions = {}
): Promise<AppointmentsListResponse> {
  const params = new URLSearchParams();

  if (options.page !== undefined) {
    params.set(
      'page',
      String(options.page)
    );
  }

  if (options.limit !== undefined) {
    params.set(
      'limit',
      String(options.limit)
    );
  }

  if (options.status !== undefined) {
    params.set(
      'status',
      options.status
    );
  }

  if (options.date !== undefined) {
    params.set('date', options.date);
  }

  const queryString = params.toString();

  const response = await fetch(
    `${API_BASE_URL}/appointments${
      queryString
        ? `?${queryString}`
        : ''
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result:
    | AppointmentsListResponse
    | { message?: string } =
    await response.json();

  if (!response.ok) {
    throw new Error(
      'message' in result
        ? result.message ||
            'Failed to fetch appointments'
        : 'Failed to fetch appointments'
    );
  }

  return result as AppointmentsListResponse;
}

// =========================
// GET SINGLE APPOINTMENT
// =========================

export async function fetchAppointmentById(
  appointmentId: string,
  token?: string
): Promise<SingleAppointmentResponse> {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to fetch appointment'
    );
  }

  return result;
}

// =========================
// UPDATE APPOINTMENT STATUS
// =========================

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  token?: string
): Promise<UpdateAppointmentStatusResponse> {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}/status`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json',

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to update appointment status'
    );
  }

  return result;
}

// =========================
// PROVIDER LIST
// =========================

export interface ProviderUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export async function fetchProviders(
  token: string
): Promise<ProviderUser[]> {
  const response = await fetch(
    `${API_BASE_URL}/provider/providers`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to fetch providers'
    );
  }

  return result.providers;
}

// =========================
// ASSIGN PROVIDER
// =========================

export async function assignProviderToAppointment(
  appointmentId: string,
  providerId: string,
  token: string
): Promise<SingleAppointmentResponse> {
  const response = await fetch(
    `${API_BASE_URL}/provider/appointments/${appointmentId}/assign`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        providerId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to assign provider'
    );
  }

  return {
    success: result.success,
    data: result.data,
  };
}

// =========================
// PROVIDER ASSIGNED APPOINTMENTS
// =========================

export async function fetchMyProviderAppointments(
  token: string
): Promise<any[]> {
  const response = await fetch(
    `${API_BASE_URL}/provider/my-appointments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Failed to fetch provider appointments'
    );
  }

  return result.appointments;
}
