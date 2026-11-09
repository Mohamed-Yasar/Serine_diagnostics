import React from 'react';
import { SerineLogo } from './SerineLogo';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, testId?: string, packageId?: string, locationId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (view: string) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#092832] text-[#b4c9cf] pt-14 pb-8 border-t border-[#123844]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#18404e]">
          {/* Col 1: Brand & Centralia Info */}
          <div className="lg:col-span-2 space-y-4">
            <SerineLogo variant="white" size="md" />
            <p className="text-sm leading-relaxed text-[#93adb5] max-w-md pt-2">
              Serine Diagnostics is a premier clinical reference laboratory based in Centralia, Illinois. Delivering precision laboratory diagnostics, rapid STAT turnaround times, and compassionate patient phlebotomy care.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-[#a0bcc4]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#168d90] flex-shrink-0 mt-0.5" />
                <span>101 S Lincoln Blvd, Centralia, IL 62801</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#168d90] flex-shrink-0" />
                <span>Centralia Lab: 872-330-7679</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#168d90] flex-shrink-0" />
                <span>clientcare@serinediagnostics.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#168d90] flex-shrink-0" />
                <span>Draw Hours: Mon–Fri 9:00 AM – 4:00 PM | Sat - Appointments Only | Sun - Closed</span>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="flex flex-wrap gap-2.5 pt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#103845] text-[#86e2df] text-[11px] font-bold border border-[#1b4e5f]">
                <ShieldCheck className="w-3.5 h-3.5" />
                CLIA ID: 
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#103845] text-[#86e2df] text-[11px] font-bold border border-[#1b4e5f]">
                <Award className="w-3.5 h-3.5" />
                CAP-Accredited Reference Standard
              </span>
            </div>
          </div>

          {/* Col 2: Clinical Services */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Clinical Testing</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('tests')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Routine Blood Work (CBC, CMP)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tests')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Cardiovascular & Lipid Panels
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tests')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Thyroid & Endocrine Assays
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tests')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Respiratory PCR Multiplex
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('packages')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Executive Wellness Profiles
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Patients & Booking */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Patient Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('book')} className="text-[#64e4e0] font-bold hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1">
                  Book a Test / Appointment →
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('insurance')} className="hover:text-white transition-colors cursor-pointer text-left">
                  In-Network Insurance & Billing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('insurance')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Transparent Self-Pay Rates
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('login')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Patient Results Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Fasting & Test Preparation
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Providers & Company */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">About & Providers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                  About Serine Diagnostics
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Laboratory Leadership
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Physician Order Faxing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors cursor-pointer text-left">
                  STAT Courier Dispatch
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Centralia Client Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Demo Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#7a959c]">
          <div className="flex items-center gap-2 text-center md:text-left">
            <HeartHandshake className="w-4 h-4 text-[#168d90] flex-shrink-0" />
            <span>
              © {new Date().getFullYear()} Serine Diagnostics, LLC. All rights reserved. Located in Centralia, Illinois.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[#8ea8af]">
            <span>Local Prototype Mode</span>
            <span>•</span>
            <span>No Real PHI Transmitted</span>
            <span>•</span>
            <span>Centralia Reference Laboratory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
