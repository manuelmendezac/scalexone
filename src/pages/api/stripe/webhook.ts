import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-28.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret!);
  } catch (err: any) {
    console.error('Error en webhook:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Pago completado:', session.id);
      
      // Aquí puedes agregar lógica para:
      // - Actualizar el estado del pedido en tu BD
      // - Enviar email de confirmación
      // - Dar acceso al producto/servicio
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Pago de suscripción exitoso:', invoice.id);
      
      // Lógica para renovaciones de suscripción
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log('Pago de suscripción fallido:', failedInvoice.id);
      
      // Lógica para manejar pagos fallidos
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Suscripción cancelada:', subscription.id);
      
      // Lógica para cancelar acceso
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.status(200).json({ received: true });
} 