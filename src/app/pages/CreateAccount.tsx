import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { getPlatformSettings } from '../data/platformSettings';
import type { LegalDocument } from '../data/platformSettings';
import { supabase } from '../lib/supabase';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const settings = getPlatformSettings();
  
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
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
    password: touched.password && password.length > 0 && !isPasswordValid,
    confirmPassword: touched.confirmPassword && confirmPassword.length > 0 && password !== confirmPassword
  };

  // Form is valid if all fields are filled and no errors
  const isFormValid =
    email.length > 0 &&
    isValidEmail(email) &&
    isPasswordValid &&
    confirmPassword.length > 0 &&
    password === confirmPassword &&
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
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

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          plan_type: 'free',
          onboarding_completed: false,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't block the flow, user can complete profile later
      }

      // Save email to localStorage for the Complete Profile step
      localStorage.setItem('registrationEmail', email);
      localStorage.setItem('supabaseUser', JSON.stringify(data.user));
      if (data.session) {
        localStorage.setItem('supabaseSession', JSON.stringify(data.session));
      }

      // After successful registration, redirect to Complete Profile
      navigate('/complete-profile');

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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* General Error Message */}
        {generalError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{generalError}</p>
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={isLoading}
              autoComplete="new-password"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Passwords do not match</span>
            </div>
          )}
          {!errors.confirmPassword && confirmPassword.length > 0 && password === confirmPassword && (
            <div className="flex items-center gap-1.5 mt-1.5 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              <span>Passwords match</span>
            </div>
          )}
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