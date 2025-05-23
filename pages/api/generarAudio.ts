import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};

const VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
const API_KEY = 'sk_7c706867b72b354e3588c31a32ce395887dbcb9947694470';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, texto } = req.body;
  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El campo nombre es requerido' });
  }
  if (!texto || typeof texto !== 'string') {
    return res.status(400).json({ error: 'El campo texto es requerido' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text: texto,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: error.detail || 'Error generando audio' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="bienvenida.mp3"');
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Error conectando con ElevenLabs' });
  }
} 