import express, { Request, Response } from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Stripe webhook needs raw body
app.post('/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Webhook received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout session completed:', session.id);

        // Get customer email and plan from session
        const customerEmail = session.customer_email || session.customer_details?.email;
        const planCode = session.metadata?.planCode;

        if (!customerEmail || !planCode) {
          console.error('❌ Missing customer email or plan code');
          break;
        }

        try {
          // Update user's plan in Supabase
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', customerEmail)
            .single();

          if (userError || !user) {
            console.error('❌ User not found:', customerEmail);
            break;
          }

          // Update user's subscription
          const { error: updateError } = await supabase
            .from('users')
            .update({
              plan_type: planCode,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ Error updating user plan:', updateError);
          } else {
            console.log('✅ User plan updated to:', planCode);
          }
        } catch (error) {
          console.error('❌ Error processing checkout:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🚫 Subscription cancelled:', subscription.id);

        try {
          // Downgrade user to free plan
          const { error } = await supabase
            .from('users')
            .update({
              plan_type: 'free',
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('❌ Error downgrading user:', error);
          } else {
            console.log('✅ User downgraded to free plan');
          }
        } catch (error) {
          console.error('❌ Error processing cancellation:', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💸 Payment failed:', invoice.id);

        try {
          // Update subscription status
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', invoice.customer);

          if (error) {
            console.error('❌ Error updating payment status:', error);
          } else {
            console.log('⚠️ User marked as past due');
          }
        } catch (error) {
          console.error('❌ Error processing payment failure:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// JSON middleware for other routes
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
  const {
    priceId,
    planCode,
    billingPeriod,
    customerEmail,
    successUrl,
    cancelUrl,
    isUpgrade = false,
    currentPlan = null,
  } = req.body;

  console.log('🛒 Creating checkout session for:', { planCode, customerEmail, isUpgrade });

  try {
    // Validate required fields
    if (!priceId || !planCode || !customerEmail || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Missing required fields: priceId, planCode, customerEmail, successUrl, cancelUrl',
      });
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        planCode: planCode,
        billingPeriod: billingPeriod || 'monthly',
        isUpgrade: isUpgrade.toString(),
        previousPlan: currentPlan || 'none',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    };

    // For upgrades, enable proration
    if (isUpgrade) {
      sessionConfig.subscription_data = {
        proration_behavior: 'create_prorations',
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Checkout session created:', session.id);

    res.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

// Verify Checkout Session (optional - webhook is preferred)
app.post('/api/verify-checkout-session', async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  console.log('🔍 Verifying checkout session:', sessionId);

  try {
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      console.log('✅ Payment verified for session:', sessionId);

      res.json({
        success: true,
        planCode: session.metadata?.planCode,
        customerEmail: session.customer_email || session.customer_details?.email,
      });
    } else {
      console.log('⚠️ Payment not completed for session:', sessionId);

      res.status(400).json({
        success: false,
        error: 'Payment not completed',
        status: session.payment_status,
      });
    }
  } catch (error: any) {
    console.error('❌ Error verifying checkout session:', error);
    res.status(500).json({
      error: 'Failed to verify checkout session',
      message: error.message,
    });
  }
});

// Get user subscription status from Supabase
app.get('/api/subscription-status/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('plan_type, subscription_status, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      planType: user.plan_type,
      subscriptionStatus: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
    });
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    // Get user's subscription ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.stripe_subscription_id) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Cancel at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(
      user.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    console.log('✅ Subscription will cancel at period end:', subscription.id);

    res.json({
      success: true,
      cancelAt: subscription.cancel_at,
    });
  } catch (error: any) {
    console.error('❌ Error cancelling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}\n`);
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});
