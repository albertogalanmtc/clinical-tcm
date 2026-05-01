import { FunctionsHttpError, FunctionsFetchError, FunctionsRelayError } from '@supabase/supabase-js';
import type { PlanType } from '@/app/data/usersManager';

export const STRIPE_PRICE_IDS = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || '',
  practitioner: import.meta.env.VITE_STRIPE_PRICE_PRACTITIONER || '',
  advanced: import.meta.env.VITE_STRIPE_PRICE_ADVANCED || '',
} as const;

export type StripeBillingPeriod = 'monthly' | 'yearly';

export interface StripeCheckoutOptions {
  planType: Exclude<PlanType, 'free'>;
  userId: string;
  userEmail: string;
  priceId?: string;
  billingPeriod?: StripeBillingPeriod;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeBillingPortalOptions {
  userId: string;
  returnUrl?: string;
}

export interface StripeInvoiceRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export function getStripePriceId(
  planType: Exclude<PlanType, 'free'>,
  billingPeriod: StripeBillingPeriod,
  plan?: {
    stripePriceIdMonthly?: string;
    stripePriceIdYearly?: string;
    stripePriceId?: string;
  }
): string {
  if (billingPeriod === 'yearly') {
    return plan?.stripePriceIdYearly || plan?.stripePriceIdMonthly || STRIPE_PRICE_IDS[planType];
  }

  return plan?.stripePriceIdMonthly || plan?.stripePriceId || STRIPE_PRICE_IDS[planType];
}

export async function createStripeCheckout(options: StripeCheckoutOptions) {
  const {
    planType,
    userId,
    userEmail,
    priceId,
    billingPeriod = 'monthly',
    successUrl,
    cancelUrl,
  } = options;

  if (planType === 'free') {
    throw new Error('Free plan does not require payment');
  }

  const resolvedPriceId = priceId || STRIPE_PRICE_IDS[planType];
  if (!resolvedPriceId) {
    throw new Error(
      `Missing Stripe price ID for plan: ${planType}. Set the plan's Stripe price ID in Supabase (admin_plans) or define VITE_STRIPE_PRICE_${planType.toUpperCase()} in Vercel.`
    );
  }

  try {
    // Import supabase inside the function to avoid circular dependencies
    const { supabase } = await import('@/app/lib/supabase');

    // Build success and cancel URLs
    const resolvedSuccessUrl = successUrl || `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}&billing=${billingPeriod}`;
    const resolvedCancelUrl = cancelUrl || `${window.location.origin}/select-membership`;

    console.log('Calling create-stripe-checkout with:', { priceId: resolvedPriceId, userId, userEmail, planType, billingPeriod, successUrl: resolvedSuccessUrl, cancelUrl: resolvedCancelUrl });

    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        priceId: resolvedPriceId,
        userId,
        userEmail,
        planType,
        billingPeriod,
        successUrl: resolvedSuccessUrl,
        cancelUrl: resolvedCancelUrl,
      },
    });

    console.log('Response from Edge Function:', { data, error });

    if (error) {
      console.error('Edge Function error:', error);
      throw error;
    }

    if (!data?.url) {
      throw new Error('No checkout URL returned');
    }

    // Redirect to Stripe Checkout - direct assignment is more reliable
    window.location.href = data.url;
  } catch (error: any) {
    console.error('Error creating checkout:', error);

    if (error instanceof FunctionsHttpError && error.context instanceof Response) {
      const responseText = await error.context.text().catch(() => '');
      const detail = responseText.trim();
      throw new Error(
        detail
          ? `Stripe checkout failed: ${detail}`
          : `Stripe checkout failed with HTTP ${error.context.status}`
      );
    }

    if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      throw new Error(error.message);
    }

    throw error;
  }
}

export async function createStripeBillingPortal(options: StripeBillingPortalOptions) {
  const { userId, returnUrl } = options;

  if (!userId) {
    throw new Error('Missing user ID for billing portal');
  }

  try {
    const { supabase } = await import('@/app/lib/supabase');
    const resolvedReturnUrl = returnUrl || `${window.location.origin}/account/membership`;

    const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
      body: {
        userId,
        returnUrl: resolvedReturnUrl,
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error('No billing portal URL returned');
    }

    window.location.href = data.url;
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);

    if (error instanceof FunctionsHttpError && error.context instanceof Response) {
      const responseText = await error.context.text().catch(() => '');
      let detail = responseText.trim();

      try {
        const parsed = JSON.parse(responseText);
        if (parsed?.error) {
          detail = String(parsed.error);
        }
      } catch {
        // keep raw text fallback
      }

      throw new Error(
        detail
          ? `Billing portal failed: ${detail}`
          : `Billing portal failed with HTTP ${error.context.status}`
      );
    }

    if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      throw new Error(error.message);
    }

    throw error;
  }
}

export async function fetchStripeInvoices(userId: string, limit = 10): Promise<StripeInvoiceRecord[]> {
  if (!userId) {
    return [];
  }

  try {
    const { supabase } = await import('@/app/lib/supabase');
    const { data, error } = await supabase.functions.invoke('list-stripe-invoices', {
      body: {
        userId,
        limit,
      },
    });

    if (error) {
      throw error;
    }

    return Array.isArray(data?.invoices) ? data.invoices : [];
  } catch (error: any) {
    console.error('Error fetching Stripe invoices:', error);

    if (error instanceof FunctionsHttpError && error.context instanceof Response) {
      const responseText = await error.context.text().catch(() => '');
      let detail = responseText.trim();

      try {
        const parsed = JSON.parse(responseText);
        if (parsed?.error) {
          detail = String(parsed.error);
        }
      } catch {
        // keep raw text fallback
      }

      throw new Error(
        detail
          ? `Failed to load invoices: ${detail}`
          : `Failed to load invoices with HTTP ${error.context.status}`
      );
    }

    if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      throw new Error(error.message);
    }

    throw error;
  }
}
