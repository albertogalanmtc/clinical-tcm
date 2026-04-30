import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, AlertCircle, Check } from 'lucide-react';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { supabase } from '../lib/supabase';

// ISO-2 Country codes with full names
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'GR', name: 'Greece' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
].sort((a, b) => a.name.localeCompare(b.name));

interface FormData {
  firstName: string;
  lastName: string;
  country: string;
}

interface FormErrors {
  firstName: boolean;
  lastName: boolean;
  country: boolean;
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    country: ''
  });
  
  const [touched, setTouched] = useState<FormErrors>({
    firstName: false,
    lastName: false,
    country: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);

  // Default logo URL
  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230d9488"/%3E%3Ctext x="50" y="65" font-size="32" fill="white" text-anchor="middle" font-family="Arial"%3ECT%3C/text%3E%3C/svg%3E';

  // Update branding when settings change
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getPlatformSettings();
      setBranding(settings.branding);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  // Validation
  const errors: FormErrors = {
    firstName: touched.firstName && formData.firstName.trim().length === 0,
    lastName: touched.lastName && formData.lastName.trim().length === 0,
    country: touched.country && formData.country.length === 0
  };

  const isFormValid = 
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.country.length > 0;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setGeneralError(null);
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      country: true
    });

    if (!isFormValid) {
      setGeneralError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      // Get current user session
      let { data: { session } } = await supabase.auth.getSession();

      // If no session, try to get user from localStorage (just created account)
      if (!session?.user) {
        const storedUser = localStorage.getItem('supabaseUser');
        const storedSession = localStorage.getItem('supabaseSession');

        if (storedSession) {
          try {
            session = JSON.parse(storedSession);
          } catch {
            // ignore parse error
          }
        }

        if (!session?.user && storedUser) {
          setGeneralError('Please check your email to confirm your account, then log in.');
          setIsLoading(false);
          return;
        }

        if (!session?.user) {
          setGeneralError('No active session. Please log in again.');
          setIsLoading(false);
          return;
        }
      }

      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          country: formData.country,
          onboarding_completed: true,
        })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating profile in Supabase:', updateError);
        setGeneralError('Failed to save profile. Please try again.');
        setIsLoading(false);
        return;
      }

      // Get email from registration step
      const registrationEmail = localStorage.getItem('registrationEmail') || session.user.email || '';

      // Save profile data to localStorage for compatibility
      const userProfile = {
        email: registrationEmail,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        country: formData.country,
        completedOnboarding: true,
        onboardingCompletedAt: new Date().toISOString()
      };

      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      // Mark onboarding as complete
      localStorage.setItem('onboardingCompleted', 'true');

      // Clean up temporary registration email
      localStorage.removeItem('registrationEmail');

      // Dispatch event to notify UserContext of profile update
      window.dispatchEvent(new Event('user-login'));

      // Success state
      setIsSuccess(true);

      // Navigate to onboarding survey after a brief delay
      setTimeout(() => {
        navigate('/onboarding-survey');
      }, 800);

    } catch (error) {
      console.error('Error saving profile:', error);
      setGeneralError('Failed to save profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_LOGO_URL;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-teal-600 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-sm text-gray-600">
            We need a few details to personalize your experience
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                disabled={isLoading || isSuccess}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.firstName
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
                } ${isSuccess ? 'bg-green-50 border-green-300' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="John"
              />
              {errors.firstName && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>First name is required</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                disabled={isLoading || isSuccess}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.lastName
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
                } ${isSuccess ? 'bg-green-50 border-green-300' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Last name is required</span>
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                onBlur={() => handleBlur('country')}
                disabled={isLoading || isSuccess}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.country
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
                } ${isSuccess ? 'bg-green-50 border-green-300' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country ? (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Country is required</span>
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  Your country determines which herbs may be restricted in your region
                </p>
              )}
            </div>

            {/* General Error */}
            {generalError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{generalError}</p>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">Profile completed! Redirecting...</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading || isSuccess}
              className="w-full bg-teal-600 text-white py-3.5 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Complete!</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        </div>

        {/* Professional Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your information is private and used only for application functionality
          </p>
        </div>
      </div>
    </div>
  );
}
