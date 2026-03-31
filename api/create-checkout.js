import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { userId, email } = req.body;
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MegaBin Pro Signature Subscription',
              description: 'Persistent Pinning, Burner Domains, and 5GB Payloads.',
            },
            unit_amount: 500, // $5.00
            recurring: { interval: 'month' }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?upgraded=true`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
}
