import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al procesar el archivo' });
    }
    let file = files.avatar;
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }
    try {
      const fileExt = file.originalFilename?.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const fileBuffer = fs.readFileSync(file.filepath);
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype || 'image/png',
          upsert: true,
        });
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return res.status(200).json({ url: publicUrlData.publicUrl });
    } catch (e) {
      return res.status(500).json({ error: 'Error al subir la imagen' });
    }
  });
} 