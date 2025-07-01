import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });

// Endpoint de salud en la raíz
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Stripe API microservicio operativo 🚀' });
});

// Endpoint de salud específico para Stripe
app.get('/api/stripe/health', (req, res) => {
  res.status(200).json({ status: 'ok', stripe: true, timestamp: new Date().toISOString() });
});

app.post('/api/stripe/checkout', async (req, res) => {
  try {
    const { planId, userId, planType } = req.body;
    if (!planId || !userId) {
      return res.status(400).json({ error: 'planId y userId son requeridos' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        userId,
        planType,
      },
    });
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error en checkout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Stripe API running on port ${PORT}`)); 