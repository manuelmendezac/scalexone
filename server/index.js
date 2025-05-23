import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import usuariosRoutes from './routes/usuarios.js';
import 'dotenv/config';

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'NO');

const app = express();
const port = 4002;

// Configuración de Multer (memoria, no disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

app.use(cors());
app.use(express.json());

// Endpoint para subir imágenes de avatar
app.post('/api/avatar-upload', upload.array('avatars', 3), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const urls = [];
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`avatar_${Date.now()}_${file.originalname}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) return res.status(500).json({ error: error.message });
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(data.path).publicUrl;
      urls.push(publicUrl);
    }
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para subir documentos
app.post('/api/document-upload', upload.array('documents', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const urls = [];
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`doc_${Date.now()}_${file.originalname}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) return res.status(500).json({ error: error.message });
      const publicUrl = supabase.storage.from('documents').getPublicUrl(data.path).publicUrl;
      urls.push(publicUrl);
    }
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', usuariosRoutes);

app.listen(port, () => {
  console.log(`Servidor backend escuchando en puerto ${port}`);
});