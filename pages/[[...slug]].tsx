import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../src/router';

export default function CatchAll() {
  return <div style={{padding: 40, fontSize: 24, color: 'green'}}>Catch-all funcionando: Next.js está sirviendo rutas dinámicas correctamente.</div>;
} 