import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useGamification } from '../hooks/useGamification';
import '../styles/gamification.css';

interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  xp_recompensa: number;
  monedas_recompensa: number;
  icono: string;
  condicion: any;
}

export const LogrosUsuario: React.FC = () => {
  const { logrosDesbloqueados } = useGamification();
  const [todosLosLogros, setTodosLosLogros] = useState<Logro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarLogros = async () => {
      try {
        const { data: logros, error } = await supabase
          .from('logros')
          .select('*')
          .order('tipo', { ascending: true });

        if (error) throw error;
        setTodosLosLogros(logros || []);
      } catch (error) {
        console.error('Error al cargar logros:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarLogros();
  }, []);

  const estaDesbloqueado = (logroId: string) => {
    return logrosDesbloqueados.some(l => l.logro_id === logroId);
  };

  const agruparLogrosPorTipo = () => {
    const grupos: { [key: string]: Logro[] } = {};
    todosLosLogros.forEach(logro => {
      if (!grupos[logro.tipo]) {
        grupos[logro.tipo] = [];
      }
      grupos[logro.tipo].push(logro);
    });
    return grupos;
  };

  const traducirTipo = (tipo: string) => {
    const traducciones: { [key: string]: string } = {
      'video': 'Videos',
      'modulo': 'Módulos',
      'curso': 'Cursos',
      'tiempo': 'Tiempo de Estudio',
      'login': 'Asistencia'
    };
    return traducciones[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const gruposLogros = agruparLogrosPorTipo();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">
        Logros y Recompensas
      </h2>

      {Object.entries(gruposLogros).map(([tipo, logros]) => (
        <div key={tipo} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            {traducirTipo(tipo)}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logros.map(logro => {
              const desbloqueado = estaDesbloqueado(logro.id);
              
              return (
                <div
                  key={logro.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-300
                    ${desbloqueado 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  {desbloqueado && (
                    <div className="absolute top-2 right-2">
                      <span className="text-green-500 text-2xl">✓</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">
                      {logro.icono || '🏆'}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {logro.titulo}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {logro.descripcion}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm text-purple-600">
                          +{logro.xp_recompensa} XP
                        </span>
                        <span className="text-sm text-yellow-600">
                          +{logro.monedas_recompensa} 🪙
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogrosUsuario; 