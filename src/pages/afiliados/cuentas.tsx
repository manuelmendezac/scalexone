import React from 'react';
import AfiliadosLayout from '../../components/afiliados/AfiliadosLayout';

// Datos mock de la cuenta IB
const cuentaIB = {
  codigo: 'IB-123456',
  nombre: 'Manuel Angel Mendez Acuna',
  email: 'manuel@scalexone.app',
  telefono: '+51 999 888 777',
  tipoSuscripcion: 'VIP', // Puede ser 'Free', 'Standard', 'VIP'
  porcentaje: 30, // VIP: 30%, Standard: 25%, Free: 20%
  niveles: [
    { nivel: 1, porcentaje: 0, descripcion: 'Comisión directa según membresía' },
    { nivel: 2, porcentaje: 5, descripcion: 'Segundo nivel: 5% extra' },
    { nivel: 3, porcentaje: 10, descripcion: 'Tercer nivel: 10% extra' },
  ],
};

const CuentasIBPage = () => {
  return (
    <AfiliadosLayout>
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
        <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">CUENTA IB</h2>
        <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Código de Cuenta IB</div>
            <div className="text-xl font-bold text-blue-800 mb-2">{cuentaIB.codigo}</div>
            <div className="text-sm text-gray-500 mb-1">Tipo de Suscripción</div>
            <div className="text-lg font-semibold text-blue-700 mb-2">{cuentaIB.tipoSuscripcion} ({cuentaIB.porcentaje}% comisión directa)</div>
          </div>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2 font-semibold">Niveles de Ganancias</div>
            <ul className="space-y-2">
              {cuentaIB.niveles.map(nivel => (
                <li key={nivel.nivel} className="flex items-center gap-3">
                  <span className="font-bold text-blue-700">Nivel {nivel.nivel}:</span>
                  <span className="text-blue-600">{nivel.porcentaje}%</span>
                  <span className="text-gray-500 text-xs">{nivel.descripcion}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <div className="text-sm text-gray-500 mb-1 font-semibold">Datos Personales</div>
            <div className="text-base text-blue-900 font-semibold">{cuentaIB.nombre}</div>
            <div className="text-sm text-gray-600">{cuentaIB.email}</div>
            <div className="text-sm text-gray-600">{cuentaIB.telefono}</div>
          </div>
        </div>
      </div>
    </AfiliadosLayout>
  );
};

export default CuentasIBPage; 