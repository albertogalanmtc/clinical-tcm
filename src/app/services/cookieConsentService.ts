import { supabase } from '../lib/supabase';

export interface CookieConsent {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_STORAGE_KEY = 'cookie_consent';
const SESSION_ID_KEY = 'cookie_session_id';

// Generate a session ID for non-authenticated users
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Check if user has given consent
export async function hasGivenConsent(): Promise<boolean> {
  try {
    // Check localStorage first (faster)
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      return true;
    }

    // Check Supabase for authenticated users
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data } = await supabase
        .from('cookie_consent')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      return !!data;
    }

    // Check Supabase for session ID
    const sessionId = getSessionId();
    const { data } = await supabase
      .from('cookie_consent')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    return !!data;
  } catch (error) {
    console.error('Error checking consent:', error);
    return false;
  }
}

// Get current consent preferences
export async function getConsent(): Promise<CookieConsent | null> {
  try {
    // Try localStorage first
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Try Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data, error } = await supabase
        .from('cookie_consent')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading consent from Supabase:', error);
        return null;
      }

      if (data) {
        const consent: CookieConsent = {
          necessary: true,
          functional: data.functional,
          analytics: data.analytics,
          marketing: data.marketing
        };
        // Cache in localStorage
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
        return consent;
      }
    } else {
      // Try session-based consent
      const sessionId = getSessionId();
      const { data } = await supabase
        .from('cookie_consent')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (data) {
        const consent: CookieConsent = {
          necessary: true,
          functional: data.functional,
          analytics: data.analytics,
          marketing: data.marketing
        };
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
        return consent;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting consent:', error);
    return null;
  }
}

// Save consent preferences
export async function saveConsent(consent: CookieConsent): Promise<boolean> {
  try {
    // Save to localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));

    // Save to Supabase
    const { data: { session } } = await supabase.auth.getSession();

    const consentData = {
      necessary: true,
      functional: consent.functional,
      analytics: consent.analytics,
      marketing: consent.marketing,
      ip_address: null, // You could get this from an IP API
      user_agent: navigator.userAgent
    };

    if (session?.user) {
      // Authenticated user
      const { error } = await supabase
        .from('cookie_consent')
        .upsert({
          user_id: session.user.id,
          ...consentData
        });

      if (error) {
        console.error('Error saving consent to Supabase:', error);
        return false;
      }
    } else {
      // Non-authenticated user - use session ID
      const sessionId = getSessionId();
      const { error } = await supabase
        .from('cookie_consent')
        .upsert({
          session_id: sessionId,
          ...consentData
        });

      if (error) {
        console.error('Error saving consent to Supabase:', error);
        return false;
      }
    }

    // Trigger analytics setup if consent was given
    if (consent.analytics) {
      window.dispatchEvent(new CustomEvent('analytics-consent-granted'));
    } else {
      window.dispatchEvent(new CustomEvent('analytics-consent-revoked'));
    }

    return true;
  } catch (error) {
    console.error('Error saving consent:', error);
    return false;
  }
}

// Accept all cookies
export async function acceptAllCookies(): Promise<boolean> {
  return saveConsent({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  });
}

// Reject all optional cookies (only necessary)
export async function rejectAllCookies(): Promise<boolean> {
  return saveConsent({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });
}

// Clear consent (for testing/debugging)
export async function clearConsent(): Promise<void> {
  localStorage.removeItem(CONSENT_STORAGE_KEY);

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      await supabase
        .from('cookie_consent')
        .delete()
        .eq('user_id', session.user.id);
    } else {
      const sessionId = getSessionId();
      await supabase
        .from('cookie_consent')
        .delete()
        .eq('session_id', sessionId);
    }
  } catch (error) {
    console.error('Error clearing consent:', error);
  }
}
