import React, { useEffect, useState } from 'react';
import { fetchMyProviderAppointments } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ProviderDashboardPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { token } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await fetchMyProviderAppointments(token);

        setAppointments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load appointments'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [token]);

  const totalOrders = appointments.length;

  const totalPatients = new Set(
    appointments.map(
      (appointment) =>
        `${appointment.firstName}-${appointment.lastName}-${appointment.dateOfBirth}`
    )
  ).size;

  const pendingOrders = appointments.filter(
    (appointment) =>
      appointment.status !== 'COMPLETED' &&
      appointment.status !== 'CANCELLED'
  ).length;

  const completedResults = appointments.filter(
    (appointment) => appointment.status === 'COMPLETED'
  ).length;

  const recentAppointments = appointments.slice(0, 5);

  const getStatusClass = (status: string) => {
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

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f5fbfb] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-extrabold text-[#168d90] uppercase tracking-[0.2em] mb-2">
            Provider Portal
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a]">
            Provider Dashboard
          </h1>

          <p className="text-sm text-[#617d86] mt-2">
            Manage your laboratory orders, patients, and diagnostic reports.
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* Total Patients */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Total Patients
            </p>

            <p className="text-3xl font-extrabold text-[#103d4a] mt-2">
              {loading ? '...' : totalPatients}
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Total Orders
            </p>

            <p className="text-3xl font-extrabold text-[#103d4a] mt-2">
              {loading ? '...' : totalOrders}
            </p>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Pending Orders
            </p>

            <p className="text-3xl font-extrabold text-[#168d90] mt-2">
              {loading ? '...' : pendingOrders}
            </p>
          </div>

          {/* Completed Results */}
          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <p className="text-xs font-bold text-[#7f959d] uppercase tracking-wide">
              Completed Results
            </p>

            <p className="text-3xl font-extrabold text-[#168d90] mt-2">
              {loading ? '...' : completedResults}
            </p>
          </div>

        </div>

        {/* Main sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#103d4a] mb-5">
              Quick Actions
            </h2>

            <div className="space-y-3">

              {/* Create Lab Order */}
              <button
                onClick={() => onNavigate('provider-create-order')}
                className="w-full text-left px-4 py-3 rounded-xl bg-[#eef8f8] hover:bg-[#e1f4f3] transition-colors"
              >
                <span className="block text-sm font-bold text-[#173f4c]">
                  Create Lab Order
                </span>

                <span className="block text-xs text-[#7f959d] mt-1">
                  Submit a new laboratory order
                </span>
              </button>

              {/* My Orders */}
              <button
                onClick={() => onNavigate('provider-orders')}
                className="w-full text-left px-4 py-3 rounded-xl bg-[#eef8f8] hover:bg-[#e1f4f3] transition-colors"
              >
                <span className="block text-sm font-bold text-[#173f4c]">
                  View My Orders
                </span>

                <span className="block text-xs text-[#7f959d] mt-1">
                  Track your assigned laboratory orders
                </span>
              </button>

              {/* Results */}
              <button
                onClick={() => onNavigate('provider-results')}
                className="w-full text-left px-4 py-3 rounded-xl bg-[#eef8f8] hover:bg-[#e1f4f3] transition-colors"
              >
                <span className="block text-sm font-bold text-[#173f4c]">
                  View Results
                </span>

                <span className="block text-xs text-[#7f959d] mt-1">
                  View available diagnostic reports
                </span>
              </button>

            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-[#103d4a]">
                Recent Orders
              </h2>

              <span className="text-xs font-bold text-[#168d90]">
                Provider Orders
              </span>
            </div>

            {/* Loading */}
            {loading && (
              <div className="border border-dashed border-[#dce8e9] rounded-xl p-10 text-center">
                <p className="text-sm font-bold text-[#617d86]">
                  Loading orders...
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && recentAppointments.length === 0 && (
              <div className="border border-dashed border-[#dce8e9] rounded-xl p-10 text-center">
                <p className="text-sm font-bold text-[#617d86]">
                  No assigned laboratory orders yet
                </p>

                <p className="text-xs text-[#8fa7ad] mt-2">
                  Orders from assigned patient appointments will appear here.
                </p>
              </div>
            )}

            {/* Recent appointment orders */}
            {!loading && recentAppointments.length > 0 && (
              <div className="space-y-3">

                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-[#e2eeee] rounded-xl p-4 hover:border-[#c8dddd] transition-colors"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div>
                        <p className="text-sm font-extrabold text-[#173f4c]">
                          {appointment.firstName}{' '}
                          {appointment.lastName}
                        </p>

                        <p className="text-xs text-[#7f959d] mt-1">
                          Confirmation:{' '}
                          {appointment.confirmationNumber}
                        </p>

                        <p className="text-xs text-[#7f959d] mt-1">
                          {appointment.appointmentDate
                            ? new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString()
                            : 'Date unavailable'}{' '}
                          •{' '}
                          {appointment.appointmentTime ||
                            'Time unavailable'}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {formatStatus(appointment.status)}
                      </span>

                    </div>

                    {/* Ordered Tests */}
                    <div className="mt-4">
                      <p className="text-xs font-bold text-[#617d86] uppercase tracking-wide mb-2">
                        Ordered Tests
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {appointment.tests?.map(
                          (item: any) => (
                            <span
                              key={item.id}
                              className="px-2.5 py-1 rounded-lg bg-[#f5fbfb] border border-[#e2eeee] text-xs font-semibold text-[#496873]"
                            >
                              {item.test?.name ||
                                item.package?.name ||
                                'Laboratory Test'}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};