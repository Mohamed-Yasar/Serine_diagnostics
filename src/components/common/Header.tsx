import React, { useState } from 'react';
import { SerineLogo } from './SerineLogo';
import {
  Phone,
  Calendar,
  User,
  Menu,
  X,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (
    view: string,
    testId?: string,
    packageId?: string,
    locationId?: string
  ) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'book', label: 'Book a Test', highlight: true },
    { id: 'tests', label: 'Tests & Menu' },
    { id: 'home-collection', label: 'Home Collection' },
    { id: 'packages', label: 'Wellness Packages' },
    { id: 'insurance', label: 'Insurance & Billing' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-[#103d4a] text-[#b8d4dc] text-xs py-2 px-4 border-b border-[#184d5c]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 text-white font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#168d90]" />
              Centralia Reference Laboratory & Patient Service Center
            </span>

            <span className="hidden md:inline-flex items-center gap-1 text-[#93b3bd]">
              <Clock className="w-3.5 h-3.5 text-[#168d90]" />
              Same-Day STAT Processing Available
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs font-semibold ml-auto">
            <a
              href="tel:3125557376"
              className="hover:text-white transition-colors inline-flex items-center gap-1 text-[#e1f4f3]"
            >
              <Phone className="w-3 h-3 text-[#168d90]" />
              872-330-7679
            </a>

            <span className="text-[#2a5968]">|</span>

            <button
              onClick={() => handleNavClick('login')}
              className="hover:text-white transition-colors inline-flex items-center gap-1 text-[#a5cbcf]"
            >
              <User className="w-3 h-3 text-[#168d90]" />
              Patient Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dce8e9] shadow-[0_4px_20px_rgba(16,61,74,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[74px]">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left cursor-pointer focus:outline-none"
              aria-label="Serine Diagnostics Home"
            >
              <SerineLogo size="md" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
              {navItems.map((item) => {
                const isActive = currentView === item.id;

                if (item.highlight) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#168d90] text-white shadow-sm'
                          : 'text-[#415f69] hover:text-[#168d90] hover:bg-[#f6fafb]'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
  ? 'bg-[#168d90] text-white shadow-sm'
  : 'text-[#415f69] hover:text-[#168d90] hover:bg-[#f6fafb]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => handleNavClick('book')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-xs xl:text-sm font-bold shadow-[0_6px_16px_rgba(22,141,144,0.22)] hover:shadow-[0_8px_20px_rgba(22,141,144,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Book an Appointment
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => handleNavClick('book')}
                className="px-3 py-1.5 rounded-lg bg-[#168d90] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#103d4a] hover:bg-[#f0f7f8] focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e2eeee] bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="grid gap-1 mb-4">
              {navItems.map((item) => {
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#168d90] text-white font-bold'
                        : 'text-[#294c57] hover:bg-[#f6fafb]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.highlight && (
                        <Calendar
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-[#168d90]'
                          }`}
                        />
                      )}
                      {item.label}
                    </span>

                    <ChevronRight
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-[#8a9fa6]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#edf4f5] flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#cfe2e4] text-[#168d90] text-sm font-bold bg-[#f8fbfb]"
              >
                <User className="w-4 h-4" />
                Patient Results Portal
              </button>

              <a
                href="tel:872-330-7679"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#103d4a] text-white text-sm font-bold"
              >
                <Phone className="w-4 h-4 text-[#168d90]" />
                Call Centralia Lab: 872-330-7679
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};