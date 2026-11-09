import React from 'react';
import { ShieldCheck, Award, FlaskConical, Users, MapPin, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string, testId?: string, packageId?: string, locationId?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#f6fafb] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
            About Our Laboratory
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103d4a] mt-1 tracking-tight">
            Advancing Diagnostic Precision in Centralia
          </h1>
          <p className="text-sm sm:text-base text-[#57737c] mt-3 leading-relaxed">
            Serine Diagnostics is an independent, high-complexity clinical reference laboratory located in Centralia, Illinois. Founded to provide clinicians and patients with ultra-accurate results and rapid turnaround times.
          </p>
        </div>

        {/* Mission & Key Facts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-[#dce8ea] shadow-sm space-y-4">
            <h2 className="text-2xl font-extrabold text-[#103d4a]">Our Clinical Mission</h2>
            <p className="text-xs sm:text-sm text-[#5a7680] leading-relaxed">
              Every laboratory test specimen represents a human life, a medical decision, and a pathway to healing. We unite automated robotics, state-of-the-art mass spectrometry, clinical chemistry, and molecular PCR with board-certified pathologist oversight to deliver actionable diagnostic intelligence.
            </p>

            <div className="space-y-2 pt-3">
              {[
                'CLIA Certified High-Complexity Testing (CLIA ID: )',
                'CAP-Aligned Quality Assurance & Proficiency Testing Standards',
                'Same-Day STAT specimen processing from Centralia',
                'Compassionate, licensed phlebotomists prioritizing patient comfort'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#395d67] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#168d90] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-[#103d4a] text-white space-y-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#8ae0dc]">99.8%</span>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#d2ecf1]">Analytical Accuracy</h4>
              <p className="text-[11px] text-[#a4c5cd]">Rigorous daily internal calibrations & dual pathologist reviews.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#dce8ea] space-y-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#168d90]">100+</span>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#103d4a]">Clinical Assays</h4>
              <p className="text-[11px] text-[#638089]">Broad menu covering routine blood work, immunology, & hormones.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#dce8ea] space-y-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#168d90]">6</span>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#103d4a]">Service Locations</h4>
              <p className="text-[11px] text-[#638089]">Patient service center in Centralia, Illinois.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#103d4a] text-white space-y-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#8ae0dc]">STAT</span>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#d2ecf1]">Same-Day Courier</h4>
              <p className="text-[11px] text-[#a4c5cd]">Rapid transit from doctor offices directly to central analyzer.</p>
            </div>
          </div>
        </div>

        {/* Centralia Community Commitment */}
        <div className="bg-gradient-to-br from-[#edf7f9] to-[#f4fafb] p-8 sm:p-10 rounded-3xl border border-[#cfe3e7] text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#168d90] text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#103d4a]">Rooted in Centralia Healthcare</h3>
              <p className="text-xs text-[#52727c]">Located at 101 S Lincoln Blvd, Centralia, IL 62801</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#4c6a74] leading-relaxed max-w-4xl">
            Serine Diagnostics proudly supports independent medical practices, community clinics, nursing facilities, and individual patients across Centralia and surrounding Illinois communities. We believe everyone deserves prompt access to laboratory diagnostics without burdensome hospital facility charges.
          </p>
        </div>
      </div>
    </div>
  );
};
