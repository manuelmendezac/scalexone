import type { VercelRequest, VercelResponse } from 'vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { postId } = req.query;
  const title = `Post de la comunidad #${postId}`;
  const description = 'Prueba de OG tags mínimos con imagen pública.';
  const image = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';
  const realUrl = `https://scalexone.app/comunidad?post=${postId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${realUrl}" />
        <meta property="og:type" content="article" />
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
        <img src="${image}" alt="imagen" style="max-width:400px;" />
        <p><a href="${realUrl}">Ver post en ScalexOne</a></p>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(html, 'utf-8').toString());
  res.status(200).send(html);
} 