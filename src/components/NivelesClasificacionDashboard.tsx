import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from './LoadingScreen';

interface Nivel {
  id: number;
  nivel: number;
  titulo: string;
  descripcion: string;
  xp_requerida: number;
  recompensa_monedas: number;
  porcentaje_miembros?: number;
}

interface ProgresoUsuario {
  nivel_actual: number;
  xp_actual: number;
  xp_siguiente_nivel: number;
  monedas: number;
}

const NivelesClasificacionDashboard: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [progreso, setProgreso] = useState<ProgresoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuario no autenticado');
          return;
        }

        // Obtener niveles
        const { data: nivelesData, error: nivelesError } = await supabase
          .from('niveles_xp')
          .select('*')
          .order('nivel', { ascending: true });

        if (nivelesError) throw nivelesError;

        // Obtener progreso del usuario
        const { data: progresoData, error: progresoError } = await supabase
          .from('progreso_usuario_xp')
          .select('*')
          .eq('usuario_id', user.id)
          .single();

        if (progresoError && progresoError.code !== 'PGRST116') throw progresoError;

        // Si no existe el progreso, crearlo
        if (!progresoData) {
          const nuevoProgreso = {
            usuario_id: user.id,
            nivel_actual: 1,
            xp_actual: 0,
            xp_siguiente_nivel: 1000,
            monedas: 0
          };

          const { data: nuevoProgresoData, error: nuevoProgresoError } = await supabase
            .from('progreso_usuario_xp')
            .insert(nuevoProgreso)
            .select()
            .single();

          if (nuevoProgresoError) throw nuevoProgresoError;
          setProgreso(nuevoProgresoData);
        } else {
          setProgreso(progresoData);
        }

        const nivelesConPorcentaje = nivelesData?.map((nivel, index) => ({
          ...nivel,
          porcentaje_miembros: index === 0 ? 75 : index === 1 ? 25 : 0
        })) || [];

        setNiveles(nivelesConPorcentaje);

      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const nivelActual = niveles.find(n => n.nivel === progreso?.nivel_actual);

  return (
    <div className="container mx-auto p-8">
      <div className="bg-[#1E1E1E] rounded-lg p-8 shadow-xl">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Panel izquierdo con perfil */}
          <div className="flex flex-col items-center space-y-4 min-w-[300px]">
            <div className="relative">
              {/* Círculo de progreso */}
              <div className="w-40 h-40 rounded-full bg-[#2A2A2A] border-4 border-[#333333] relative">
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#FFD700 ${(progreso?.xp_actual || 0) * 36}deg, transparent 0deg)`,
                    transform: 'rotate(-90deg)'
                  }}
                />
                <img
                  src="/images/silueta-perfil.svg"
                  alt="Perfil"
                  className="absolute inset-0 w-full h-full rounded-full object-cover p-1"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#FFD700] text-black rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl border-2 border-[#2A2A2A]">
                  {progreso?.nivel_actual || 1}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white">Metalink Comunidad</h2>
            <div className="bg-[#FFD700] text-black px-4 py-1 rounded-full font-semibold">
              Nivel {progreso?.nivel_actual || 1}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{progreso?.xp_actual || 0} XP</p>
              <p className="text-gray-400">
                {progreso?.xp_siguiente_nivel || 1000} XP para subir de nivel
              </p>
            </div>
          </div>

          {/* Panel derecho con niveles */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {niveles.map((nivel) => (
              <div 
                key={nivel.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  nivel.nivel <= (progreso?.nivel_actual || 1)
                    ? 'bg-[#2A2A2A]'
                    : 'bg-[#232323]'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  nivel.nivel <= (progreso?.nivel_actual || 1)
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-[#333333] text-gray-500'
                }`}>
                  {nivel.nivel <= (progreso?.nivel_actual || 1) ? (
                    nivel.nivel
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Nivel {nivel.nivel} - {nivel.titulo}</h3>
                  <p className="text-gray-400">{nivel.porcentaje_miembros || 0}% de miembros</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NivelesClasificacionDashboard; 