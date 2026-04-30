# Stripe Integration Guide

This document explains how to complete the Stripe integration for the membership subscription flow.

## Frontend Implementation (Already Complete)

The frontend is ready and includes:

1. **SelectMembership Page** (`src/app/pages/SelectMembership.tsx`)
   - Free plan: Saves directly to localStorage and redirects to app
   - Paid plans (Pro/Clinic): Creates Stripe Checkout session and redirects

2. **PaymentSuccess Page** (`src/app/pages/PaymentSuccess.tsx`)
   - Verifies payment after Stripe redirect
   - Saves plan to localStorage
   - Redirects to app

## Backend Requirements

You need to implement two API endpoints:

### 1. Create Checkout Session

**Endpoint:** `POST /api/create-checkout-session`

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "planCode": "pro",
  "customerEmail": "user@example.com",
  "successUrl": "https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yourdomain.com/select-membership",
  "isUpgrade": false,
  "currentPlan": "free"
}
```

**Note:** `isUpgrade` and `currentPlan` are optional and only sent when a user is upgrading their existing plan (not during initial signup).

**Response:**
```json
{
  "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Implementation Example (Node.js):**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, planCode, customerEmail, successUrl, cancelUrl } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
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
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

### 2. Verify Checkout Session

**Endpoint:** `POST /api/verify-checkout-session`

**Request Body:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Response:**
```json
{
  "success": true,
  "planCode": "pro"
}
```

**Implementation Example (Node.js):**
```javascript
app.post('/api/verify-checkout-session', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      res.json({
        success: true,
        planCode: session.metadata.planCode,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    res.status(500).json({ error: 'Failed to verify checkout session' });
  }
});
```

### 3. Stripe Webhook (Recommended)

To handle subscription lifecycle events (cancellations, renewals, payment failures), implement a webhook:

**Endpoint:** `POST /api/stripe-webhook`

**Events to Handle:**
- `checkout.session.completed` - Subscription started
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed

**Implementation Example:**
```javascript
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update user subscription in database
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Downgrade user to free plan
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object;
      // Send payment failure notification
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

## Configuration

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Price IDs

Update the price IDs in `src/app/services/planService.ts`:

```typescript
{
  id: '2',
  name: 'Practitioner',
  code: 'pro',
  stripePriceId: 'price_YOUR_ACTUAL_PRICE_ID', // ← Update this
  // ...
}
```

You can find your Price IDs in the Stripe Dashboard under Products.

## Testing

### Test Mode

Use Stripe test mode for development:

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Test Webhook:**

Use Stripe CLI to forward webhook events to localhost:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### Production Checklist

Before going live:

- [ ] Switch from test keys to live keys
- [ ] Update Price IDs to production prices
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test complete subscription flow
- [ ] Test cancellation flow
- [ ] Set up monitoring for failed payments

## Frontend Configuration

Once the backend endpoints are ready, update the API endpoint URLs in:

1. `src/app/pages/SelectMembership.tsx` (line 30)
   - Change `const API_ENDPOINT = '/api/create-checkout-session';` to your actual URL

2. `src/app/pages/PaymentSuccess.tsx` (line 24)
   - Change `const API_ENDPOINT = '/api/verify-checkout-session';` to your actual URL

## User Flow Summary

1. User registers → CompleteProfile
2. User selects plan → SelectMembership
3. **If Free:** Save plan locally → Redirect to app
4. **If Paid:**
   - Create Stripe Checkout session via backend
   - Redirect to Stripe Checkout
   - User completes payment
   - Stripe redirects to `/payment-success?session_id=...`
   - Frontend verifies session with backend
   - Save plan locally → Redirect to app

## Plan Upgrades

Users can upgrade their plan at any time using the **UpgradePlanModal** component, which is triggered by:
- "Upgrade to Pro/Enterprise" buttons in locked features
- Upgrade prompts throughout the app

### Upgrade Flow

1. User clicks "Upgrade" button → Modal opens
2. Modal shows only plans higher than current plan
3. User selects new plan → Clicks "Upgrade Now"
4. Frontend creates Stripe Checkout session with `isUpgrade: true`
5. User completes payment on Stripe
6. Stripe redirects to `/payment-success?session_id=...`
7. Frontend verifies and saves new plan
8. User immediately gets access to new features

### Backend Considerations for Upgrades

When `isUpgrade: true` is sent to your backend, you should:

1. **Prorate the subscription** - Give credit for unused time on old plan
2. **Update the subscription** - Use Stripe's subscription update API instead of creating a new subscription
3. **Handle metadata** - Store both `currentPlan` and `planCode` to track the upgrade

**Example upgrade implementation:**

```javascript
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, planCode, customerEmail, isUpgrade, currentPlan } = req.body;

  try {
    if (isUpgrade) {
      // For upgrades, you might want to update existing subscription instead
      // This is a simplified example - adjust based on your needs
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          proration_behavior: 'create_prorations', // Prorate the upgrade
        },
        metadata: {
          planCode: planCode,
          previousPlan: currentPlan,
          isUpgrade: 'true',
        },
        success_url: req.body.successUrl,
        cancel_url: req.body.cancelUrl,
      });

      res.json({ sessionUrl: session.url });
    } else {
      // Handle new subscription (existing code)
      // ...
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

### Components Involved in Upgrades

- **UpgradePlanModal** (`src/app/components/UpgradePlanModal.tsx`) - Modal showing upgrade options
- **UpgradePrompt** (`src/app/components/UpgradePrompt.tsx`) - Buttons/prompts that open the modal
- **MembershipPage** (`src/app/pages/MembershipPage.tsx`) - Account page with upgrade/downgrade buttons
- **FeatureGuard** - Wraps features and shows upgrade prompts when locked

### Downgrades

Downgrades don't require immediate payment but should:

1. **Update subscription at period end** - User keeps access until current billing period ends
2. **Send confirmation** - Email notification of the scheduled downgrade
3. **Use Stripe API** - Update subscription with `proration_behavior: 'none'` and `cancel_at_period_end: false`

**Example downgrade endpoint:**

```javascript
app.post('/api/update-subscription', async (req, res) => {
  const { newPlanCode, currentPlan, isDowngrade } = req.body;

  try {
    // Get customer's subscription ID from your database
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription to new plan at period end
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'none', // No prorations for downgrades
      metadata: {
        previousPlan: currentPlan,
        newPlan: newPlanCode,
        isDowngrade: 'true',
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});
```

## Notes

- Free plan users bypass Stripe completely during signup
- Paid plan users must complete Stripe checkout before accessing the app
- User role is set to 'user' (not 'admin') during signup
- Admin users can access Admin Panel; regular users cannot
- Plan upgrades are processed immediately - users don't need to wait for the next billing cycle to access new features
