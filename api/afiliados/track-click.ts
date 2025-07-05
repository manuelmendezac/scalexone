import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const {
    ib,
    community_id,
    utm_source,
    utm_medium,
    utm_campaign,
    user_agent,
    referrer,
    ip_address
  } = req.body;

  // Validación robusta
  if (!ib || !community_id || community_id === 'default') {
    console.error('TRACK-CLICK: Faltan datos obligatorios o community_id inválido', { ib, community_id });
    return res.status(400).json({ error: 'Faltan datos obligatorios o community_id inválido' });
  }

  // Verifica que el IB existe y está activo
  const { data: codigo, error: errorCodigo } = await supabase
    .from('codigos_afiliado')
    .select('user_id')
    .eq('codigo', ib)
    .eq('activo', true)
    .single();

  if (errorCodigo || !codigo?.user_id) {
    console.error('TRACK-CLICK: Código de afiliado inválido o inactivo', { ib });
    return res.status(400).json({ error: 'Código de afiliado inválido o inactivo' });
  }

  const tracking_id = uuidv4();
  const { error } = await supabase
    .from('tracking_afiliados')
    .insert([{
      tracking_id,
      ib,
      community_id,
      utm_source,
      utm_medium,
      utm_campaign,
      user_agent,
      referrer,
      ip_address,
      created_at: new Date().toISOString()
    }]);
  if (error) {
    console.error('TRACK-CLICK: Error al insertar en tracking_afiliados:', error);
    return res.status(500).json({ error: error.message, details: error.details });
  }
  res.status(200).json({ tracking_id });
} 