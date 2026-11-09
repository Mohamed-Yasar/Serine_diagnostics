import React, { useEffect, useState } from 'react';

import {
  fetchAppointments,
  fetchAppointmentById,
  updateAppointmentStatus,
  fetchProviders,
  assignProviderToAppointment,
  ProviderUser,
} from '../../services/api';

import {
  Appointment,
  AppointmentPagination,
  AppointmentStatus,
} from '../../types';

import { useAuth } from '../../context/AuthContext';

interface AppointmentsPageProps {
  onNavigate?: (view: string) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  onNavigate,
}) => {
  const { token, user, logout } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] =
    useState<AppointmentPagination | null>(null);

  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | ''
  >('');

  const [dateFilter, setDateFilter] = useState('');

  const [limit] = useState(10);

  const [loading, setLoading] = useState(true);

  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string | null>(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Provider state
  const [providers, setProviders] = useState<ProviderUser[]>([]);
  const [selectedProviderId, setSelectedProviderId] =
    useState('');

  const [assigningProvider, setAssigningProvider] =
    useState(false);

  const [providerAssignmentMessage, setProviderAssignmentMessage] =
    useState<string | null>(null);

  /*
   * ========================================
   * LOAD APPOINTMENTS
   * ========================================
   */

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error(
            'Authentication token is required'
          );
        }

        const response = await fetchAppointments(token, {
          page,
          limit,
          ...(statusFilter
            ? { status: statusFilter }
            : {}),
          ...(dateFilter
            ? { date: dateFilter }
            : {}),
        });

        setAppointments(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error(
          'Failed to load appointments:',
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load appointments'
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [
    token,
    page,
    limit,
    statusFilter,
    dateFilter,
  ]);

  /*
   * ========================================
   * LOAD ACTIVE PROVIDERS
   * ========================================
   */

  useEffect(() => {
    async function loadProviders() {
      try {
        if (!token) {
          return;
        }

        const providerList =
          await fetchProviders(token);

        setProviders(providerList);
      } catch (error) {
        console.error(
          'Failed to load providers:',
          error
        );
      }
    }

    loadProviders();
  }, [token]);

  /*
   * ========================================
   * VIEW APPOINTMENT DETAILS
   * ========================================
   */

  const handleViewDetails = async (
    appointmentId: string
  ) => {
    try {
      if (!token) {
        throw new Error(
          'Authentication token is required'
        );
      }

      setError(null);
      setSelectedAppointmentId(appointmentId);
      setSelectedAppointment(null);
      setSelectedProviderId('');
      setProviderAssignmentMessage(null);

      const response =
        await fetchAppointmentById(
          appointmentId,
          token
        );

      setSelectedAppointment(response.data);
    } catch (error) {
      console.error(
        'Failed to load appointment details:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load appointment details'
      );
    }
  };

  /*
   * ========================================
   * UPDATE APPOINTMENT STATUS
   * ========================================
   */

  const handleUpdateStatus = async (
    appointmentId: string,
    status: AppointmentStatus
  ) => {
    try {
      if (!token) {
        throw new Error(
          'Authentication token is required'
        );
      }

      setError(null);

      const response =
        await updateAppointmentStatus(
          appointmentId,
          status,
          token
        );

      setAppointments(
        (currentAppointments) =>
          currentAppointments.map(
            (appointment) =>
              appointment.id === appointmentId
                ? {
                    ...appointment,
                    status:
                      response.data.status,
                  }
                : appointment
          )
      );

      if (
        selectedAppointment &&
        selectedAppointment.id === appointmentId
      ) {
        setSelectedAppointment({
          ...selectedAppointment,
          status: response.data.status,
        });
      }
    } catch (error) {
      console.error(
        'Failed to update appointment status:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update appointment status'
      );
    }
  };

  /*
   * ========================================
   * ASSIGN PROVIDER
   * ========================================
   */

  const handleAssignProvider = async (
    appointmentId: string,
    providerId: string
  ) => {
    if (!providerId || assigningProvider) {
      return;
    }

    try {
      if (!token) {
        throw new Error(
          'Authentication token is required'
        );
      }

      setError(null);
      setProviderAssignmentMessage(null);
      setAssigningProvider(true);

      const response =
        await assignProviderToAppointment(
          appointmentId,
          providerId,
          token
        );

      setSelectedAppointment(response.data);
      setSelectedProviderId('');
      setProviderAssignmentMessage(
        'Provider assigned successfully.'
      );
    } catch (error) {
      console.error(
        'Failed to assign provider:',
        error
      );

      setProviderAssignmentMessage(null);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to assign provider'
      );
    } finally {
      setAssigningProvider(false);
    }
  };

  /*
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-700">
            Loading appointments...
          </div>

          <p className="text-sm text-slate-500 mt-2">
            Please wait while we retrieve appointment data.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ========================================
   * ERROR
   * ========================================
   */

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="border border-red-200 bg-red-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load appointments
          </h2>

          <p className="text-red-600 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ========================================
   * APPOINTMENT DETAILS
   * ========================================
   */

  if (selectedAppointment) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">

        <button
          type="button"
          onClick={() => {
            setSelectedAppointment(null);
            setSelectedAppointmentId(null);
            setSelectedProviderId('');
          }}
          className="mb-6 px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Appointments
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Appointment Details
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Patient */}

            <div>
              <p className="text-sm text-slate-500">
                Patient
              </p>

              <p className="font-semibold text-slate-900">
                {selectedAppointment.firstName}{' '}
                {selectedAppointment.lastName}
              </p>
            </div>

            {/* Email */}

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="font-semibold text-slate-900">
                {selectedAppointment.email}
              </p>
            </div>

            {/* Phone */}

            <div>
              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="font-semibold text-slate-900">
                {selectedAppointment.phone}
              </p>
            </div>

            {/* Date of Birth */}

            <div>
              <p className="text-sm text-slate-500">
                Date of Birth
              </p>

              <p className="font-semibold text-slate-900">
                {new Date(
                  selectedAppointment.dateOfBirth
                ).toLocaleDateString()}
              </p>
            </div>

            {/* Appointment Date */}

            <div>
              <p className="text-sm text-slate-500">
                Appointment Date
              </p>

              <p className="font-semibold text-slate-900">
                {new Date(
                  selectedAppointment.appointmentDate
                ).toLocaleDateString()}
              </p>
            </div>

            {/* Appointment Time */}

            <div>
              <p className="text-sm text-slate-500">
                Appointment Time
              </p>

              <p className="font-semibold text-slate-900">
                {selectedAppointment.appointmentTime}
              </p>
            </div>

            {/* Status */}

            <div>
              <p className="text-sm text-slate-500">
                Status
              </p>

              {user?.role === 'DOCTOR' ? (
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.status.replace(
                    '_',
                    ' '
                  )}
                </p>
              ) : (
                <select
                  value={selectedAppointment.status}
                  onChange={(event) =>
                    handleUpdateStatus(
                      selectedAppointment.id,
                      event.target.value as AppointmentStatus
                    )
                  }
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold bg-white"
                >
                  <option value="CONFIRMED">
                    Confirmed
                  </option>

                  <option value="CHECKED_IN">
                    Checked In
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>

                  <option value="NO_SHOW">
                    No Show
                  </option>
                </select>
              )}
            </div>

            {/* Confirmation */}

            <div>
              <p className="text-sm text-slate-500">
                Confirmation
              </p>

              <p className="font-mono font-semibold text-slate-900">
                {selectedAppointment.confirmationNumber}
              </p>
            </div>

          </div>

          {/* ========================================
              PROVIDER ASSIGNMENT
              ======================================== */}

          {user?.role === 'ADMIN' && (
            <div className="mt-8 pt-6 border-t border-slate-200">

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Doctor Assignment
              </h2>

              {selectedAppointment.provider && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Currently Assigned Doctor
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    Dr. {selectedAppointment.provider.firstName}{' '}
                    {selectedAppointment.provider.lastName}
                  </p>

                  {selectedAppointment.provider.email && (
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedAppointment.provider.email}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">

                <select
                  value={selectedProviderId}
                  onChange={(event) => {
                    setSelectedProviderId(event.target.value);
                    setProviderAssignmentMessage(null);
                  }}
                  disabled={
                    assigningProvider ||
                    providers.length === 0
                  }
                  className="border border-slate-300 rounded-lg px-3 py-3 text-sm bg-white flex-1 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {providers.length === 0
                      ? 'No doctors available'
                      : 'Select Doctor'}
                  </option>

                  {providers.map((provider) => (
                    <option
                      key={provider.id}
                      value={provider.id}
                    >
                      Dr. {provider.firstName}{' '}
                      {provider.lastName}
                      {provider.email
                        ? ` — ${provider.email}`
                        : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    handleAssignProvider(
                      selectedAppointment.id,
                      selectedProviderId
                    )
                  }
                  disabled={
                    !selectedProviderId ||
                    assigningProvider
                  }
                  className="px-6 py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-[160px]"
                >
                  {assigningProvider ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      />
                      Assigning...
                    </>
                  ) : (
                    'Assign Doctor'
                  )}
                </button>

              </div>

              {providerAssignmentMessage && (
                <p className="text-sm text-green-700 mt-3">
                  {providerAssignmentMessage}
                </p>
              )}

              {providers.length === 0 && (
                <p className="text-sm text-slate-500 mt-3">
                  No active doctors available.
                </p>
              )}

            </div>
          )}

        </div>
      </div>
    );
  }

  /*
   * ========================================
   * APPOINTMENT DASHBOARD
   * ========================================
   */

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Admin Navigation */}

      <div className="mb-6 flex flex-wrap gap-3">

        <button
          type="button"
          onClick={() =>
            onNavigate?.('appointments')
          }
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
        >
          📅 Appointments
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate?.('staff-management')
          }
          className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
        >
          👥 Staff Management
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate?.('test-management')
          }
          className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
        >
          🧪 Manage Tests
        </button>

      </div>

      {/* Header */}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Appointment Dashboard
          </h1>

          <p className="text-slate-600 mt-2">
            Manage and monitor patient appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            onNavigate?.('login');
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 transition"
        >
          Log Out
        </button>

      </div>

      {/* Filters */}

      <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div className="flex flex-col sm:flex-row gap-4">

          {/* Status Filter */}

          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Filter by Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as
                    | AppointmentStatus
                    | ''
                );

                setPage(1);
              }}
              className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm min-w-[180px]"
            >
              <option value="">
                All Statuses
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="CHECKED_IN">
                Checked In
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="NO_SHOW">
                No Show
              </option>
            </select>
          </div>

          {/* Date Filter */}

          <div>
            <label
              htmlFor="date-filter"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Filter by Date
            </label>

            <div className="flex items-center gap-2">
              <input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setPage(1);
                }}
                className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm"
              />

              {dateFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('');
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        </div>

        <div className="text-sm text-slate-500">
          {pagination
            ? `Showing page ${pagination.page} of ${pagination.totalPages}`
            : null}
        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="border border-slate-200 rounded-xl p-5 bg-white">

          <div className="text-sm text-slate-500">
            Total Appointments
          </div>

          <div className="text-2xl font-bold text-slate-900 mt-2">
            {pagination?.total ?? 0}
          </div>

        </div>

        <div className="border border-slate-200 rounded-xl p-5 bg-white">

          <div className="text-sm text-slate-500">
            Confirmed
          </div>

          <div className="text-2xl font-bold text-blue-600 mt-2">
            {
              appointments.filter(
                (appointment) =>
                  appointment.status ===
                  'CONFIRMED'
              ).length
            }
          </div>

        </div>

        <div className="border border-slate-200 rounded-xl p-5 bg-white">

          <div className="text-sm text-slate-500">
            Checked In
          </div>

          <div className="text-2xl font-bold text-purple-600 mt-2">
            {
              appointments.filter(
                (appointment) =>
                  appointment.status ===
                  'CHECKED_IN'
              ).length
            }
          </div>

        </div>

        <div className="border border-slate-200 rounded-xl p-5 bg-white">

          <div className="text-sm text-slate-500">
            Completed
          </div>

          <div className="text-2xl font-bold text-green-600 mt-2">
            {
              appointments.filter(
                (appointment) =>
                  appointment.status ===
                  'COMPLETED'
              ).length
            }
          </div>

        </div>

      </div>

      {/* Table */}

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50 border-b border-slate-200">

              <tr>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Patient
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Date & Time
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Location
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Tests
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Confirmation
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {appointments.length === 0 ? (
                <tr>

                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No appointments found.
                  </td>

                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >

                    {/* Patient */}

                    <td className="px-5 py-4">

                      <div className="font-medium text-slate-900">
                        {appointment.firstName}{' '}
                        {appointment.lastName}
                      </div>

                      <div className="text-sm text-slate-500">
                        {appointment.email}
                      </div>

                    </td>

                    {/* Date */}

                    <td className="px-5 py-4">

                      <div className="font-medium text-slate-800">
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}
                      </div>

                      <div className="text-sm text-slate-500">
                        {appointment.appointmentTime}
                      </div>

                    </td>

                    {/* Location */}

                    <td className="px-5 py-4">

                      <div className="font-medium text-slate-800">
                        {appointment.location.shortName}
                      </div>

                      <div className="text-sm text-slate-500">
                        {appointment.location.city},{' '}
                        {appointment.location.state}
                      </div>

                    </td>

                    {/* Tests */}

                    <td className="px-5 py-4">

                      <div className="text-sm text-slate-700">
                        {appointment.tests
                          .map((item) => {
                            if (item.test) {
                              return item.test.name;
                            }

                            if (item.package) {
                              return item.package.name;
                            }

                            return 'Unknown item';
                          })
                          .join(', ')}
                      </div>

                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">

                      {user?.role === 'DOCTOR' ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {appointment.status.replace(
                            '_',
                            ' '
                          )}
                        </span>
                      ) : (
                        <select
                          value={appointment.status}
                          onChange={(event) =>
                            handleUpdateStatus(
                              appointment.id,
                              event.target.value as AppointmentStatus
                            )
                          }
                          className="border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold bg-white"
                        >
                          <option value="CONFIRMED">
                            Confirmed
                          </option>

                          <option value="CHECKED_IN">
                            Checked In
                          </option>

                          <option value="IN_PROGRESS">
                            In Progress
                          </option>

                          <option value="COMPLETED">
                            Completed
                          </option>

                          <option value="CANCELLED">
                            Cancelled
                          </option>

                          <option value="NO_SHOW">
                            No Show
                          </option>
                        </select>
                      )}

                    </td>

                    {/* Confirmation */}

                    <td className="px-5 py-4">

                      <div className="font-mono text-sm text-slate-600">
                        {appointment.confirmationNumber}
                      </div>

                    </td>

                    {/* Action */}

                    <td className="px-5 py-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(
                            appointment.id
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-[#168d90] text-white text-xs font-semibold hover:bg-[#117a7d] transition-colors"
                      >
                        View Details
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Pagination */}

      {pagination &&
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">

            <button
              type="button"
              onClick={() =>
                setPage(
                  (currentPage) =>
                    currentPage - 1
                )
              }
              disabled={
                !pagination.hasPreviousPage
              }
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="text-sm text-slate-600">
              Page {pagination.page} of{' '}
              {pagination.totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setPage(
                  (currentPage) =>
                    currentPage + 1
                )
              }
              disabled={
                !pagination.hasNextPage
              }
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>

          </div>
        )}

    </div>
  );
};