import React, { useState } from 'react';

const mockHistorial: { fecha: string; rango: string; cantidad: string; status: string }[] = [];

const HistorialTransaccionesPage = () => {
  const [tab, setTab] = useState('comision');
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-06-10');

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">HISTORIAL DE TRANSACCIONES</h2>
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
          <div className="text-sm text-gray-500 mb-1">Número de cuenta de COMISIÓN</div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-blue-800">880914</span>
            <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">SOLICITAR COMISIÓN</button>
          </div>
          <div className="mt-4 text-gray-500 text-sm">Comisión total</div>
          <div className="text-2xl font-bold text-blue-900">$0.08</div>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Saldo disponible</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-600 hover:bg-blue-100 transition">RETIROS</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">TRANSFERIR</button>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-900">$0.00</div>
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex gap-2 md:gap-6 border-b border-gray-200 mb-4 justify-between">
          <button
            onClick={() => setTab('comision')}
            className={`flex-1 min-w-0 px-1 py-2 text-[11px] md:text-lg font-semibold transition-all border-b-2 rounded-t-md md:rounded-none md:px-4 md:py-2
              ${tab === 'comision' ? 'border-blue-600 text-blue-800 bg-blue-50 md:bg-transparent' : 'border-transparent text-gray-500 bg-transparent'}`}
          >
            HISTORIAL DE COMISIÓN
          </button>
          <button
            onClick={() => setTab('retiros')}
            className={`flex-1 min-w-0 px-1 py-2 text-[11px] md:text-lg font-semibold transition-all border-b-2 rounded-t-md md:rounded-none md:px-4 md:py-2
              ${tab === 'retiros' ? 'border-blue-600 text-blue-800 bg-blue-50 md:bg-transparent' : 'border-transparent text-gray-500 bg-transparent'}`}
          >
            HISTORIAL DE RETIROS
          </button>
          <button
            onClick={() => setTab('transferencias')}
            className={`flex-1 min-w-0 px-1 py-2 text-[11px] md:text-lg font-semibold transition-all border-b-2 rounded-t-md md:rounded-none md:px-4 md:py-2
              ${tab === 'transferencias' ? 'border-blue-600 text-blue-800 bg-blue-50 md:bg-transparent' : 'border-transparent text-gray-500 bg-transparent'}`}
          >
            HISTORIAL DE TRANSFERENCIAS
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          <select className="border rounded-lg p-2 bg-white shadow-sm min-w-[120px]">
            <option>Seleccionar</option>
          </select>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border rounded-lg p-2 bg-white shadow-sm" />
          <span>-</span>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border rounded-lg p-2 bg-white shadow-sm" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">ACTUALIZAR</button>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left font-semibold">FECHA</th>
                <th className="p-3 text-left font-semibold">RANGO DE FECHAS</th>
                <th className="p-3 text-left font-semibold">Cantidad</th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockHistorial.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div className="mt-4">Sin datos</div>
                    </div>
                  </td>
                </tr>
              ) : (
                mockHistorial.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-blue-50 transition">
                    <td className="p-3">{item.fecha}</td>
                    <td className="p-3">{item.rango}</td>
                    <td className="p-3">{item.cantidad}</td>
                    <td className="p-3">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex justify-end gap-2 p-4">
            <span className="px-2">1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialTransaccionesPage; 