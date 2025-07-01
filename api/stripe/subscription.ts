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
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId es requerido' })
    }

    // Obtener sesión de checkout
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Pago no completado' })
    }

    // Obtener suscripción
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    res.status(200).json({ 
      subscription: subscription,
      session: session 
    })
  } catch (error) {
    console.error('Error en subscription:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 