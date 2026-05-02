import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { getPlatformSettings } from '../data/platformSettings';
import type { LegalDocument } from '../data/platformSettings';
import { getUserByEmail, setUserPlan } from '../data/usersManager';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authentication, setAuthentication] = useState(() => getPlatformSettings().authentication);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update authentication when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getPlatformSettings();
      setAuthentication(settings.authentication);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // First, check if it's a demo user
      const demoUser = getUserByEmail(email);
      if (demoUser && demoUser.password === password) {
        // Handle demo user login (existing logic)
        localStorage.setItem('userRole', demoUser.role);
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('userProfile', JSON.stringify(demoUser.profile));
        setUserPlan(demoUser.planType);
        window.dispatchEvent(new Event('user-login'));

        if (demoUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/app');
        }
        setIsLoading(false);
        return;
      }

      // Try Supabase Auth for real users
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Supabase login error:', signInError);
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      // Store user data
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('supabaseSession', JSON.stringify(data.session));
      localStorage.setItem('supabaseUser', JSON.stringify(data.user));

      const onboardingCompleted = Boolean(userProfile?.onboarding_completed);

      if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify({
          name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          title: userProfile.title,
          email: userProfile.email,
          billingPeriod: userProfile.billing_period || null,
        }));
        setUserPlan(userProfile.plan_type || 'free');
        localStorage.setItem('onboardingCompleted', onboardingCompleted ? 'true' : 'false');
      } else {
        setUserPlan('free');
        localStorage.setItem('onboardingCompleted', 'false');
      }

      // Dispatch custom event to notify UserContext
      window.dispatchEvent(new Event('user-login'));

      // Redirect to onboarding if the profile is incomplete
      navigate(onboardingCompleted ? '/app' : '/complete-profile');
      setIsLoading(false);
    } catch (error: any) {
      console.error('Login exception:', error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (oauthError) {
        console.error(`${provider} OAuth error:`, oauthError);
        setError(`Failed to sign in with ${provider}. Please try again.`);
        setIsLoading(false);
        return;
      }

      // Supabase will redirect to Google/Microsoft/Apple
      // User will be redirected back to /auth/callback after authentication
    } catch (error: any) {
      console.error(`${provider} OAuth exception:`, error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOpenLegalDocument = (docType: string) => {
    const settings = getPlatformSettings();
    const doc = settings.legalDocuments.find(d => d.type === docType && d.status === 'published');
    if (doc) {
      setSelectedDocument(doc);
      setIsModalOpen(true);
    }
  };

  return (
    <AuthLayout 
      title={getPlatformSettings().branding.appName}
      subtitle="Professional Traditional Chinese Medicine Platform"
    >
      {/* Social Login Section - Only show if at least one OAuth provider is enabled */}
      {(authentication.oauthProviders.google || authentication.oauthProviders.microsoft || authentication.oauthProviders.apple) && (
        <>
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 text-center mb-4 uppercase tracking-wide">
              Continue with
            </p>
            
            <div className="space-y-3">
              {/* Google */}
              {authentication.oauthProviders.google && (
                <button
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
                    Log in with Google
                  </span>
                </button>
              )}

              {/* Microsoft */}
              {authentication.oauthProviders.microsoft && (
                <button
                  onClick={() => console.log('OAuth login with Microsoft - requires Supabase configuration')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f25022" d="M0 0h11v11H0z" />
                    <path fill="#00a4ef" d="M12 0h11v11H12z" />
                    <path fill="#7fba00" d="M0 12h11v11H0z" />
                    <path fill="#ffb900" d="M12 12h11v11H12z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Sign in with Microsoft
                  </span>
                </button>
              )}

              {/* Apple */}
              {authentication.oauthProviders.apple && (
                <button
                  onClick={() => console.log('OAuth login with Apple - requires Supabase configuration')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Sign in with Apple
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Divider - Only show if email/password is also enabled */}
          {authentication.loginOptions.allowEmailPassword && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-500 uppercase tracking-wide">
                  or continue with email
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Email & Password Form - Only show if enabled */}
      {authentication.loginOptions.allowEmailPassword && (
        <>
          {/* Demo Credentials Helper - Removed */}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
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
                required
                disabled={isLoading}
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
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
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </>
      )}

      {/* Secondary Links */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          to="/forgot-password"
          className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          Forgot password?
        </Link>
        <Link
          to="/create-account"
          className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          Create account
        </Link>
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
