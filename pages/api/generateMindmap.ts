import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not found' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return res.status(400).json({ error: 'Prompt vacío o inválido.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Error desconocido de OpenAI' });
    }

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: 'Respuesta inesperada o vacía de OpenAI' });
    }

    return res.status(200).json({ result: data.choices[0].message.content });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Error generando respuesta desde OpenAI' });
  }
}