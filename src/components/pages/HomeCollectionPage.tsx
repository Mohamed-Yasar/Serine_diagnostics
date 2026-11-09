import React from 'react';
import { Home, Clock, ShieldCheck, CheckCircle2, Phone, Calendar, ArrowRight, MapPin } from 'lucide-react';

interface HomeCollectionPageProps {
  onNavigate: (view: string, testId?: string, packageId?: string, locationId?: string) => void;
}

export const HomeCollectionPage: React.FC<HomeCollectionPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#f6fafb] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#103d4a] to-[#0c2f39] text-white p-8 sm:p-14 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5566] text-[#86ded9] text-xs font-extrabold uppercase tracking-wider">
              <Home className="w-3.5 h-3.5" />
              Mobile Diagnostic Phlebotomy
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Clinical Blood Draw from the Comfort of Your Home
            </h1>
            <p className="text-sm sm:text-base text-[#a9c9d2] leading-relaxed">
              Serine Diagnostics offers certified mobile phlebotomist house calls across Cook, DuPage, Lake, and Will counties in Illinois. Perfect for seniors, busy professionals, pediatric patients, and mobility-impaired individuals.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('book', undefined, undefined, 'home-mobile')}
                className="px-6 py-3.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Book a Mobile Phlebotomist
              </button>
              <a
                href="tel:3125557376"
                className="px-5 py-3.5 rounded-xl bg-[#174e5e] hover:bg-[#1f5e71] text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#86ded9]" /> Dispatch Line: 872-330-7679
              </a>
            </div>
          </div>
        </div>

        {/* How It Works 3-Step Process */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">Simple 3-Step Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103d4a] mt-1">
              How Mobile Collection Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-[#dce8ea] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f6f4] text-[#168d90] font-extrabold text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="font-extrabold text-lg text-[#103d4a]">Schedule Online or Phone</h3>
              <p className="text-xs text-[#5d7a84] leading-relaxed">
                Select your required diagnostic tests, input your Centralia area address, and pick a convenient morning or afternoon arrival window.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#dce8ea] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f6f4] text-[#168d90] font-extrabold text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="font-extrabold text-lg text-[#103d4a]">Phlebotomist Arrives</h3>
              <p className="text-xs text-[#5d7a84] leading-relaxed">
                A certified, licensed Illinois phlebotomist visits your residence or workplace with sterile single-use supplies and temperature-controlled transport kits.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#dce8ea] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f6f4] text-[#168d90] font-extrabold text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="font-extrabold text-lg text-[#103d4a]">Same-Day Lab Results</h3>
              <p className="text-xs text-[#5d7a84] leading-relaxed">
                Specimens are immediately couriered to our central Centralia Reference Laboratory for rapid STAT processing and electronic result delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="bg-white p-8 rounded-3xl border border-[#dce8ea] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">Service Radius</span>
              <h3 className="text-2xl font-extrabold text-[#103d4a] mt-0.5">Centralia Area Coverage</h3>
            </div>
            <span className="text-xs font-bold text-[#168d90] bg-[#e8f6f4] px-3 py-1 rounded-full">
              Monday – Saturday Dispatch
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#4c6a74]">
            <div className="p-4 rounded-xl bg-[#f8fbfb] border border-[#edf4f5]">
              <strong className="text-[#103d4a] block text-sm mb-1">Cook County</strong>
              <span>Centralia and surrounding Illinois communities</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f8fbfb] border border-[#edf4f5]">
              <strong className="text-[#103d4a] block text-sm mb-1">DuPage County</strong>
              <span>Naperville, Wheaton, Downers Grove, Elmhurst, Oak Brook, Lombard</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f8fbfb] border border-[#edf4f5]">
              <strong className="text-[#103d4a] block text-sm mb-1">Lake County</strong>
              <span>Highland Park, Deerfield, Lake Forest, Buffalo Grove, Waukegan</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f8fbfb] border border-[#edf4f5]">
              <strong className="text-[#103d4a] block text-sm mb-1">Will County</strong>
              <span>Joliet, Bolingbrook, Plainfield, Orland Park, Tinley Park</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
