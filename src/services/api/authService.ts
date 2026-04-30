/**
 * Authentication Service
 * 
 * Handles all authentication operations.
 * Currently uses localStorage for mock authentication.
 * When migrating to Supabase, only this file needs to be updated.
 */

import type { User, UserProfile, AuthSession, ApiResponse } from '@/types';

// ============================================================================
// CURRENT IMPLEMENTATION: LocalStorage (Mock)
// ============================================================================

const AUTH_STORAGE_KEY = 'tcm_auth_session';
const PROFILE_STORAGE_KEY = 'userProfile';
const ROLE_STORAGE_KEY = 'userRole';
const PLAN_STORAGE_KEY = 'userPlanType';

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  profile: Partial<UserProfile>
): Promise<ApiResponse<User>> {
  try {
    // TODO: Replace with Supabase auth.signUp()
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: {
    //     data: profile
    //   }
    // });

    // Mock implementation
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      role: 'user',
      planType: 'free',
      profile: {
        email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        country: profile.country || '',
        onboardingCompleted: false,
      },
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem(ROLE_STORAGE_KEY, 'user');
    localStorage.setItem(PLAN_STORAGE_KEY, 'free');
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(user.profile));

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to sign up',
        code: 'SIGNUP_ERROR',
      },
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<AuthSession>> {
  try {
    // TODO: Replace with Supabase auth.signInWithPassword()
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password
    // });

    // Mock implementation - check if user exists in localStorage
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedEmail !== email) {
      return {
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      };
    }

    const profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
    const role = localStorage.getItem(ROLE_STORAGE_KEY) || 'user';
    const planType = localStorage.getItem(PLAN_STORAGE_KEY) || 'free';

    const user: User = {
      id: `user_${email}`,
      email,
      role: role as 'user' | 'admin',
      planType: planType as any,
      profile,
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      user,
      accessToken: 'mock_access_token',
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    // Store session
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    // Dispatch login event
    window.dispatchEvent(new Event('user-login'));

    return {
      success: true,
      data: session,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to sign in',
        code: 'SIGNIN_ERROR',
      },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<ApiResponse<void>> {
  try {
    // TODO: Replace with Supabase auth.signOut()
    // const { error } = await supabase.auth.signOut();

    // Mock implementation
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('userEmail');
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(PLAN_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);

    // Dispatch logout event
    window.dispatchEvent(new Event('user-logout'));

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to sign out',
        code: 'SIGNOUT_ERROR',
      },
    };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession(): Promise<ApiResponse<AuthSession | null>> {
  try {
    // TODO: Replace with Supabase auth.getSession()
    // const { data: { session }, error } = await supabase.auth.getSession();

    // Mock implementation
    const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!sessionStr) {
      return {
        success: true,
        data: null,
      };
    }

    const session: AuthSession = JSON.parse(sessionStr);

    // Check if session is expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to get session',
        code: 'SESSION_ERROR',
      },
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<ApiResponse<User | null>> {
  try {
    // TODO: Replace with Supabase auth.getUser()
    // const { data: { user }, error } = await supabase.auth.getUser();

    const sessionResult = await getCurrentSession();
    if (!sessionResult.success || !sessionResult.data) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: sessionResult.data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to get user',
        code: 'USER_ERROR',
      },
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> {
  try {
    // TODO: Replace with Supabase database update
    // const { data, error } = await supabase
    //   .from('profiles')
    //   .update(updates)
    //   .eq('id', userId)
    //   .select()
    //   .single();

    // Mock implementation
    const currentProfile = JSON.parse(
      localStorage.getItem(PROFILE_STORAGE_KEY) || '{}'
    );

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

    // Dispatch profile update event
    window.dispatchEvent(new Event('user-login'));

    return {
      success: true,
      data: updatedProfile,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR',
      },
    };
  }
}

/**
 * Reset password (send reset email)
 */
export async function resetPassword(email: string): Promise<ApiResponse<void>> {
  try {
    // TODO: Replace with Supabase auth.resetPasswordForEmail()
    // const { error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: `${window.location.origin}/reset-password`,
    // });

    // Mock implementation - just log
    console.log(`Password reset email would be sent to: ${email}`);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to send reset email',
        code: 'RESET_PASSWORD_ERROR',
      },
    };
  }
}

/**
 * Verify current password by re-authenticating
 */
export async function verifyCurrentPassword(email: string, currentPassword: string): Promise<ApiResponse<void>> {
  try {
    const { supabase } = await import('@/app/lib/supabase');

    // Try to sign in with current credentials to verify password
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });

    if (error) {
      return {
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INVALID_PASSWORD',
        },
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to verify password',
        code: 'VERIFY_PASSWORD_ERROR',
      },
    };
  }
}

/**
 * Update password (requires current password verification first)
 */
export async function updatePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  try {
    const { supabase } = await import('@/app/lib/supabase');

    // First, verify current password
    const verifyResult = await verifyCurrentPassword(email, currentPassword);
    if (!verifyResult.success) {
      return verifyResult;
    }

    // If verification passed, update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UPDATE_PASSWORD_ERROR',
        },
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to update password',
        code: 'UPDATE_PASSWORD_ERROR',
      },
    };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!sessionStr) return false;

  try {
    const session: AuthSession = JSON.parse(sessionStr);
    return !session.expiresAt || session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (session: AuthSession | null) => void
): () => void {
  // TODO: Replace with Supabase auth.onAuthStateChange()
  // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  //   callback(session);
  // });
  // return () => subscription.unsubscribe();

  // Mock implementation
  const handleStorageChange = async () => {
    const result = await getCurrentSession();
    callback(result.data || null);
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('user-login', handleStorageChange);
  window.addEventListener('user-logout', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('user-login', handleStorageChange);
    window.removeEventListener('user-logout', handleStorageChange);
  };
}

// ============================================================================
// FUTURE SUPABASE IMPLEMENTATION (Commented for reference)
// ============================================================================

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Then replace all the mock implementations above with real Supabase calls
// Example:
// export async function signUp(email: string, password: string, profile: Partial<UserProfile>) {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: { data: profile }
//   });
//   
//   if (error) {
//     return {
//       success: false,
//       error: { message: error.message, code: error.code }
//     };
//   }
//   
//   return { success: true, data: data.user };
// }
*/
