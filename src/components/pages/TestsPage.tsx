import React, { useEffect, useState, useMemo } from 'react';
import type { LabTest } from '../../types';
import { useLabData } from '../../context/LabDataContext';
import {
  Search,
  FlaskConical,
  Clock,
  Droplets,
  ArrowRight,
  X,
} from 'lucide-react';

interface TestsPageProps {
  onNavigate: (
    view: string,
    testId?: string,
    packageId?: string,
    locationId?: string
  ) => void;
  initialTestId?: string | null;
}

export const TestsPage: React.FC<TestsPageProps> = ({
  onNavigate,
  initialTestId = null,
}) => {
  const { tests, testsLoading, testsError } = useLabData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  useEffect(() => {
    if (!initialTestId || testsLoading) return;

    const test = tests.find((item) => item.id === initialTestId);

    if (test) {
      setSelectedTest(test);
    }
  }, [initialTestId, tests, testsLoading]);

  const handleEnquiry = () => {
    onNavigate('contact');

    setTimeout(() => {
      const inquirySection = document.getElementById('contact-inquiry');

      inquirySection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);
  };

  /*
   * Only active tests are visible in the public catalog.
   *
   * Admin deactivation sets:
   * active = false
   * bookable = false
   *
   * Inactive tests therefore disappear from the public website.
   */
  const publicTests = useMemo(() => {
    return tests.filter((test) => test.active);
  }, [tests]);

  /*
   * Convert a category value into a stable filter ID.
   *
   * Examples:
   * "AMH" -> "amh"
   * "Hematology" -> "hematology"
   * "Endocrinology & Thyroid" -> "endocrinology-thyroid"
   * "Wellness & Nutrition" -> "wellness-nutrition"
   */
  const getCategoryId = (category: string) => {
    return category
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /*
   * Existing categories keep their current order.
   *
   * Any new category created from Test Management is automatically
   * discovered from the active public tests and appended to the filter.
   */
 const categories = useMemo(() => {
  const defaultCategories = [
    {
      label: 'Hematology',
    },
    {
      label: 'Biochemistry',
    },
    {
      label: 'Endocrinology & Thyroid',
    },
    {
      label: 'Wellness & Nutrition',
    },
    {
      label: 'Infectious & PCR',
    },
    {
      label: 'Immunology',
    },
    {
      label: 'Routine Urinalysis',
    },
  ];

  const categoryMap = new Map<
    string,
    {
      id: string;
      label: string;
    }
  >();

  /*
   * Keep the existing categories first.
   */
  defaultCategories.forEach((category) => {
    const id = getCategoryId(category.label);

    categoryMap.set(id, {
      id,
      label: category.label,
    });
  });

  /*
   * Discover categories directly from categoryLabel.
   *
   * This is important because the public card itself displays
   * test.categoryLabel.
   *
   * Example:
   * categoryLabel = "AMH"
   * -> AMH automatically becomes a filter.
   */
  publicTests.forEach((test) => {
    const label =
      test.categoryLabel?.trim() ||
      test.category?.trim() ||
      '';

    if (!label) return;

    const id = getCategoryId(label);

    if (!id) return;

    if (!categoryMap.has(id)) {
      categoryMap.set(id, {
        id,
        label,
      });
    }
  });

  return [
    {
      id: 'all',
      label: 'All Tests',
    },
    ...Array.from(categoryMap.values()),
  ];
}, [publicTests]);

  const filteredTests = useMemo(() => {
  return publicTests.filter((test) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchSearch =
      normalizedSearch === '' ||
      test.name.toLowerCase().includes(normalizedSearch) ||
      test.code.toLowerCase().includes(normalizedSearch) ||
      test.description.toLowerCase().includes(normalizedSearch) ||
      (test.commonFor &&
        test.commonFor.some((condition) =>
          condition.toLowerCase().includes(normalizedSearch)
        ));

    /*
     * Use categoryLabel because that is the category actually
     * displayed on the test card and should be used by the
     * public category filter.
     */
    const displayedCategory =
      test.categoryLabel?.trim() ||
      test.category?.trim() ||
      '';

    const testCategoryId = getCategoryId(displayedCategory);

    const matchCategory =
      activeCategory === 'all' ||
      testCategoryId === activeCategory;

    return matchSearch && matchCategory;
  });
}, [publicTests, searchTerm, activeCategory]);

  if (testsLoading) {
    return (
      <div className="bg-[#f6fafb] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FlaskConical className="w-10 h-10 text-[#168d90] mx-auto mb-3 animate-pulse" />

          <p className="text-sm font-semibold text-[#57737c]">
            Loading diagnostic tests...
          </p>
        </div>
      </div>
    );
  }

  if (testsError) {
    return (
      <div className="bg-[#f6fafb] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-red-100 text-center">
          <h2 className="text-lg font-bold text-red-600">
            Unable to load tests
          </h2>

          <p className="text-sm text-[#57737c] mt-2">
            {testsError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6fafb] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Page Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
            Clinical Laboratory Menu
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103d4a] mt-1 tracking-tight">
            Diagnostic Test Directory
          </h1>

          <p className="text-sm sm:text-base text-[#57737c] mt-3 leading-relaxed">
            Browse our comprehensive test catalog processed at Serine Diagnostics
            in Centralia. View clinical significance, sample requirements,
            turnaround times, and self-pay or insurance rates.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-6 rounded-3xl border border-[#dce8ea] shadow-sm space-y-4">

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f9aa1]" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tests by name, lab code, or condition..."
              className="w-full pl-11 pr-4 py-3.5 bg-[#f8fbfb] border border-[#d6e4e6] rounded-2xl text-sm text-[#103d4a] placeholder-[#93a7ad] focus:bg-white focus:border-[#168d90] focus:ring-2 focus:ring-[#168d90]/10 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeCategory === category.id
                    ? 'bg-[#168d90] text-white shadow-sm'
                    : 'bg-[#edf5f6] text-[#4f6f77] hover:bg-[#e1f0f2]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const isBookable = test.active && test.bookable;

            return (
              <div
                key={test.id}
                className="bg-white rounded-3xl p-6 border border-[#dce8ea] hover:border-[#b4d6d8] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>

                  {/* Category + Enquiry */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-2.5 py-1 rounded-md">
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
                  <p className="text-xs text-[#5f7a84] mt-2.5 leading-relaxed">
                    {test.description}
                  </p>

                  {/* Common For */}
                  {test.commonFor && test.commonFor.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1">
                      {test.commonFor.map((condition, index) => (
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

                {/* Test Information */}
                <div className="mt-6 pt-4 border-t border-[#edf4f5] space-y-3">

                  <div className="text-[11px] text-[#55737c] space-y-1">

                    {/* Specimen */}
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-[#168d90]" />

                      <span>
                        Specimen: {test.specimenType}
                      </span>
                    </div>

                    {/* Turnaround */}
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

                    {/* Booking */}
                    {isBookable ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('book', test.id)}
                        className="w-full py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        Book This Test
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

        {/* No Results */}
        {filteredTests.length === 0 && (
          <div className="bg-white p-10 rounded-3xl border border-[#dce8ea] text-center space-y-3">

            <FlaskConical className="w-10 h-10 text-[#a0bcc3] mx-auto" />

            <h3 className="text-lg font-bold text-[#103d4a]">
              No matching tests found
            </h3>

            <p className="text-xs text-[#627e87]">
              Try adjusting your search terms or choose from one of our popular
              categories above.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#e8f6f4] text-[#168d90] font-bold text-xs cursor-pointer"
            >
              Reset Filters
            </button>

          </div>
        )}

      </div>

      {/* Test Details Modal */}
      {selectedTest && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedTest(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="shrink-0 flex items-start justify-between gap-4 p-6 border-b border-[#e4eeee]">
              <div>
                <span className="text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-2.5 py-1 rounded-md">
                  {selectedTest.categoryLabel}
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-3">
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

            {/* Modal Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-7">

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

              {/* What's Tested */}
              {selectedTest.whatIsTested &&
                selectedTest.whatIsTested.length > 0 && (
                  <section>
                    <h3 className="text-lg font-extrabold text-[#103d4a]">
                      What's Tested?
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                      {selectedTest.whatIsTested.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2.5 bg-[#f6fafb] border border-[#e4eeee] rounded-xl px-3.5 py-3"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#168d90] shrink-0" />

                          <span className="text-xs font-semibold text-[#456972]">
                            {item}
                          </span>
                        </div>
                      ))}
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

              {/* Collection */}
              <section>
                <h3 className="text-lg font-extrabold text-[#103d4a]">
                  Specimen & Collection
                </h3>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <div className="bg-[#f6fafb] rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Specimen
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.specimenType}
                    </p>
                  </div>

                  <div className="bg-[#f6fafb] rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Volume
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.specimenVolume ||
                        'Information not available'}
                    </p>
                  </div>

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

              {/* Preparation */}
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

              {/* Test Information */}
              <section>
                <h3 className="text-lg font-extrabold text-[#103d4a]">
                  Test Information
                </h3>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <div className="bg-[#f6fafb] rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#168d90]">
                      Turnaround Time
                    </p>

                    <p className="text-sm font-semibold text-[#103d4a] mt-1">
                      {selectedTest.turnaroundTime}
                    </p>
                  </div>

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

              {/* Important Information */}
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

              {/* Related Tests */}
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

              {/* Extra bottom spacing so Related Tests can scroll above footer */}
              <div className="h-2" />

            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-5 border-t border-[#e4eeee] bg-white/95 backdrop-blur-sm">

              {selectedTest.active && selectedTest.bookable ? (
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