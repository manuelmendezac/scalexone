import React from 'react';

const Error404 = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-neurolink-coldWhite bg-neurolink-background">
    <h1 className="text-7xl font-orbitron mb-4 text-neurolink-cyberBlue drop-shadow-lg">404</h1>
    <p className="text-2xl mb-8 font-futuristic">Página no encontrada</p>
    <a href="/" className="px-6 py-3 rounded-lg bg-neurolink-cyberBlue text-black font-bold font-orbitron shadow-lg border-2 border-cyan-300 hover:scale-105 transition-transform">Volver al inicio</a>
  </div>
);

export default Error404; 