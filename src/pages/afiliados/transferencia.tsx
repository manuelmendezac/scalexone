import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

const TransferenciaIBPage = () => {
  const [ibOrigen, setIbOrigen] = useState('');
  const [userIdOrigen, setUserIdOrigen] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [ibDestino, setIbDestino] = useState('');
  const [nombreDestino, setNombreDestino] = useState('');
  const [userIdDestino, setUserIdDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorIbDestino, setErrorIbDestino] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserIdOrigen(user.id);
      // Obtener IB origen
      const { data: codigo } = await supabase
        .from('codigos_afiliado')
        .select('codigo')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (codigo) setIbOrigen(codigo.codigo);
      // Obtener saldo disponible (solo comisiones liberadas)
      const { data: saldoData } = await supabase.rpc('obtener_saldo_ib', { p_ib: codigo?.codigo });
      const saldoReal = Array.isArray(saldoData) ? (saldoData[0]?.saldo || 0) : (saldoData?.saldo || 0);
      setSaldo(saldoReal);
    };
    fetchDatos();
  }, []);

  // Validar IB destino y traer nombre
  const handleValidarDestino = async () => {
    setNombreDestino('');
    setUserIdDestino('');
    setErrorIbDestino('');
    if (!ibDestino || ibDestino === ibOrigen) {
      setErrorIbDestino('El IB destino no es válido.');
      toast.error('El IB destino no es válido');
      return;
    }
    const { data: cod } = await supabase
      .from('codigos_afiliado')
      .select('user_id')
      .eq('codigo', ibDestino)
      .eq('activo', true)
      .single();
    if (!cod) {
      setErrorIbDestino('El IB destino no existe. Verifica el código e inténtalo de nuevo.');
      toast.error('El IB destino no existe');
      return;
    }
    setUserIdDestino(cod.user_id);
    // Traer nombre del usuario destino (usar 'name' y fallback a email)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('name, email')
      .eq('id', cod.user_id)
      .single();
    if (usuario?.name) {
      setNombreDestino(usuario.name);
      setConfirmado(true);
    } else if (usuario?.email) {
      setNombreDestino(usuario.email);
      setConfirmado(true);
    } else {
      toast.error('No se pudo confirmar el nombre del IB destino');
    }
  };

  const handleTransferir = async () => {
    const montoNum = parseFloat(monto);
    if (!confirmado || !userIdDestino) {
      toast.error('Debes validar y confirmar el IB destino');
      return;
    }
    if (ibDestino === ibOrigen) {
      toast.error('No puedes transferir a tu propio IB');
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error('Monto inválido');
      return;
    }
    if (montoNum > saldo) {
      toast.error('Saldo insuficiente');
      return;
    }
    setLoading(true);
    // Registrar transferencia
    const { error } = await supabase
      .from('transferencias_ib')
      .insert([{
        ib_origen: ibOrigen,
        ib_destino: ibDestino,
        user_id_origen: userIdOrigen,
        user_id_destino: userIdDestino,
        monto: montoNum,
        estado: 'completada',
      }]);
    setLoading(false);
    if (error) {
      toast.error('Error al registrar la transferencia');
      return;
    }
    setSuccess(true);
    setSaldo(saldo - montoNum);
    setIbDestino('');
    setNombreDestino('');
    setUserIdDestino('');
    setMonto('');
    setConfirmado(false);
    toast.success('Transferencia realizada con éxito');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Transferencia IB</h2>
      <div className="mb-4">
        <div className="text-sm text-gray-600">Tu IB (origen):</div>
        <div className="font-bold text-blue-700 text-lg mb-2">{ibOrigen}</div>
        <div className="text-sm text-gray-600">Saldo disponible:</div>
        <div className="font-bold text-green-600 text-lg mb-2">${saldo.toFixed(2)}</div>
        {saldo === 0 && (
          <div className="text-xs text-yellow-600 mb-2">¿No ves tu saldo? Asegúrate de tener comisiones confirmadas y que no haya retiros pendientes.</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">IB destino</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-black"
            value={ibDestino}
            onChange={e => { setIbDestino(e.target.value.toUpperCase()); setConfirmado(false); setErrorIbDestino(''); }}
            placeholder="Ej: IB973005"
            disabled={loading}
          />
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            onClick={handleValidarDestino}
            disabled={loading || !ibDestino || ibDestino === ibOrigen}
          >
            Validar
          </button>
        </div>
        {confirmado && nombreDestino && (
          <div className="mt-2 text-green-700 text-sm">Titular: <b>{nombreDestino}</b></div>
        )}
        {errorIbDestino && (
          <div className="mt-1 text-red-600 text-sm">{errorIbDestino}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Monto a transferir</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 text-black"
          value={monto}
          onChange={e => setMonto(e.target.value)}
          min={1}
          max={saldo}
          step={0.01}
          disabled={loading}
        />
      </div>
      <button
        className="w-full bg-blue-700 text-white font-bold py-3 rounded hover:bg-blue-800 disabled:bg-blue-300"
        onClick={handleTransferir}
        disabled={loading || !confirmado || !monto}
      >
        {loading ? 'Procesando...' : 'Transferir'}
      </button>
      {success && (
        <div className="mt-4 text-green-700 text-center font-semibold">¡Transferencia realizada con éxito!</div>
      )}
    </div>
  );
};

export default TransferenciaIBPage; 