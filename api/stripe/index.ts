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
    const { nombre, descripcion, precio, tipo_pago, moneda = 'usd', periodicidad = 'month' } = req.body

    if (!nombre || !precio || !tipo_pago) {
      return res.status(400).json({ error: 'nombre, precio y tipo_pago son requeridos' })
    }

    // Crear producto en Stripe
    const product = await stripe.products.create({
      name: nombre,
      description: descripcion,
    })

    // Crear precio en Stripe
    const priceData: any = {
      product: product.id,
      unit_amount: Math.round(precio * 100), // Stripe usa centavos
      currency: moneda,
    }

    if (tipo_pago === 'suscripcion') {
      priceData.recurring = {
        interval: periodicidad,
      }
    }

    const price = await stripe.prices.create(priceData)

    res.status(200).json({
      stripe_product_id: product.id,
      stripe_price_id: price.id,
      nombre,
      precio,
      tipo_pago,
    })
  } catch (error) {
    console.error('Error creando producto en Stripe:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 