import express from 'express';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// POST /api/crear-usuario
router.post('/crear-usuario', async (req, res) => {
  const { name, avatar_url } = req.body;
  if (!name || !avatar_url) {
    return res.status(400).json({ error: 'Faltan campos requeridos: name y avatar_url.' });
  }
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ name, avatar_url }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, usuario: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Búsqueda semántica de documentos (mock)
router.post('/searchDocs', async (req, res) => {
  const { prompt, categoria } = req.body;
  // Simulación: devolver documentos mock relevantes
  // En el futuro, aquí se haría la búsqueda real con embeddings y Supabase
  const docsMock = [
    {
      id: '1',
      titulo: 'Cómo ser más productivo',
      categoria: 'Productividad',
      fragmento: 'La productividad se basa en hábitos y enfoque...',
      url: 'https://ejemplo.com/doc1.pdf',
    },
    {
      id: '2',
      titulo: 'Ideas creativas',
      categoria: 'Creatividad',
      fragmento: 'La creatividad surge de la conexión de ideas...',
      url: 'https://ejemplo.com/doc2.pdf',
    },
  ];
  // Filtrar por categoría si se envía
  const docsFiltrados = categoria ? docsMock.filter(d => d.categoria === categoria) : docsMock;
  // Simular búsqueda por prompt (en el futuro usar embeddings)
  const resultados = docsFiltrados.filter(d => d.titulo.toLowerCase().includes((prompt||'').toLowerCase()) || d.fragmento.toLowerCase().includes((prompt||'').toLowerCase()));
  res.json({ resultados: resultados.length ? resultados : docsFiltrados });
});

export default router; 