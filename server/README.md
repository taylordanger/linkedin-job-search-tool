# LinkedIn URL Generator - Backend Server

Node.js/Express backend server with Stripe payment integration for the LinkedIn URL Generator premium features.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Get Your Stripe Keys

1. **API Keys**: [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
   - Copy your **Secret key** → `STRIPE_SECRET_KEY`
   - Copy your **Publishable key** → `STRIPE_PUBLISHABLE_KEY`

2. **Create Product**:
   - Go to [Products](https://dashboard.stripe.com/products)
   - Click "Add product"
   - Name: "Premium Subscription"
   - Price: $4.99/month (recurring)
   - Click "Save product"
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_ID`

3. **Webhook Secret** (for production):
   - Go to [Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Start the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Create Checkout Session
```
POST /create-checkout-session
Content-Type: application/json

{
  "priceId": "price_xxx",  // Optional, uses .env value if not provided
  "customerEmail": "user@example.com"  // Optional
}

Response:
{
  "id": "cs_test_xxx",
  "url": "https://checkout.stripe.com/xxx"
}
```

### Verify Subscription
```
POST /verify-subscription
Content-Type: application/json

{
  "sessionId": "cs_test_xxx"
}

Response:
{
  "success": true,
  "isPremium": true,
  "subscriptionId": "sub_xxx",
  "customerId": "cus_xxx",
  "status": "active",
  "currentPeriodEnd": "2026-02-15T00:00:00.000Z"
}
```

### Cancel Subscription
```
POST /cancel-subscription
Content-Type: application/json

{
  "subscriptionId": "sub_xxx"
}

Response:
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the billing period",
  "cancelAt": "2026-02-15T00:00:00.000Z"
}
```

### Create Portal Session
```
POST /create-portal-session
Content-Type: application/json

{
  "customerId": "cus_xxx"
}

Response:
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

### Get Config
```
GET /config

Response:
{
  "publishableKey": "pk_test_xxx"
}
```

### Webhook Handler
```
POST /webhook
Stripe-Signature: xxx
Content-Type: application/json

[Stripe webhook events]
```

## 🔧 Update Frontend

Update `../script.js` with your backend URL:

```javascript
// Get publishable key from backend
fetch('http://localhost:3000/config')
  .then(r => r.json())
  .then(data => {
    const stripe = Stripe(data.publishableKey);
  });

// Create checkout session
const response = await fetch('http://localhost:3000/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'price_YOUR_PRICE_ID',
  }),
});
```

## 🧪 Testing

### Test with Stripe Test Cards

**Successful payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Payment requires authentication:**
```
Card: 4000 0025 0000 3155
```

**Payment fails:**
```
Card: 4000 0000 0000 9995
```

[More test cards](https://stripe.com/docs/testing#cards)

### Test Webhook Locally

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or
npm install -g stripe
```

Login and forward webhooks:
```bash
stripe login
stripe listen --forward-to localhost:3000/webhook
```

This will give you a webhook secret starting with `whsec_`. Add it to your `.env` file.

## 🚢 Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_xxx
heroku config:set STRIPE_PRICE_ID=price_xxx
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxx
heroku config:set FRONTEND_URL=https://yourdomain.com

# Deploy
git push heroku main
```

### Option 2: Vercel

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/server.js" }],
  "env": {
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
    "STRIPE_PRICE_ID": "@stripe-price-id",
    "FRONTEND_URL": "@frontend-url"
  }
}
```

Deploy:
```bash
npm install -g vercel
vercel
```

### Option 3: AWS EC2 / DigitalOcean

```bash
# SSH into server
ssh user@your-server-ip

# Clone repo
git clone your-repo-url
cd server

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server.js --name linkedin-api

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 4: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** (already in `.gitignore`)
2. **Use environment variables** for all sensitive data
3. **Enable webhook signature verification** (already implemented)
4. **Use HTTPS in production** (required by Stripe)
5. **Validate all inputs** (basic validation included)
6. **Rate limit your endpoints** (consider adding `express-rate-limit`)
7. **Use Stripe test mode** during development

## 📊 Database Integration (Optional)

For production, you should store user data in a database. Example with MongoDB:

```javascript
// Add to server.js
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  customerId: String,
  subscriptionId: String,
  isPremium: Boolean,
  premiumUntil: Date
});

const User = mongoose.model('User', userSchema);

// Update user after successful payment
async function updateUserPremiumStatus(customerId, isPremium) {
  await User.updateOne(
    { customerId },
    { isPremium, premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  );
}
```

## 🐛 Troubleshooting

**Server won't start:**
- Check if port 3000 is already in use
- Verify `.env` file exists and has correct values
- Run `npm install` again

**Stripe errors:**
- Verify API keys are correct (test vs live)
- Check Stripe Dashboard for error logs
- Ensure Price ID is for the correct mode (test/live)

**Webhook not working:**
- Check webhook signature in Stripe Dashboard
- Verify endpoint URL is correct
- Use Stripe CLI for local testing

**CORS errors:**
- Update `FRONTEND_URL` in `.env`
- Check browser console for specific CORS error

## 📝 Next Steps

1. ✅ Set up environment variables
2. ✅ Test locally with Stripe test cards
3. ✅ Update frontend to use backend URL
4. ⬜ Add database for user management
5. ⬜ Implement user authentication
6. ⬜ Deploy to production
7. ⬜ Switch to Stripe live mode
8. ⬜ Set up production webhooks

## 📚 Resources

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Express.js Docs](https://expressjs.com/)

## 💬 Support

For issues or questions:
- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Stripe Discord: [stripe.com/discord](https://stripe.com/discord)
