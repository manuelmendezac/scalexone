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
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow transition group" style={{ border: '1.5px solid #FFD700', boxShadow: '0 2px 12px #FFD70044' }}>
      <FiZap className="w-7 h-7 mb-2 group-hover:scale-110 transition" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }} />
      <div className="text-2xl font-bold text-yellow-200">{kpis.microtasks}%</div>
      <div className="text-yellow-400 text-sm">Microtareas completadas</div>
    </div>
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow transition group" style={{ border: '1.5px solid #FFD700', boxShadow: '0 2px 12px #FFD70044' }}>
      <FaBrain className="w-7 h-7 mb-2 group-hover:scale-110 transition" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }} />
      <div className="text-2xl font-bold text-yellow-200">{kpis.focusTime}h</div>
      <div className="text-yellow-400 text-sm">Tiempo de enfoque</div>
    </div>
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow transition group" style={{ border: '1.5px solid #FFD700', boxShadow: '0 2px 12px #FFD70044' }}>
      <FiMessageCircle className="w-7 h-7 mb-2 group-hover:scale-110 transition" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }} />
      <div className="text-2xl font-bold text-yellow-200 truncate max-w-[120px]">{kpis.lastAIMessage}</div>
      <div className="text-yellow-400 text-sm">Última conversación IA</div>
    </div>
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow transition group" style={{ border: '1.5px solid #FFD700', boxShadow: '0 2px 12px #FFD70044' }}>
      <FiSmile className="w-7 h-7 mb-2 group-hover:scale-110 transition" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }} />
      <div className="text-2xl font-bold text-yellow-200">{kpis.emotion || '🙂'}</div>
      <div className="text-yellow-400 text-sm">Estado emocional</div>
    </div>
  </div>
);

export default KPIDashboard; 