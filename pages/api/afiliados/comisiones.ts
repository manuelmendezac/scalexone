import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { afiliado_id } = req.query;
  if (!afiliado_id) return res.status(401).json({ error: 'No autorizado: falta afiliado_id' });

  // Obtener comisiones solo de este afiliado
  const { data: commissions, error } = await supabase
    .from('commissions')
    .select('id, sale_id, afiliado_id, monto, estado, fecha')
    .eq('afiliado_id', afiliado_id);

  if (error) return res.status(500).json({ error: error.message });

  // Obtener ventas relacionadas
  const saleIds = commissions?.map(c => c.sale_id) || [];
  const { data: sales } = await supabase
    .from('sales')
    .select('id, fecha, user_id, membership_id, monto, afiliado_id');

  // Obtener usuarios y membresías
  const { data: users } = await supabase
    .from('users')
    .select('id, nombre');
  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, nombre');

  const comisiones = (commissions || []).map(c => {
    const sale = sales?.find(s => s.id === c.sale_id);
    return {
      id: c.id,
      fecha: sale?.fecha || c.fecha,
      referido: users?.find(u => u.id === sale?.afiliado_id)?.nombre || 'Afiliado',
      producto: memberships?.find(m => m.id === sale?.membership_id)?.nombre || 'Membresía',
      cliente: users?.find(u => u.id === sale?.user_id)?.nombre || 'Cliente',
      nivel: 1, // Por ahora solo un nivel
      montoVenta: sale?.monto || 0,
      comision: c.monto,
      estado: c.estado,
    };
  });

  res.status(200).json(comisiones);
} 