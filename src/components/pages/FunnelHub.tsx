import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Copy,
  Share2,
  BarChart2,
  Users,
  DollarSign,
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Video,
  FileText,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import { useFunnelStore } from '../../stores/funnelStore';

interface FunnelTemplate {
  id: string;
  name: string;
  type: 'capture' | 'webinar' | 'evergreen' | 'digital';
  description: string;
  pages: {
    capture: string;
    confirmation: string;
    event: string;
    checkout: string;
  };
  metrics: {
    views: number;
    conversions: number;
    clicks: number;
    sales: number;
  };
}

interface Funnel {
  id: string;
  templateId: string;
  name: string;
  customUrl: string;
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  metrics: {
    views: number;
    conversions: number;
    clicks: number;
    sales: number;
  };
}

const FunnelHub: React.FC = () => {
  const { templates, funnels, createFunnel, updateFunnel, deleteFunnel } = useFunnelStore();
  const [selectedTab, setSelectedTab] = useState<'templates' | 'my-funnels'>('templates');
  const [expandedFunnel, setExpandedFunnel] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');

  const handleCreateFunnel = (templateId: string) => {
    if (newFunnelName.trim()) {
      createFunnel({
        templateId,
        name: newFunnelName,
        customUrl: newFunnelName.toLowerCase().replace(/\s+/g, '-'),
        status: 'draft',
        createdAt: new Date().toISOString(),
        metrics: {
          views: 0,
          conversions: 0,
          clicks: 0,
          sales: 0
        }
      });
      setShowCreateModal(false);
      setNewFunnelName('');
    }
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-2">
              Embudos de Venta
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Crea y gestiona embudos de venta con tracking de referidos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Embudo
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neurolink-cyberBlue/30">
          <button
            onClick={() => setSelectedTab('templates')}
            className={`px-4 py-2 font-orbitron ${
              selectedTab === 'templates'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Biblioteca de Embudos
          </button>
          <button
            onClick={() => setSelectedTab('my-funnels')}
            className={`px-4 py-2 font-orbitron ${
              selectedTab === 'my-funnels'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Mis Embudos
          </button>
        </div>

        {/* Contenido */}
        <AnimatePresence mode="wait">
          {selectedTab === 'templates' ? (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {templates.map(template => (
                <div
                  key={template.id}
                  className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
                >
                  <h3 className="text-xl font-orbitron text-neurolink-coldWhite mb-2">
                    {template.name}
                  </h3>
                  <p className="text-neurolink-coldWhite/70 mb-4">
                    {template.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-neurolink-cyberBlue/10 rounded-lg p-3">
                      <h4 className="text-neurolink-coldWhite/70 text-sm mb-1">Vistas</h4>
                      <p className="text-neurolink-matrixGreen">{template.metrics.views}</p>
                    </div>
                    <div className="bg-neurolink-cyberBlue/10 rounded-lg p-3">
                      <h4 className="text-neurolink-coldWhite/70 text-sm mb-1">Conversiones</h4>
                      <p className="text-neurolink-matrixGreen">{template.metrics.conversions}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewFunnelName(template.name);
                      setShowCreateModal(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                  >
                    Usar este Embudo
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="my-funnels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {funnels.map(funnel => (
                <div
                  key={funnel.id}
                  className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFunnel(expandedFunnel === funnel.id ? null : funnel.id)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left"
                  >
                    <div>
                      <h3 className="text-xl font-orbitron text-neurolink-coldWhite">
                        {funnel.name}
                      </h3>
                      <p className="text-neurolink-coldWhite/70">
                        {funnel.customUrl}
                      </p>
                    </div>
                    {expandedFunnel === funnel.id ? (
                      <ChevronUp className="w-5 h-5 text-neurolink-coldWhite" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neurolink-coldWhite" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedFunnel === funnel.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                            <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Vistas</h4>
                            <p className="text-2xl text-neurolink-matrixGreen">{funnel.metrics.views}</p>
                          </div>
                          <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                            <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Conversiones</h4>
                            <p className="text-2xl text-neurolink-matrixGreen">{funnel.metrics.conversions}</p>
                          </div>
                          <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                            <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Clics</h4>
                            <p className="text-2xl text-neurolink-matrixGreen">{funnel.metrics.clicks}</p>
                          </div>
                          <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                            <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Ventas</h4>
                            <p className="text-2xl text-neurolink-matrixGreen">{funnel.metrics.sales}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Editar
                          </button>
                          <button className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" />
                            Métricas
                          </button>
                          <button className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Compartir
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Creación */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Crear Nuevo Embudo
              </h2>
              <input
                type="text"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                placeholder="Nombre del embudo"
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite mb-4"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleCreateFunnel(templates[0].id)}
                  className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
                >
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FunnelHub; 