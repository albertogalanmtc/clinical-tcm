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

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const normalizePlanType = (value: string | null | undefined): 'free' | 'practitioner' | 'advanced' | null => {
  if (value === 'free' || value === 'practitioner' || value === 'advanced') {
    return value
  }

  if (value === 'pro') return 'practitioner'
  if (value === 'clinic') return 'advanced'

  return null
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()

    const event = webhookSecret
      ? stripe.webhooks.constructEvent(body, signature, webhookSecret)
      : JSON.parse(body)

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId || session.client_reference_id
        const planType = normalizePlanType(session.metadata?.planType)

        if (!userId || !planType) {
          console.error('Missing userId or planType in session metadata')
          break
        }

        const { error } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: session.customer_email || session.customer_details?.email || '',
            plan_type: planType,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          })

        if (error) {
          console.error('Error updating user plan:', error)
        } else {
          console.log(`Updated user ${userId} to ${planType} plan`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          const isActive = subscription.status === 'active'
          const updatePayload: Record<string, unknown> = {
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          }

          if (!isActive) {
            updatePayload.plan_type = 'free'
          }

          const { error } = await supabase
            .from('users')
            .update(updatePayload)
            .eq('id', user.id)

          if (error) {
            console.error('Error updating subscription:', error)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          const { error } = await supabase
            .from('users')
            .update({
              plan_type: 'free',
              stripe_subscription_id: null,
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (error) {
            console.error('Error downgrading user:', error)
          } else {
            console.log(`Downgraded user ${user.id} to free plan`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
