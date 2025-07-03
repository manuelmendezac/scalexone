import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const nivelLabel = {
  1: 'NIVEL 1',
  2: 'NIVEL 2',
  3: 'NIVEL 3',
};

type Referido = { id: string; nombre: string; comision: number };
type Nivel = { nivel: number; referidos: Referido[] };

const MultinivelIBPage = () => {
  const [multinivel, setMultinivel] = useState<Nivel[]>([
    { nivel: 1, referidos: [] },
    { nivel: 2, referidos: [] },
    { nivel: 3, referidos: [] },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMultinivel();
  }, []);

  const obtenerComisionesPorProducto = async (referidoId: string, nivel: number) => {
    const { data: afiliaciones } = await supabase
      .from('solicitudes_afiliacion')
      .select('producto_id, tipo_producto, estado')
      .eq('usuario_id', referidoId)
      .eq('estado', 'aprobada');
    if (!afiliaciones || afiliaciones.length === 0) return [];
    const productosCursosIds = afiliaciones.filter(a => a.tipo_producto === 'curso').map(a => a.producto_id);
    const productosServiciosIds = afiliaciones.filter(a => a.tipo_producto === 'servicio').map(a => a.producto_id);
    let productos: any[] = [];
    if (productosCursosIds.length > 0) {
      const { data } = await supabase
        .from('cursos_marketplace')
        .select('id, nombre, comision_nivel1, comision_nivel2, comision_nivel3')
        .in('id', productosCursosIds);
      productos = productos.concat(data || []);
    }
    if (productosServiciosIds.length > 0) {
      const { data } = await supabase
        .from('servicios_marketplace')
        .select('id, nombre, comision_nivel1, comision_nivel2, comision_nivel3')
        .in('id', productosServiciosIds);
      productos = productos.concat(data || []);
    }
    return productos.map(p => ({
      nombre: p.nombre,
      porcentaje: nivel === 1 ? p.comision_nivel1 : nivel === 2 ? p.comision_nivel2 : p.comision_nivel3
    }));
  };

  const cargarMultinivel = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: nivel1 } = await supabase
        .from('usuarios')
        .select('id, full_name, email')
        .eq('afiliado_referente', user.id);
      const nivel1Ids = (nivel1 || []).map(u => u.id);
      let nivel2: any[] = [];
      if (nivel1Ids.length > 0) {
        const { data } = await supabase
          .from('usuarios')
          .select('id, full_name, email, afiliado_referente')
          .in('afiliado_referente', nivel1Ids);
        nivel2 = data || [];
      }
      const nivel2Ids = (nivel2 || []).map(u => u.id);
      let nivel3: any[] = [];
      if (nivel2Ids.length > 0) {
        const { data } = await supabase
          .from('usuarios')
          .select('id, full_name, email, afiliado_referente')
          .in('afiliado_referente', nivel2Ids);
        nivel3 = data || [];
      }
      const comisionesPorUsuario: Record<string, number> = {};
      const { data: comisiones } = await supabase
        .from('conversiones_afiliado')
        .select('nuevo_usuario_id, comision_generada, estado')
        .in('nuevo_usuario_id', [...nivel1Ids, ...nivel2Ids, ...nivel3.map(u => u.id)])
        .eq('estado', 'pagada');
      (comisiones || []).forEach(c => {
        if (!comisionesPorUsuario[c.nuevo_usuario_id]) comisionesPorUsuario[c.nuevo_usuario_id] = 0;
        comisionesPorUsuario[c.nuevo_usuario_id] += c.comision_generada || 0;
      });
      const referidosNivel1 = await Promise.all((nivel1 || []).map(async u => ({
        id: u.id,
        nombre: u.full_name || u.email,
        comision: comisionesPorUsuario[u.id] || 0,
        productos: await obtenerComisionesPorProducto(u.id, 1)
      })));
      const referidosNivel2 = await Promise.all((nivel2 || []).map(async u => ({
        id: u.id,
        nombre: u.full_name || u.email,
        comision: comisionesPorUsuario[u.id] || 0,
        productos: await obtenerComisionesPorProducto(u.id, 2)
      })));
      const referidosNivel3 = await Promise.all((nivel3 || []).map(async u => ({
        id: u.id,
        nombre: u.full_name || u.email,
        comision: comisionesPorUsuario[u.id] || 0,
        productos: await obtenerComisionesPorProducto(u.id, 3)
      })));
      setMultinivel([
        { nivel: 1, referidos: referidosNivel1 },
        { nivel: 2, referidos: referidosNivel2 },
        { nivel: 3, referidos: referidosNivel3 },
      ]);
    } catch (error) {
      console.error('Error cargando multinivel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
      <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">MULTINIVEL IB</h2>
      <div className="w-full max-w-3xl mx-auto space-y-12">
        {multinivel.map(nivel => (
          <div key={nivel.nivel} className="w-full">
            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center tracking-widest">
              {nivelLabel[nivel.nivel as 1 | 2 | 3]}
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              {nivel.referidos.length === 0 && (
                <div className="text-gray-400 text-center">Sin referidos en este nivel</div>
              )}
              {nivel.referidos.map((ref: any) => (
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
                  <div className="text-xl font-bold text-blue-700 mb-2">${ref.comision.toFixed(2)}</div>
                  {ref.productos && ref.productos.length > 0 ? (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {ref.productos.map((p: any, idx: number) => (
                        <div key={idx}>
                          <span className="font-semibold text-blue-700">{p.nombre}:</span> {p.porcentaje ? `${p.porcentaje}%` : 'Sin comisión'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No afiliado a productos</div>
                  )}
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
  );
};

export default MultinivelIBPage; 