import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { setUserPlan } from '../data/usersManager';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔐 OAuth callback - processing...');

        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!session) {
          console.log('No session found');
          setError('No session found. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log('✅ Session found:', session.user.email);

        // Check if user profile exists in database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = not found (expected for new users)
          console.error('Error fetching user profile:', profileError);
        }

        if (!userProfile) {
          console.log('📝 New user - creating profile...');

          // Extract user data from OAuth provider
          const firstName = session.user.user_metadata?.given_name || session.user.user_metadata?.name?.split(' ')[0] || '';
          const lastName = session.user.user_metadata?.family_name || session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '';
          const email = session.user.email || '';

          // Create user profile
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              role: 'user',
              plan_type: 'free',
            });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Continue anyway, user can complete profile later
          } else {
            console.log('✅ User profile created');
          }

          // Store in localStorage
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('onboardingCompleted', 'false'); // Will redirect to complete-profile
          localStorage.setItem('userProfile', JSON.stringify({
            firstName,
            lastName,
            email,
            title: '',
          }));
          setUserPlan('free');

          // Redirect to complete profile
          navigate('/complete-profile');
        } else {
          console.log('✅ Existing user - loading profile...');

          // Store user data
          localStorage.setItem('userRole', userProfile.role || 'user');
          localStorage.setItem('onboardingCompleted', 'true');
          localStorage.setItem('userProfile', JSON.stringify({
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            title: userProfile.title,
            email: userProfile.email,
          }));
          setUserPlan(userProfile.plan_type || 'free');

          // Dispatch event to update UserContext
          window.dispatchEvent(new Event('user-login'));

          // Redirect to home
          navigate('/');
        }
      } catch (error: any) {
        console.error('OAuth callback exception:', error);
        setError('An error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication.</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
