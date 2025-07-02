import React, { useState } from 'react';

const perfilIB = {
  nombre: 'MANUEL ANGEL MENDEZ ACUNA',
  uid: '662166',
  email: 'h***h@gmail.com',
  telefono: '+971 ***722',
  direccion: 'Av.26 De Marzo N.1247 Florencia De Mora Trujillo-La Libertad Trujillo-La Libertad QFEFAA 570 Peru',
};

const PerfilIBPage = () => {
  const [tab, setTab] = useState<'cliente' | 'acuerdo'>('cliente');

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">PERFIL IB</h2>
      <div className="w-full max-w-2xl mx-auto mb-8 flex gap-2 justify-center">
        <button onClick={() => setTab('cliente')} className={`px-6 py-2 rounded-full font-semibold text-lg transition-all ${tab === 'cliente' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-600'}`}>Información de cliente</button>
        <button onClick={() => setTab('acuerdo')} className={`px-6 py-2 rounded-full font-semibold text-lg transition-all ${tab === 'acuerdo' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-600'}`}>Acuerdo IB</button>
      </div>
      {tab === 'cliente' && (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <span className="text-gray-500 text-sm md:w-1/3">nombre del cliente</span>
              <span className="text-blue-900 font-semibold flex-1">{perfilIB.nombre}</span>
              <span className="text-gray-400 text-xs">UID: {perfilIB.uid}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <span className="text-gray-500 text-sm md:w-1/3">CORREO ELECTRÓNICO</span>
              <span className="text-blue-900 font-semibold flex-1">{perfilIB.email}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <span className="text-gray-500 text-sm md:w-1/3">Número de teléfono</span>
              <span className="text-blue-900 font-semibold flex-1">{perfilIB.telefono}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <span className="text-gray-500 text-sm md:w-1/3">Dirección</span>
              <span className="text-blue-900 font-semibold flex-1">{perfilIB.direccion}</span>
            </div>
          </div>
        </div>
      )}
      {tab === 'acuerdo' && (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100 text-center text-gray-500">
          <div className="text-lg font-semibold mb-4 text-blue-900">Acuerdo IB</div>
          <div className="text-sm">Aquí irá el texto del acuerdo IB o un enlace para descargarlo.</div>
        </div>
      )}
    </div>
  );
};

export default PerfilIBPage; 