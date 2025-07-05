import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { user_id, email, nombre, tracking_id } = req.body;
  if (!user_id || !email || !tracking_id) return res.status(400).json({ error: 'Faltan datos obligatorios o tracking_id inválido' });

  // Buscar tracking
  const { data: tracking, error: trackingError } = await supabase
    .from('tracking_afiliados')
    .select('*')
    .eq('tracking_id', tracking_id)
    .single();
  if (trackingError || !tracking || !tracking.community_id) {
    return res.status(400).json({ error: 'Tracking no encontrado o inválido. Debes registrarte desde un link de invitación.' });
  }

  // Crear usuario en la tabla usuarios
  const { error: userError } = await supabase
    .from('usuarios')
    .upsert({
      id: user_id,
      email,
      nombre,
      community_id: tracking.community_id,
      afiliado_referente: tracking.ib,
      created_at: new Date().toISOString()
    });
  if (userError) return res.status(500).json({ error: userError.message });

  // Marcar lead/conversión en tracking
  await supabase
    .from('tracking_afiliados')
    .update({ lead_registrado: true, user_id })
    .eq('tracking_id', tracking_id);

  res.status(200).json({ success: true });
} 