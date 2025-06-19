import React from 'react';
import { useGamification } from '../hooks/useGamification';

export const ProgresoUsuarioXP: React.FC = () => {
  const {
    xp,
    nivel,
    monedas,
    xpSiguienteNivel,
    logrosDesbloqueados,
    loading
  } = useGamification();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-indigo-600 mb-2">
            {nivel}
          </div>
          <div className="text-gray-600">Nivel Actual</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {xp}
          </div>
          <div className="text-gray-600">XP Total</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-600 mb-2">
            {monedas}
          </div>
          <div className="text-gray-600">Monedas</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progreso al siguiente nivel</span>
          <span>{xp} / {xpSiguienteNivel} XP</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(xp / xpSiguienteNivel) * 100}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Logros Desbloqueados ({logrosDesbloqueados.length})
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {logrosDesbloqueados.map((logro: any) => (
            <div
              key={logro.id}
              className="flex items-center p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl mr-3">{logro.logros.icono || '🏆'}</span>
              <div>
                <div className="font-medium text-gray-800">
                  {logro.logros.titulo}
                </div>
                <div className="text-sm text-gray-500">
                  +{logro.logros.xp_recompensa} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 