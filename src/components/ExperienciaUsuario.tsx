import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

interface ProgresoXP {
  nivel_actual: number;
  xp_actual: number;
  xp_siguiente_nivel: number;
  monedas: number;
}

interface NivelXP {
  nivel: number;
  xp_requerida: number;
  recompensa_monedas: number;
  titulo: string;
  descripcion: string;
}

const ExperienciaUsuario: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [progreso, setProgreso] = useState<ProgresoXP | null>(null);
  const [nivelInfo, setNivelInfo] = useState<NivelXP | null>(null);
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

        // Obtener información del nivel actual
        if (progresoData?.nivel_actual) {
          const { data: nivelData, error: nivelError } = await supabase
            .from('niveles_xp')
            .select('*')
            .eq('nivel', progresoData.nivel_actual)
            .single();

          if (nivelError) throw nivelError;
          setNivelInfo(nivelData);
        }

      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Panel de Nivel */}
      <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-neurolink-matrixGreen text-2xl">🎮</div>
          <h2 className="text-xl font-bold text-white">Nivel {progreso?.nivel_actual}</h2>
        </div>
        <div className="text-gray-400">
          {progreso?.xp_actual} / {progreso?.xp_siguiente_nivel} XP
        </div>
        {/* Barra de progreso */}
        <div className="mt-2 h-2 bg-[#222222] rounded-full overflow-hidden">
          <div 
            className="h-full bg-neurolink-matrixGreen transition-all duration-500"
            style={{
              width: `${Math.min(
                ((progreso?.xp_actual || 0) / (progreso?.xp_siguiente_nivel || 1)) * 100,
                100
              )}%`
            }}
          />
        </div>
      </div>

      {/* Panel de Experiencia Total */}
      <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-neurolink-matrixGreen text-2xl">⭐</div>
          <h2 className="text-xl font-bold text-white">Experiencia Total</h2>
        </div>
        <div className="text-neurolink-matrixGreen text-2xl font-bold">
          {progreso?.xp_actual} XP
        </div>
      </div>

      {/* Panel de Monedas */}
      <div className="bg-[#111111] rounded-xl p-6 border border-[#222222]">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-neurolink-matrixGreen text-2xl">💰</div>
          <h2 className="text-xl font-bold text-white">Monedas</h2>
        </div>
        <div className="text-neurolink-matrixGreen text-2xl font-bold">
          {progreso?.monedas || 0}
        </div>
      </div>
    </div>
  );
};

export default ExperienciaUsuario; 