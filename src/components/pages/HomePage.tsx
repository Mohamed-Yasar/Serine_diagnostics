import React, { useEffect, useState } from 'react';
import type { LabTest } from '../../types';
import {
  LAB_TESTS,
  LAB_PACKAGES,
  INSURANCES_ACCEPTED,
  FAQS,
} from '../../data/labData';
import { useLabData } from '../../context/LabDataContext';
import { fetchFrequentlyOrderedTests } from '../../services/api';

import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Phone,
  Droplets,
  Activity,
  ChevronDown,
  Sparkles,
  Users,
  Home,
  X,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (
    view: string,
    testId?: string,
    packageId?: string,
    locationId?: string
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Selected test for More Details modal
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  // Use the same test data source as TestsPage
  const { tests, testsLoading } = useLabData();

  // Homepage section: top 6 individual tests by confirmed/completed
  // appointments during the rolling 90-day period.
  const [frequentlyOrderedTests, setFrequentlyOrderedTests] =
    useState<LabTest[]>([]);
  const [frequentlyOrderedLoading, setFrequentlyOrderedLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadFrequentlyOrderedTests = async () => {
      try {
        const data = await fetchFrequentlyOrderedTests();

        if (!cancelled) {
          setFrequentlyOrderedTests(data);
        }
      } catch (error) {
        console.error(
          'Failed to load frequently ordered tests:',
          error
        );
      } finally {
        if (!cancelled) {
          setFrequentlyOrderedLoading(false);
        }
      }
    };

    loadFrequentlyOrderedTests();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleEnquiry = () => {
    onNavigate('contact');

    setTimeout(() => {
      const inquirySection =
        document.getElementById('contact-inquiry');

      inquirySection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);
  };

  /*
   * Home page featured tests
   *
   * When LabDataContext has loaded, use the same live test objects
   * used by TestsPage. This is important because the richer fields
   * such as what's tested, clinical significance, related tests,
   * preparation, etc. come from the same source.
   *
   * While loading, fall back to the original LAB_TESTS data so the
   * home page does not suddenly become empty.
   */
  const featuredTests: LabTest[] =
    !frequentlyOrderedLoading
      ? frequentlyOrderedTests.slice(0, 6)
      : !testsLoading && tests.length > 0
        ? tests.filter((test) => test.active).slice(0, 6)
        : LAB_TESTS.slice(0, 6);

  return (
    <div className="space-y-0">

      {/* =========================================================
          HERO SECTION
          ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0faf9] via-[#f7fbfc] to-[#eaf5f7] py-16 sm:py-24 border-b border-[#dce8ea]">

        {/* Background Subtle Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#168d90]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#e75a5a]/5 rounded-full blur-2xl translate-y-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cde5e7] shadow-sm text-xs font-bold text-[#168d90]">
                <span className="w-2 h-2 rounded-full bg-[#36a36d] animate-pulse" />
                CLIA Certified Clinical Laboratory • Centralia, IL
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#103d4a] tracking-tight leading-[1.08]">
                Precision Laboratory Testing
                <br />
                <span className="text-[#168d90]">
                  Made Effortless.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#55727a] max-w-xl leading-relaxed">
                Centralia's premier diagnostic laboratory delivering rapid
                Same-Day routine blood work, advanced specialty panels,
                compassionate phlebotomy, and seamless appointment booking.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3.5 pt-2">

                <button
                  type="button"
                  onClick={() => onNavigate('tests')}
                  className="px-6 py-3.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-sm font-bold shadow-[0_10px_25px_rgba(22,141,144,0.25)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Droplets className="w-4 h-4" />
                  Explore Individual Tests
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#f6fafb] text-[#103d4a] border border-[#cfe0e2] text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#168d90]" />
                  Explore Wellness Packages
                </button>

              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 pt-4 text-xs font-bold text-[#55717a]">

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168d90]" />
                  Same-Day STAT Results
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168d90]" />
                  In-Network with Major Insurers
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#168d90]" />
                  Walk-Ins & Appointments Welcome
                </span>

              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-5">

              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-white shadow-[0_20px_60px_rgba(16,61,74,0.12)] text-left relative">

                <div className="flex items-center justify-between pb-4 border-b border-[#edf4f5]">

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#36a36d]" />

                    <span className="text-xs font-extrabold text-[#103d4a] uppercase tracking-wider">
                      Centralia Reference Lab
                    </span>
                  </div>

                  <span className="text-xs text-[#168d90] font-bold bg-[#e8f6f4] px-2.5 py-0.5 rounded-full">
                    Open for Testing
                  </span>

                </div>

                <div className="my-6 space-y-4">

                  <div className="p-4 rounded-2xl bg-[#f8fbfb] border border-[#e5eeef] flex items-start gap-3.5">

                    <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#103d4a]">
                        Rapid STAT & Routine Processing
                      </h4>

                      <p className="text-xs text-[#637f88] mt-0.5">
                        High-throughput clinical chemistry, hematology,
                        and PCR multiplex platforms on-site.
                      </p>
                    </div>

                  </div>

                  <div className="p-4 rounded-2xl bg-[#f8fbfb] border border-[#e5eeef] flex items-start gap-3.5">

                    <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#103d4a]">
                        Home & Office Phlebotomy
                      </h4>

                      <p className="text-xs text-[#637f88] mt-0.5">
                        Certified phlebotomists dispatched throughout
                        Cook, DuPage, Lake, and Will counties.
                      </p>
                    </div>

                  </div>

                  <div className="p-4 rounded-2xl bg-[#f8fbfb] border border-[#e5eeef] flex items-start gap-3.5">

                    <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#103d4a]">
                        Accredited Quality Standard
                      </h4>

                      <p className="text-xs text-[#637f88] mt-0.5">
                        CLIA certified facility under strict medical
                        pathologist clinical direction.
                      </p>
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('book')}
                  className="w-full py-3.5 rounded-xl bg-[#103d4a] hover:bg-[#0b2c36] text-white text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Schedule Your Appointment Online
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          QUICK ACTION NAVIGATION
          ========================================================= */}
      <section className="bg-white border-b border-[#dce8ea] py-5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <button
              type="button"
              onClick={() => onNavigate('book')}
              className="p-3.5 rounded-xl hover:bg-[#f6fafb] border border-[#e2ebee] text-left flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>

              <div>
                <strong className="block text-xs text-[#103d4a] font-bold">
                  Book a Test
                </strong>

                <span className="text-[11px] text-[#718c94]">
                  4-step easy scheduler
                </span>
              </div>
            </button>


            <button
              type="button"
              onClick={() => onNavigate('tests')}
              className="p-3.5 rounded-xl hover:bg-[#f6fafb] border border-[#e2ebee] text-left flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Droplets className="w-4 h-4" />
              </div>

              <div>
                <strong className="block text-xs text-[#103d4a] font-bold">
                  Test Catalog
                </strong>

                <span className="text-[11px] text-[#718c94]">
                  Full clinical menu
                </span>
              </div>
            </button>


            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="p-3.5 rounded-xl hover:bg-[#f6fafb] border border-[#e2ebee] text-left flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>

              <div>
                <strong className="block text-xs text-[#103d4a] font-bold">
                  View Lab Results
                </strong>

                <span className="text-[11px] text-[#718c94]">
                  Patient portal login
                </span>
              </div>
            </button>

          </div>

        </div>
      </section>


      {/* =========================================================
          FEATURED CLINICAL TESTS
          ========================================================= */}
      <section className="py-16 sm:py-20 bg-[#f9fbfb]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">

            <div>

              <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
                Clinical Menu
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a] mt-1">
                Frequently Ordered Laboratory Tests
              </h2>

              <p className="text-sm text-[#5d7780] mt-1 max-w-xl">
                Accurate, quality-assured diagnostic testing processed
                locally in Centralia. Book online or walk in.
              </p>

            </div>


            <button
              type="button"
              onClick={() => onNavigate('tests')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#168d90] hover:text-[#117a7d] cursor-pointer"
            >
              Browse Complete Test Menu ({tests.length || LAB_TESTS.length}+ tests)
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>


          {/* Test Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">

            {featuredTests.map((test) => {

              const isBookable =
                test.active && test.bookable;

              return (
                <div
                  key={test.id}
                  className="bg-white p-6 rounded-2xl border border-[#dce8ea] hover:border-[#b4d6d8] hover:shadow-md transition-all flex flex-col justify-between"
                >

                  <div>

                    {/* Category + Enquiry */}
                    <div className="flex items-center justify-between gap-3">

                      <span className="text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-2 py-0.5 rounded">
                        {test.categoryLabel}
                      </span>

                      <button
                        type="button"
                        onClick={handleEnquiry}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8f6f4] hover:bg-[#168d90] text-[#168d90] hover:text-white text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                      >
                        Enquiry
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                    </div>


                    {/* Test Name */}
                    <h3 className="font-extrabold text-base text-[#103d4a] mt-3 leading-snug">
                      {test.name}
                    </h3>


                    {/* Code */}
                    <span className="text-[11px] text-[#168d90] font-mono font-bold block mt-0.5">
                      Code: {test.code}
                    </span>


                    {/* Description */}
                    <p className="text-xs text-[#637d86] mt-2 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>


                    {/* Common For */}
                    {test.commonFor &&
                      test.commonFor.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">

                          {test.commonFor
                            .slice(0, 3)
                            .map((condition, index) => (
                              <span
                                key={index}
                                className="text-[10px] bg-[#f0f6f7] text-[#456972] px-2 py-0.5 rounded font-medium"
                              >
                                {condition}
                              </span>
                            ))}

                        </div>
                      )}

                  </div>


                  {/* Test Info + Actions */}
                  <div className="mt-5 pt-3.5 border-t border-[#edf4f5] space-y-3">

                    <div className="text-[11px] text-[#607d86] space-y-1">

                      {/* Specimen */}
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-[#168d90]" />

                        <span>
                          Specimen: {test.specimenType}
                        </span>
                      </div>


                      {/* TAT */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#168d90]" />

                        <span>
                          TAT: {test.turnaroundTime}
                        </span>
                      </div>


                      {/* Fasting */}
                      <div className="flex items-center gap-1.5 font-semibold">

                        {test.fastingRequired ? (
                          <span className="text-[#b85c18]">
                            Fasting: {test.fastingHours || 10} hours required
                          </span>
                        ) : (
                          <span className="text-[#2b8260]">
                            No fasting required
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">

                      {/* More Details */}
                      <button
                        type="button"
                        onClick={() => setSelectedTest(test)}
                        className="w-full py-2.5 rounded-xl border border-[#168d90] text-[#168d90] hover:bg-[#e8f6f4] text-xs font-bold transition-colors cursor-pointer"
                      >
                        More Details
                      </button>


                      {/* Book Test */}
                      {isBookable ? (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate('book', test.id)
                          }
                          className="w-full py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          Book Test
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl bg-[#edf2f3] text-[#8a9da3] text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          Not Currently Bookable
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          WELLNESS PACKAGES
          ========================================================= */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#dce8ea]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12">

            <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
              Preventative Health
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a] mt-1">
              Comprehensive Wellness Profiles
            </h2>

            <p className="text-sm text-[#5d7780] mt-2">
              Cost-effective bundled diagnostic panels designed for
              annual checkups, metabolic longevity, heart health,
              and vitality.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

            {LAB_PACKAGES.slice(0, 3).map((pkg) => (

              <div
                key={pkg.id}
                className={`p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                  pkg.featured
                    ? 'border-[#168d90] bg-[#f8fcfa] ring-2 ring-[#168d90]/10 shadow-lg relative'
                    : 'border-[#dce8ea] bg-white hover:border-[#b4d6d8]'
                }`}
              >

                {pkg.badge && (
                  <span className="inline-block self-start text-[10px] font-extrabold bg-[#168d90] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                    {pkg.badge}
                  </span>
                )}

                <div>

                  <h3 className="text-xl font-extrabold text-[#103d4a]">
                    {pkg.name}
                  </h3>

                  <p className="text-xs font-semibold text-[#168d90] mt-0.5">
                    {pkg.tagline}
                  </p>

                  <p className="text-xs text-[#637d86] mt-2.5 leading-relaxed">
                    {pkg.description}
                  </p>


             


                  <div className="bg-white p-3 rounded-2xl border border-[#e5eeef] space-y-1.5">

                    <span className="text-[11px] font-extrabold text-[#103d4a] block">
                      Key Included Panels:
                    </span>

                    <ul className="text-xs text-[#526f78] space-y-1">

                      {pkg.testsIncluded.map((t, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#168d90] flex-shrink-0" />

                          <span>{t}</span>
                        </li>
                      ))}

                    </ul>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    onNavigate('book', undefined, pkg.id)
                  }
                  className="mt-6 w-full py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Book This Package
                </button>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          WHY CHOOSE SERINE
          ========================================================= */}
      <section className="py-16 sm:py-20 bg-[#103d4a] text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 space-y-5 text-left">

              <span className="text-xs font-extrabold text-[#87deda] uppercase tracking-wider">
                Clinical Excellence
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Why Healthcare Providers & Patients Rely on Serine
              </h2>

              <p className="text-sm text-[#a8c6cf] leading-relaxed">
                Operating high-complexity clinical chemistry,
                hematology, immunology, and molecular testing
                facilities centered in Centralia.
              </p>


              <div className="pt-2 flex flex-col gap-3 text-xs text-[#b8d4dc]">

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-[#1a5566] text-[#87deda] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>

                  <span>
                    CLIA Certified & CAP-Aligned Quality Management
                  </span>

                </div>


                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-[#1a5566] text-[#87deda] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>

                  <span>
                    Centralia Same-Day STAT Courier & Processing
                  </span>

                </div>


                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-[#1a5566] text-[#87deda] flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>

                  <span>
                    Gentle, Skilled Certified Phlebotomy Team
                  </span>

                </div>

              </div>

            </div>


            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">

              <div className="p-6 rounded-2xl bg-[#144755] border border-[#1b5869]">
                <Activity className="w-6 h-6 text-[#87deda] mb-3" />

                <h3 className="font-bold text-base text-white">
                  99.8% Test Accuracy Rate
                </h3>

                <p className="text-xs text-[#a4c5ce] mt-1.5 leading-relaxed">
                  Dual-technologist verification for critical reflex
                  thresholds and abnormal findings.
                </p>
              </div>


              <div className="p-6 rounded-2xl bg-[#144755] border border-[#1b5869]">
                <Clock className="w-6 h-6 text-[#87deda] mb-3" />

                <h3 className="font-bold text-base text-white">
                  Same-Day STAT Turnaround
                </h3>

                <p className="text-xs text-[#a4c5ce] mt-1.5 leading-relaxed">
                  Direct specimen processing at our Centralia laboratory
                  laboratory for rapid clinical decision making.
                </p>
              </div>


              <div className="p-6 rounded-2xl bg-[#144755] border border-[#1b5869]">
                <ShieldCheck className="w-6 h-6 text-[#87deda] mb-3" />

                <h3 className="font-bold text-base text-white">
                  Transparent Billing
                </h3>

                <p className="text-xs text-[#a4c5ce] mt-1.5 leading-relaxed">
                  No hidden lab fees. Clear self-pay cash discount
                  rates and prompt insurance filing.
                </p>
              </div>


              <div className="p-6 rounded-2xl bg-[#144755] border border-[#1b5869]">
                <Home className="w-6 h-6 text-[#87deda] mb-3" />

                <h3 className="font-bold text-base text-white">
                  Mobile Specimen Dispatch
                </h3>

                <p className="text-xs text-[#a4c5ce] mt-1.5 leading-relaxed">
                  Comfortable home blood draws for seniors,
                  mobility-impaired patients, and executive physicals.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>





      {/* =========================================================
          INSURANCE
          ========================================================= */}
      <section className="py-14 bg-white border-b border-[#dce8ea]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
            Coverage & Payment
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-1">
            Accepted Insurance & Direct Self-Pay Options
          </h2>

          <p className="text-xs sm:text-sm text-[#5d7780] mt-2 max-w-xl mx-auto">
            We partner with premier insurance carriers in Illinois
            and offer transparent out-of-pocket pricing.
          </p>


          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 text-left">

            {INSURANCES_ACCEPTED.map((ins, idx) => (

              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#f8fbfb] border border-[#dce8ea] text-xs"
              >

                <strong className="block text-[#103d4a] font-bold leading-snug">
                  {ins.name}
                </strong>

                <span className="text-[10px] text-[#168d90] font-semibold mt-1 block">
                  {ins.status}
                </span>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          FAQ
          ========================================================= */}
      <section className="py-16 sm:py-20 bg-[#f9fbfb]">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">

          <div className="text-center mb-10">

            <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
              Questions & Answers
            </span>

            <h2 className="text-3xl font-extrabold text-[#103d4a] mt-1">
              Frequently Asked Patient Questions
            </h2>

          </div>


          <div className="space-y-3">

            {FAQS.map((faq, idx) => (

              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#dce8ea] overflow-hidden shadow-sm"
              >

                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#fbfdfd]"
                >

                  <span className="font-bold text-sm text-[#103d4a] pr-4">
                    {faq.q}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-[#168d90] flex-shrink-0 transition-transform ${
                      openFaqIndex === idx
                        ? 'rotate-180'
                        : ''
                    }`}
                  />

                </button>


                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5a747d] leading-relaxed border-t border-[#edf4f5]">
                    {faq.a}
                  </div>
                )}

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          CTA
          ========================================================= */}
      <section className="bg-gradient-to-r from-[#168d90] to-[#126b6d] py-14 px-4 sm:px-6 text-white text-center">

        <div className="max-w-4xl mx-auto space-y-4">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Schedule Your Test in Centralia?
          </h2>

          <p className="text-sm sm:text-base text-[#d4f3f2] max-w-xl mx-auto leading-relaxed">
            Fast, confidential diagnostic testing with Same-Day
            results. Choose your test and reserve your time slot
            in under 2 minutes.
          </p>


          <div className="pt-3 flex flex-wrap justify-center gap-3">

            <button
              type="button"
              onClick={() => onNavigate('book')}
              className="px-8 py-3.5 rounded-xl bg-white text-[#103d4a] font-extrabold text-sm shadow-lg hover:bg-[#f2faf9] transition-all cursor-pointer"
            >
              Book an Appointment Now
            </button>


            <a
              href="tel:8723307679"
              className="px-6 py-3.5 rounded-xl bg-[#103d4a] text-white font-bold text-sm hover:bg-[#0c2b34] transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#86e2df]" />
              Call 872-330-7679
            </a>

          </div>

        </div>
      </section>


      {/* =========================================================
          TEST DETAILS MODAL
          SAME STRUCTURE AS TESTS PAGE
          ========================================================= */}
      {selectedTest && (

        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedTest(null)}
        >

          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* =================================================
                MODAL HEADER
                ================================================= */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-[#e4eeee] shrink-0">

              <div className="min-w-0">

                <span className="inline-block text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-2.5 py-1 rounded-md">
                  {selectedTest.categoryLabel}
                </span>


                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-3 leading-tight">
                  {selectedTest.name}
                </h2>


                <p className="text-xs text-[#168d90] font-mono font-bold mt-1">
                  Code: {selectedTest.code}
                </p>

              </div>


              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                className="shrink-0 w-9 h-9 rounded-full bg-[#f1f6f7] hover:bg-[#e4eeee] flex items-center justify-center text-[#57737c] cursor-pointer"
                aria-label="Close test details"
              >
                <X className="w-5 h-5" />
              </button>

            </div>


            {/* =================================================
                MODAL CONTENT
                ================================================= */}
            <div className="overflow-y-auto flex-1 min-h-0 p-6 space-y-7">

              {/* About */}
              <section>

                <h3 className="text-lg font-extrabold text-[#103d4a]">
                  About This Test
                </h3>

                <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                  {selectedTest.description}
                </p>

              </section>


              {/* Why */}
              {selectedTest.whyItIsDone && (
                <section>

                  <h3 className="text-lg font-extrabold text-[#103d4a]">
                    Why Is This Test Done?
                  </h3>

                  <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                    {selectedTest.whyItIsDone}
                  </p>

                </section>
              )}


              {/* What it evaluates */}
              {selectedTest.whatItHelpsEvaluate && (
                <section>

                  <h3 className="text-lg font-extrabold text-[#103d4a]">
                    What Does It Help Evaluate?
                  </h3>

                  <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                    {selectedTest.whatItHelpsEvaluate}
                  </p>

                </section>
              )}


              {/* =================================================
                  WHAT'S TESTED
                  THIS IS THE IMPORTANT MISSING SECTION
                  ================================================= */}
              {selectedTest.whatIsTested &&
                selectedTest.whatIsTested.length > 0 && (

                  <section>

                    <h3 className="text-lg font-extrabold text-[#103d4a]">
                      What's Tested?
                    </h3>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">

                      {selectedTest.whatIsTested.map(
                        (item, index) => (

                          <div
                            key={index}
                            className="flex items-center gap-2.5 bg-[#f6fafb] border border-[#e4eeee] rounded-xl px-3.5 py-3"
                          >

                            <span className="w-1.5 h-1.5 rounded-full bg-[#168d90] shrink-0" />

                            <span className="text-xs font-semibold text-[#456972]">
                              {item}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </section>
                )}


              {/* Clinical Significance */}
              {selectedTest.clinicalSignificance && (
                <section>

                  <h3 className="text-lg font-extrabold text-[#103d4a]">
                    Clinical Significance
                  </h3>

                  <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                    {selectedTest.clinicalSignificance}
                  </p>

                </section>
              )}


              {/* Symptoms */}
              {selectedTest.abnormalSymptoms && (
                <section>

                  <h3 className="text-lg font-extrabold text-[#103d4a]">
                    Possible Signs & Symptoms
                  </h3>

                  <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                    {selectedTest.abnormalSymptoms}
                  </p>

                </section>
              )}


              {/* =================================================
                  SPECIMEN & COLLECTION
                  ================================================= */}
              <section>

                <h3 className="text-lg font-extrabold text-[#103d4a]">
                  Specimen & Collection
                </h3>


                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {/* Specimen */}
                  <div className="bg-[#f6fafb] rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Specimen
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.specimenType}
                    </p>

                  </div>


                  {/* Volume */}
                  <div className="bg-[#f6fafb] rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Volume
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.specimenVolume ||
                        'Information not available'}
                    </p>

                  </div>


                  {/* Collection Kit */}
                  <div className="bg-[#f6fafb] rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Collection Kit
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.collectionKit ||
                        'Information not available'}
                    </p>

                  </div>

                </div>

              </section>


              {/* Patient Preparation */}
              {selectedTest.patientPreparation && (
                <section>

                  <h3 className="text-lg font-extrabold text-[#103d4a]">
                    Patient Preparation
                  </h3>

                  <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                    {selectedTest.patientPreparation}
                  </p>

                </section>
              )}


              {/* =================================================
                  TEST INFORMATION
                  ================================================= */}
              <section>

                <h3 className="text-lg font-extrabold text-[#103d4a]">
                  Test Information
                </h3>


                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">




                  {/* TAT */}
                  <div className="bg-[#f6fafb] rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Turnaround Time
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.turnaroundTime}
                    </p>

                  </div>


                  {/* Fasting */}
                  <div className="bg-[#f6fafb] rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Fasting
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.fastingRequired
                        ? `${selectedTest.fastingHours || 10} hours required`
                        : 'No fasting required'}
                    </p>

                  </div>

                </div>

              </section>


              {/* =================================================
                  IMPORTANT INFORMATION
                  ================================================= */}
              {selectedTest.importantInformation && (
                <section className="bg-[#f0f8f7] border border-[#d6ebe9] rounded-2xl p-5">

                  <h3 className="text-base font-extrabold text-[#103d4a]">
                    Important Information
                  </h3>

                  <p className="text-sm text-[#5f7a84] mt-2 leading-relaxed">
                    {selectedTest.importantInformation}
                  </p>

                </section>
              )}


              {/* =================================================
                  RELATED TESTS
                  ================================================= */}
              {selectedTest.relatedTests &&
                selectedTest.relatedTests.length > 0 && (

                  <section className="pb-2">

                    <h3 className="text-lg font-extrabold text-[#103d4a]">
                      Related Tests
                    </h3>


                    <div className="flex flex-wrap gap-2 mt-3">

                      {selectedTest.relatedTests.map(
                        (relatedTest, index) => (

                          <span
                            key={index}
                            className="text-xs bg-[#edf5f6] text-[#456972] px-3 py-1.5 rounded-lg font-semibold"
                          >
                            {relatedTest}
                          </span>

                        )
                      )}

                    </div>

                  </section>
                )}

            </div>


            {/* =================================================
                MODAL FOOTER
                ================================================= */}
            <div className="sticky bottom-0 p-5 border-t border-[#e4eeee] bg-white/95 backdrop-blur-sm shrink-0">

              {selectedTest.active &&
              selectedTest.bookable ? (

                <button
                  type="button"
                  onClick={() => {

                    const testId = selectedTest.id;

                    setSelectedTest(null);

                    onNavigate('book', testId);
                  }}
                  className="w-full py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  Book This Test
                  <ArrowRight className="w-4 h-4" />
                </button>

              ) : (

                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl bg-[#edf2f3] text-[#8a9da3] text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  This Test Is Not Currently Bookable
                </button>

              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};