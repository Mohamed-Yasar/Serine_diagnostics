import React, { useState, useEffect } from 'react';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

import { HomePage } from './components/pages/HomePage';
import { HomeCollectionPage } from './components/pages/HomeCollectionPage';
import { TestsPage } from './components/pages/TestsPage';
import { PackagesPage } from './components/pages/PackagesPage';
import { InsurancePage } from './components/pages/InsurancePage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { LoginPage } from './components/pages/LoginPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';

import { BookingWizard } from './components/booking/BookingWizard';

import { AppointmentsPage } from './components/pages/AppointmentsPage';
import { StaffManagementPage } from './components/pages/StaffManagementPage';
import { TestManagementPage } from './components/pages/TestManagementPage';

import { ProviderDashboardPage } from './components/pages/ProviderDashboardPage';
import { ProviderCreateOrderPage } from './components/pages/ProviderCreateOrderPage';
import { ProviderOrdersPage } from './components/pages/ProviderOrdersPage';
import { ProviderResultsPage } from './components/pages/ProviderResultsPage';

export default function App() {
  const [currentView, setCurrentView] =
    useState('home');

  const [
    bookingTestId,
    setBookingTestId,
  ] = useState<string | null>(null);

  const [
    bookingPackageId,
    setBookingPackageId,
  ] = useState<string | null>(null);

  const [
    bookingLocationId,
    setBookingLocationId,
  ] = useState<string | null>(null);

  const [
    testsDetailId,
    setTestsDetailId,
  ] = useState<string | null>(null);

  const [
    resetPasswordToken,
    setResetPasswordToken,
  ] = useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * Supported application views
   * ---------------------------------------------------------
   */

  const validViews = [
    'home',
    'book',
    'tests',
    'packages',
    'insurance',
    'about',
    'home-collection',
    'contact',
    'login',
    'forgot-password',
    'reset-password',
    'appointments',
    'test-management',
    'staff-management',
    'provider',
    'provider-create-order',
    'provider-orders',
    'provider-results',
  ];

  /*
   * ---------------------------------------------------------
   * Read URL hash
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const handleHash = () => {
      const hash =
        window.location.hash.replace(
          '#',
          ''
        );

      if (!hash) {
        setCurrentView('home');
        setResetPasswordToken(null);
        return;
      }

      const parts = hash.split('/');
      const view = parts[0];

      /*
       * Password reset link
       *
       * Example:
       *
       * #reset-password/abcdef123456
       */

      if (view === 'reset-password') {
        if (parts[1]) {
          setResetPasswordToken(
            parts.slice(1).join('/')
          );
        } else {
          setResetPasswordToken(null);
        }

        setCurrentView(
          'reset-password'
        );

        return;
      }

      /*
       * Validate normal views
       */

      if (!validViews.includes(view)) {
        setCurrentView('home');
        setResetPasswordToken(null);
        return;
      }

      /*
       * Set current page
       */

      setCurrentView(view);

      /*
       * Clear reset token when leaving
       * reset-password page.
       */

      setResetPasswordToken(null);

      /*
       * Booking URL handling
       */

      if (view === 'book') {
        setBookingTestId(null);
        setBookingPackageId(null);
        setBookingLocationId(null);

        if (
          parts[1] === 'test' &&
          parts[2]
        ) {
          setBookingTestId(parts[2]);
        }

        if (
          parts[1] === 'package' &&
          parts[2]
        ) {
          setBookingPackageId(
            parts[2]
          );
        }

        if (
          parts[1] === 'location' &&
          parts[2]
        ) {
          setBookingLocationId(
            parts[2]
          );
        }
      }

      /*
       * Tests detail URL handling
       */

      if (view === 'tests') {
        if (
          parts[1] === 'test' &&
          parts[2]
        ) {
          setTestsDetailId(parts[2]);
        } else {
          setTestsDetailId(null);
        }
      } else {
        setTestsDetailId(null);
      }
    };

    /*
     * Run once
     */

    handleHash();

    /*
     * Listen for hash changes
     */

    window.addEventListener(
      'hashchange',
      handleHash
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHash
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Navigation Handler
   * ---------------------------------------------------------
   */

  const handleNavigate = (
    view: string,
    testId?: string,
    packageId?: string,
    locationId?: string
  ) => {
    /*
     * Update React state
     */

    setCurrentView(view);

    /*
     * BOOKING
     */

    if (view === 'book') {
      setBookingTestId(
        testId || null
      );

      setBookingPackageId(
        packageId || null
      );

      setBookingLocationId(
        locationId || null
      );

      if (testId) {
        window.location.hash =
          `book/test/${testId}`;
      } else if (packageId) {
        window.location.hash =
          `book/package/${packageId}`;
      } else if (locationId) {
        window.location.hash =
          `book/location/${locationId}`;
      } else {
        window.location.hash =
          'book';
      }
    }

    /*
     * TESTS
     */

    else if (view === 'tests') {
      if (testId) {
        setTestsDetailId(testId);

        window.location.hash =
          `tests/test/${testId}`;
      } else {
        setTestsDetailId(null);

        window.location.hash =
          'tests';
      }
    }

    /*
     * HOME COLLECTION
     */

    else if (
      view === 'home-collection'
    ) {
      setTestsDetailId(null);

      window.location.hash =
        'home-collection';
    }

    /*
     * RESET PASSWORD
     *
     * This is normally reached directly
     * from the reset email.
     */

    else if (
      view === 'reset-password'
    ) {
      window.location.hash =
        'reset-password';
    }

    /*
     * ALL OTHER PAGES
     */

    else {
      setTestsDetailId(null);

      window.location.hash =
        view;
    }

    /*
     * Scroll to top
     */

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-grow">

        {/* HOME */}

        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
          />
        )}

        {/* BOOKING */}

        {currentView === 'book' && (
          <BookingWizard
            initialTestId={
              bookingTestId
            }
            initialPackageId={
              bookingPackageId
            }
            initialLocationId={
              bookingLocationId
            }
            onNavigateHome={() =>
              handleNavigate('home')
            }
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* TESTS */}

        {currentView === 'tests' && (
          <TestsPage
            onNavigate={
              handleNavigate
            }
            initialTestId={
              testsDetailId
            }
          />
        )}

        {/* WELLNESS PACKAGES */}

        {currentView === 'packages' && (
          <PackagesPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* INSURANCE */}

        {currentView === 'insurance' && (
          <InsurancePage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* ABOUT */}

        {currentView === 'about' && (
          <AboutPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* HOME COLLECTION */}

        {currentView ===
          'home-collection' && (
          <HomeCollectionPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* CONTACT */}

        {currentView === 'contact' && (
          <ContactPage />
        )}

        {/* LOGIN */}

        {currentView === 'login' && (
          <LoginPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* FORGOT PASSWORD */}

        {currentView ===
          'forgot-password' && (
          <ForgotPasswordPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* RESET PASSWORD */}

        {currentView ===
          'reset-password' && (
          <ResetPasswordPage
            onNavigate={
              handleNavigate
            }
            token={
              resetPasswordToken ?? ''
            }
          />
        )}

        {/* APPOINTMENTS */}

        {currentView === 'appointments' && (
          <AppointmentsPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* STAFF MANAGEMENT */}

        {currentView ===
          'staff-management' && (
          <StaffManagementPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* TEST MANAGEMENT */}

        {currentView ===
          'test-management' && (
          <TestManagementPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* PROVIDER DASHBOARD */}

        {currentView === 'provider' && (
          <ProviderDashboardPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* PROVIDER CREATE ORDER */}

        {currentView ===
          'provider-create-order' && (
          <ProviderCreateOrderPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* PROVIDER ORDERS */}

        {currentView ===
          'provider-orders' && (
          <ProviderOrdersPage
            onNavigate={
              handleNavigate
            }
          />
        )}

        {/* PROVIDER RESULTS */}

        {currentView ===
          'provider-results' && (
          <ProviderResultsPage
            onNavigate={
              handleNavigate
            }
          />
        )}

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer
        onNavigate={
          handleNavigate
        }
      />

    </div>
  );
}