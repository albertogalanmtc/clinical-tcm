import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { getPlatformSettings } from '../data/platformSettings';
import type { LegalDocument } from '../data/platformSettings';
import { supabase } from '../lib/supabase';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authentication, setAuthentication] = useState(() => getPlatformSettings().authentication);
  
  const settings = getPlatformSettings();
  const pendingPlanType = searchParams.get('plan');
  const pendingBillingPeriod = searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly';
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  // Validation errors
  const errors = {
    email: touched.email && email.length > 0 && !isValidEmail(email),
    password: touched.password && password.length > 0 && !isPasswordValid
  };

  // Form is valid if all fields are filled and no errors
  const isFormValid =
    email.length > 0 &&
    isValidEmail(email) &&
    isPasswordValid &&
    agreedToTerms;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleOpenLegalDocument = (docType: string) => {
    const doc = settings.legalDocuments.find(d => d.type === docType && d.status === 'published');
    if (doc) {
      setSelectedDocument(doc);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthentication(getPlatformSettings().authentication);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!pendingPlanType) return;

    localStorage.setItem('pendingPlanType', pendingPlanType);
    localStorage.setItem('pendingBillingPeriod', pendingBillingPeriod);
  }, [pendingBillingPeriod, pendingPlanType]);

  const handleOAuthLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    setIsLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        console.error(`${provider} OAuth error:`, oauthError);
        setGeneralError(`Failed to sign up with ${provider}. Please try again.`);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error(`${provider} OAuth exception:`, error);
      setGeneralError('An error occurred while signing up. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      email: true,
      password: true
    });

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);

    try {
      if (pendingPlanType) {
        localStorage.setItem('pendingPlanType', pendingPlanType);
        localStorage.setItem('pendingBillingPeriod', pendingBillingPeriod);
      }

      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Supabase signup error:', signUpError);

        if (signUpError.message.includes('already registered')) {
          setGeneralError('This email is already registered. Please sign in or use a different email.');
        } else {
          setGeneralError(signUpError.message || 'An error occurred while creating your account. Please try again.');
        }

        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setGeneralError('An error occurred while creating your account. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('Account created in Supabase:', data.user);

      // Save email to localStorage for the Complete Profile step
      localStorage.setItem('registrationEmail', email);
      localStorage.setItem('supabaseUser', JSON.stringify(data.user));
      if (data.session) {
        localStorage.setItem('supabaseSession', JSON.stringify(data.session));
        setSuccessMessage(null);
        navigate('/complete-profile');
        return;
      }

      // When email verification is enabled, Supabase may not create a session yet.
      // The verification link will return the user to /auth/callback.
      setSuccessMessage('We sent you a verification email. Open the link to finish creating your account.');
      setIsLoading(false);

    } catch (error: any) {
      console.error('Error creating account:', error);
      setIsLoading(false);
      setGeneralError('An error occurred while creating your account. Please try again.');
    }
  };

  return (
    <AuthLayout 
      title="Create account"
      subtitle="Start your TCM professional journey"
    >
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 text-center mb-4 uppercase tracking-wide">
          Continue with
        </p>

        <div className="space-y-3">
          {authentication.oauthProviders.google && (
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Sign up with Google
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* General Error Message */}
        {generalError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{generalError}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            disabled={isLoading}
            autoComplete="email"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Please enter a valid email address</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              autoComplete="new-password"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {/* Password Requirements */}
          <div className="mt-2 space-y-1.5">
            <p className="text-xs font-medium text-gray-700 mb-1.5">Password must contain:</p>
            <div className="space-y-1">
              <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRequirements.minLength ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRequirements.hasUppercase ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                <span>One uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRequirements.hasLowercase ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                <span>One lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRequirements.hasNumber ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                <span>One number (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRequirements.hasSpecialChar ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                <span>One special character (!@#$%^&*...)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-500">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => handleOpenLegalDocument('terms')}
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={() => handleOpenLegalDocument('privacy')}
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        {/* Submit Button */}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>

        {/* Secondary Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => handleOpenLegalDocument('terms')}
            className="hover:text-gray-700 transition-colors"
          >
            Terms of Service
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => handleOpenLegalDocument('privacy')}
            className="hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </button>
        </div>
      </form>

      {/* Legal Document Modal */}
      <LegalDocumentModal 
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDocument(null);
        }}
      />
    </AuthLayout>
  );
}
