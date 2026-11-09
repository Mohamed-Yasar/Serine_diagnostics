import React, { useEffect, useState } from 'react';

interface LabTest {
  id: string;
  code: string;
  name: string;
  category: string;
  price: string | number;
  fastingRequired: boolean;
  active?: boolean;
  isActive?: boolean;
  status?: string;
}

interface ProviderCreateOrderPageProps {
  onNavigate: (view: string) => void;
}

const API_BASE_URL = 'https://serine-diagnostics.onrender.com/api';

export const ProviderCreateOrderPage: React.FC<
  ProviderCreateOrderPageProps
> = ({ onNavigate }) => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);

  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [biologicalSex, setBiologicalSex] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /*
   * ========================================
   * LOAD LABORATORY TESTS
   * ========================================
   */

  useEffect(() => {
    const loadTests = async () => {
      try {
        setIsLoadingTests(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/tests`);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              'Failed to load laboratory tests'
          );
        }

        /*
         * Backend response can be:
         *
         * { tests: [...] }
         * { data: [...] }
         * { data: { tests: [...] } }
         * { data: { items: [...] } }
         */

        let rawTests: LabTest[] = [];

        if (Array.isArray(result?.tests)) {
          rawTests = result.tests;
        } else if (Array.isArray(result?.data)) {
          rawTests = result.data;
        } else if (Array.isArray(result?.data?.tests)) {
          rawTests = result.data.tests;
        } else if (Array.isArray(result?.data?.items)) {
          rawTests = result.data.items;
        } else if (Array.isArray(result?.items)) {
          rawTests = result.items;
        }

        /*
         * Only exclude tests that are explicitly inactive.
         * If active/isActive is missing, we keep the test.
         */

        const activeTests = rawTests.filter((test) => {
          if (test.active === false) {
            return false;
          }

          if (test.isActive === false) {
            return false;
          }

          if (
            typeof test.status === 'string' &&
            test.status.toUpperCase() === 'INACTIVE'
          ) {
            return false;
          }

          return true;
        });

        setTests(activeTests);

        console.log(
          'Provider Create Order - Laboratory Tests:',
          activeTests
        );
      } catch (err) {
        console.error(
          'Failed to load laboratory tests:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load laboratory tests'
        );

        setTests([]);
      } finally {
        setIsLoadingTests(false);
      }
    };

    loadTests();
  }, []);

  /*
   * ========================================
   * TEST SELECTION
   * ========================================
   */

  const handleTestToggle = (testId: string) => {
    setSelectedTestIds((current) =>
      current.includes(testId)
        ? current.filter((id) => id !== testId)
        : [...current, testId]
    );
  };

  /*
   * ========================================
   * CREATE LAB ORDER
   * ========================================
   */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (selectedTestIds.length === 0) {
      setError(
        'Please select at least one laboratory test.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem(
        'serine_auth_token'
      );

      if (!token) {
        throw new Error(
          'Authentication token is required'
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/provider/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientFirstName,
            patientLastName,
            dateOfBirth,
            biologicalSex,
            email,
            phone,
            notes,
            testIds: selectedTestIds,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Failed to create lab order'
        );
      }

      setMessage(
        `Lab order ${result.order.orderNumber} created successfully.`
      );

      setPatientFirstName('');
      setPatientLastName('');
      setDateOfBirth('');
      setBiologicalSex('');
      setEmail('');
      setPhone('');
      setNotes('');
      setSelectedTestIds([]);
    } catch (err) {
      console.error(
        'Create lab order failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create lab order'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ========================================
   * UI
   * ========================================
   */

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f5fbfb] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">

          <button
            type="button"
            onClick={() => onNavigate('provider')}
            className="text-sm font-bold text-[#168d90] hover:underline mb-4"
          >
            ← Back to Dashboard
          </button>

          <p className="text-xs font-extrabold text-[#168d90] uppercase tracking-[0.2em] mb-2">
            Provider Portal
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a]">
            Create Lab Order
          </h1>

          <p className="text-sm text-[#617d86] mt-2">
            Submit a laboratory order for your patient.
          </p>

        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Patient Information */}

          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">

            <h2 className="text-lg font-extrabold text-[#103d4a] mb-5">
              Patient Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name
                </label>

                <input
                  type="text"
                  required
                  value={patientFirstName}
                  onChange={(event) =>
                    setPatientFirstName(
                      event.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  placeholder="Patient first name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>

                <input
                  type="text"
                  required
                  value={patientLastName}
                  onChange={(event) =>
                    setPatientLastName(
                      event.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  placeholder="Patient last name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date of Birth
                </label>

                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(
                      event.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Biological Sex
                </label>

                <select
                  required
                  value={biologicalSex}
                  onChange={(event) =>
                    setBiologicalSex(
                      event.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
                >
                  <option value="">
                    Select
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  placeholder="patient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  placeholder="Patient phone"
                />
              </div>

            </div>
          </div>

          {/* Laboratory Tests */}

          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">

            <h2 className="text-lg font-extrabold text-[#103d4a] mb-2">
              Laboratory Tests
            </h2>

            <p className="text-sm text-[#617d86] mb-5">
              Select one or more tests for this patient.
            </p>

            {isLoadingTests ? (
              <p className="text-sm text-slate-500">
                Loading laboratory tests...
              </p>
            ) : tests.length === 0 ? (
              <p className="text-sm text-slate-500">
                No active laboratory tests available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {tests.map((test) => (
                  <label
                    key={test.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedTestIds.includes(test.id)
                        ? 'border-[#168d90] bg-[#eef8f8]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={selectedTestIds.includes(
                        test.id
                      )}
                      onChange={() =>
                        handleTestToggle(test.id)
                      }
                      className="mt-1"
                    />

                    <div>

                      <p className="text-sm font-bold text-[#173f4c]">
                        {test.name}
                      </p>

                      <p className="text-xs text-[#7f959d] mt-1">
                        {test.code} • {test.category}
                      </p>

                      {test.fastingRequired && (
                        <p className="text-xs font-semibold text-[#168d90] mt-1">
                          Fasting required
                        </p>
                      )}

                    </div>

                  </label>
                ))}

              </div>
            )}

          </div>

          {/* Notes */}

          <div className="bg-white rounded-2xl border border-[#e2eeee] p-6 shadow-sm">

            <h2 className="text-lg font-extrabold text-[#103d4a] mb-5">
              Order Notes
            </h2>

            <textarea
              rows={4}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90] resize-none"
              placeholder="Optional clinical or order notes"
            />

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingTests ||
              tests.length === 0
            }
            className="w-full py-4 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition-colors disabled:opacity-60"
          >
            {isSubmitting
              ? 'Submitting Lab Order...'
              : 'Submit Lab Order'}
          </button>

        </form>

      </div>
    </div>
  );
};