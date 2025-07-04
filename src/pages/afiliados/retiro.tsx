import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

const MIN_RETIRO = 50;
const FEE = 0.03;

const RetiroAfiliadoPage = () => {
  const [ib, setIb] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [monto, setMonto] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorWallet, setErrorWallet] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Obtener IB
        const { data: codigos } = await supabase
          .from('codigos_afiliado')
          .select('codigo')
          .eq('user_id', user.id)
          .eq('activo', true)
          .order('created_at', { ascending: false })
          .limit(1);
        if (codigos && codigos.length > 0) setIb(codigos[0].codigo);
        // Obtener saldo disponible real usando la función obtener_saldo_ib
        if (codigos && codigos.length > 0) {
          const { data: saldoData } = await supabase.rpc('obtener_saldo_ib', { p_ib: codigos[0].codigo });
          const saldoReal = Array.isArray(saldoData) ? (saldoData[0]?.saldo || 0) : (saldoData?.saldo || 0);
          setSaldo(saldoReal);
        }
      } catch (e) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  const montoNum = parseFloat(monto) || 0;
  const fee = montoNum * FEE;
  const neto = montoNum - fee;

  const validarWalletTRC20 = (w: string) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(w);

  const handleSolicitar = async () => {
    if (montoNum < MIN_RETIRO) {
      toast.error('El monto mínimo de retiro es $50 USD');
      return;
    }
    if (montoNum > saldo) {
      toast.error('No tienes saldo suficiente');
      return;
    }
    if (!validarWalletTRC20(wallet)) {
      setErrorWallet('Wallet TRC20 inválida. Verifica la dirección.');
      toast.error('Wallet TRC20 inválida');
      return;
    }
    setLoading(true);
    try {
      // Crear solicitud de retiro
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');
      const { error } = await supabase
        .from('retiros_afiliados')
        .insert([{
          afiliado_id: user.id,
          codigo_ib: ib,
          monto: montoNum,
          fee: fee,
          monto_neto: neto,
          wallet_trc20: wallet,
          estado: 'pendiente',
          red: 'TRC20',
          fecha_solicitud: new Date().toISOString(),
        }]);
      if (error) throw error;
      setSuccess(true);
      setMonto('');
      setWallet('');
      toast.success('Solicitud de retiro enviada');
    } catch (e) {
      toast.error('Error al solicitar retiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb] py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-blue-900 font-orbitron mb-6 text-center">Retirar Fondos</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Código IB</div>
          <div className="text-lg font-bold text-blue-800">{ib || 'Cargando...'}</div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Saldo disponible</div>
          <div className="text-2xl font-bold text-green-600">${saldo.toFixed(2)}</div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto a retirar (mínimo $50 USD)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-black"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            min={MIN_RETIRO}
            step={0.01}
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Wallet USDT (TRC20)</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-black"
            value={wallet}
            onChange={e => { setWallet(e.target.value); setErrorWallet(''); }}
            placeholder="Ej: T..."
            disabled={loading}
          />
          {errorWallet && (
            <div className="mt-1 text-red-600 text-sm">{errorWallet}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">Solo se aceptan retiros a wallets USDT en red TRC20. Fee: 3%.</div>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-500">Fee (3%):</span>
          <span className="font-semibold text-yellow-600">${fee.toFixed(2)}</span>
        </div>
        <div className="mb-6 flex justify-between items-center">
          <span className="text-gray-500">Monto neto a recibir:</span>
          <span className="font-bold text-green-700 text-lg">${neto > 0 ? neto.toFixed(2) : '0.00'}</span>
        </div>
        <button
          onClick={handleSolicitar}
          disabled={loading || !ib || montoNum < MIN_RETIRO || montoNum > saldo || !validarWalletTRC20(wallet)}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${loading ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'}`}
        >
          {loading ? 'Procesando...' : 'Solicitar Retiro'}
        </button>
        {success && (
          <div className="mt-4 text-green-600 text-center font-semibold">¡Solicitud enviada correctamente!</div>
        )}
      </div>
    </div>
  );
};

export default RetiroAfiliadoPage; 