import React from 'react';
import { INSURANCES_ACCEPTED } from '../../data/labData';
import { CheckCircle2, DollarSign, FileText } from 'lucide-react';

interface InsurancePageProps {
  onNavigate: (view: string, testId?: string, packageId?: string, locationId?: string) => void;
}

export const InsurancePage: React.FC<InsurancePageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#f6fafb] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
            Patient Financial Services
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103d4a] mt-1 tracking-tight">
            Insurance Coverage & Transparent Billing
          </h1>
          <p className="text-sm sm:text-base text-[#57737c] mt-3 leading-relaxed">
            Serine Diagnostics accepts major commercial insurance plans in Illinois, Medicare Part B, and Illinois Medicaid. Self-pay options are available for patients who are not using insurance.
          </p>
        </div>

        {/* Accepted Plans Grid */}
        <div className="bg-white p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#103d4a]">In-Network Insurance Networks</h2>
            <p className="text-xs sm:text-sm text-[#617f88] mt-1">
              We bill insurance directly when presented with a valid physician lab requisition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSURANCES_ACCEPTED.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#f8fbfb] border border-[#dce8ea] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#e8f6f4] text-[#168d90] flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <strong className="block text-sm text-[#103d4a] font-bold leading-snug">{ins.name}</strong>
                <span className="text-xs text-[#168d90] font-semibold block">{ins.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Pay Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-[#103d4a]">Self-Pay Options</h3>
            <p className="text-xs text-[#57737c] leading-relaxed">
              Uninsured, underinsured, or choosing not to file an insurance claim? Contact Serine Diagnostics for current self-pay billing information. Payment can be made at the time of service using available payment options.
            </p>
            <div className="pt-2 p-4 rounded-2xl bg-[#f8fbfb] border border-[#e8f1f2] text-xs text-[#476872] leading-relaxed">
              Current self-pay amounts are provided during the billing process. Please contact the patient accounts team if you need a specific estimate before your visit.
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-[#103d4a]">No Surprises Act Compliance</h3>
            <p className="text-xs text-[#57737c] leading-relaxed">
              In accordance with federal and Illinois healthcare transparency regulations, patients are entitled to a Good Faith Estimate (GFE) of expected charges prior to scheduled non-emergency diagnostic services.
            </p>
            <div className="p-4 bg-[#edf7f9] rounded-2xl border border-[#cfe2e5] text-xs text-[#2c5f6e] space-y-1">
              <strong>Have billing questions?</strong>
              <p>Contact our Centralia Patient Accounts Team at 872-330-7679 or email billing@serinediagnostics.com.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#103d4a] text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold">Ready to Schedule Your Test?</h3>
            <p className="text-xs text-[#a3c3cb] mt-1">Book online in minutes with your insurance or self-pay option.</p>
          </div>
          <button
            onClick={() => onNavigate('book')}
            className="px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs font-extrabold uppercase tracking-wider transition-colors flex-shrink-0 cursor-pointer"
          >
            Book Appointment →
          </button>
        </div>
      </div>
    </div>
  );
};

