import React, { useState } from 'react';
import { useLabData } from '../../context/LabDataContext';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface PackagesPageProps {
  onNavigate: (
    view: string,
    testId?: string,
    packageId?: string,
    locationId?: string
  ) => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  onNavigate,
}) => {
  const {
    packages,
    packagesLoading,
    packagesError,
    tests,
  } = useLabData();

  const [selectedPackage, setSelectedPackage] =
    useState<(typeof packages)[number] | null>(null);

  const normalize = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  const getIncludedTest = (includedName: string) => {
    const target = normalize(includedName);
    if (!target) return undefined;

    const exact = tests.find(
      (test) => normalize(test.name) === target
    );
    if (exact) return exact;

    const aliases: Record<string, string[]> = {
      cbc: ['complete blood count', 'cbc'],
      cmp: ['comprehensive metabolic panel', 'cmp'],
      lipid: ['lipid panel', 'lipid profile'],
      hba1c: ['hemoglobin a1c', 'hba1c'],
      tsh: ['thyroid stimulating hormone', 'tsh'],
      'vitamin d': ['vitamin d'],
      ferritin: ['ferritin'],
      'hs crp': ['high sensitivity c reactive protein', 'hs crp'],
      psa: ['psa', 'prostate specific antigen'],
      urinalysis: ['urinalysis'],
    };

    const alias = Object.entries(aliases).find(([key]) =>
      target.includes(key)
    )?.[1];

    if (alias) {
      const match = tests.find((test) => {
        const name = normalize(test.name);
        return alias.some((part) => name.includes(part));
      });
      if (match) return match;
    }

    const targetWords = target.split(' ').filter((word) => word.length > 2);
    return tests.find((test) => {
      const name = normalize(test.name);
      const matches = targetWords.filter((word) =>
        name.includes(word)
      ).length;
      return matches >= Math.min(2, targetWords.length);
    });
  };

  // =========================
  // LOADING STATE
  // =========================

  if (packagesLoading) {
    return (
      <div className="bg-[#f6fafb] min-h-screen py-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#168d90] mx-auto" />

          <p className="text-sm font-semibold text-[#57737c]">
            Loading wellness packages...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR STATE
  // =========================

  if (packagesError) {
    return (
      <div className="bg-[#f6fafb] min-h-screen py-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-600">
            Unable to load packages
          </h2>

          <p className="text-sm text-[#57737c] mt-2">
            {packagesError}
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <>
    <div className="bg-[#f6fafb] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Page Header */}

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f6f4] text-[#168d90] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />

            Preventative Laboratory Profiles
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103d4a] tracking-tight">
            Wellness Health Packages
          </h1>

          <p className="text-sm sm:text-base text-[#57737c] mt-3 leading-relaxed">
            Multi-panel health profiles designed for executive wellness,
            annual physical baselines, cardiovascular risk stratification,
            and metabolic monitoring. Direct-access pricing with no surprise
            facility fees.
          </p>
        </div>

        {/* Packages Grid */}

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {packages.map((pkg) => (

              <div
                key={pkg.id}
                className={`rounded-3xl p-8 border flex flex-col justify-between transition-all bg-white ${
                  pkg.featured
                    ? 'border-[#168d90] ring-2 ring-[#168d90]/15 shadow-xl relative'
                    : 'border-[#dce8ea] shadow-sm hover:shadow-md'
                }`}
              >

                <div>

                  {/* Top */}

                  <div className="flex items-center justify-between gap-2">

                    {pkg.badge ? (
                      <span className="text-[10px] font-extrabold bg-[#168d90] text-white px-3 py-1 rounded-full uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider bg-[#e5f5f4] px-2.5 py-1 rounded-md">
                        Wellness Profile
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onNavigate('contact')}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8f6f4] text-[#168d90] hover:bg-[#168d90] hover:text-white text-[11px] font-bold transition-colors"
                    >
                      Enquiry
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                  </div>

                  {/* Package Name */}

                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#103d4a] mt-4">
                    {pkg.name}
                  </h3>

                  <p className="text-xs font-bold text-[#168d90] mt-1">
                    {pkg.tagline}
                  </p>

                  <p className="text-xs text-[#5e7983] mt-3 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Recommended For */}

                  {pkg.recommendedFor && (
                    <div className="mt-4 p-3 rounded-xl bg-[#f8fbfb] border border-[#e8f1f2] text-xs text-[#456872]">

                      <strong className="block text-[#103d4a] text-[11px] mb-0.5">
                        Recommended For:
                      </strong>

                      {pkg.recommendedFor}

                    </div>
                  )}

                  {/* Included Tests */}

                  <div className="mt-5 space-y-2">

                    <span className="text-xs font-extrabold text-[#103d4a] block uppercase tracking-wider">

                      Included Tests & Biomarkers ({pkg.testCount}):

                    </span>

                    <ul className="space-y-1.5 text-xs text-[#4b6a74]">

                      {pkg.testsIncluded.map((test, index) => (

                        <li
                          key={index}
                          className="flex items-center gap-2"
                        >

                          <CheckCircle2 className="w-3.5 h-3.5 text-[#168d90] flex-shrink-0" />

                          <span>{test}</span>

                        </li>

                      ))}

                    </ul>

                  </div>

                </div>

                {/* Bottom */}

                <div className="mt-8 pt-4 border-t border-[#edf4f5] space-y-3">

                  <div className="flex items-center justify-between text-xs text-[#5c7a84]">

  <span className="flex items-center gap-1 font-semibold text-[#b85c18]">
    <Clock className="w-3.5 h-3.5" />
    {pkg.fastingRequired
      ? '10–12 Hr Fasting'
      : 'No Fasting'}
  </span>

  <span>
    Results in {pkg.turnaroundTime}
  </span>

</div>

<div className="flex gap-2">
  <button
    type="button"
    onClick={() => setSelectedPackage(pkg)}
    className="flex-1 py-3 rounded-xl border border-[#168d90] bg-white hover:bg-[#e8f6f4] text-[#168d90] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
  >
    More Details
    <ArrowRight className="w-4 h-4" />
  </button>

  <button
    type="button"
    onClick={() =>
      onNavigate(
        'book',
        undefined,
        pkg.id
      )
    }
    className="flex-1 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
  >
    Book This Package
    <ArrowRight className="w-4 h-4" />
  </button>
</div>
                </div>

              </div>

            ))}

          </div>
        ) : (

          <div className="bg-white border border-[#dce8ea] rounded-3xl p-10 text-center">

            <h3 className="text-lg font-bold text-[#103d4a]">
              No packages available
            </h3>

            <p className="text-sm text-[#57737c] mt-2">
              Please check back later for available wellness packages.
            </p>

          </div>

        )}

        {/* Guidance Notice */}

        <div className="bg-[#edf7f9] p-6 sm:p-8 rounded-3xl border border-[#d2e6ea] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="space-y-1">

            <h3 className="font-extrabold text-base text-[#103d4a]">
              Need a Custom Panel or Physician Consultation?
            </h3>

            <p className="text-xs text-[#52727c]">
              Serine Diagnostics works with thousands of physicians across
              the Greater Centralia area. If your clinician ordered a custom
              combination of tests, bring their requisition order to any center.
            </p>

          </div>

          <button
            onClick={() => onNavigate('book')}
            className="px-6 py-3 rounded-xl bg-[#103d4a] hover:bg-[#0c2c35] text-white font-bold text-xs flex-shrink-0 cursor-pointer"
          >
            Schedule Custom Test Visit
          </button>

        </div>

      </div>
    </div>
      {selectedPackage && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPackage(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-hidden bg-white rounded-3xl shadow-2xl border border-[#dce8ea]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#e8f1f2] px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#168d90]">
                    Wellness Package Details
                  </p>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#103d4a] truncate">
                    {selectedPackage.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xl flex items-center justify-center shrink-0"
                  aria-label="Close package details"
                >
                  ×
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-7">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedPackage.badge && (
                      <span className="inline-flex text-[10px] font-extrabold bg-[#168d90] text-white px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedPackage.badge}
                      </span>
                    )}
                    {selectedPackage.featured && (
                      <span className="inline-flex text-[10px] font-extrabold bg-[#e8f6f4] text-[#168d90] px-3 py-1 rounded-full uppercase tracking-wider">
                        Featured Package
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-bold text-[#168d90] mt-3">
                    {selectedPackage.tagline}
                  </p>

                  <p className="text-sm text-[#5e7983] mt-3 leading-7">
                    {selectedPackage.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-[#e8f1f2] bg-[#f8fbfb] p-4">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Included Tests
                    </span>
                    <span className="block text-lg font-extrabold text-[#103d4a] mt-1">
                      {selectedPackage.testCount}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#e8f1f2] bg-[#f8fbfb] p-4">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Preparation
                    </span>
                    <span className="block text-sm font-bold text-[#103d4a] mt-1">
                      {selectedPackage.fastingRequired
                        ? '10–12 Hr Fasting'
                        : 'No Fasting Required'}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#e8f1f2] bg-[#f8fbfb] p-4">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Turnaround
                    </span>
                    <span className="block text-sm font-bold text-[#103d4a] mt-1">
                      {selectedPackage.turnaroundTime}
                    </span>
                  </div>
                </div>

                {selectedPackage.recommendedFor && (
                  <section>
                    <h3 className="text-base font-extrabold text-[#103d4a]">
                      Who This Package Is For
                    </h3>
                    <div className="mt-3 p-4 rounded-2xl bg-[#f8fbfb] border border-[#e8f1f2]">
                      <p className="text-sm text-[#456872] leading-6">
                        {selectedPackage.recommendedFor}
                      </p>
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-[#103d4a]">
                        What’s Included
                      </h3>
                      <p className="text-xs text-[#57737c] mt-1">
                        Review what each included laboratory test evaluates.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedPackage.testsIncluded.map((includedName, index) => {
                      const test = getIncludedTest(includedName);

                      return (
                        <div
                          key={`${includedName}-${index}`}
                          className="rounded-2xl border border-[#e8f1f2] bg-white p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#168d90] shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm sm:text-base font-extrabold text-[#103d4a]">
                                  {test?.name || includedName}
                                </h4>
                                {test?.categoryLabel && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[#e8f6f4] text-[#168d90]">
                                    {test.categoryLabel}
                                  </span>
                                )}
                              </div>

                              {test ? (
                                <>
                                  <p className="text-sm text-[#5e7983] mt-2 leading-6">
                                    {test.description}
                                  </p>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                                    <div className="rounded-xl bg-[#f8fbfb] border border-[#edf4f5] p-3">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Specimen
                                      </span>
                                      <span className="block text-xs font-semibold text-[#103d4a] mt-1">
                                        {test.specimenType || 'Confirmed at visit'}
                                      </span>
                                    </div>
                                    <div className="rounded-xl bg-[#f8fbfb] border border-[#edf4f5] p-3">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Fasting
                                      </span>
                                      <span className="block text-xs font-semibold text-[#103d4a] mt-1">
                                        {test.fastingRequired
                                          ? test.fastingHours
                                            ? `${test.fastingHours} hours`
                                            : 'Required'
                                          : 'Not required'}
                                      </span>
                                    </div>
                                    <div className="rounded-xl bg-[#f8fbfb] border border-[#edf4f5] p-3">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Turnaround
                                      </span>
                                      <span className="block text-xs font-semibold text-[#103d4a] mt-1">
                                        {test.turnaroundTime || selectedPackage.turnaroundTime}
                                      </span>
                                    </div>
                                  </div>

                                  {test.clinicalSignificance && (
                                    <div className="mt-4 pt-4 border-t border-[#edf4f5]">
                                      <span className="block text-xs font-extrabold text-[#103d4a]">
                                        Clinical Significance
                                      </span>
                                      <p className="text-xs text-[#5e7983] mt-1 leading-5">
                                        {test.clinicalSignificance}
                                      </p>
                                    </div>
                                  )}

                                  {test.patientPreparation && (
                                    <div className="mt-3">
                                      <span className="block text-xs font-extrabold text-[#103d4a]">
                                        Patient Preparation
                                      </span>
                                      <p className="text-xs text-[#5e7983] mt-1 leading-5">
                                        {test.patientPreparation}
                                      </p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs text-[#57737c] mt-2">
                                  This test is included in the package. Test-specific details are confirmed by Serine Diagnostics.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="rounded-2xl border border-[#d2e6ea] bg-[#edf7f9] p-5">
                  <h3 className="text-sm font-extrabold text-[#103d4a]">
                    Before Your Visit
                  </h3>
                  <p className="text-sm text-[#52727c] mt-2 leading-6">
                    {selectedPackage.fastingRequired
                      ? 'This package requires fasting. Follow the preparation instructions provided by Serine Diagnostics before your appointment.'
                      : 'This package does not require fasting based on the package information currently provided.'}
                  </p>
                  <p className="text-xs text-[#52727c] mt-2 leading-5">
                    Individual test preparation requirements may also apply. Review the test-specific information above and follow the instructions provided for your appointment.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPackage(null);
                      onNavigate('contact');
                    }}
                    className="px-5 py-3 rounded-xl bg-[#e8f6f4] text-[#168d90] hover:bg-[#168d90] hover:text-white text-sm font-bold transition-colors"
                  >
                    Enquiry
                    <ArrowRight className="inline-block w-4 h-4 ml-2" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPackage(null);
                      onNavigate('book', undefined, selectedPackage.id);
                    }}
                    className="px-5 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-sm font-bold transition-colors"
                  >
                    Book This Package
                    <ArrowRight className="inline-block w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};