import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onNavigate: (page: string) => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  token,
  onNavigate,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isStrongPassword =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');

    if (!token) {
      setError('This password reset link is invalid or incomplete.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!isStrongPassword) {
      setError(
        'Password must contain an uppercase letter, lowercase letter, number, and special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to reset your password. Please try again.'
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reset your password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[800px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-[#168d90] text-[11px] font-extrabold tracking-[0.18em] uppercase mb-4">
            <ShieldCheck size={15} />
            Secure Account Recovery
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-[1.05] text-[#103d4a]">
            Create Your
            <br />
            <span className="text-[#168d90]">New Password.</span>
          </h1>

          <p className="mt-6 text-sm md:text-base leading-7 text-[#67808a] max-w-md">
            Choose a strong password for your Serine Diagnostics portal
            account.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7f7f7] flex items-center justify-center text-[#168d90] shrink-0">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#103d4a]">
                  Minimum 8 Characters
                </p>

                <p className="text-xs text-[#78919a] mt-1">
                  Use a long password that&apos;s difficult to guess.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e7f7f7] flex items-center justify-center text-[#168d90] shrink-0">
                <Lock size={18} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#103d4a]">
                  Strong Password Required
                </p>

                <p className="text-xs text-[#78919a] mt-1">
                  Uppercase, lowercase, number and special character.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dcebed] rounded-2xl shadow-[0_20px_50px_rgba(16,61,74,0.08)] p-8">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-[11px] font-bold text-[#168d90] hover:underline mb-7"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </button>

          {success ? (
            <div>
              <div className="w-14 h-14 rounded-full bg-[#e7f7f7] text-[#168d90] flex items-center justify-center mb-5">
                <ShieldCheck size={28} />
              </div>

              <h2 className="text-2xl font-black text-[#103d4a]">
                Password Reset Successful
              </h2>

              <p className="text-sm text-[#78919a] leading-6 mt-3">
                Your Serine Diagnostics password has been updated successfully.
                You can now sign in with your new password.
              </p>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full mt-7 h-12 rounded-xl bg-[#168d90] text-white text-xs font-extrabold hover:bg-[#117b7e] transition"
              >
                BACK TO SIGN IN
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-[#103d4a]">
                Reset Password
              </h2>

              <p className="text-xs text-[#78919a] mt-2">
                Enter and confirm your new password.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-[#f2caca] bg-[#fff5f5] px-4 py-3 text-xs font-semibold text-[#c24b4b]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-[11px] font-extrabold text-[#103d4a] mb-2"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78919a]"
                    />

                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      className="w-full h-11 rounded-xl border border-[#d6e4e7] bg-[#f8fbfc] pl-10 pr-11 text-xs text-[#103d4a] outline-none focus:border-[#168d90] focus:ring-2 focus:ring-[#168d90]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78919a] hover:text-[#168d90]"
                      aria-label={
                        showPassword
                          ? 'Hide new password'
                          : 'Show new password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-[11px] font-extrabold text-[#103d4a] mb-2"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78919a]"
                    />

                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      className="w-full h-11 rounded-xl border border-[#d6e4e7] bg-[#f8fbfc] pl-10 pr-11 text-xs text-[#103d4a] outline-none focus:border-[#168d90] focus:ring-2 focus:ring-[#168d90]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78919a] hover:text-[#168d90]"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirmation password'
                          : 'Show confirmation password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dcebed] bg-[#f8fbfc] p-4">
                  <p className="text-[11px] font-extrabold text-[#103d4a] mb-2">
                    Password requirements
                  </p>

                  <ul className="space-y-1 text-[11px] text-[#78919a]">
                    <li
                      className={
                        passwordRequirements.minLength
                          ? 'text-[#168d90] font-semibold'
                          : ''
                      }
                    >
                      • At least 8 characters
                    </li>

                    <li
                      className={
                        passwordRequirements.uppercase
                          ? 'text-[#168d90] font-semibold'
                          : ''
                      }
                    >
                      • One uppercase letter
                    </li>

                    <li
                      className={
                        passwordRequirements.lowercase
                          ? 'text-[#168d90] font-semibold'
                          : ''
                      }
                    >
                      • One lowercase letter
                    </li>

                    <li
                      className={
                        passwordRequirements.number
                          ? 'text-[#168d90] font-semibold'
                          : ''
                      }
                    >
                      • One number
                    </li>

                    <li
                      className={
                        passwordRequirements.special
                          ? 'text-[#168d90] font-semibold'
                          : ''
                      }
                    >
                      • One special character
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#168d90] text-white text-xs font-extrabold hover:bg-[#117b7e] disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Supports the named import currently used by App.tsx.
export { ResetPasswordPage };

// Also supports default imports.
export default ResetPasswordPage;