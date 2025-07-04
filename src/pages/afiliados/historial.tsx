import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

// Definir tipos para los historiales
interface ComisionHistorial {
  id: string;
  tipo_comision: string;
  monto: number;
  estado: string;
  created_at: string;
}
interface RetiroHistorial {
  id: string;
  monto: number;
  estado: string;
  fecha_solicitud: string;
  metodo_pago: string;
}
interface TransferenciaHistorial {
  id: string;
  ib_origen: string;
  ib_destino: string;
  monto: number;
  fecha: string;
  estado: string;
}

const HistorialTransaccionesPage = () => {
  const [tab, setTab] = useState('comision');
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-06-10');
  const [ib, setIb] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [userId, setUserId] = useState('');
  const [historialComision, setHistorialComision] = useState<ComisionHistorial[]>([]);
  const [historialRetiros, setHistorialRetiros] = useState<RetiroHistorial[]>([]);
  const [historialTransferencias, setHistorialTransferencias] = useState<TransferenciaHistorial[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      // Obtener IB
      const { data: codigo } = await supabase
        .from('codigos_afiliado')
        .select('codigo')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (codigo) setIb(codigo.codigo);
      // Obtener saldo disponible
      const { data: saldoData } = await supabase.rpc('obtener_saldo_ib', { p_ib: codigo?.codigo });
      setSaldo(saldoData?.saldo || 0);
      // Historial de comisiones
      const { data: comisiones } = await supabase
        .from('comisiones_afiliado')
        .select('id, tipo_comision, monto, estado, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setHistorialComision(comisiones || []);
      // Historial de retiros
      const { data: retiros } = await supabase
        .from('retiros_afiliados')
        .select('id, monto, estado, fecha_solicitud, metodo_pago')
        .eq('afiliado_id', user.id)
        .order('fecha_solicitud', { ascending: false });
      setHistorialRetiros(retiros || []);
      // Historial de transferencias
      const { data: transferencias } = await supabase
        .from('transferencias_ib')
        .select('id, ib_origen, ib_destino, monto, fecha, estado')
        .or(`user_id_origen.eq.${user.id},user_id_destino.eq.${user.id}`)
        .order('fecha', { ascending: false });
      setHistorialTransferencias(transferencias || []);
    };
    fetchDatos();
  }, []);

  // Render helpers para cada tab
  const renderComisiones = () => (
    <tbody>
      {historialComision.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center p-12 text-gray-400">
            <div className="flex flex-col items-center justify-center">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="mt-4">Sin datos</div>
            </div>
          </td>
        </tr>
      ) : (
        historialComision.map((item, idx) => (
          <tr key={item.id} className="border-t hover:bg-blue-50 transition">
            <td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td>
            <td className="p-3">-</td>
            <td className="p-3">${item.monto.toFixed(2)}</td>
            <td className="p-3">{item.estado}</td>
          </tr>
        ))
      )}
    </tbody>
  );

  const renderRetiros = () => (
    <tbody>
      {historialRetiros.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center p-12 text-gray-400">
            <div className="flex flex-col items-center justify-center">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="mt-4">Sin datos</div>
            </div>
          </td>
        </tr>
      ) : (
        historialRetiros.map((item, idx) => (
          <tr key={item.id} className="border-t hover:bg-blue-50 transition">
            <td className="p-3">{new Date(item.fecha_solicitud).toLocaleDateString()}</td>
            <td className="p-3">-</td>
            <td className="p-3">${item.monto.toFixed(2)}</td>
            <td className="p-3">{item.estado}</td>
          </tr>
        ))
      )}
    </tbody>
  );

  const renderTransferencias = () => (
    <tbody>
      {historialTransferencias.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center p-12 text-gray-400">
            <div className="flex flex-col items-center justify-center">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="mt-4">Sin datos</div>
            </div>
          </td>
        </tr>
      ) : (
        historialTransferencias.map((item, idx) => (
          <tr key={item.id} className="border-t hover:bg-blue-50 transition">
            <td className="p-3">{new Date(item.fecha).toLocaleDateString()}</td>
            <td className="p-3">{item.ib_origen} → {item.ib_destino}</td>
            <td className="p-3">${item.monto.toFixed(2)}</td>
            <td className="p-3">{item.estado}</td>
          </tr>
        ))
      )}
    </tbody>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">HISTORIAL DE TRANSACCIONES</h2>
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
          <div className="text-sm text-gray-500 mb-1">Número de cuenta de COMISIÓN</div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-blue-800">{ib || '---'}</span>
            <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition" onClick={() => navigate('/afiliados/retiro')}>SOLICITAR COMISIÓN</button>
          </div>
          <div className="mt-4 text-gray-500 text-sm">Comisión total</div>
          <div className="text-2xl font-bold text-blue-900">$0.08</div>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Saldo disponible</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-600 hover:bg-blue-100 transition" onClick={() => navigate('/afiliados/retiro')}>RETIROS</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition" onClick={() => navigate('/afiliados/transferencia')}>TRANSFERIR</button>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-900">${saldo.toFixed(2)}</div>
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
            {tab === 'comision' && renderComisiones()}
            {tab === 'retiros' && renderRetiros()}
            {tab === 'transferencias' && renderTransferencias()}
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