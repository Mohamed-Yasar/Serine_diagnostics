import React, { useEffect, useState, useMemo } from 'react';
import { DEMO_TIME_SLOTS } from '../../data/labData';
import { useLabData } from '../../context/LabDataContext';
import {
  BookingState,
  CreateAppointmentRequest,
} from '../../types';
import { createAppointment, fetchBookedAppointmentTimes } from '../../services/api';
import { getBookingConfig } from '../../config/bookingConfig';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldAlert,
  Printer,
  Sparkles,
  ExternalLink,
  FlaskConical,
  Activity,
  Droplets,
  AlertCircle
} from 'lucide-react';
import { DateOfBirthPicker } from './DateOfBirthPicker';
import { printAppointmentSummary } from './PrintAppointmentSummary';

function getChicagoDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function addDaysToDateString(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function getDateLabel(dateString: string) {
  const date = new Date(`${dateString}T12:00:00Z`);
  return {
    dayName: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    monthName: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
    dayNum: date.getUTCDate(),
    isSunday: date.getUTCDay() === 0,
  };
}

function timeToMinutes(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour === 12) hour = 0;
  if (period === 'PM') hour += 12;

  return hour * 60 + minute;
}

function isChicagoSlotInPast(
  dateString: string,
  time: string,
  chicagoNow: { date: string; minutes: number } | null
) {
  // The server/database clock is the source of truth. Until the first
  // availability response arrives, do not incorrectly mark slots as past.
  if (!chicagoNow || !chicagoNow.date || chicagoNow.minutes < 0) return false;

  if (dateString < chicagoNow.date) return true;
  if (dateString > chicagoNow.date) return false;

  const slotMinutes = timeToMinutes(time);
  return slotMinutes >= 0 && slotMinutes <= chicagoNow.minutes;
}

interface BookingWizardProps {
  initialTestId?: string | null;
  initialPackageId?: string | null;
  initialLocationId?: string | null;
  onNavigateHome: () => void;
  onNavigate: (
    view: string,
    testId?: string,
    packageId?: string,
    locationId?: string
  ) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialTestId = null,
  initialPackageId = null,
  initialLocationId = null,
  onNavigateHome,
  onNavigate
}) => {
  const {
    tests,
    packages,
    locations,
    testsLoading,
    packagesLoading,
    locationsLoading,
    testsError,
    packagesError,
    locationsError,
  } = useLabData();

  const bookingConfig = getBookingConfig();

  // Calculate the 14-day selector from Chicago calendar dates,
  // so the booking date never depends on the patient's device timezone.
  const availableDates = useMemo(() => {
    const chicagoToday = getChicagoDateParts();
    const todayString = `${String(chicagoToday.year).padStart(4, '0')}-${String(chicagoToday.month).padStart(2, '0')}-${String(chicagoToday.day).padStart(2, '0')}`;
    const dates = [];

    for (let i = 0; i < 14; i++) {
      const fullDate = addDaysToDateString(todayString, i);
      const label = getDateLabel(fullDate);

      dates.push({
        fullDate,
        dayName: label.dayName,
        monthName: label.monthName,
        dayNum: label.dayNum,
        isSunday: label.isSunday,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }

    return dates;
  }, []);

  // Initial booking state
  const [state, setState] = useState<BookingState>({
    step: 1,
    selectedTestId: initialTestId,
    selectedPackageId: initialPackageId,
    customTestRequested: '',
    selectedLocationId: initialLocationId || locations[0]?.id || '',
    selectedDate: availableDates.find(d => !d.isSunday)?.fullDate || availableDates[0].fullDate,
    selectedTime: '08:30 AM',
    patientInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      biologicalSex: '',
      insuranceType: 'private_insurance',
      insuranceCarrier: '',
      hasPhysicianOrder: 'yes_paper',
      physicianName: '',
      specialAssistance: [],
      notes: ''
    }
  });

  // Step 1 Search & Category filter state
  const [testSearch, setTestSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [itemType, setItemType] = useState<'tests' | 'packages' | 'custom'>('tests');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [serverChicagoNow, setServerChicagoNow] = useState<{ date: string; minutes: number } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAvailability = async () => {
      if (!state.selectedLocationId || !state.selectedDate || state.step !== 2) {
        return;
      }

      setAvailabilityLoading(true);

      try {
        const availability = await fetchBookedAppointmentTimes(
          state.selectedLocationId,
          state.selectedDate
        );

        if (!cancelled) {
          setBookedTimes(availability.bookedTimes);
          setServerChicagoNow(availability.chicagoNow);
        }
      } catch (error) {
        console.error('Failed to load slot availability:', error);
        if (!cancelled) {
          setBookedTimes([]);
          setServerChicagoNow(null);
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    };

    void loadAvailability();

    if (state.step !== 2) {
      return () => { cancelled = true; };
    }

    const interval = window.setInterval(() => {
      void loadAvailability();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [state.selectedLocationId, state.selectedDate, state.step]);

  // Only active + bookable tests can be selected for online booking.
  // Inactive tests remain available to the admin catalog, but are never
  // presented as bookable services to patients.
  const bookableTests = useMemo(() => {
    return tests.filter(t => t.active !== false && t.bookable === true);
  }, [tests]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return bookableTests.filter(t => {
      const matchesSearch = testSearch.trim() === '' ||
        t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
        t.code.toLowerCase().includes(testSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(testSearch.toLowerCase()) ||
        t.categoryLabel.toLowerCase().includes(testSearch.toLowerCase());

      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [bookableTests, testSearch, selectedCategory]);

  // If a booking URL contains an inactive or non-bookable test ID,
  // clear it after the test catalog has loaded instead of allowing it
  // to be submitted.
  useEffect(() => {
    if (testsLoading || !initialTestId) return;

    const initialTest = tests.find(t => t.id === initialTestId);
    const isValidInitialTest =
      !!initialTest &&
      initialTest.active !== false &&
      initialTest.bookable === true;

    if (!isValidInitialTest) {
      setState(prev => ({
        ...prev,
        selectedTestId: null,
      }));
    }
  }, [tests, testsLoading, initialTestId]);

  // Active selections
  const currentTest = tests.find(t => t.id === state.selectedTestId);
  const currentPackage = packages.find(p => p.id === state.selectedPackageId);
  const currentLocation = locations.find(l => l.id === state.selectedLocationId) || locations[0];

  const isSlotUnavailable = (time: string) =>
    isChicagoSlotInPast(state.selectedDate, time, serverChicagoNow) || bookedTimes.includes(time);

  const getSlotUnavailableReason = (time: string) => {
    if (isChicagoSlotInPast(state.selectedDate, time, serverChicagoNow)) {
      return 'Past';
    }

    if (bookedTimes.includes(time)) {
      return 'Booked';
    }

    return null;
  };


  // Helper to handle test selection
  const selectTest = (testId: string) => {
    setState(prev => ({
      ...prev,
      selectedTestId: testId,
      selectedPackageId: null,
      customTestRequested: ''
    }));
  };

  // Helper to handle package selection
  const selectPackage = (packageId: string) => {
    setState(prev => ({
      ...prev,
      selectedPackageId: packageId,
      selectedTestId: null,
      customTestRequested: ''
    }));
  };

  // Step 3 Validation
  const validatePatientInfo = () => {
    const errors: Record<string, string> = {};
    if (!state.patientInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!state.patientInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!state.patientInfo.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (state.patientInfo.dateOfBirth) {
      const [year, month, day] =
        state.patientInfo.dateOfBirth.split('-').map(Number);

      const dateOfBirth = new Date(
        year,
        month - 1,
        day
      );

      const today = new Date();

      const dobDateOnly = new Date(
        dateOfBirth.getFullYear(),
        dateOfBirth.getMonth(),
        dateOfBirth.getDate()
      );

      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (dobDateOnly > todayDateOnly) {
        errors.dateOfBirth =
          'Date of birth cannot be in the future';
      }
    }

    if (!state.patientInfo.email.trim() || !state.patientInfo.email.includes('@')) {
      errors.email = 'A valid email address is required';
    }
    if (!state.patientInfo.phone.trim() || state.patientInfo.phone.length < 7) {
      errors.phone = 'Valid phone number is required';
    }
    if (!state.patientInfo.biologicalSex) {
      errors.biologicalSex = 'Please select biological sex for lab reference ranges';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const mapBiologicalSex = (value: string) => {
    const sexMap: Record<string, string> = {
      female: 'FEMALE',
      male: 'MALE',
      other: 'OTHER',
    };

    return sexMap[value] || value.toUpperCase();
  };

  const mapInsuranceType = (value: string) => {
    const insuranceMap: Record<string, string> = {
      private_insurance: 'PRIVATE_INSURANCE',
      medicare: 'MEDICARE',
      medicaid: 'MEDICAID',
      self_pay: 'SELF_PAY',
      uninsured_assistance: 'UNINSURED_ASSISTANCE',
    };

    return insuranceMap[value] || value.toUpperCase();
  };

  const mapPhysicianOrder = (value: string) => {
    const orderMap: Record<string, string> = {
      yes_paper: 'YES_PAPER',
      yes_electronic: 'YES_ELECTRONIC',
      need_clinical_order: 'NEED_CLINICAL_ORDER',
      wellness_self_request: 'WELLNESS_SELF_REQUEST',
    };

    return orderMap[value] || value.toUpperCase();
  };

  const submitAppointment = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (state.customTestRequested) {
        throw new Error(
          'Doctor’s Order bookings are not yet available through the online booking API.'
        );
      }

      // Never submit an inactive or non-bookable test, even if a stale
      // selection or manually modified URL reaches this component.
      if (state.selectedTestId) {
        const selectedBookableTest = tests.find(
          test => test.id === state.selectedTestId
        );

        if (
          !selectedBookableTest ||
          selectedBookableTest.active === false ||
          selectedBookableTest.bookable !== true
        ) {
          setState(prev => ({
            ...prev,
            selectedTestId: null,
            step: 1,
          }));

          throw new Error(
            'This test is currently unavailable for online booking. Please select another test.'
          );
        }
      }

      const selectedTests: CreateAppointmentRequest['selectedTests'] = [];

      if (state.selectedTestId) {
        selectedTests.push({
          type: 'test',
          id: state.selectedTestId,
        });
      }

if (state.selectedPackageId) {
  selectedTests.push({
    type: 'package',
    id: state.selectedPackageId,
  });
}

if (selectedTests.length === 0) {
  throw new Error(
    'Please select a lab test or wellness package.'
  );
}

      const appointmentData: CreateAppointmentRequest = {
        appointmentDate: state.selectedDate,
        appointmentTime: state.selectedTime,
        locationId: state.selectedLocationId,
        firstName: state.patientInfo.firstName,
        lastName: state.patientInfo.lastName,
        dateOfBirth: state.patientInfo.dateOfBirth,
        email: state.patientInfo.email,
        phone: state.patientInfo.phone,
        biologicalSex: mapBiologicalSex(state.patientInfo.biologicalSex),
        insuranceType: mapInsuranceType(state.patientInfo.insuranceType),
        insuranceCarrier: state.patientInfo.insuranceCarrier || null,
        hasPhysicianOrder: mapPhysicianOrder(state.patientInfo.hasPhysicianOrder),
        physicianName: state.patientInfo.physicianName || null,
        specialAssistance: state.patientInfo.specialAssistance,
        notes: state.patientInfo.notes || null,
        selectedTests,
      };

      const result = await createAppointment(appointmentData);

      setState(prev => ({
        ...prev,
        step: 5,
        confirmationNumber: result.data.confirmationNumber,
      }));

      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (error) {
      console.error('Appointment submission failed:', error);

      if (error instanceof Error && error.message.includes('slot is no longer available')) {
        setBookedTimes(prev =>
          prev.includes(state.selectedTime)
            ? prev
            : [...prev, state.selectedTime]
        );
        setState(prev => ({ ...prev, step: 2 }));
        setSubmitError(null);
        setFormErrors({ location: 'That slot was just booked by another patient. It is now marked as Booked. Please choose another time.' });
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to create appointment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (state.step === 1) {
      if (!state.selectedTestId && !state.selectedPackageId && !state.customTestRequested) {
        setFormErrors({ test: 'Please select a test, package, or enter a physician order.' });
        return;
      }
      setFormErrors({});
      setState(prev => ({ ...prev, step: 2 }));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (state.step === 2) {
      if (!state.selectedLocationId || !state.selectedDate || !state.selectedTime) {
        setFormErrors({ location: 'Please choose your location, date, and appointment time.' });
        return;
      }

      if (isSlotUnavailable(state.selectedTime)) {
        setFormErrors({ location: 'That appointment slot is no longer available. Please select another time.' });
        return;
      }

      setFormErrors({});
      setState(prev => ({ ...prev, step: 3 }));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (state.step === 3) {
      if (!validatePatientInfo()) return;
      setState(prev => ({ ...prev, step: 4 }));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (state.step === 4) {
      void submitAppointment();
    }
  };

  const handleBack = () => {
    if (state.step > 1 && state.step < 5) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as any }));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setState({
      step: 1,
      selectedTestId: null,
      selectedPackageId: null,
      customTestRequested: '',
      selectedLocationId: locations[0]?.id || '',
      selectedDate: availableDates[0].fullDate,
      selectedTime: '08:30 AM',
      patientInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        biologicalSex: '',
        insuranceType: 'private_insurance',
        insuranceCarrier: '',
        hasPhysicianOrder: 'yes_paper',
        physicianName: '',
        specialAssistance: [],
        notes: ''
      }
    });
    setFormErrors({});
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDataLoading = testsLoading || packagesLoading || locationsLoading;
  const dataError = testsError || packagesError || locationsError;

  if (isDataLoading) {
    return (
      <div className="bg-[#f6fafb] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-[#dce8ea] shadow-sm p-8 text-center">
          <FlaskConical className="w-10 h-10 text-[#168d90] mx-auto mb-3 animate-pulse" />
          <h2 className="text-lg font-extrabold text-[#103d4a]">Loading booking information...</h2>
          <p className="text-sm text-[#5c7780] mt-2">Please wait while we load tests, packages, and locations.</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="bg-[#f6fafb] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-3xl border border-red-200 shadow-sm p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-[#103d4a]">Unable to load booking data</h2>
          <p className="text-sm text-[#5c7780] mt-2">{dataError}</p>
          <button onClick={() => window.location.reload()} className="mt-5 px-5 py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-sm font-bold">Try Again</button>
        </div>
      </div>
    );
  }

  if (tests.length === 0 || locations.length === 0) {
    return (
      <div className="bg-[#f6fafb] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-3xl border border-[#dce8ea] shadow-sm p-8 text-center">
          <AlertCircle className="w-10 h-10 text-[#b85c18] mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-[#103d4a]">Booking data is unavailable</h2>
          <p className="text-sm text-[#5c7780] mt-2">No active tests or locations were returned by the server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6fafb] min-h-screen">
      {/* Header Banner for Booking */}
      <section className="bg-gradient-to-r from-[#edf8f6] via-[#f7fbfc] to-[#edf7f9] border-b border-[#dce8ea] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e1f4f3] text-[#168d90] text-xs font-extrabold uppercase tracking-wider mb-3">
            <FlaskConical className="w-3.5 h-3.5" />
            Patient Scheduling Journey
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103d4a] tracking-tight">
            Schedule Your Diagnostic Test
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5c7780] max-w-2xl mx-auto leading-relaxed">
            Follow our guided 4-step process to select your clinical tests, choose a Centralia patient service center or home draw, and pick your preferred time.
          </p>

        </div>
      </section>

      {/* Main Booking Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress Step Indicator (Visible on steps 1-4) */}
        {state.step < 5 && (
          <div className="mb-10 bg-white p-4 sm:p-6 rounded-2xl border border-[#dce8ea] shadow-sm">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
              {/* Connector line */}
              <div className="hidden sm:block absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-[#e4edf0] -z-0" />

              {[
                { stepNum: 1, title: '1. Test / Service', desc: 'Choose lab tests' },
                { stepNum: 2, title: '2. Location & Time', desc: 'Centralia center & date' },
                { stepNum: 3, title: '3. Patient Info', desc: 'Intake demo fields' },
                { stepNum: 4, title: '4. Review & Confirm', desc: 'Final appointment check' }
              ].map((item) => {
                const isCurrent = state.step === item.stepNum;
                const isPassed = state.step > item.stepNum;

                return (
                  <div key={item.stepNum} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                        isCurrent
                          ? 'bg-[#168d90] text-white ring-4 ring-[#e1f4f3] shadow-md scale-105'
                          : isPassed
                          ? 'bg-[#299a9c] text-white'
                          : 'bg-[#edf3f4] text-[#8199a0]'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : item.stepNum}
                    </div>
                    <span
                      className={`mt-2 text-xs font-bold leading-tight ${
                        isCurrent ? 'text-[#103d4a]' : isPassed ? 'text-[#168d90]' : 'text-[#8199a0]'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="hidden sm:block text-[11px] text-[#8199a0] mt-0.5">{item.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: CHOOSE TEST OR SERVICE
           ========================================================================= */}
        {state.step === 1 && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#dce8ea] shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#eef4f5]">
                <div>
                  <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">Step 1 of 4</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-1">
                    What test or service are you visiting for?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#66808a] mt-1">
                    Select individual diagnostic tests, comprehensive wellness packages, or enter a physician’s custom lab requisition.
                  </p>
                </div>

                {/* Switcher Tab */}
                <div className="inline-flex p-1 bg-[#f0f6f7] rounded-xl border border-[#dce8ea]">
                  <button
                    onClick={() => setItemType('tests')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      itemType === 'tests'
                        ? 'bg-white text-[#103d4a] shadow-sm'
                        : 'text-[#66808a] hover:text-[#103d4a]'
                    }`}
                  >
                    Individual Tests ({bookableTests.length})
                  </button>
                  <button
                    onClick={() => setItemType('packages')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      itemType === 'packages'
                        ? 'bg-white text-[#103d4a] shadow-sm'
                        : 'text-[#66808a] hover:text-[#103d4a]'
                    }`}
                  >
                    Wellness Packages ({packages.length})
                  </button>
                  <button
                    onClick={() => setItemType('custom')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      itemType === 'custom'
                        ? 'bg-white text-[#103d4a] shadow-sm'
                        : 'text-[#66808a] hover:text-[#103d4a]'
                    }`}
                  >
                    Doctor's Order
                  </button>
                </div>
              </div>

              {formErrors.test && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formErrors.test}
                </div>
              )}

              {/* INDIVIDUAL TESTS SUB-VIEW */}
              {itemType === 'tests' && (
                <div className="mt-6 space-y-6">
                  {/* Search Bar & Category Filters */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#88a1a8]" />
                      <input
                        type="text"
                        value={testSearch}
                        onChange={(e) => setTestSearch(e.target.value)}
                        placeholder="Search by test name, CPT code, or condition (e.g. CBC, Thyroid, Cholesterol, Vitamin D, Glucose)..."
                        className="w-full pl-10 pr-4 py-3 bg-[#f8fbfb] border border-[#d6e4e6] rounded-xl text-sm text-[#103d4a] placeholder-[#93a7ad] focus:bg-white focus:border-[#168d90] focus:ring-2 focus:ring-[#168d90]/10 outline-none transition-all"
                      />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { id: 'all', label: 'All Tests' },
                        { id: 'hematology', label: 'Hematology & Blood' },
                        { id: 'biochemistry', label: 'Metabolic & Lipids' },
                        { id: 'endocrinology', label: 'Thyroid & Hormones' },
                        { id: 'wellness', label: 'Vitamins & Nutrition' },
                        { id: 'infectious', label: 'Respiratory & Infectious' },
                        { id: 'immunology', label: 'Cardiac & Inflammation' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            selectedCategory === cat.id
                              ? 'bg-[#168d90] text-white'
                              : 'bg-[#edf5f6] text-[#4f6f77] hover:bg-[#e1f0f2]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Test Selection Grid */}
                  {filteredTests.length === 0 && (
                    <div className="p-5 rounded-2xl bg-[#f8fbfb] border border-[#dce8ea] text-center">
                      <FlaskConical className="w-8 h-8 text-[#9bb5bb] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#103d4a]">
                        No bookable tests found
                      </p>
                      <p className="text-xs text-[#66808a] mt-1">
                        Try another search or category. Tests that are inactive
                        or not configured for online booking are not shown here.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredTests.map((test) => {
                      const isSelected = state.selectedTestId === test.id;
                      return (
                        <div
                          key={test.id}
                          onClick={() => selectTest(test.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? 'border-[#168d90] bg-[#f2faf9] ring-2 ring-[#168d90]/20 shadow-sm'
                              : 'border-[#dce8ea] bg-white hover:border-[#b4d6d8] hover:bg-[#fbfdfd]'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-2 py-0.5 rounded">
                                {test.categoryLabel}
                              </span>
                           
                            </div>

                            <h3 className="font-bold text-sm text-[#103d4a] mt-2 leading-snug">
                              {test.name}
                            </h3>
                            <p className="text-xs text-[#66808a] mt-1.5 line-clamp-2 leading-relaxed">
                              {test.description}
                            </p>
                            <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    onNavigate('tests', test.id);
  }}
  className="mt-2 text-xs font-bold text-[#168d90] hover:text-[#117a7d] hover:underline cursor-pointer text-left"
>
  More Details
</button>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[#e8f1f2] flex items-center justify-between text-[11px] text-[#55737c]">
                            <div className="flex items-center gap-3">
                              {test.fastingRequired ? (
                                <span className="inline-flex items-center gap-1 text-[#b85c18] font-bold">
                                  <Clock className="w-3 h-3" />
                                  {test.fastingHours ? `${test.fastingHours}h Fasting` : 'Fasting Required'}
                                </span>
                              ) : (
                                <span className="text-[#3c8266] font-medium">No Fasting Required</span>
                              )}
                              <span>• {test.turnaroundTime}</span>
                            </div>

                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#168d90] bg-[#168d90] text-white' : 'border-[#9ab0b5]'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WELLNESS PACKAGES SUB-VIEW */}
              {itemType === 'packages' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = state.selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => selectPackage(pkg.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                          isSelected
                            ? 'border-[#168d90] bg-[#f2faf9] ring-2 ring-[#168d90]/20 shadow-sm'
                            : 'border-[#dce8ea] bg-white hover:border-[#b4d6d8] hover:bg-[#fbfdfd]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            {pkg.badge && (
  <span className="text-[10px] font-extrabold bg-[#168d90] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
    {pkg.badge}
  </span>
)}
</div>

<h3 className="font-extrabold text-base text-[#103d4a] mt-2">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-[#168d90] font-semibold mt-0.5">
                            {pkg.tagline}
                          </p>
                          <p className="text-xs text-[#66808a] mt-2 leading-relaxed">
                            {pkg.description}
                          </p>

                          <div className="mt-3 bg-[#f8fbfb] p-2.5 rounded-xl border border-[#e5eeef]">
                            <span className="text-[11px] font-bold text-[#103d4a] block mb-1">
                              Includes {pkg.testCount} tests & panels:
                            </span>
                            <ul className="text-[11px] text-[#55737c] space-y-0.5">
                              {pkg.testsIncluded.slice(0, 4).map((t, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-[#168d90] flex-shrink-0" />
                                  <span>{t}</span>
                                </li>
                              ))}
                              {pkg.testsIncluded.length > 4 && (
                                <li className="text-[10px] text-[#168d90] font-semibold pl-4">
                                  + {pkg.testsIncluded.length - 4} more panels
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#e8f1f2] flex items-center justify-between text-xs">
                          <span className="text-[#b85c18] font-bold text-[11px]">
                            {pkg.fastingRequired ? '10-12 Hour Fasting Required' : 'No Fasting'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isSelected ? 'bg-[#168d90] text-white' : 'bg-[#e8f6f4] text-[#168d90]'
                          }`}>
                            {isSelected ? 'Selected' : 'Select Package'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CUSTOM PHYSICIAN ORDER SUB-VIEW */}
              {itemType === 'custom' && (
                <div className="mt-6 p-6 rounded-2xl bg-[#f8fbfb] border border-[#dce8ea] space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#103d4a]">
                        Have a Doctor's Lab Requisition or Prescription?
                      </h3>
                      <p className="text-xs text-[#66808a] mt-1 leading-relaxed">
                        If your healthcare provider ordered specific laboratory tests on their own requisition form or electronic prescription, enter the test names or note below. You will bring the physical order or have your doctor fax it to Serine Diagnostics at 872-330-7679.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#294c57] mb-1">
                      List Requested Tests or Clinical Notes
                    </label>
                    <textarea
                      rows={3}
                      value={state.customTestRequested}
                      onChange={(e) => {
                        setState(prev => ({
                          ...prev,
                          customTestRequested: e.target.value,
                          selectedTestId: null,
                          selectedPackageId: null
                        }));
                      }}
                      placeholder="e.g. Physician ordered: Lipid Panel, Thyroid TSH, Fasting Insulin, Vitamin D..."
                      className="w-full p-3 bg-white border border-[#d6e4e6] rounded-xl text-xs text-[#103d4a] placeholder-[#9cb0b6] focus:border-[#168d90] focus:ring-2 focus:ring-[#168d90]/10 outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#edf7f9] rounded-xl text-[11px] text-[#336371] flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 text-[#168d90]" />
                    <span>
                      Our phlebotomists will review your physician's requisition upon arrival to ensure all tubes and special handling requirements are fulfilled.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Summary Card & Next Button */}
            {(currentTest || currentPackage || state.customTestRequested) && (
              <div className="bg-[#103d4a] text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#8ae0dc] tracking-wider">Current Selection</span>
                  <div className="text-base sm:text-lg font-extrabold mt-0.5">
                    {currentTest ? currentTest.name : currentPackage ? currentPackage.name : `Doctor's Order: ${state.customTestRequested}`}
                  </div>
                  <div className="text-xs text-[#b0ced6] mt-0.5 flex items-center gap-3">
  {currentTest && <span>Code: {currentTest.code}</span>}
  {currentPackage && <span>{currentPackage.testCount} Tests</span>}
  <span>Same-day STAT available at Centralia Lab</span>
</div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                >
                  Continue to Location & Date
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 2: CHOOSE LOCATION, DATE & TIME
           ========================================================================= */}
        {state.step === 2 && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-8">
              <div>
                <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">Step 2 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-1">
                  Choose Location, Date & Available Time
                </h2>
                <p className="text-xs sm:text-sm text-[#66808a] mt-1">
                  Select your preferred Centralia patient service center, appointment date, and time slot.
                </p>
              </div>

              {formErrors.location && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formErrors.location}
                </div>
              )}

              {/* 1. Location Selection */}
              <div>
                <label className="block text-xs font-extrabold text-[#294c57] uppercase tracking-wider mb-3">
                  1. Select Patient Service Center or Mobile Draw
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {locations.map((loc) => {
                    const isSelected = state.selectedLocationId === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setState(prev => ({ ...prev, selectedLocationId: loc.id }))}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#168d90] bg-[#f2faf9] ring-2 ring-[#168d90]/20 shadow-sm'
                            : 'border-[#dce8ea] bg-white hover:border-[#b4d6d8] hover:bg-[#fbfdfd]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-sm text-[#103d4a]">{loc.name}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? 'border-[#168d90] bg-[#168d90] text-white' : 'border-[#9ab0b5]'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                          </div>

                          <p className="text-xs text-[#526f78] mt-1.5 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#168d90] flex-shrink-0 mt-0.5" />
                            <span>{loc.address}, {loc.city}, {loc.state} {loc.zip}</span>
                          </p>

                          <div className="mt-2.5 text-[11px] text-[#718a91] space-y-1">
                            <div><strong>Hours:</strong> Mon–Fri {loc.hoursWeekday}</div>
                            {loc.transitInfo && (
                              <div className="text-[#3c7885] italic font-medium">{loc.transitInfo}</div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#e8f1f2] flex items-center justify-between text-[11px]">
                          <span className="text-[#168d90] font-bold">
                            {loc.hasParking ? '✓ Patient Parking Available' : '✓ Transit Connected'}
                          </span>
                          <span className="text-[#55737c]">Phone: {loc.phone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Interactive Date Ribbon Selector */}
              <div>
                <label className="block text-xs font-extrabold text-[#294c57] uppercase tracking-wider mb-3">
                  2. Select Appointment Date
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.slice(0, 7).map((d) => {
                    const isSelected = state.selectedDate === d.fullDate;
                    return (
                      <button
                        key={d.fullDate}
                        disabled={d.isSunday && state.selectedLocationId !== 'home-mobile'}
                        onClick={() => setState(prev => ({ ...prev, selectedDate: d.fullDate }))}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#168d90] text-white border-[#168d90] shadow-md scale-105'
                            : d.isSunday
                            ? 'bg-[#f4f7f8] text-[#a4b5b9] border-[#e2ebee] opacity-60 cursor-not-allowed'
                            : 'bg-white text-[#103d4a] border-[#dce8ea] hover:border-[#168d90]'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {d.isToday ? 'Today' : d.isTomorrow ? 'Tmrw' : d.dayName}
                        </span>
                        <span className="text-base font-extrabold my-0.5">{d.dayNum}</span>
                        <span className="text-[10px] font-medium">{d.monthName}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                  {availableDates.slice(7, 14).map((d) => {
                    const isSelected = state.selectedDate === d.fullDate;
                    return (
                      <button
                        key={d.fullDate}
                        disabled={d.isSunday && state.selectedLocationId !== 'home-mobile'}
                        onClick={() => setState(prev => ({ ...prev, selectedDate: d.fullDate }))}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#168d90] text-white border-[#168d90] shadow-md scale-105'
                            : d.isSunday
                            ? 'bg-[#f4f7f8] text-[#a4b5b9] border-[#e2ebee] opacity-60 cursor-not-allowed'
                            : 'bg-white text-[#103d4a] border-[#dce8ea] hover:border-[#168d90]'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {d.dayName}
                        </span>
                        <span className="text-base font-extrabold my-0.5">{d.dayNum}</span>
                        <span className="text-[10px] font-medium">{d.monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Available Time Slots */}
              <div>
                <label className="block text-xs font-extrabold text-[#294c57] uppercase tracking-wider mb-3">
                  3. Select Available Time Slot
                </label>

                <div className="space-y-4">
                  {/* Morning Slots */}
                  <div>
                    <span className="text-[11px] font-bold text-[#55737c] uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Clock className="w-3.5 h-3.5 text-[#168d90]" />
                      Morning Slots (Recommended for Fasting Tests)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                      {DEMO_TIME_SLOTS.filter(s => s.period === 'morning').map((slot) => {
                        const isSelected = state.selectedTime === slot.time;
                        const unavailableReason = getSlotUnavailableReason(slot.time);
                        const unavailable = unavailableReason !== null;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={unavailable}
                            onClick={() => setState(prev => ({ ...prev, selectedTime: slot.time }))}
                            className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                              unavailable
                                ? 'bg-[#f1f5f6] text-[#9aadb2] border-[#e1e8ea] cursor-not-allowed opacity-70'
                                : isSelected
                                  ? 'bg-[#168d90] text-white border-[#168d90] shadow-sm cursor-pointer'
                                  : 'bg-white text-[#103d4a] border-[#dce8ea] hover:border-[#168d90] hover:bg-[#f6fafb] cursor-pointer'
                            }`}
                            title={unavailableReason ? `This slot is ${unavailableReason.toLowerCase()} in Chicago` : undefined}
                          >
                            <span>{slot.time}</span>
                            <span className={`text-[9px] mt-0.5 font-semibold ${
                              unavailable ? 'text-[#9aadb2]' : isSelected ? 'text-[#c6f3f1]' : 'text-[#77949c]'
                            }`}>
                              {unavailableReason || slot.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div>
                    <span className="text-[11px] font-bold text-[#55737c] uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Clock className="w-3.5 h-3.5 text-[#168d90]" />
                      Afternoon Slots
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {DEMO_TIME_SLOTS.filter(s => s.period === 'afternoon').map((slot) => {
                        const isSelected = state.selectedTime === slot.time;
                        const unavailableReason = getSlotUnavailableReason(slot.time);
                        const unavailable = unavailableReason !== null;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={unavailable}
                            onClick={() => setState(prev => ({ ...prev, selectedTime: slot.time }))}
                            className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                              unavailable
                                ? 'bg-[#f1f5f6] text-[#9aadb2] border-[#e1e8ea] cursor-not-allowed opacity-70'
                                : isSelected
                                  ? 'bg-[#168d90] text-white border-[#168d90] shadow-sm cursor-pointer'
                                  : 'bg-white text-[#103d4a] border-[#dce8ea] hover:border-[#168d90] hover:bg-[#f6fafb] cursor-pointer'
                            }`}
                            title={unavailableReason ? `This slot is ${unavailableReason.toLowerCase()} in Chicago` : undefined}
                          >
                            <span>{slot.time}</span>
                            <span className={`text-[9px] mt-0.5 font-semibold ${
                              unavailable ? 'text-[#9aadb2]' : isSelected ? 'text-[#c6f3f1]' : 'text-[#77949c]'
                            }`}>
                              {unavailableReason || slot.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-xl border border-[#cfe2e4] text-[#103d4a] hover:bg-white font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Test
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                Continue to Patient Information <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: PATIENT INFORMATION
           ========================================================================= */}
        {state.step === 3 && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-6">
              <div>
                <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">Step 3 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-1">
                  Patient Information (Demonstration)
                </h2>
                <p className="text-xs sm:text-sm text-[#66808a] mt-1">
                  Enter demonstration contact details and medical preferences. No actual PHI is stored in this preview.
                </p>
              </div>

              {/* Demo Notice Banner */}
              <div className="p-4 rounded-2xl bg-[#edf8f6] border border-[#cde8e3] text-[#24584b] text-xs flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#168d90] mt-0.5" />
                <div>
                  <strong>Local Demonstration Form:</strong>
                  <p className="mt-0.5 text-[#4a7a6f]">
                    This form demonstrates the patient intake interface for scheduling. Dummy/test data can be used freely.
                  </p>
                </div>
              </div>

              {/* Patient Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state.patientInfo.firstName}
                    onChange={(e) => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, firstName: e.target.value } }))}
                    placeholder="e.g. Jane"
                    className={`w-full p-3 bg-[#f8fbfb] border rounded-xl text-xs text-[#103d4a] outline-none ${
                      formErrors.firstName ? 'border-red-400 bg-red-50' : 'border-[#d6e4e6] focus:border-[#168d90]'
                    }`}
                  />
                  {formErrors.firstName && <p className="text-red-500 text-[10px] mt-1">{formErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state.patientInfo.lastName}
                    onChange={(e) => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, lastName: e.target.value } }))}
                    placeholder="e.g. Doe"
                    className={`w-full p-3 bg-[#f8fbfb] border rounded-xl text-xs text-[#103d4a] outline-none ${
                      formErrors.lastName ? 'border-red-400 bg-red-50' : 'border-[#d6e4e6] focus:border-[#168d90]'
                    }`}
                  />
                  {formErrors.lastName && <p className="text-red-500 text-[10px] mt-1">{formErrors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <DateOfBirthPicker
                    value={state.patientInfo.dateOfBirth}
                    onChange={(value) =>
                      setState(prev => ({
                        ...prev,
                        patientInfo: {
                          ...prev.patientInfo,
                          dateOfBirth: value
                        }
                      }))
                    }
                    hasError={!!formErrors.dateOfBirth}
                  />
                  {formErrors.dateOfBirth && <p className="text-red-500 text-[10px] mt-1">{formErrors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    Biological Sex (for Reference Ranges) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={state.patientInfo.biologicalSex}
                    onChange={(e) => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, biologicalSex: e.target.value as any } }))}
                    className={`w-full p-3 bg-[#f8fbfb] border rounded-xl text-xs text-[#103d4a] outline-none ${
                      formErrors.biologicalSex ? 'border-red-400 bg-red-50' : 'border-[#d6e4e6] focus:border-[#168d90]'
                    }`}
                  >
                    <option value="">Select Biological Sex...</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Non-Binary</option>
                  </select>
                  {formErrors.biologicalSex && <p className="text-red-500 text-[10px] mt-1">{formErrors.biologicalSex}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={state.patientInfo.email}
                    onChange={(e) => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, email: e.target.value } }))}
                    placeholder="patient@example.com"
                    className={`w-full p-3 bg-[#f8fbfb] border rounded-xl text-xs text-[#103d4a] outline-none ${
                      formErrors.email ? 'border-red-400 bg-red-50' : 'border-[#d6e4e6] focus:border-[#168d90]'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-500 text-[10px] mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={state.patientInfo.phone}
                    onChange={(e) => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, phone: e.target.value } }))}
                    placeholder="872-330-7679"
                    className={`w-full p-3 bg-[#f8fbfb] border rounded-xl text-xs text-[#103d4a] outline-none ${
                      formErrors.phone ? 'border-red-400 bg-red-50' : 'border-[#d6e4e6] focus:border-[#168d90]'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-[10px] mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              {/* Insurance / Billing Type */}
              <div className="pt-4 border-t border-[#edf4f5]">
                <label className="block text-xs font-extrabold text-[#294c57] uppercase tracking-wider mb-2">
                  Payment / Insurance Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'private_insurance', label: 'In-Network Private Insurance', desc: 'BCBS, Aetna, UHC, Cigna' },
                    { id: 'medicare', label: 'Medicare / Medicaid', desc: 'Part B & HealthChoice IL' },
                    { id: 'self_pay', label: 'Self-Pay / Cash Rate', desc: 'Direct payment option' }
                  ].map(ins => (
                    <div
                      key={ins.id}
                      onClick={() => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, insuranceType: ins.id as any } }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        state.patientInfo.insuranceType === ins.id
                          ? 'border-[#168d90] bg-[#f2faf9] font-bold text-[#103d4a]'
                          : 'border-[#dce8ea] bg-[#f8fbfb] text-[#55737c]'
                      }`}
                    >
                      <div className="text-xs font-bold">{ins.label}</div>
                      <div className="text-[10px] text-[#78959d] mt-0.5">{ins.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physician Order Status */}
              <div className="pt-4 border-t border-[#edf4f5]">
                <label className="block text-xs font-extrabold text-[#294c57] uppercase tracking-wider mb-2">
                  Physician Order / Requisition Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'yes_paper', label: 'I have a paper lab requisition from my doctor', desc: 'Bring physical paper to your visit' },
                    { id: 'yes_electronic', label: 'My doctor sent an electronic/fax order', desc: 'Our lab staff will look it up' },
                    { id: 'wellness_self_request', label: 'Self-requested wellness package', desc: 'Direct clinical screening' },
                    { id: 'need_clinical_order', label: 'Request Serine clinical physician review', desc: 'Physician oversight authorization' }
                  ].map(ord => (
                    <div
                      key={ord.id}
                      onClick={() => setState(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, hasPhysicianOrder: ord.id as any } }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        state.patientInfo.hasPhysicianOrder === ord.id
                          ? 'border-[#168d90] bg-[#f2faf9] font-bold text-[#103d4a]'
                          : 'border-[#dce8ea] bg-[#f8fbfb] text-[#55737c]'
                      }`}
                    >
                      <div className="text-xs font-bold">{ord.label}</div>
                      <div className="text-[10px] text-[#78959d] mt-0.5">{ord.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-xl border border-[#cfe2e4] text-[#103d4a] hover:bg-white font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Location & Time
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                Review Appointment Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: REVIEW APPOINTMENT
           ========================================================================= */}
        {state.step === 4 && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-6">
              <div>
                <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">Step 4 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-1">
                  Review Your Appointment Details
                </h2>
                <p className="text-xs sm:text-sm text-[#66808a] mt-1">
                  Please review your selected lab services, Centralia patient center location, date/time, and clinical preparation guidelines before confirming.
                </p>
              </div>

              {submitError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Unable to create appointment</p>
                    <p className="mt-1">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Review Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Selected Test / Package Card */}
                <div className="p-5 rounded-2xl bg-[#f8fbfb] border border-[#dce8ea] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#168d90] uppercase tracking-wider">
                      Selected Diagnostic Service
                    </span>
                    <button
                      onClick={() => setState(prev => ({ ...prev, step: 1 }))}
                      className="text-[11px] text-[#168d90] font-bold underline cursor-pointer"
                    >
                      Change Test
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#103d4a]">
                      {currentTest ? currentTest.name : currentPackage ? currentPackage.name : state.customTestRequested}
                    </h3>
                    {currentTest && (
                      <p className="text-xs text-[#55737c] mt-1">
                        CPT / Lab Code: {currentTest.code} • Category: {currentTest.categoryLabel}
                      </p>
                    )}
                    {currentPackage && (
                      <p className="text-xs text-[#55737c] mt-1">
                        {currentPackage.testCount} Comprehensive Panels Included
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#e2ebee] text-xs">
                    {(currentTest?.fastingRequired || currentPackage?.fastingRequired) ? (
                      <div className="text-[#b85c18] font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Fasting Preparation: 10–12 hours no food or sweetened beverages (water permitted).</span>
                      </div>
                    ) : (
                      <div className="text-[#2e7d5d] font-bold">
                        ✓ No fasting required for this test.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Location & Date/Time Card */}
                <div className="p-5 rounded-2xl bg-[#f8fbfb] border border-[#dce8ea] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#168d90] uppercase tracking-wider">
                      Location & Scheduled Time
                    </span>
                    <button
                      onClick={() => setState(prev => ({ ...prev, step: 2 }))}
                      className="text-[11px] text-[#168d90] font-bold underline cursor-pointer"
                    >
                      Change Date/Time
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#103d4a]">
                      {currentLocation.name}
                    </h3>
                    <p className="text-xs text-[#55737c] mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#168d90] flex-shrink-0 mt-0.5" />
                      <span>{currentLocation.address}, {currentLocation.city}, {currentLocation.state} {currentLocation.zip}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e2ebee] text-xs flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[#103d4a] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-[#168d90]" />
                      {state.selectedDate}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#103d4a] font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#168d90]" />
                      {state.selectedTime}
                    </span>
                  </div>
                </div>

                {/* 3. Patient Information Card */}
                <div className="p-5 rounded-2xl bg-[#f8fbfb] border border-[#dce8ea] space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#168d90] uppercase tracking-wider">
                      Patient & Billing Summary
                    </span>
                    <button
                      onClick={() => setState(prev => ({ ...prev, step: 3 }))}
                      className="text-[11px] text-[#168d90] font-bold underline cursor-pointer"
                    >
                      Edit Patient Info
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#41616b] pt-1">
                    <div>
                      <span className="text-[#849da4] block text-[10px] uppercase font-bold">Patient Name</span>
                      <strong className="text-[#103d4a]">{state.patientInfo.firstName} {state.patientInfo.lastName}</strong>
                    </div>
                    <div>
                      <span className="text-[#849da4] block text-[10px] uppercase font-bold">Contact</span>
                      <span className="text-[#103d4a] font-medium">{state.patientInfo.email} • {state.patientInfo.phone}</span>
                    </div>
                    <div>
                      <span className="text-[#849da4] block text-[10px] uppercase font-bold">Billing / Order</span>
                      <span className="text-[#103d4a] font-medium capitalize">
                        {state.patientInfo.insuranceType.replace('_', ' ')} • {state.patientInfo.hasPhysicianOrder.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Bring Checklist */}
              <div className="p-4 rounded-2xl bg-[#edf7f9] border border-[#d2e7ea] text-xs text-[#2b5966] space-y-2">
                <span className="font-extrabold block text-[#103d4a]">What to Bring to Your Visit:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168d90]" />
                    <span>Government photo ID / Driver's License</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168d90]" />
                    <span>Insurance card (if applicable)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#168d90]" />
                    <span>Doctor requisition form (if provided)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-xl border border-[#cfe2e4] text-[#103d4a] hover:bg-white font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Edit Info
              </button>

              <button
                disabled={isSubmitting}
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Appointment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Appointment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: CONFIRMATION VIEW
           ========================================================================= */}
        {(state.step as number) === 5 && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#dce8ea] shadow-xl text-center space-y-8 animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-[#e3f7f2] text-[#189872] flex items-center justify-center mx-auto shadow-sm ring-8 ring-[#f1fbf8]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-3 py-1 rounded-full">
                Appointment Confirmed
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a] mt-3">
                Appointment Scheduled!
              </h2>
              <p className="text-sm text-[#5c7780] mt-1">
                Your appointment has been successfully created with Serine Diagnostics.
              </p>

              <div className="mt-4 inline-block bg-[#f4fbfb] border border-[#cfe4e6] px-6 py-3 rounded-2xl">
                <span className="text-[11px] text-[#718e96] block uppercase tracking-wider font-bold">Confirmation Reference ID</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#103d4a] tracking-wider font-mono">
                  {state.confirmationNumber}
                </span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-[#f8fbfb] p-6 rounded-2xl border border-[#dce8ea] text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#809ba2] block text-[10px] uppercase font-bold">Test / Service</span>
                <strong className="text-[#103d4a] text-sm block mt-0.5">
                  {currentTest ? currentTest.name : currentPackage ? currentPackage.name : state.customTestRequested}
                </strong>
                <span className="text-[#55737c] mt-0.5 block">
                  {currentTest?.turnaroundTime || 'Same-day STAT processing'}
                </span>
              </div>

              <div>
                <span className="text-[#809ba2] block text-[10px] uppercase font-bold">Patient Service Center</span>
                <strong className="text-[#103d4a] text-sm block mt-0.5">{currentLocation.name}</strong>
                <span className="text-[#55737c] mt-0.5 block">{currentLocation.address}, {currentLocation.city}, {currentLocation.state}</span>
              </div>

              <div className="pt-3 border-t border-[#e5eeef]">
                <span className="text-[#809ba2] block text-[10px] uppercase font-bold">Scheduled Time</span>
                <span className="text-[#103d4a] font-bold text-sm block mt-0.5">
                  {state.selectedDate} at {state.selectedTime}
                </span>
              </div>

              <div className="pt-3 border-t border-[#e5eeef]">
                <span className="text-[#809ba2] block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="text-[#103d4a] font-bold text-sm block mt-0.5">
                  {state.patientInfo.firstName} {state.patientInfo.lastName}
                </span>
              </div>
            </div>

            {/* Preparation Reminder */}
            {(currentTest?.fastingRequired || currentPackage?.fastingRequired) && (
              <div className="p-4 rounded-2xl bg-[#fff8eb] border border-[#fae2b6] text-left text-xs text-[#8c5717] flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 text-[#c27b20] mt-0.5" />
                <div>
                  <strong>Important Fasting Reminder:</strong>
                  <p className="mt-0.5 text-[#9e6722]">
                    Please do not eat or drink anything other than plain water for 10 to 12 hours prior to your blood draw. Continue drinking water to ensure adequate hydration for a smooth vein collection.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() =>
                  printAppointmentSummary({
                    confirmationNumber: state.confirmationNumber,
                    testName:
                      currentTest?.name ??
                      currentPackage?.name ??
                      state.customTestRequested ??
                      'Diagnostic Test',
                    turnaroundTime:
                      currentTest?.turnaroundTime ||
                      (currentPackage ? 'Same-day STAT processing' : undefined),
                    locationName: currentLocation.name,
                    address: currentLocation.address,
                    city: currentLocation.city,
                    state: currentLocation.state,
                    zip: currentLocation.zip,
                    phone: currentLocation.phone,
                    selectedDate: state.selectedDate,
                    selectedTime: state.selectedTime,
                    patientName: `${state.patientInfo.firstName} ${state.patientInfo.lastName}`,
                    fastingRequired:
                      Boolean(currentTest?.fastingRequired) ||
                      Boolean(currentPackage?.fastingRequired),
                  })
                }
                className="px-5 py-2.5 rounded-xl border border-[#cfe2e4] text-[#103d4a] hover:bg-[#f6fafb] font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#168d90]" /> Print Summary
              </button>

              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Book Another Test
              </button>

              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-xl bg-[#103d4a] hover:bg-[#0b2b35] text-white font-bold text-xs cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
