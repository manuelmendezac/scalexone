import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

console.log('TRACK-CLICK: endpoint reached');
console.log('TRACK-CLICK: process.env.NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING');
console.log('TRACK-CLICK: process.env.SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  console.log('TRACK-CLICK: handler called, method:', req.method);
  if (req.method !== 'POST') {
    console.error('TRACK-CLICK: Método no permitido:', req.method);
    return res.status(405).json({ error: 'Método no permitido' });
  }
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

  console.log('TRACK-CLICK: Datos recibidos:', {
    ib,
    community_id,
    utm_source,
    utm_medium,
    utm_campaign,
    user_agent,
    referrer,
    ip_address
  });

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

  console.log('TRACK-CLICK: Resultado búsqueda IB:', { codigo, errorCodigo });

  if (errorCodigo || !codigo?.user_id) {
    console.error('TRACK-CLICK: Código de afiliado inválido o inactivo', { ib, errorCodigo });
    return res.status(400).json({ error: 'Código de afiliado inválido o inactivo' });
  }

  const tracking_id = uuidv4();
  const insertObj = {
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
  };
  console.log('TRACK-CLICK: Intentando insertar en tracking_afiliados:', insertObj);
  const { error } = await supabase
    .from('tracking_afiliados')
    .insert([insertObj]);
  if (error) {
    console.error('TRACK-CLICK: Error al insertar en tracking_afiliados:', error);
    return res.status(500).json({ error: error.message, details: error.details });
  }
  console.log('TRACK-CLICK: Insert exitoso, tracking_id:', tracking_id);
  res.status(200).json({ tracking_id });
} 