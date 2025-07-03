import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const CuentasIBPage = () => {
  const [codigoAfiliado, setCodigoAfiliado] = useState<string | null>(null);
  const [fechaRegistro, setFechaRegistro] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [telefono, setTelefono] = useState('');
  const [editandoTelefono, setEditandoTelefono] = useState(false);
  const [afiliaciones, setAfiliaciones] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Datos personales
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('id, full_name, email, telefono, created_at')
        .eq('id', user.id)
        .single();
      setUsuario(usuarioData);
      setTelefono(usuarioData?.telefono || '');
      setFechaRegistro(usuarioData?.created_at || null);
      // Código de afiliado principal
      const { data: codigos } = await supabase
        .from('codigos_afiliado')
        .select('codigo, created_at')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1);
      setCodigoAfiliado(codigos?.[0]?.codigo || null);
      // Afiliaciones aprobadas
      const { data: afiliacionesData } = await supabase
        .from('solicitudes_afiliacion')
        .select('producto_id, tipo_producto, estado')
        .eq('usuario_id', user.id)
        .eq('estado', 'aprobada');
      setAfiliaciones(afiliacionesData || []);
      // Consultar productos afiliados
      let productosArr: any[] = [];
      if (afiliacionesData && afiliacionesData.length > 0) {
        const cursosIds = afiliacionesData.filter(a => a.tipo_producto === 'curso').map(a => a.producto_id);
        const serviciosIds = afiliacionesData.filter(a => a.tipo_producto === 'servicio').map(a => a.producto_id);
        if (cursosIds.length > 0) {
          const { data } = await supabase
            .from('cursos_marketplace')
            .select('id, nombre, tipo_producto, comision_nivel1, comision_nivel2, comision_nivel3')
            .in('id', cursosIds);
          productosArr = productosArr.concat(data || []);
        }
        if (serviciosIds.length > 0) {
          const { data } = await supabase
            .from('servicios_marketplace')
            .select('id, nombre, tipo_producto, comision_nivel1, comision_nivel2, comision_nivel3')
            .in('id', serviciosIds);
          productosArr = productosArr.concat(data || []);
        }
      }
      setProductos(productosArr);
    } catch (error) {
      console.error('Error cargando datos de cuenta IB:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarTelefono = async () => {
    if (!usuario) return;
    await supabase
      .from('usuarios')
      .update({ telefono })
      .eq('id', usuario.id);
    setEditandoTelefono(false);
  };

  const copiarCodigo = () => {
    if (codigoAfiliado) {
      navigator.clipboard.writeText(codigoAfiliado);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">CUENTA IB</h2>
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Código de Afiliado</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xl font-bold text-blue-800">{codigoAfiliado || 'Sin código'}</div>
            {codigoAfiliado && (
              <button onClick={copiarCodigo} className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50">Copiar</button>
            )}
            {!codigoAfiliado && (
              <span className="text-xs text-gray-400">Solicita tu código en el panel de afiliados</span>
            )}
          </div>
          {fechaRegistro && (
            <div className="text-xs text-gray-400 mb-1">Afiliado desde {new Date(fechaRegistro).toLocaleDateString()}</div>
          )}
        </div>
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2 font-semibold">Afiliaciones y Porcentajes</div>
          {productos.length === 0 ? (
            <div className="text-gray-400 text-sm">No tienes afiliaciones activas. <a href="/afiliados/marketplace" className="text-blue-600 underline cursor-pointer">Afíliate a un producto</a></div>
          ) : (
            <ul className="space-y-3">
              {productos.map((p, idx) => (
                <li key={p.id || idx} className="border-b border-gray-100 pb-2">
                  <div className="font-semibold text-blue-700">{p.nombre} <span className="text-xs text-gray-400">({p.tipo_producto})</span></div>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span className="text-blue-700">Nivel 1: <span className="font-bold">{p.comision_nivel1 || 0}%</span></span>
                    <span className="text-blue-700">Nivel 2: <span className="font-bold">{p.comision_nivel2 || 0}%</span></span>
                    <span className="text-blue-700">Nivel 3: <span className="font-bold">{p.comision_nivel3 || 0}%</span></span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-500 mb-1 font-semibold">Datos Personales</div>
          <div className="text-base text-blue-900 font-semibold">{usuario?.full_name || usuario?.email || 'Sin nombre'}</div>
          <div className="text-sm text-gray-600">{usuario?.email || 'Sin email'}</div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {editandoTelefono ? (
              <>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} className="border px-2 py-1 rounded text-sm" />
                <button onClick={guardarTelefono} className="text-xs text-green-600 border border-green-200 rounded px-2 py-1 hover:bg-green-50">Guardar</button>
                <button onClick={() => setEditandoTelefono(false)} className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">Cancelar</button>
              </>
            ) : (
              <>
                {telefono || <span className="text-gray-400">Sin teléfono</span>}
                <button onClick={() => setEditandoTelefono(true)} className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50">Editar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuentasIBPage; 