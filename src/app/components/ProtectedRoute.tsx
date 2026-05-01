import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);

        // Check if admin
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userProfile?.role === 'admin') {
          setIsAdmin(true);
        }

        setLoading(false);
        return;
      }

      // For production: Require real Supabase authentication
      // Uncomment below ONLY for local development/testing without Supabase
      /*
      const userRole = localStorage.getItem('userRole');
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');

      if (userRole && onboardingCompleted === 'true') {
        setIsAuthenticated(true);
        if (userRole === 'admin') {
          setIsAdmin(true);
        }
      }
      */

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL to redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Non-admin trying to access admin route
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
