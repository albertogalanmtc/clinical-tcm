import type { PlanType } from '@/app/data/usersManager';

export const STRIPE_PRICE_IDS = {
  free: import.meta.env.VITE_STRIPE_PRICE_FREE || 'price_1TQSiKBwGvLUpGuBwZs5woZ5',
  practitioner: import.meta.env.VITE_STRIPE_PRICE_PRACTITIONER || 'price_1TQSimBwGvLUpGuBBhXw7LHb',
  advanced: import.meta.env.VITE_STRIPE_PRICE_ADVANCED || 'price_1TQSj3BwGvLUpGuBSyqanz4O',
} as const;

export async function createStripeCheckout(planType: Exclude<PlanType, 'free'>, userId: string, userEmail: string) {
  if (planType === 'free') {
    throw new Error('Free plan does not require payment');
  }

  const priceId = STRIPE_PRICE_IDS[planType];

  try {
    // Import supabase inside the function to avoid circular dependencies
    const { supabase } = await import('@/app/lib/supabase');

    // Build success and cancel URLs
    const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/select-membership`;

    console.log('Calling create-stripe-checkout with:', { priceId, userId, userEmail, planType, successUrl, cancelUrl });

    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        priceId,
        userId,
        userEmail,
        planType,
        successUrl,
        cancelUrl,
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
