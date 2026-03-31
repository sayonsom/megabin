import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { userId, email, packType } = req.body;
    
    let packName, unitAmount, transferCount;
    if (packType === 'pack_100') {
      packName = 'MegaBin Pro - 100 Transfers';
      unitAmount = 2500;
      transferCount = 100;
    } else if (packType === 'pack_25') {
      packName = 'MegaBin Pro - 25 Transfers';
      unitAmount = 1500;
      transferCount = 25;
    } else {
      packName = 'MegaBin Pro - 5 Transfers';
      unitAmount = 500;
      transferCount = 5;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        packType: packType || 'pack_5',
        transferCount: transferCount
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: packName,
              description: 'Persistent Pinning, Burner Domains, and 5GB Payloads. Never expire.',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?upgraded=true&packSize=${transferCount}`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
}
