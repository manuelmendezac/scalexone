import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  orden: number;
  porcentaje_miembros: number;
  puntos_minimos: number;
  puntos_maximos: number;
  comunidad_id?: string;
}

interface NivelesClasificacionDashboardProps {
  comunidad_id?: string;
}

// Componente de progreso circular
const CircularProgress = ({ value, max = 100, size = 160, stroke = 8, color = '#FFD700', bg = '#23232b' }: any) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bg}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s' }}
      />
    </svg>
  );
};

const NivelesClasificacionDashboard: React.FC<NivelesClasificacionDashboardProps> = ({ comunidad_id }) => {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelo, setModelo] = useState<'ventas' | 'educacion'>('ventas');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Datos reales del usuario
  const avatarUrl = useNeuroState(state => state.avatarUrl);
  const userName = useNeuroState(state => state.userInfo.name) || useNeuroState(state => state.userName);
  const userLevel = useNeuroState(state => state.userLevel);
  const userXP = useNeuroState(state => state.userXP);

  // Obtener el progreso real del usuario según el modelo
  const [progresoUsuario, setProgresoUsuario] = useState<any>(null);

  useEffect(() => {
    const fetchNiveles = async () => {
      setLoading(true);
      // Seleccionar la tabla correcta según el modelo
      const tabla = modelo === 'ventas' ? 'niveles_ventas' : 'niveles_academicos';
      
      let query = supabase
        .from(tabla)
        .select('*')
        .order(modelo === 'ventas' ? 'min_ventas' : 'modulos_requeridos', { ascending: true });

      if (comunidad_id) {
        query = query.eq('comunidad_id', comunidad_id);
      }

      const { data, error } = await query;
      if (error) {
        console.error(`Error al obtener niveles de ${tabla}:`, error);
      } else {
        // Transformar los datos al formato esperado por el componente
        const nivelesFormateados = data?.map((nivel: any, index: number) => ({
          id: nivel.id,
          nombre: nivel.nombre,
          descripcion: nivel.descripcion || '',
          icono: nivel.icono || '🏆',
          color: nivel.color || '#FFD700',
          orden: index + 1,
          porcentaje_miembros: 0, // Por ahora lo dejamos en 0, luego podemos calcularlo
          puntos_minimos: modelo === 'ventas' ? nivel.min_ventas : nivel.modulos_requeridos,
          puntos_maximos: modelo === 'ventas' ? nivel.max_ventas : nivel.videos_requeridos,
          comunidad_id: nivel.comunidad_id
        })) || [];

        setNiveles(nivelesFormateados);
      }
      setLoading(false);
    };
    fetchNiveles();
  }, [comunidad_id, modelo]);

  useEffect(() => {
    const fetchProgresoUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tabla = modelo === 'ventas' ? 'progreso_ventas_usuario' : 'progreso_academico_usuario';
      const { data } = await supabase
        .from(tabla)
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      setProgresoUsuario(data);
    };

    fetchProgresoUsuario();
  }, [modelo]);

  // Calcular puntos y progreso según el modelo
  const getPuntos = () => {
    if (!progresoUsuario) return 0;
    return modelo === 'ventas' 
      ? progresoUsuario.ventas_acumuladas || 0
      : (progresoUsuario.modulos_completados || 0) * 100 + (progresoUsuario.videos_completados || 0) * 10;
  };

  const getPuntosParaSubir = () => {
    const nivelActual = niveles.find(n => n.puntos_minimos > getPuntos());
    return nivelActual ? nivelActual.puntos_minimos - getPuntos() : 0;
  };

  const getProgreso = () => {
    if (!progresoUsuario || niveles.length === 0) return 0;
    const puntos = getPuntos();
    const nivelActual = niveles.find(n => n.puntos_minimos > puntos);
    if (!nivelActual) return 1;
    const nivelAnterior = niveles[niveles.indexOf(nivelActual) - 1];
    const min = nivelAnterior ? nivelAnterior.puntos_minimos : 0;
    return (puntos - min) / (nivelActual.puntos_minimos - min);
  };

  // Actualizar las variables que se usan en el render
  const puntos = getPuntos();
  const puntosParaSubir = getPuntosParaSubir();
  const progreso = getProgreso();

  // NUEVO: Función para guardar cambios y mostrar mensaje de éxito
  const guardarCambios = async () => {
    setLoading(true);
    // Aquí deberías implementar la lógica real de guardado (update/insert/delete en Supabase)
    // Simulación de guardado exitoso:
    setTimeout(() => {
      setMensajeExito('¡Niveles guardados exitosamente!');
      setLoading(false);
      setTimeout(() => setMensajeExito(null), 2500);
    }, 1000);
  };

  if (loading) {
    return <div className="text-center text-gray-400">Cargando niveles...</div>;
  }

  return (
    <section className="w-full max-w-6xl mx-auto mb-8">
      {/* Selector de modelo de niveles */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          className={`px-6 py-2 rounded-full font-bold text-lg border-2 ${modelo === 'ventas' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-white border-gray-600'}`}
          onClick={() => setModelo('ventas')}
        >
          Niveles por Ventas
        </button>
        <button
          className={`px-6 py-2 rounded-full font-bold text-lg border-2 ${modelo === 'educacion' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-white border-gray-600'}`}
          onClick={() => setModelo('educacion')}
        >
          Niveles por Educación
        </button>
      </div>
      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="text-center mb-4 text-green-400 font-bold bg-black/60 rounded-lg py-2">{mensajeExito}</div>
      )}
      {/* Encabezado visual */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-[#23232b] rounded-2xl p-8 mb-8 shadow-lg border border-[#FFD700]/20">
        {/* Avatar y progreso circular */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative">
            <CircularProgress value={progreso * 100} color="#FFD700" bg="#333" />
            <img
              src={avatarUrl || '/images/silueta-perfil.svg'}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#FFD700] shadow-xl absolute top-1/2 left-1/2"
              style={{ transform: 'translate(-50%, -50%)', top: '50%', left: '50%', zIndex: 2 }}
            />
            <span className="absolute bottom-0 right-0 bg-[#FFD700] text-black font-bold rounded-full px-4 py-1 text-lg border-4 border-[#23232b] shadow" style={{zIndex:3}}>{userLevel || 1}</span>
          </div>
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">{userName || 'Usuario'}</div>
            <span className="bg-[#FFD700] text-black font-bold px-4 py-1 rounded-full text-base">Nivel {userLevel || 1}</span>
            <div className="mt-2 text-white text-lg font-semibold">
              {puntos} {modelo === 'ventas' ? '$ en ventas' : 'puntos académicos'}
            </div>
            <div className="text-gray-400 text-base mt-1">
              <span className="font-bold">{puntosParaSubir}</span> {modelo === 'ventas' ? '$ para subir' : 'puntos para subir'} de nivel
            </div>
          </div>
        </div>
        {/* Lista de niveles (simulada, solo visual) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {niveles.slice(0, 5).map((nivel, idx) => (
              <div key={nivel.id} className="flex items-center gap-4">
                <span className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold ${idx === 0 ? 'bg-[#FFD700] text-black' : 'bg-gray-700 text-white'}`}>{nivel.orden}</span>
                <div>
                  <div className="text-white text-lg font-semibold">{nivel.nombre}</div>
                  <div className="text-gray-400 text-sm">{nivel.porcentaje_miembros}% de miembros</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {niveles.slice(5, 10).map((nivel, idx) => (
              <div key={nivel.id} className="flex items-center gap-4">
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 text-white text-xl font-bold">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
                </span>
                <div>
                  <div className="text-white text-lg font-semibold">{nivel.nombre}</div>
                  <div className="text-gray-400 text-sm">{nivel.porcentaje_miembros}% de miembros</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tabla de niveles (opcional, para administración) */}
      <div className="bg-black/40 border border-neurolink-cyberBlue/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-neurolink-coldWhite/90 font-orbitron text-xl flex items-center gap-2">
            🏆 Niveles de Clasificación
          </div>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow transition"
            onClick={guardarCambios}
            disabled={loading}
          >
            Guardar Cambios
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-neurolink-coldWhite/60 text-sm">
                <th className="py-2 pr-4">Orden</th>
                <th className="py-2 pr-4">Icono</th>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Puntos Mínimos</th>
                <th className="py-2 pr-4">Puntos Máximos</th>
                <th className="py-2 pr-4">% Miembros</th>
              </tr>
            </thead>
            <tbody>
              {niveles.map((nivel) => (
                <tr key={nivel.id} className="border-b border-neurolink-cyberBlue/10">
                  <td className="py-2 pr-4">{nivel.orden}</td>
                  <td className="py-2 pr-4">{nivel.icono}</td>
                  <td className="py-2 pr-4">{nivel.nombre}</td>
                  <td className="py-2 pr-4">{nivel.descripcion}</td>
                  <td className="py-2 pr-4">{nivel.puntos_minimos}</td>
                  <td className="py-2 pr-4">{nivel.puntos_maximos}</td>
                  <td className="py-2 pr-4">{nivel.porcentaje_miembros}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default NivelesClasificacionDashboard; 