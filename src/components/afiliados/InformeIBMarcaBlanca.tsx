import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

const TABS = [
  { key: 'fondos', label: 'Informe de fondos' },
  { key: 'comisiones', label: 'Reporte de comisión' },
];

const InformeIBMarcaBlanca: React.FC = () => {
  const [tab, setTab] = useState('fondos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(5);
  const [fondos, setFondos] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        window.location.href = '/login';
        return;
      }
      const afiliado_id = user.id;
      const fondosRes = await fetch(`/api/afiliados/fondos?afiliado_id=${afiliado_id}`);
      setFondos(await fondosRes.json());
      const comisionesRes = await fetch(`/api/afiliados/comisiones?afiliado_id=${afiliado_id}`);
      setComisiones(await comisionesRes.json());
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filtros para tabla de fondos
  const fondosFiltrados = fondos.filter(f =>
    (!busqueda || f.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || f.cuenta?.includes(busqueda)) &&
    (!fechaInicio || f.fecha >= fechaInicio) &&
    (!fechaFin || f.fecha <= fechaFin)
  );
  const totalPaginasFondos = Math.ceil(fondosFiltrados.length / porPagina) || 1;
  const fondosPaginados = fondosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Filtros para tabla de comisiones
  const comisionesFiltradas = comisiones.filter(c =>
    (!busqueda || c.referido?.toLowerCase().includes(busqueda.toLowerCase()) || c.cliente?.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!fechaInicio || c.fecha >= fechaInicio) &&
    (!fechaFin || c.fecha <= fechaFin)
  );
  const totalPaginasComisiones = Math.ceil(comisionesFiltradas.length / porPagina) || 1;
  const comisionesPaginadas = comisionesFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Tarjetas de resumen
  const resumenFondos = {
    financiamientoNeto: fondosFiltrados.reduce((acc, f) => acc + (Number(f.cantidad) || 0), 0),
    depositos: fondosFiltrados.reduce((acc, f) => acc + (f.escribe === 'Deposit' ? Number(f.cantidad) : 0), 0),
    retiros: fondosFiltrados.reduce((acc, f) => acc + (f.escribe === 'Withdraw' ? Number(f.cantidad) : 0), 0),
    cuentasAbiertas: new Set(fondosFiltrados.map(f => f.cuenta)).size,
  };

  // Cambiar de pestaña resetea la página
  const handleTab = (key: string) => {
    setTab(key);
    setPagina(1);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Informe IB - Marca Blanca</h2>
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all ${tab === t.key ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-white'}`}
            onClick={() => handleTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Tarjetas de resumen */}
      {tab === 'fondos' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Financiamiento Neto</span>
            <span className="text-2xl font-bold">${resumenFondos.financiamientoNeto}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Depósitos</span>
            <span className="text-2xl font-bold">${resumenFondos.depositos}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Retiros</span>
            <span className="text-2xl font-bold">${resumenFondos.retiros}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-1">Cuentas Abiertas</span>
            <span className="text-2xl font-bold">{resumenFondos.cuentasAbiertas}</span>
          </div>
        </div>
      )}
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-gray-600 text-sm">Desde</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border rounded p-2" />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-gray-600 text-sm">Hasta</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border rounded p-2" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, cuenta, cliente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border rounded p-2 flex-1 min-w-[200px]"
        />
      </div>
      {/* Tabla */}
      {loading ? (
        <div className="text-center py-8">Cargando datos...</div>
      ) : tab === 'fondos' ? (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Cuenta</th>
                <th className="p-2 text-left">Escribe</th>
                <th className="p-2 text-left">Cantidad (USD)</th>
                <th className="p-2 text-left">Moneda</th>
              </tr>
            </thead>
            <tbody>
              {fondosPaginados.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">Sin resultados</td></tr>
              ) : (
                fondosPaginados.map(f => (
                  <tr key={f.id} className="border-t">
                    <td className="p-2">{f.fecha}</td>
                    <td className="p-2">{f.nombre}</td>
                    <td className="p-2">{f.cuenta}</td>
                    <td className="p-2">{f.escribe}</td>
                    <td className="p-2">${f.cantidad}</td>
                    <td className="p-2">{f.currency}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Paginación */}
          <div className="flex justify-end gap-2 p-4">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Anterior</button>
            <span className="px-2">Página {pagina} de {totalPaginasFondos}</span>
            <button onClick={() => setPagina(p => Math.min(totalPaginasFondos, p + 1))} disabled={pagina === totalPaginasFondos} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Referido</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Cliente</th>
                <th className="p-2 text-left">Nivel</th>
                <th className="p-2 text-left">Monto Venta</th>
                <th className="p-2 text-left">Comisión</th>
                <th className="p-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {comisionesPaginadas.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-4">Sin resultados</td></tr>
              ) : (
                comisionesPaginadas.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{c.fecha}</td>
                    <td className="p-2">{c.referido}</td>
                    <td className="p-2">{c.producto}</td>
                    <td className="p-2">{c.cliente}</td>
                    <td className="p-2">{c.nivel}</td>
                    <td className="p-2">${c.montoVenta}</td>
                    <td className="p-2">${c.comision}</td>
                    <td className="p-2">{c.estado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Paginación */}
          <div className="flex justify-end gap-2 p-4">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Anterior</button>
            <span className="px-2">Página {pagina} de {totalPaginasComisiones}</span>
            <button onClick={() => setPagina(p => Math.min(totalPaginasComisiones, p + 1))} disabled={pagina === totalPaginasComisiones} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformeIBMarcaBlanca; 