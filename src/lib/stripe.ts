import type { PlanType } from '@/app/data/usersManager';

export const STRIPE_PRICE_IDS = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || 'price_1TQSiKBwGvLUpGuBwZs5woZ5',
  practitioner: import.meta.env.VITE_STRIPE_PRICE_PRACTITIONER || 'price_1TQSimBwGvLUpGuBBhXw7LHb',
  advanced: import.meta.env.VITE_STRIPE_PRICE_ADVANCED || 'price_1TQSj3BwGvLUpGuBSyqanz4O',
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
    throw new Error(`Missing Stripe price ID for plan: ${planType}`);
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
    throw error;
  }
}
