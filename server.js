const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const VOICE_ID = 'QjgzRSmNzhwPwD4h6c9j';
const XI_API_KEY = process.env.XI_API_KEY || 'sk_7c706867b72b354e3588c31a32ce395887dbcb9947694470';

app.use(cors());
app.use(express.json());

app.post('/api/generarAudio', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El campo nombre es requerido' });
  }

  const texto = `Hola ${nombre}, soy tu clon IA. Bienvenido a tu portal de inteligencia aumentada.`;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': XI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texto,
        model_id: 'eleven_monolingual_v1',
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
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
}); 