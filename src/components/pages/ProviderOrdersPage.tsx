import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProviderOrdersPageProps {
  onNavigate: (view: string) => void;
}

interface LabTest {
  id: string;
  name: string;
  code?: string;
  category?: string;
}

interface CreatedOrderTest {
  id: string;
  price?: string | number;
  test?: LabTest;
}

interface CreatedOrder {
  id: string;
  orderNumber: string;
  patientFirstName: string;
  patientLastName: string;
  dateOfBirth: string;
  biologicalSex: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  status?: string;
  createdAt: string;
  tests?: CreatedOrderTest[];
}

interface AppointmentTest {
  id: string;
  test?: LabTest;
  package?: {
    id: string;
    name: string;
  };
}

interface AssignedAppointment {
  id: string;
  confirmationNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  status: string;
  appointmentDate?: string;
  appointmentTime?: string;
  tests?: AppointmentTest[];
  notes?: string | null;
}

type MyOrder =
  | {
      type: 'CREATED_ORDER';
      id: string;
      orderNumber: string;
      patientName: string;
      dateOfBirth?: string;
      status?: string;
      createdAt?: string;
      tests: string[];
      notes?: string | null;
    }
  | {
      type: 'ASSIGNED_APPOINTMENT';
      id: string;
      orderNumber: string;
      patientName: string;
      dateOfBirth?: string;
      status?: string;
      createdAt?: string;
      tests: string[];
      notes?: string | null;
      appointmentDate?: string;
      appointmentTime?: string;
      confirmationNumber?: string;
    };

const API_BASE_URL = 'https://serine-diagnostics.onrender.com/api';

export const ProviderOrdersPage: React.FC<
  ProviderOrdersPageProps
> = ({ onNavigate }) => {
  const { token } = useAuth();

  const [createdOrders, setCreatedOrders] = useState<
    CreatedOrder[]
  >([]);

  const [assignedAppointments, setAssignedAppointments] =
    useState<AssignedAppointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  // ===============================================
  // LOAD CREATED ORDERS + ASSIGNED APPOINTMENTS
  // ===============================================

  useEffect(() => {
    const loadMyOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [ordersResponse, appointmentsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/provider/orders`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(
              `${API_BASE_URL}/provider/my-appointments`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
          ]);

        const ordersResult =
          await ordersResponse.json();

        const appointmentsResult =
          await appointmentsResponse.json();

        if (!ordersResponse.ok) {
          throw new Error(
            ordersResult?.message ||
              'Failed to load created orders'
          );
        }

        if (!appointmentsResponse.ok) {
          throw new Error(
            appointmentsResult?.message ||
              'Failed to load assigned appointments'
          );
        }

        setCreatedOrders(
          Array.isArray(ordersResult?.orders)
            ? ordersResult.orders
            : []
        );

        setAssignedAppointments(
          Array.isArray(
            appointmentsResult?.appointments
          )
            ? appointmentsResult.appointments
            : []
        );
      } catch (err) {
        console.error(
          'Failed to load provider orders:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load provider orders'
        );
      } finally {
        setLoading(false);
      }
    };

    loadMyOrders();
  }, [token]);

  // ===============================================
  // DOWNLOAD PDF
  // ===============================================

  const handleDownloadPDF = async (
    order: MyOrder
  ) => {
    if (!token) {
      setError('Authentication token is required');
      return;
    }

    try {
      setError(null);
      setDownloadingId(
        `${order.type}-${order.id}`
      );

      const endpoint =
        order.type === 'CREATED_ORDER'
          ? `${API_BASE_URL}/provider/orders/${order.id}/pdf`
          : `${API_BASE_URL}/provider/appointments/${order.id}/pdf`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Failed to download PDF';

        try {
          const result = await response.json();

          message =
            result?.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = downloadUrl;

      link.download =
        order.type === 'CREATED_ORDER'
          ? `Lab-Order-${order.orderNumber}.pdf`
          : `Appointment-${order.orderNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl
      );
    } catch (err) {
      console.error(
        'Failed to download PDF:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to download PDF'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // ===============================================
  // FORMAT HELPERS
  // ===============================================

  const formatDate = (date?: string) => {
    if (!date) {
      return 'Date unavailable';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString();
  };

  const formatStatus = (status?: string) => {
    if (!status) {
      return 'Pending';
    }

    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-[#e8f7ef] text-[#24824f]';

      case 'CANCELLED':
        return 'bg-[#fdecec] text-[#c94b4b]';

      case 'IN_PROGRESS':
        return 'bg-[#fff4df] text-[#a96d16]';

      case 'CHECKED_IN':
        return 'bg-[#eef4ff] text-[#4267a8]';

      default:
        return 'bg-[#eef8f8] text-[#168d90]';
    }
  };

  // ===============================================
  // COMBINE BOTH SOURCES
  // ===============================================

  const combinedOrders: MyOrder[] = [
    ...createdOrders.map((order) => ({
      type: 'CREATED_ORDER' as const,
      id: order.id,
      orderNumber: order.orderNumber,
      patientName: `${order.patientFirstName} ${order.patientLastName}`,
      dateOfBirth: order.dateOfBirth,
      status: order.status,
      createdAt: order.createdAt,
      tests:
        order.tests?.map(
          (item) =>
            item.test?.name ||
            'Laboratory Test'
        ) || [],
      notes: order.notes,
    })),

    ...assignedAppointments.map(
      (appointment) => ({
        type: 'ASSIGNED_APPOINTMENT' as const,
        id: appointment.id,
        orderNumber:
          appointment.confirmationNumber ||
          `AP-${appointment.id.slice(0, 8)}`,
        patientName: `${appointment.firstName} ${appointment.lastName}`,
        dateOfBirth: appointment.dateOfBirth,
        status: appointment.status,
        createdAt: appointment.appointmentDate,
        tests:
          appointment.tests?.map(
            (item) =>
              item.test?.name ||
              item.package?.name ||
              'Laboratory Test'
          ) || [],
        notes: appointment.notes,
        appointmentDate:
          appointment.appointmentDate,
        appointmentTime:
          appointment.appointmentTime,
        confirmationNumber:
          appointment.confirmationNumber,
      })
    ),
  ];

  // ===============================================
  // SORT NEWEST FIRST
  // ===============================================

  combinedOrders.sort((a, b) => {
    const dateA = a.createdAt
      ? new Date(a.createdAt).getTime()
      : 0;

    const dateB = b.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;

    return dateB - dateA;
  });

  // ===============================================
  // UI
  // ===============================================

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f5fbfb] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">

          <button
            onClick={() =>
              onNavigate('provider')
            }
            className="mb-5 text-sm font-bold text-[#168d90] hover:text-[#103d4a] transition-colors"
          >
            ← Back to Provider Dashboard
          </button>

          <p className="text-xs font-extrabold text-[#168d90] uppercase tracking-[0.2em] mb-2">
            Provider Portal
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a]">
            My Orders
          </h1>

          <p className="text-sm text-[#617d86] mt-2">
            View laboratory orders you created and appointments assigned to you.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-[#f3caca] bg-[#fff5f5] px-4 py-3">
            <p className="text-sm font-semibold text-[#b33d3d]">
              {error}
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* Total */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Total Orders
            </p>

            <p className="text-3xl font-extrabold text-[#103d4a] mt-2">
              {loading
                ? '...'
                : combinedOrders.length}
            </p>
          </div>

          {/* Created */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Created By Me
            </p>

            <p className="text-3xl font-extrabold text-[#168d90] mt-2">
              {loading
                ? '...'
                : createdOrders.length}
            </p>
          </div>

          {/* Assigned */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Assigned To Me
            </p>

            <p className="text-3xl font-extrabold text-[#168d90] mt-2">
              {loading
                ? '...'
                : assignedAppointments.length}
            </p>
          </div>

        </div>

        {/* Orders Container */}
        <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <h2 className="text-lg font-extrabold text-[#103d4a]">
              All My Orders
            </h2>

            <button
              onClick={() =>
                onNavigate(
                  'provider-create-order'
                )
              }
              className="px-5 py-3 rounded-xl bg-[#168d90] hover:bg-[#117b7e] text-white text-sm font-bold transition-colors"
            >
              + Create Lab Order
            </button>

          </div>

          {/* Loading */}
          {loading && (
            <div className="border border-dashed border-[#dce8e9] rounded-xl p-10 text-center">
              <p className="text-sm font-bold text-[#617d86]">
                Loading your orders...
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            combinedOrders.length === 0 && (
              <div className="border border-dashed border-[#dce8e9] rounded-xl p-10 text-center">

                <p className="text-sm font-bold text-[#617d86]">
                  No orders or assigned appointments yet
                </p>

                <p className="text-xs text-[#8fa7ad] mt-2">
                  Orders you create and appointments assigned to you will appear here.
                </p>

                <button
                  onClick={() =>
                    onNavigate(
                      'provider-create-order'
                    )
                  }
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117b7e] text-white text-sm font-bold transition-colors"
                >
                  Create Lab Order
                </button>

              </div>
            )}

          {/* Combined Orders */}
          {!loading &&
            combinedOrders.length > 0 && (
              <div className="space-y-4">

                {combinedOrders.map(
                  (order) => {

                    const currentDownloadId =
                      `${order.type}-${order.id}`;

                    const isDownloading =
                      downloadingId ===
                      currentDownloadId;

                    return (
                      <div
                        key={currentDownloadId}
                        className="border border-[#e2eeee] rounded-xl p-5 hover:border-[#c8dddd] transition-colors"
                      >

                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="text-sm font-extrabold text-[#173f4c]">
                                {order.orderNumber}
                              </p>

                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${
                                  order.type ===
                                  'CREATED_ORDER'
                                    ? 'bg-[#eef8f8] text-[#168d90]'
                                    : 'bg-[#eef4ff] text-[#4267a8]'
                                }`}
                              >
                                {order.type ===
                                'CREATED_ORDER'
                                  ? 'Created Order'
                                  : 'Assigned Appointment'}
                              </span>

                            </div>

                            <p className="text-xs text-[#7f959d] mt-1">
                              {order.type ===
                              'CREATED_ORDER'
                                ? `Created: ${formatDate(
                                    order.createdAt
                                  )}`
                                : `Appointment: ${formatDate(
                                    order.appointmentDate
                                  )}${
                                    order.appointmentTime
                                      ? ` • ${order.appointmentTime}`
                                      : ''
                                  }`}
                            </p>

                          </div>

                          <span
                            className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {formatStatus(
                              order.status
                            )}
                          </span>

                        </div>

                        {/* Patient Info */}
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div>
                            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
                              Patient
                            </p>

                            <p className="text-sm font-bold text-[#173f4c] mt-1">
                              {order.patientName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
                              Date of Birth
                            </p>

                            <p className="text-sm font-semibold text-[#496873] mt-1">
                              {formatDate(
                                order.dateOfBirth
                              )}
                            </p>
                          </div>

                        </div>

                        {/* Appointment Confirmation */}
                        {order.type ===
                          'ASSIGNED_APPOINTMENT' &&
                          order.confirmationNumber && (
                            <div className="mt-4">

                              <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
                                Confirmation Number
                              </p>

                              <p className="text-sm font-semibold text-[#496873] mt-1">
                                {order.confirmationNumber}
                              </p>

                            </div>
                          )}

                        {/* Tests */}
                        <div className="mt-5">

                          <p className="text-xs font-bold text-[#617d86] uppercase tracking-wide mb-2">
                            Ordered Tests
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {order.tests.length > 0 ? (
                              order.tests.map(
                                (
                                  testName,
                                  index
                                ) => (
                                  <span
                                    key={`${order.id}-${index}`}
                                    className="px-2.5 py-1 rounded-lg bg-[#f5fbfb] border border-[#e2eeee] text-xs font-semibold text-[#496873]"
                                  >
                                    {testName}
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-xs text-[#8fa7ad]">
                                No tests listed
                              </span>
                            )}

                          </div>

                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="mt-5">

                            <p className="text-xs font-bold text-[#617d86] uppercase tracking-wide mb-1">
                              Notes
                            </p>

                            <p className="text-sm text-[#496873]">
                              {order.notes}
                            </p>

                          </div>
                        )}

                        {/* PDF Download */}
                        <div className="mt-5 pt-4 border-t border-[#e2eeee] flex justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadPDF(
                                order
                              )
                            }
                            disabled={
                              isDownloading
                            }
                            className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-colors ${
                              isDownloading
                                ? 'bg-[#8bbfc0] cursor-not-allowed'
                                : 'bg-[#168d90] hover:bg-[#117b7e]'
                            }`}
                          >
                            {isDownloading
                              ? 'Preparing PDF...'
                              : `↓ Download ${
                                  order.type ===
                                  'CREATED_ORDER'
                                    ? 'Lab Order PDF'
                                    : 'Appointment PDF'
                                }`}
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>

      </div>
    </div>
  );
};