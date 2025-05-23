import React from 'react';
import { FiZap, FiBookOpen, FiSmile, FiMessageCircle } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';

interface KPIDashboardProps {
  kpis: {
    microtasks: number;
    focusTime: number;
    lastAIMessage: string;
    emotion: string;
  };
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ kpis }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-cyan-400/30 transition group">
      <FiZap className="w-7 h-7 text-cyan-400 mb-2 group-hover:scale-110 transition" />
      <div className="text-2xl font-bold text-white">{kpis.microtasks}%</div>
      <div className="text-cyan-200 text-sm">Microtareas completadas</div>
    </div>
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-cyan-400/30 transition group">
      <FaBrain className="w-7 h-7 text-cyan-400 mb-2 group-hover:scale-110 transition" />
      <div className="text-2xl font-bold text-white">{kpis.focusTime}h</div>
      <div className="text-cyan-200 text-sm">Tiempo de enfoque</div>
    </div>
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-cyan-400/30 transition group">
      <FiMessageCircle className="w-7 h-7 text-cyan-400 mb-2 group-hover:scale-110 transition" />
      <div className="text-2xl font-bold text-white truncate max-w-[120px]">{kpis.lastAIMessage}</div>
      <div className="text-cyan-200 text-sm">Última conversación IA</div>
    </div>
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-cyan-400/30 transition group">
      <FiSmile className="w-7 h-7 text-cyan-400 mb-2 group-hover:scale-110 transition" />
      <div className="text-2xl font-bold text-white">{kpis.emotion || '🙂'}</div>
      <div className="text-cyan-200 text-sm">Estado emocional</div>
    </div>
  </div>
);

export default KPIDashboard; 