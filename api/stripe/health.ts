import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }
  res.status(200).json({ status: 'ok', stripe: true, timestamp: new Date().toISOString() })
} 