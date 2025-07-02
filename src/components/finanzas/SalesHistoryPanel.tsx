import React, { useEffect, useState } from 'react';
import useVentasStore from '../../store/useVentasStore';
import OfertasMarketplaceService from '../../services/ofertasMarketplaceService';
import type { OfertaMarketplace } from '../../services/ofertasMarketplaceService';
import useNeuroState from '../../store/useNeuroState';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const METODOS = [
  { value: '', label: 'Todos' },
  { value: 'stripe', label: 'Stripe' },
  // Futuro: PayPal, Yape, etc.
];

const SalesHistoryPanel: React.FC = () => {
  const { ventas, fetchVentas, loading, error } = useVentasStore();
  const { userInfo } = useNeuroState();
  const [productos, setProductos] = useState<Record<string, OfertaMarketplace | null>>({});
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchVentas(userInfo?.rol);
  }, [fetchVentas, userInfo?.rol]);

  useEffect(() => {
    // Cargar los productos asociados a las ventas
    const cargarProductos = async () => {
      const ids = Array.from(new Set(ventas.map(v => v.producto_id)));
      const nuevos: Record<string, OfertaMarketplace | null> = {};
      for (const id of ids) {
        if (!productos[id]) {
          try {
            nuevos[id] = await OfertasMarketplaceService.obtenerOfertaPorId(id);
          } catch {
            nuevos[id] = null;
          }
        }
      }
      setProductos(prev => ({ ...prev, ...nuevos }));
    };
    if (ventas.length > 0) cargarProductos();
    // eslint-disable-next-line
  }, [ventas]);

  // Filtros y búsqueda
  const ventasFiltradas = ventas.filter(v => {
    const producto = productos[v.producto_id];
    const coincideEstado = !filtroEstado || v.estado === filtroEstado;
    const coincideMetodo = !filtroMetodo || 'stripe' === filtroMetodo; // Por ahora solo Stripe
    const coincideBusqueda = !busqueda || (producto?.titulo?.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideMetodo && coincideBusqueda;
  });

  return (
    <div className="w-full p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-yellow-500 mb-1">Historial de Ventas</h2>
          <p className="text-gray-300">Visualiza todas las ventas realizadas en la plataforma. Filtra por estado, método de pago o busca por producto.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
          />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
          >
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select
            value={filtroMetodo}
            onChange={e => setFiltroMetodo(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
          >
            {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow border border-gray-800 bg-gray-900/60">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Método</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">Cargando ventas...</td></tr>
            ) : ventasFiltradas.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">No hay ventas registradas.</td></tr>
            ) : ventasFiltradas.map(v => {
              const producto = productos[v.producto_id];
              return (
                <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition">
                  <td className="p-3">{new Date(v.fecha).toLocaleString()}</td>
                  <td className="p-3">{v.usuario_id.slice(0, 8)}...</td>
                  <td className="p-3 font-semibold">{producto?.titulo || 'Producto desconocido'}</td>
                  <td className="p-3">{producto?.tipo_producto || '-'}</td>
                  <td className="p-3">${v.monto.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${v.estado === 'confirmada' ? 'bg-green-700 text-green-200' : v.estado === 'pendiente' ? 'bg-yellow-700 text-yellow-200' : 'bg-red-700 text-red-200'}`}>{v.estado}</span>
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs font-semibold">Stripe</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {error && <div className="mt-4 text-red-400">Error: {error}</div>}
    </div>
  );
};

export default SalesHistoryPanel; 