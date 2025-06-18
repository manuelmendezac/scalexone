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

// Endpoint para compartir posts con metaetiquetas Open Graph
app.get('/api/share/:id', async (req, res) => {
  const postId = req.params.id;
  // Buscar el post en la tabla comunidad_posts
  const { data: post, error } = await supabase
    .from('comunidad_posts')
    .select('*')
    .eq('id', postId)
    .single();
  if (error || !post) {
    return res.status(404).send('<h1>Post no encontrado</h1>');
  }
  // Determinar imagen a mostrar
  let image = post.media_url || (post.imagenes_urls && post.imagenes_urls[0]) || 'https://scalexone.app/public/images/silueta-perfil.svg';
  // Limitar el contenido y descripción para metaetiquetas
  const title = (post.contenido || 'Post de la comunidad').slice(0, 80);
  const description = (post.descripcion || '').slice(0, 160);
  const url = `https://scalexone.app/comunidad/${post.id}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        <meta http-equiv="refresh" content="1; url=${url}" />
        <title>${title}</title>
        <style>body{background:#18181b;color:#e6a800;font-family:sans-serif;text-align:center;padding:40px;}</style>
      </head>
      <body>
        <h2>Redirigiendo al post...</h2>
        <p>Si no eres redirigido automáticamente, <a href="${url}">haz clic aquí</a>.</p>
      </body>
    </html>
  `);
});

app.use('/api', usuariosRoutes);

app.listen(port, () => {
  console.log(`Servidor backend escuchando en puerto ${port}`);
});