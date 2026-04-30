import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUserPlan, getCurrentUserFeatures, getUserRole, getUserProfile, getPlanFeaturesAsync, DEFAULT_PLANS, type PlanType, type PlanFeatures } from '../data/usersManager';
import { supabase } from '../lib/supabase';

interface UserContextType {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  country: string;
  avatarColor: string;
  avatarImage: string | null;
  isAdmin: boolean;
  planType: PlanType | null;
  planFeatures: PlanFeatures;
  userId: string | null; // Supabase user ID
  user: { id: string; email: string } | null; // For compatibility with services
  setName: (name: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setTitle: (title: string) => void;
  setCountry: (country: string) => void;
  setAvatarColor: (color: string) => void;
  setAvatarImage: (image: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize state with default values
  const [name, setName] = useState('Dr. Alberto Galán');
  const [firstName, setFirstName] = useState('Alberto');
  const [lastName, setLastName] = useState('Galán');
  const [title, setTitle] = useState('Dr.');
  const [email, setEmail] = useState('admin@tcm.com');
  const [country, setCountry] = useState('');
  const [avatarColor, setAvatarColor] = useState('bg-teal-600');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures>(DEFAULT_PLANS.free);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user data from localStorage and Supabase session on mount
  useEffect(() => {
    const loadUserData = async () => {
      // Check for Supabase session first
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // User is logged in with Supabase
        setUserId(session.user.id);
        setEmail(session.user.email || '');

        // Store user ID for community features
        sessionStorage.setItem('supabase_user_id', session.user.id);

        // Load profile from database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          setFirstName(userProfile.first_name || '');
          setLastName(userProfile.last_name || '');
          setName(`${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User');
          setTitle(userProfile.title || '');
          setCountry(userProfile.country || '');
          setPlanType(userProfile.plan_type || 'free');
          setIsAdmin(userProfile.role === 'admin');

          // Load plan features from Supabase
          const userPlanType = userProfile.plan_type || 'free';
          const features = await getPlanFeaturesAsync(userPlanType);
          setPlanFeatures(features);

          // Update localStorage for compatibility
          // Important: Use session.user.email (from auth) not userProfile.email (from users table)
          localStorage.setItem('userProfile', JSON.stringify({
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            title: userProfile.title,
            email: session.user.email, // Use email from auth session
            country: userProfile.country,
          }));
          localStorage.setItem('userPlanType', userProfile.plan_type || 'free');
          localStorage.setItem('userRole', userProfile.role || 'user');
        } else {
          console.error('No user profile found in database for ID:', session.user.id, profileError);

          // Fallback: use default values if profile not found
          setName('User');
          setFirstName('User');
          setLastName('');
          setTitle('');
          setCountry('');
          setPlanType('free');
          setIsAdmin(false);
          setPlanFeatures(DEFAULT_PLANS.free);
        }

        return;
      }

      // Fallback to localStorage for demo users
      const profile = getUserProfile();
      let userRole = getUserRole();
      const userPlan = getCurrentUserPlan();
      const features = getCurrentUserFeatures();

      // If no role is set, default to admin for development/editing
      if (!userRole) {
        userRole = 'admin';
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userPlanType', 'clinic');
        localStorage.setItem('onboardingCompleted', 'true');
      }

      if (profile) {
        setName(`${profile.firstName} ${profile.lastName}`);
        setEmail(profile.email || 'admin@tcm.com');
        setCountry(profile.country || '');
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setTitle(profile.title || '');
      }

      setIsAdmin(userRole === 'admin');
      setPlanType(userPlan);
      setPlanFeatures(features);
    };

    loadUserData();
  }, []);

  // Listen for changes in localStorage (login/logout) and Supabase session changes
  useEffect(() => {
    const handleStorageChange = async () => {
      // Check for Supabase session first
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Reload from Supabase, not localStorage
        setUserId(session.user.id);
        setEmail(session.user.email || ''); // Always use email from auth session

        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          setFirstName(userProfile.first_name || '');
          setLastName(userProfile.last_name || '');
          setName(`${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User');
          setTitle(userProfile.title || '');
          setCountry(userProfile.country || '');
          setPlanType(userProfile.plan_type || 'free');
          setIsAdmin(userProfile.role === 'admin');

          // Reload plan features from Supabase
          const userPlanType = userProfile.plan_type || 'free';
          const features = await getPlanFeaturesAsync(userPlanType);
          setPlanFeatures(features);
        }
        return;
      }

      // Fallback to localStorage for demo users
      const userRole = getUserRole();
      const userPlan = getCurrentUserPlan();
      const features = getCurrentUserFeatures();

      setIsAdmin(userRole === 'admin');
      setPlanType(userPlan);
      setPlanFeatures(features);

      const newProfile = getUserProfile();
      if (newProfile) {
        setName(`${newProfile.firstName} ${newProfile.lastName}`);
        setEmail(newProfile.email || 'sarah.chen@example.com');
        setCountry(newProfile.country || '');
        setFirstName(newProfile.firstName);
        setLastName(newProfile.lastName);
        setTitle(newProfile.title || '');
      }
    };

    // Listen to storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen to custom login event from same tab
    window.addEventListener('user-login', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-login', handleStorageChange);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        name,
        firstName,
        lastName,
        title,
        email,
        country,
        avatarColor,
        avatarImage,
        isAdmin,
        planType,
        planFeatures,
        userId,
        user: userId ? { id: userId, email } : null,
        setName,
        setFirstName,
        setLastName,
        setTitle,
        setCountry,
        setAvatarColor,
        setAvatarImage
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // During development/hot reload, provide a temporary fallback to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      // Silent fallback for development - this is expected during hot-reload
      return {
        name: 'User',
        firstName: 'User',
        lastName: 'User',
        title: 'Dr.',
        email: 'user@tcm.com',
        country: '',
        avatarColor: 'bg-teal-600',
        avatarImage: null,
        isAdmin: false,
        planType: 'free' as PlanType,
        planFeatures: DEFAULT_PLANS.free,
        userId: null,
        user: null,
        setName: () => {},
        setFirstName: () => {},
        setLastName: () => {},
        setTitle: () => {},
        setCountry: () => {},
        setAvatarColor: () => {},
        setAvatarImage: () => {},
      };
    }
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}