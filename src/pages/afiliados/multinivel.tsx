import React from 'react';
import AfiliadosLayout from '../../components/afiliados/AfiliadosLayout';

// Datos mock de referidos multinivel
const mockMultinivel = [
  {
    nivel: 1,
    referidos: [
      { id: '880914', nombre: 'Manuel Angel Mendez Acuna', comision: 120 },
    ],
  },
  {
    nivel: 2,
    referidos: [
      { id: '940470', nombre: 'Capital Infinity Peru S A C', comision: 45 },
      { id: '940471', nombre: 'Empresa Demo 2', comision: 30 },
    ],
  },
  {
    nivel: 3,
    referidos: [
      { id: '950001', nombre: 'Usuario Tercer Nivel 1', comision: 60 },
      { id: '950002', nombre: 'Usuario Tercer Nivel 2', comision: 25 },
    ],
  },
];

const nivelLabel = {
  1: 'NIVEL 1',
  2: 'NIVEL 2',
  3: 'NIVEL 3',
};

const MultinivelIBPage = () => {
  return (
    <AfiliadosLayout>
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
        <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">MULTINIVEL IB</h2>
        <div className="w-full max-w-3xl mx-auto space-y-12">
          {mockMultinivel.map(nivel => (
            <div key={nivel.nivel} className="w-full">
              <h3 className="text-lg font-bold text-gray-700 mb-6 text-center tracking-widest">
                {nivelLabel[nivel.nivel as 1 | 2 | 3]}
              </h3>
              <div className="flex flex-wrap justify-center gap-8">
                {nivel.referidos.map(ref => (
                  <div
                    key={ref.id}
                    className={`rounded-xl shadow-md flex flex-col items-center px-8 py-6 border ${nivel.nivel === 1 ? 'bg-white' : nivel.nivel === 2 ? 'bg-blue-50' : 'bg-blue-100'} min-w-[220px]`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${nivel.nivel === 1 ? 'bg-blue-100' : 'bg-blue-200'}`}>
                      <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#2563eb" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#2563eb" strokeWidth="2"/></svg>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">ID: {ref.id}</div>
                    <div className="text-base font-semibold text-blue-900 mb-1 text-center">{ref.nombre}</div>
                    <div className="text-sm text-gray-600 mb-1">Comisión generada:</div>
                    <div className="text-xl font-bold text-blue-700 mb-2">${ref.comision}</div>
                    <div className="text-xs text-gray-400">{nivel.nivel === 1 ? 'Comisión directa' : nivel.nivel === 2 ? '+5% segundo nivel' : '+10% tercer nivel'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Las comisiones multinivel se calculan automáticamente: 5% en segundo nivel y 10% en tercer nivel, adicional a tu comisión directa según membresía. Solo se muestran hasta 3 niveles.
        </div>
      </div>
    </AfiliadosLayout>
  );
};

export default MultinivelIBPage; 