import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

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

const NivelesClasificacionDashboard: React.FC<NivelesClasificacionDashboardProps> = ({ comunidad_id }) => {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section className="w-full max-w-4xl mx-auto mb-8">
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