const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize Stripe with your secret key
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { 
        amount, 
        currency = 'usd', 
        productName, 
        customerEmail,
        successUrl,
        cancelUrl 
      } = req.body;

      // Validate required fields
      if (!amount || !productName) {
        return res.status(400).json({ 
          error: 'Missing required fields: amount and productName are required' 
        });
      }

      // Create Stripe Checkout Session
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: productName,
                description: 'Product purchase',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl || `${req.headers.origin}/checkout?success=true`,
        cancel_url: cancelUrl || `${req.headers.origin}/checkout?canceled=true`,
        customer_email: customerEmail || undefined,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IN', 'JP', 'BR'],
        }
      });

      res.json({ 
        sessionId: session.id,
        url: session.url 
      });

    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({
        error: 'Failed to create checkout session',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
