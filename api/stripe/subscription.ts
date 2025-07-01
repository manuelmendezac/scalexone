import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { stripe_price_id, customer_email, metadata } = req.body

    if (!stripe_price_id) {
      return res.status(400).json({ error: 'stripe_price_id es requerido' })
    }

    // Crear sesión de suscripción
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer_email,
      metadata,
    })

    res.status(200).json({ 
      checkout_url: session.url,
      session_id: session.id
    })
  } catch (error) {
    console.error('Error en subscription:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 