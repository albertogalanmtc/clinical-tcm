import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckoutRequest {
  priceId: string
  userId: string
  userEmail: string
  planType: 'free' | 'practitioner' | 'advanced'
  billingPeriod?: 'monthly' | 'yearly'
  successUrl?: string
  cancelUrl?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userId, userEmail, planType, billingPeriod = 'monthly', successUrl, cancelUrl }: CheckoutRequest = await req.json()

    if (!priceId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (planType === 'free') {
      return new Response(
        JSON.stringify({ error: 'Free plan does not require payment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const resolvedSuccessUrl = successUrl || `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}&billing=${billingPeriod}`
    const resolvedCancelUrl = cancelUrl || `${appUrl}/select-membership`

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      metadata: {
        userId,
        planType,
        billingPeriod,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
