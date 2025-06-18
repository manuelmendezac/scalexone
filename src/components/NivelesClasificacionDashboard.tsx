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

  // Datos reales del usuario
  const avatarUrl = useNeuroState(state => state.avatarUrl);
  const userName = useNeuroState(state => state.userInfo.name) || useNeuroState(state => state.userName);
  const userLevel = useNeuroState(state => state.userLevel);
  const userXP = useNeuroState(state => state.userXP);

  // Simulación de puntos y progreso
  const puntos = userXP || 0;
  const nivel = userLevel || 1;
  const puntosParaSubir = 2; // Simulado
  const progreso = 0.75; // Simulado (75%)

  useEffect(() => {
    const fetchNiveles = async () => {
      setLoading(true);
      let query = supabase.from('clasificacion_niveles').select('*').order('orden', { ascending: true });
      if (comunidad_id) {
        query = query.eq('comunidad_id', comunidad_id);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error al obtener niveles:', error);
      } else {
        setNiveles(data || []);
      }
      setLoading(false);
    };
    fetchNiveles();
  }, [comunidad_id]);

  if (loading) {
    return <div className="text-center text-gray-400">Cargando niveles...</div>;
  }

  return (
    <section className="w-full max-w-6xl mx-auto mb-8">
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
            <span className="absolute bottom-0 right-0 bg-[#FFD700] text-black font-bold rounded-full px-4 py-1 text-lg border-4 border-[#23232b] shadow" style={{zIndex:3}}>{nivel}</span>
          </div>
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">{userName || 'Usuario'}</div>
            <span className="bg-[#FFD700] text-black font-bold px-4 py-1 rounded-full text-base">Nivel {nivel}</span>
            <div className="mt-2 text-white text-lg font-semibold">{puntos} Puntos</div>
            <div className="text-gray-400 text-base mt-1">
              <span className="font-bold">{puntosParaSubir}</span> puntos para subir de nivel
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
        <div className="text-neurolink-coldWhite/90 font-orbitron text-xl mb-4 flex items-center gap-2">
          🏆 Niveles de Clasificación
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