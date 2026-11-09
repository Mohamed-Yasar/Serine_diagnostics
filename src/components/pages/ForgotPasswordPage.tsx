import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (view: string) => void;
}

export const ForgotPasswordPage: React.FC<
  ForgotPasswordPageProps
> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3001/api';

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Unable to process your request.'
        );
      }

      setMessage(
        result.message ||
          'If an account exists for that email, a password reset link has been sent.'
      );
    } catch (error) {
      console.error(
        'Forgot password request failed:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to process your request.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-gradient-to-br from-[#f5fbfb] via-[#ffffff] to-[#eef8f8] py-14 px-4 sm:px-6 flex items-center justify-center">

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <div className="lg:col-span-6 space-y-6">

          <div>

            <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-[0.2em] mb-2 block">
              Secure Account Recovery
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#103d4a] tracking-tight leading-[1.08]">
              Reset Your Portal
              <br />

              <span className="text-[#168d90]">
                Password Securely.
              </span>
            </h1>

          </div>

          <p className="text-sm sm:text-base text-[#617d86] leading-relaxed">
            Enter the email address associated with
            your Serine Diagnostics staff account.
            If an account exists, we'll send you a
            secure password reset link.
          </p>

          <div className="space-y-4 pt-2">

            <div className="flex items-center gap-3.5">

              <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>

                <strong className="block text-sm text-[#173f4c]">
                  Secure Reset Link
                </strong>

                <span className="text-xs text-[#7f979e]">
                  Your reset link expires after 30 minutes.
                </span>

              </div>

            </div>

            <div className="flex items-center gap-3.5">

              <div className="w-10 h-10 rounded-xl bg-[#e1f4f3] text-[#168d90] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>

              <div>

                <strong className="block text-sm text-[#173f4c]">
                  Email Verification
                </strong>

                <span className="text-xs text-[#7f979e]">
                  The reset link is sent only to the account email.
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="lg:col-span-6">

          <div className="bg-white/98 rounded-3xl border border-[#e2eeee] p-8 sm:p-10 shadow-[0_24px_70px_rgba(16,61,74,0.1)]">

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 text-xs font-bold text-[#168d90] hover:text-[#117a7d] mb-7 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>

            <div className="mb-6">

              <h2 className="text-2xl font-extrabold text-[#103d4a]">
                Forgot Password?
              </h2>

              <p className="text-xs text-[#7f959d] mt-1 leading-relaxed">
                Enter your registered email address
                and we'll send you instructions to
                reset your password.
              </p>

            </div>

            {message && (
              <div className="mb-5 p-4 rounded-2xl bg-[#edf8f5] border border-[#cce8dd] text-xs text-[#28614f]">

                <div className="flex items-start gap-3">

                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />

                  <p className="leading-relaxed">
                    {message}
                  </p>

                </div>

              </div>
            )}

            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-[#fff4f4] border border-[#f0d2d2] text-xs text-[#9b3b3b]">
                {error}
              </div>
            )}

            {!message && (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

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
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="patient@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#f8fbfb] border border-[#dce8e9] rounded-xl text-xs text-[#173f4c] outline-none focus:bg-white focus:border-[#299a9c] focus:ring-2 focus:ring-[#299a9c]/10 transition-all"
                    />

                  </div>

                </div>

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
                        Send Reset Link
                      </span>

                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}

                </button>

              </form>
            )}

            {message && (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-3.5 rounded-xl bg-[#178f92] hover:bg-[#117a7d] text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Return to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};