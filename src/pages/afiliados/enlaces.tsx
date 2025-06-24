import React, { useState } from 'react';

const enlacesMarcaBlanca = [
  {
    nombre: 'Cuenta real',
    url: 'https://www.vtmarkets.net/es/trade-now/?affid=880914',
  },
  {
    nombre: 'Cuenta demo',
    url: 'https://www.vtmarkets.net/es/demo-account/?affid=880914',
  },
  {
    nombre: 'Página de inicio',
    url: 'https://www.vtmarkets.net/es/?affid=880914',
  },
  {
    nombre: 'Descargar APP',
    url: 'https://app.topoantech.com:18008/vt-h5/outward/register?agentAccount=880914',
  },
];

const enlacesScalexOne = [
  {
    nombre: 'Embudo SaaS',
    url: 'https://scalexone.app/registro?ref=880914',
  },
  {
    nombre: 'Embudo Academia',
    url: 'https://scalexone.app/academia?ref=880914',
  },
  {
    nombre: 'Embudo Consultoría',
    url: 'https://scalexone.app/consultoria?ref=880914',
  },
];

const idiomas = ['Español', 'Inglés'];

const EnlacesAfiliadosPage = () => {
  const [idioma, setIdioma] = useState('Español');
  const [usarCorto, setUsarCorto] = useState(false);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado!');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">ENLACES DE REFERENCIA</h2>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        {/* Selector de idioma y opción de enlace corto */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-gray-700 font-medium">Idioma de la campaña</span>
            <select value={idioma} onChange={e => setIdioma(e.target.value)} className="border rounded-lg p-2 bg-white shadow-sm">
              {idiomas.map(idioma => (
                <option key={idioma}>{idioma}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer">
            <input type="checkbox" checked={usarCorto} onChange={e => setUsarCorto(e.target.checked)} />
            Compartir usando un enlace corto
          </label>
        </div>

        {/* Enlaces Marca Blanca */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-4">
          <div className="text-lg font-bold text-blue-900 mb-4">Enlaces Marca Blanca</div>
          <div className="flex flex-col gap-4">
            {enlacesMarcaBlanca.map((enlace, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex-1">
                  <div className="text-gray-700 font-medium mb-1">{enlace.nombre}</div>
                  <div className="text-blue-900 text-sm break-all font-mono">{enlace.url}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button onClick={() => handleCopy(enlace.url)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">COPIAR</button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">Compartir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enlaces ScalexOne */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="text-lg font-bold text-blue-900 mb-4">Enlaces de Productos ScalexOne</div>
          <div className="flex flex-col gap-4">
            {enlacesScalexOne.map((enlace, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex-1">
                  <div className="text-gray-700 font-medium mb-1">{enlace.nombre}</div>
                  <div className="text-blue-900 text-sm break-all font-mono">{enlace.url}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button onClick={() => handleCopy(enlace.url)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">COPIAR</button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">Compartir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnlacesAfiliadosPage; 