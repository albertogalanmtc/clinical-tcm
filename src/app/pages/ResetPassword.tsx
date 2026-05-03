import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, Lock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted && data.session) {
        setIsRecoveryReady(true);
      }
      if (isMounted) {
        setCheckingSession(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setIsRecoveryReady(true);
        setCheckingSession(false);
      }
    });

    void checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isValidPassword = useMemo(() => newPassword.trim().length >= 8, [newPassword]);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = isValidPassword && passwordsMatch;
  const hasError = touched && newPassword.length > 0 && !isValidPassword;
  const confirmError = touched && confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err?.message || 'Failed to update password');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Choose a new password for your account"
    >
      {checkingSession ? (
        <div className="py-8 text-center text-gray-600">
          Checking your recovery session...
        </div>
      ) : !isRecoveryReady ? (
        <div className="space-y-4 text-center py-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
            <Lock className="w-7 h-7 text-teal-600" />
          </div>
          <p className="text-sm text-gray-600">
            Open the password reset link from your email to continue.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to reset request</span>
          </Link>
        </div>
      ) : !isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isLoading}
              autoComplete="new-password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter your new password"
              autoFocus
            />
            {hasError && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Password must be at least 8 characters</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isLoading}
              autoComplete="new-password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                confirmError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Repeat your new password"
            />
            {confirmError && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Passwords do not match</span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating...</span>
              </>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <p className="text-green-700 font-medium mb-4">
            Your password has been updated successfully.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to login</span>
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
