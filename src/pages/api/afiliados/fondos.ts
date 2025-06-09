import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { afiliado_id } = req.query;
  if (!afiliado_id) return res.status(401).json({ error: 'No autorizado: falta afiliado_id' });

  // Obtener ventas confirmadas solo de este afiliado
  const { data: sales, error } = await supabase
    .from('sales')
    .select('id, fecha, monto, user_id, afiliado_id, estado')
    .eq('estado', 'confirmada')
    .eq('afiliado_id', afiliado_id);

  if (error) return res.status(500).json({ error: error.message });

  // Obtener usuarios para mostrar nombre
  const userIds = sales?.map(s => s.user_id) || [];
  const { data: users } = await supabase
    .from('users')
    .select('id, nombre');

  const fondos = (sales || []).map(s => ({
    id: s.id,
    fecha: s.fecha,
    nombre: users?.find(u => u.id === s.user_id)?.nombre || 'Desconocido',
    cuenta: s.user_id.slice(0, 8), // Simulación
    escribe: 'Deposit',
    cantidad: s.monto,
    currency: 'USD',
  }));

  res.status(200).json(fondos);
} 