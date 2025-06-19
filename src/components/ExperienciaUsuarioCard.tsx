import React from 'react';
import { useGamification } from '../hooks/useGamification';

export const ExperienciaUsuarioCard: React.FC = () => {
  const {
    xp,
    nivel,
    monedas,
    xpSiguienteNivel,
    ultimosLogros,
    loading
  } = useGamification();

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-lg p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Nivel {nivel}</h2>
          <p className="text-white/80">¡Sigue así!</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{xp}</div>
          <div className="text-white/80">XP Total</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progreso al siguiente nivel</span>
          <span>{xp} / {xpSiguienteNivel} XP</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(xp / xpSiguienteNivel) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold mb-1">{monedas}</div>
          <div className="text-white/80 text-sm">Monedas</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold mb-1">
            {ultimosLogros.length}
          </div>
          <div className="text-white/80 text-sm">Logros</div>
        </div>
      </div>

      {ultimosLogros.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Últimos Logros</h3>
          <div className="space-y-2">
            {ultimosLogros.slice(0, 3).map((logro: any) => (
              <div
                key={logro.id}
                className="flex items-center gap-3 bg-white/10 rounded-lg p-3"
              >
                <span className="text-2xl">{logro.logros.icono || '🏆'}</span>
                <div>
                  <div className="font-medium">{logro.logros.titulo}</div>
                  <div className="text-sm text-white/70">
                    +{logro.logros.xp_recompensa} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 