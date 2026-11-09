import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      setIsLoading(true);
      setLoginMessage(null);

      const loggedInUser = await login(email, password);

      setLoginMessage(
        'Login successful. Redirecting to your dashboard...'
      );

      setTimeout(() => {
        /*
         * ============================================
         * ROLE-BASED DASHBOARD ROUTING
         * ============================================
         *
         * ADMIN
         * → Admin / Appointments Dashboard
         *
         * STAFF
         * → Provider Dashboard
         *
         * DOCTOR
         * → Provider Dashboard
         *
         * PROVIDER
         * → Provider Dashboard
         *
         * Everyone else
         * → Home
         */

        if (loggedInUser.role === 'ADMIN') {
          // ONLY ADMIN gets the Admin / Appointments UI
          onNavigate('appointments');
        } else if (
          loggedInUser.role === 'STAFF' ||
          loggedInUser.role === 'DOCTOR' ||
          loggedInUser.role === 'PROVIDER'
        ) {
          // STAFF + DOCTOR + PROVIDER
          // all use the Provider Dashboard
          onNavigate('provider');
        } else {
          onNavigate('home');
        }
      }, 500);

    } catch (error) {
      console.error('Login failed:', error);

      setLoginMessage(
        error instanceof Error
          ? error.message
          : 'Failed to log in'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-gradient-to-br from-[#f5fbfb] via-[#ffffff] to-[#eef8f8] py-14 px-4 sm:px-6 flex items-center justify-center text-left">

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* =====================================================
            LEFT SIDE — BRAND INTRO
            ===================================================== */}

        <div className="lg:col-span-6 space-y-6">

          <div className="inline-block">

            <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-[0.2em] mb-2 block">
              Patient Results Portal
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#103d4a] tracking-tight leading-[1.08]">
              Access Your Lab Results <br />

              <span className="text-[#168d90]">
                Securely & Rapidly.
              </span>
            </h1>

          </div>

          <p className="text-sm sm:text-base text-[#617d86] leading-relaxed">
            Log in to view authorized laboratory test reports, download
            certified PDF copies for your physician, track biomarker history,
            and manage upcoming Centralia appointments.
          </p>

          <div className="space-y-4 pt-2">

            {/* =================================================
                CERTIFIED DIAGNOSTIC REPORTS
                ================================================= */}

            <div className="flex items-center gap-3.5">

              <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>

              <div>

                <strong className="block text-sm text-[#173f4c]">
                  Certified Diagnostic Reports
                </strong>

                <span className="text-xs text-[#7f979e]">
                  Download full quantitative panels and reference charts.
                </span>

              </div>

            </div>

            {/* =================================================
                HISTORICAL TREND COMPARISON
                ================================================= */}

            <div className="flex items-center gap-3.5">

              <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                <Activity className="w-5 h-5" />
              </div>

              <div>

                <strong className="block text-sm text-[#173f4c]">
                  Historical Trend Comparison
                </strong>

                <span className="text-xs text-[#7f979e]">
                  Track lipid, glycemic, and metabolic biomarkers over time.
                </span>

              </div>

            </div>

            {/* =================================================
                STRICT ACCESS CONTROLS
                ================================================= */}

            <div className="flex items-center gap-3.5">

              <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>

                <strong className="block text-sm text-[#173f4c]">
                  Strict Access Controls
                </strong>

                <span className="text-xs text-[#7f979e]">
                  End-to-end encrypted connection and multi-factor auth.
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE — LOGIN CARD
            ===================================================== */}

        <div className="lg:col-span-6">

          <div className="bg-white/98 rounded-3xl border border-[#e2eeee] p-8 sm:p-10 shadow-[0_24px_70px_rgba(16,61,74,0.1)] space-y-6">

            {/* Login Header */}

            <div>

              <h2 className="text-2xl font-extrabold text-[#103d4a]">
                Sign In to Portal
              </h2>

              <p className="text-xs text-[#7f959d] mt-1">
                Enter your registered email and portal password.
              </p>

            </div>

            {/* =================================================
                LOGIN MESSAGE
                ================================================= */}

            {loginMessage && (
              <div className="p-4 rounded-2xl bg-[#edf7f9] border border-[#cde2e5] text-xs text-[#285d6b] space-y-1 leading-relaxed">

                <strong>Login:</strong>

                <p>
                  {loginMessage}
                </p>

              </div>
            )}

            {/* =================================================
                LOGIN FORM
                ================================================= */}

            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {/* =================================================
                  EMAIL
                  ================================================= */}

              <div>

                <label className="block text-xs font-bold text-[#294c57] mb-1">
                  Email Address
                </label>

                <div className="relative">

                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8fa7ad]" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#f8fbfb] border border-[#dce8e9] rounded-xl text-xs text-[#173f4c] outline-none focus:bg-white focus:border-[#299a9c] focus:ring-2 focus:ring-[#299a9c]/10 transition-all"
                  />

                </div>

              </div>

              {/* =================================================
                  PASSWORD
                  ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-1">

                  <label className="text-xs font-bold text-[#294c57]">
                    Password
                  </label>

                  <button
  type="button"
  onClick={() =>
    onNavigate('forgot-password')
  }
  className="text-[11px] font-bold text-[#168d90] hover:underline cursor-pointer"
>
  Forgot Password?
</button>
                </div>

                <div className="relative">

                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8fa7ad]" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#f8fbfb] border border-[#dce8e9] rounded-xl text-xs text-[#173f4c] outline-none focus:bg-white focus:border-[#299a9c] focus:ring-2 focus:ring-[#299a9c]/10 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    title={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8fa7ad] hover:text-[#168d90] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* =================================================
                  LOGIN BUTTON
                  ================================================= */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#178f92] hover:bg-[#117a7d] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_8px_20px_rgba(23,143,146,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >

                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      Sign In to Staff Portal
                    </span>

                    <ArrowRight className="w-4 h-4" />
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                BOOK APPOINTMENT WITHOUT ACCOUNT
                ================================================= */}

            <div className="pt-4 border-t border-[#edf2f2] text-center space-y-3">

              <p className="text-xs text-[#7f949c]">
                Need to book a new lab test or checkup?
              </p>

              <button
                type="button"
                onClick={() => onNavigate('book')}
                className="text-xs font-bold text-[#168d90] hover:text-[#117a7d] underline cursor-pointer"
              >
                Schedule an Appointment without an Account →
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};