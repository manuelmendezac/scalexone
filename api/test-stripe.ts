import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Endpoint de prueba simple
    res.status(200).json({ 
      message: 'Test endpoint funcionando',
      timestamp: new Date().toISOString(),
      method: req.method 
    })
  } catch (error) {
    console.error('Error en test endpoint:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
} 