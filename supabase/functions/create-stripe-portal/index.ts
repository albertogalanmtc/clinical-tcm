import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortalRequest {
  userId: string
  returnUrl?: string
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'paused',
])

async function findStripeCustomerIdByEmail(email: string): Promise<string | null> {
  if (!email) return null

  const customers = await stripe.customers.list({
    email,
    limit: 10,
  })

  if (!customers.data.length) {
    return null
  }

  let fallbackCustomerId: string | null = null

  for (const customer of customers.data) {
    if (!customer || customer.deleted) {
      continue
    }

    if (!fallbackCustomerId) {
      fallbackCustomerId = customer.id
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    })

    const hasActiveSubscription = subscriptions.data.some((subscription) =>
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
    )

    if (hasActiveSubscription) {
      return customer.id
    }
  }

  return fallbackCustomerId
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, returnUrl }: PortalRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error loading user for billing portal:', userError)
      return new Response(
        JSON.stringify({ error: 'Unable to load billing account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let stripeCustomerId = user?.stripe_customer_id || null

    if (!stripeCustomerId && user?.email) {
      stripeCustomerId = await findStripeCustomerIdByEmail(user.email)

      if (stripeCustomerId) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error caching recovered Stripe customer ID:', updateError)
        }
      }
    }

    if (!stripeCustomerId) {
      return new Response(
        JSON.stringify({
          error: 'No Stripe customer found for this user. Complete a paid subscription first.',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const resolvedReturnUrl = returnUrl || `${appUrl}/account/membership`

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: resolvedReturnUrl,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error creating billing portal session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
