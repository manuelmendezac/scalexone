import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).send('ID inválido');
    return;
  }
  // Buscar el post en la tabla comunidad_posts
  const { data: post, error } = await supabase
    .from('comunidad_posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !post) {
    res.status(404).send('<h1>Post no encontrado</h1>');
    return;
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
} 