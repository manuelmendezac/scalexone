import React, { useState, useEffect } from 'react';

// Simulación de membresía del usuario actual
const USER_MEMBERSHIP = 'standard'; // Puede ser 'free', 'standard', 'vip'
const MEMBERSHIP_PERCENT = {
  free: 0.20,
  standard: 0.25,
  vip: 0.30,
};

// Datos mock de ventas de productos ScalexOne
const mockVentas = [
  {
    id: 1,
    fecha: '2024-06-03',
    referido: 'Carlos López',
    producto: 'SaaS ScalexOne',
    nivel: 1,
    montoVenta: 200,
    estado: 'Confirmada',
  },
  {
    id: 2,
    fecha: '2024-06-04',
    referido: 'Ana Martínez',
    producto: 'Consultoría ScalexOne',
    nivel: 3,
    montoVenta: 300,
    estado: 'Pendiente',
  },
  {
    id: 3,
    fecha: '2024-06-05',
    referido: 'Pedro Sánchez',
    producto: 'Academia Online',
    nivel: 2,
    montoVenta: 150,
    estado: 'Pagada',
  },
];

const InformeIBScalexOne: React.FC = () => {
  const [tab, setTab] = useState('fondos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(5);

  // Calcular comisiones según membresía
  const ventasConComision = mockVentas.map(v => ({
    ...v,
    comision: v.montoVenta * MEMBERSHIP_PERCENT[USER_MEMBERSHIP],
  }));

  // Filtros para tabla de ventas
  const ventasFiltradas = ventasConComision.filter(v =>
    (!busqueda || v.referido.toLowerCase().includes(busqueda.toLowerCase()) || v.producto.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!fechaInicio || v.fecha >= fechaInicio) &&
    (!fechaFin || v.fecha <= fechaFin)
  );
  const totalPaginas = Math.ceil(ventasFiltradas.length / porPagina) || 1;
  const ventasPaginadas = ventasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Tarjetas de resumen
  const resumen = {
    comisionesNetas: ventasConComision.reduce((acc, v) => acc + (Number(v.comision) || 0), 0),
    comisionesDisponibles: ventasConComision.filter(v => v.estado === 'Pendiente' || v.estado === 'Confirmada').reduce((acc, v) => acc + (Number(v.comision) || 0), 0),
    retiros: ventasConComision.filter(v => v.estado === 'Pagada').reduce((acc, v) => acc + (Number(v.comision) || 0), 0),
    totalAfiliados: new Set(ventasConComision.map(v => v.referido)).size,
  };

  // Cambiar de pestaña resetea la página
  const handleTab = (key: string) => {
    setTab(key);
    setPagina(1);
  };

  return (
    <div className="p-8 min-h-screen bg-[#f7f9fb]">
      <h2 className="text-2xl font-bold mb-6 text-blue-900 font-orbitron tracking-wide">Comisiones ScalexOne</h2>
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-5 py-2 rounded-t-lg font-semibold border-b-2 transition-all shadow-sm
            ${tab === 'fondos' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-white'}`}
          onClick={() => handleTab('fondos')}
        >
          Informe de fondos
        </button>
        <button
          className={`px-5 py-2 rounded-t-lg font-semibold border-b-2 transition-all shadow-sm
            ${tab === 'comisiones' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-white'}`}
          onClick={() => handleTab('comisiones')}
        >
          Reporte de comisión
        </button>
      </div>
      {/* Tarjetas de resumen */}
      {tab === 'fondos' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-gray-100">
            <span className="text-gray-500 text-sm mb-1 font-medium">Comisiones Netas</span>
            <span className="text-2xl font-bold text-blue-800">${resumen.comisionesNetas}</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-gray-100">
            <span className="text-gray-500 text-sm mb-1 font-medium">Comisiones Disponibles</span>
            <span className="text-2xl font-bold text-blue-800">${resumen.comisionesDisponibles}</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-gray-100">
            <span className="text-gray-500 text-sm mb-1 font-medium">Retiros</span>
            <span className="text-2xl font-bold text-blue-800">${resumen.retiros}</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border border-gray-100">
            <span className="text-gray-500 text-sm mb-1 font-medium">Total Afiliados</span>
            <span className="text-2xl font-bold text-blue-800">{resumen.totalAfiliados}</span>
          </div>
        </div>
      )}
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="date"
          value={fechaInicio}
          onChange={e => setFechaInicio(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={e => setFechaFin(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        />
        <input
          type="text"
          placeholder="Buscar por referido, producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
        />
      </div>
      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left font-semibold">Fecha</th>
              <th className="p-3 text-left font-semibold">Referido</th>
              <th className="p-3 text-left font-semibold">Producto</th>
              <th className="p-3 text-left font-semibold">Nivel</th>
              <th className="p-3 text-left font-semibold">Monto Venta</th>
              <th className="p-3 text-left font-semibold">Comisión</th>
              <th className="p-3 text-left font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventasPaginadas.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-6 text-gray-400">Sin resultados.</td></tr>
            ) : (
              ventasPaginadas.map(v => (
                <tr key={v.id} className="border-t hover:bg-blue-50 transition">
                  <td className="p-3">{v.fecha}</td>
                  <td className="p-3">{v.referido}</td>
                  <td className="p-3">{v.producto}</td>
                  <td className="p-3">{v.nivel}</td>
                  <td className="p-3">${v.montoVenta}</td>
                  <td className="p-3">${v.comision}</td>
                  <td className="p-3">{v.estado}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Paginación */}
        <div className="flex justify-end gap-2 p-4">
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Anterior</button>
          <span className="px-2">Página {pagina} de {totalPaginas}</span>
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default InformeIBScalexOne; 