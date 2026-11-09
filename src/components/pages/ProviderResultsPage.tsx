import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProviderResultsPageProps {
  onNavigate: (view: string) => void;
}

interface LabTest {
  id: string;
  name: string;
  code?: string;
  category?: string;
  specimenType?: string;
}

interface LabOrder {
  id: string;
  orderNumber: string;
  patientFirstName: string;
  patientLastName: string;
  dateOfBirth: string;
  biologicalSex: string;
  status?: string;
  createdAt: string;
}

interface LabResult {
  id: string;
  labOrderTestId: string;
  resultValue?: string | null;
  units?: string | null;
  referenceRange?: string | null;
  resultStatus: string;
  comments?: string | null;
  performedAt?: string | null;
  releasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  labOrderTest: {
    test: LabTest;
    order: LabOrder;
  };
}

const API_BASE_URL = 'https://serine-diagnostics.onrender.com/api';

export const ProviderResultsPage: React.FC<
  ProviderResultsPageProps
> = ({ onNavigate }) => {
  const { token } = useAuth();

  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedResult, setSelectedResult] =
    useState<LabResult | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState<string | null>(null);

  const [pdfLoadingId, setPdfLoadingId] =
    useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/provider/results`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || 'Failed to load results'
          );
        }

        setResults(
          Array.isArray(data?.results)
            ? data.results
            : []
        );
      } catch (err) {
        console.error(
          'Failed to load provider results:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load results'
        );
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [token]);

  const formatDate = (date?: string | null) => {
    if (!date) {
      return 'Date unavailable';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString();
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) {
      return 'Not available';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available';
    }

    return parsedDate.toLocaleString();
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

  const handleViewDetails = async (resultId: string) => {
    if (!token) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError(null);

      const response = await fetch(
        `${API_BASE_URL}/provider/results/${resultId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'Failed to load result details'
        );
      }

      if (!data?.result) {
        throw new Error('Result details are unavailable');
      }

      setSelectedResult(data.result);
    } catch (err) {
      console.error(
        'Failed to load result details:',
        err
      );

      setDetailsError(
        err instanceof Error
          ? err.message
          : 'Failed to load result details'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDownloadReport = async (result: LabResult) => {
    if (!token) {
      return;
    }

    try {
      setPdfLoadingId(result.id);

      const response = await fetch(
        `${API_BASE_URL}/provider/results/${result.id}/pdf`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = 'Failed to download diagnostic report';

        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          // PDF/error response was not JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = url;

      const safeOrderNumber = result.labOrderTest.order.orderNumber
        .replace(/[^a-zA-Z0-9-_]/g, '_');

      anchor.download = `Diagnostic-Report-${safeOrderNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        'Failed to download diagnostic report:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to download diagnostic report'
      );
    } finally {
      setPdfLoadingId(null);
    }
  };

  const closeDetails = () => {
    setSelectedResult(null);
    setDetailsError(null);
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f5fbfb] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <button
            onClick={() => onNavigate('provider')}
            className="mb-5 text-sm font-bold text-[#168d90] hover:text-[#103d4a] transition-colors"
          >
            ← Back to Provider Dashboard
          </button>

          <h1 className="text-3xl font-bold text-[#103d4a]">
            View Results
          </h1>

          <p className="mt-2 text-sm text-[#617d86]">
            View laboratory results for your patients.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-[#617d86]">
              Loading results...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-red-600 font-medium">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          results.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold text-[#103d4a]">
                No Results Available
              </h2>

              <p className="mt-2 text-sm text-[#617d86]">
                Laboratory results will appear here once
                they are received from the laboratory system.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => {
                const order =
                  result.labOrderTest.order;

                const test =
                  result.labOrderTest.test;

                return (
                  <div
                    key={result.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2eeee]"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#168d90]">
                          {test.code || 'LAB TEST'}
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-[#103d4a]">
                          {test.name}
                        </h2>

                        <p className="mt-2 text-sm text-[#496873]">
                          Patient:{' '}
                          <span className="font-semibold">
                            {order.patientFirstName}{' '}
                            {order.patientLastName}
                          </span>
                        </p>

                        <p className="text-sm text-[#496873]">
                          Order:{' '}
                          <span className="font-semibold">
                            {order.orderNumber}
                          </span>
                        </p>

                        <p className="text-sm text-[#496873]">
                          Date:{' '}
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="lg:text-right">
                        <div className="inline-flex px-3 py-1 rounded-full bg-[#eef8f8] text-[#168d90] text-sm font-bold">
                          {formatStatus(
                            result.resultStatus
                          )}
                        </div>

                        <p className="mt-3 text-2xl font-bold text-[#103d4a]">
                          {result.resultValue || 'Pending'}
                        </p>

                        {result.units && (
                          <p className="text-sm text-[#617d86]">
                            {result.units}
                          </p>
                        )}

                        {result.referenceRange && (
                          <p className="mt-1 text-xs text-[#617d86]">
                            Reference: {result.referenceRange}
                          </p>
                        )}

                        <div className="mt-4 flex flex-col sm:flex-row lg:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewDetails(result.id)
                            }
                            disabled={detailsLoading}
                            className="px-4 py-2 rounded-xl border border-[#168d90] text-[#168d90] bg-white text-sm font-bold hover:bg-[#eef8f8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {detailsLoading
                              ? 'Loading...'
                              : 'View Details'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadReport(result)
                            }
                            disabled={pdfLoadingId === result.id}
                            className="px-4 py-2 rounded-xl bg-[#168d90] text-white text-sm font-bold hover:bg-[#103d4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {pdfLoadingId === result.id
                              ? 'Preparing PDF...'
                              : 'Download Report'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#e2eeee]">

              <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2eeee]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#168d90]">
                    {selectedResult.labOrderTest.test.code || 'LAB TEST'}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#103d4a]">
                    Result Details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="text-2xl leading-none text-[#617d86] hover:text-[#103d4a]"
                  aria-label="Close result details"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {detailsError && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                    <p className="text-sm font-medium text-red-600">
                      {detailsError}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-[#103d4a]">
                    Patient Information
                  </h3>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#617d86]">
                        Patient
                      </p>
                      <p className="text-sm font-semibold text-[#496873]">
                        {selectedResult.labOrderTest.order.patientFirstName}{' '}
                        {selectedResult.labOrderTest.order.patientLastName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#617d86]">
                        Date of Birth
                      </p>
                      <p className="text-sm font-semibold text-[#496873]">
                        {formatDate(
                          selectedResult.labOrderTest.order.dateOfBirth
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#617d86]">
                        Biological Sex
                      </p>
                      <p className="text-sm font-semibold text-[#496873]">
                        {selectedResult.labOrderTest.order.biologicalSex}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#617d86]">
                        Order Number
                      </p>
                      <p className="text-sm font-semibold text-[#496873]">
                        {selectedResult.labOrderTest.order.orderNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#103d4a]">
                    Laboratory Test
                  </h3>

                  <div className="mt-3 rounded-xl bg-[#f5fbfb] p-4">
                    <p className="text-base font-bold text-[#103d4a]">
                      {selectedResult.labOrderTest.test.name}
                    </p>

                    {selectedResult.labOrderTest.test.code && (
                      <p className="mt-1 text-sm text-[#617d86]">
                        Code: {selectedResult.labOrderTest.test.code}
                      </p>
                    )}

                    {selectedResult.labOrderTest.test.category && (
                      <p className="mt-1 text-sm text-[#617d86]">
                        Category: {selectedResult.labOrderTest.test.category}
                      </p>
                    )}

                    {selectedResult.labOrderTest.test.specimenType && (
                      <p className="mt-1 text-sm text-[#617d86]">
                        Specimen: {selectedResult.labOrderTest.test.specimenType}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#103d4a]">
                    Result
                  </h3>

                  <div className="mt-3 rounded-xl border border-[#e2eeee] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#617d86]">
                          Result Value
                        </p>
                        <p className="mt-1 text-2xl font-bold text-[#103d4a]">
                          {selectedResult.resultValue || 'Pending'}
                        </p>
                      </div>

                      <div className="inline-flex self-start sm:self-auto px-3 py-1 rounded-full bg-[#eef8f8] text-[#168d90] text-sm font-bold">
                        {formatStatus(selectedResult.resultStatus)}
                      </div>
                    </div>

                    {selectedResult.units && (
                      <p className="mt-4 text-sm text-[#496873]">
                        <span className="font-semibold">Units:</span>{' '}
                        {selectedResult.units}
                      </p>
                    )}

                    {selectedResult.referenceRange && (
                      <p className="mt-1 text-sm text-[#496873]">
                        <span className="font-semibold">
                          Reference Range:
                        </span>{' '}
                        {selectedResult.referenceRange}
                      </p>
                    )}

                    {selectedResult.comments && (
                      <div className="mt-4">
                        <p className="text-xs text-[#617d86]">
                          Comments
                        </p>
                        <p className="mt-1 text-sm text-[#496873] whitespace-pre-wrap">
                          {selectedResult.comments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#103d4a]">
                    Report Dates
                  </h3>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#617d86]">
                        Performed
                      </p>
                      <p className="text-sm font-semibold text-[#496873]">
                        {formatDateTime(selectedResult.performedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#617d86]">
                        Released
                      </p>
                      <p className="text-sm font-semibold text-[#496873]">
                        {formatDateTime(selectedResult.releasedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="px-4 py-2 rounded-xl border border-[#d5e4e5] text-[#496873] bg-white text-sm font-bold hover:bg-[#f5fbfb] transition-colors"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadReport(selectedResult)
                    }
                    disabled={pdfLoadingId === selectedResult.id}
                    className="px-4 py-2 rounded-xl bg-[#168d90] text-white text-sm font-bold hover:bg-[#103d4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pdfLoadingId === selectedResult.id
                      ? 'Preparing PDF...'
                      : 'Download Diagnostic Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProviderResultsPage;
