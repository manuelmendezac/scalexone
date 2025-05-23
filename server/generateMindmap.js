// server/generateMindmap.js

import fetch from 'node-fetch';

const apiKey = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt vacío' });
  }

  console.log('Prompt recibido:', prompt);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const output = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ result: output });

  } catch (err) {
    console.error('Error generando mapa:', err);
    res.status(500).json({ error: 'Error generando el mapa mental' });
  }
}

function generarPromptDesdeInputs() {
  // Usa los valores de tus inputs
  return `
Estoy creando un mapa mental y necesito que lo estructures en formato de árbol para visualizarlo y trabajarlo con IA.

🔹 Mi idea central es: "${ideaCentral}"
🔹 Ramas principales: ${ramas.join(", ")}

Para cada rama, genera entre 2 y 4 subtemas concretos, breves, útiles y aplicables al contexto de la idea central. Usa un formato de salida estructurado como JSON para que pueda procesarlo y pintarlo en forma de árbol visual.

Formato esperado:
{
  "idea": "${ideaCentral}",
  "ramas": [
    {
      "tema": "rama1",
      "subtemas": ["subtema1", "subtema2", "subtema3"]
    }
  ]
}
Solo responde con el JSON. No agregues explicación adicional ni encabezados.
`;
}
