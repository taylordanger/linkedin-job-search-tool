require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// For webhook verification, we need raw body
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// For other routes, parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LinkedIn URL Generator API is running',
    timestamp: new Date().toISOString()
  });
});

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerEmail } = req.body;

    // Use the price ID from request or environment variable
    const finalPriceId = priceId || process.env.STRIPE_PRICE_ID;

    if (!finalPriceId) {
      return res.status(400).json({
        error: 'Price ID is required. Set STRIPE_PRICE_ID in .env or pass priceId in request.'
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: process.env.SUCCESS_URL || `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.CANCEL_URL || `${process.env.FRONTEND_URL}/cancel.html`,
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        product: 'premium-subscription'
      }
    });

    res.json({
      id: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Verify subscription status
app.post('/verify-subscription', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      res.json({
        success: true,
        isPremium: subscription.status === 'active',
        subscriptionId: subscription.id,
        customerId: session.customer,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      });
    } else {
      res.json({
        success: false,
        isPremium: false
      });
    }

  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Cancel subscription
app.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        error: 'Subscription ID is required'
      });
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: new Date(subscription.cancel_at * 1000)
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Create customer portal session (for managing subscriptions)
app.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required'
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.FRONTEND_URL,
    });

    res.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Stripe Webhook Handler
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Checkout completed:', session.id);
      // TODO: Update your database to mark user as premium
      // Example: await updateUserPremiumStatus(session.customer, true);
      break;

    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      console.log('✅ Subscription created:', subscriptionCreated.id);
      // TODO: Handle new subscription
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      console.log('🔄 Subscription updated:', subscriptionUpdated.id);
      // TODO: Handle subscription update
      break;

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      console.log('❌ Subscription deleted:', subscriptionDeleted.id);
      // TODO: Update your database to remove premium status
      // Example: await updateUserPremiumStatus(subscriptionDeleted.customer, false);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('💰 Payment succeeded:', invoice.id);
      // TODO: Handle successful payment
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('⚠️  Payment failed:', failedInvoice.id);
      // TODO: Handle failed payment (send email, suspend premium, etc.)
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get Stripe publishable key (for frontend)
app.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
