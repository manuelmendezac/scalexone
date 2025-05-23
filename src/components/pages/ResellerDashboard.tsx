import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Settings,
  Users,
  DollarSign,
  BarChart2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Upload,
  Palette,
  Globe,
  FileText,
  CreditCard
} from 'lucide-react';
import { useResellerStore } from '../../stores/resellerStore';

interface Clone {
  id: string;
  name: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  description: string;
  subdomain: string;
  stripeConnected: boolean;
  metrics: {
    activeUsers: number;
    totalRevenue: number;
    subscriptions: number;
  };
}

const ResellerDashboard: React.FC = () => {
  const { clones, createClone, updateClone } = useResellerStore();
  const [showNewCloneModal, setShowNewCloneModal] = useState(false);
  const [expandedClone, setExpandedClone] = useState<string | null>(null);
  const [newClone, setNewClone] = useState<Partial<Clone>>({
    name: '',
    description: '',
    subdomain: '',
    colors: {
      primary: '#00ff00',
      secondary: '#0000ff',
      accent: '#ff00ff'
    }
  });

  const handleCreateClone = async () => {
    try {
      await createClone(newClone as Clone);
      setShowNewCloneModal(false);
      setNewClone({
        name: '',
        description: '',
        subdomain: '',
        colors: {
          primary: '#00ff00',
          secondary: '#0000ff',
          accent: '#ff00ff'
        }
      });
    } catch (error) {
      console.error('Error creating clone:', error);
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
              Panel de Revendedores
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Gestiona tus clones de marca blanca y monitorea su rendimiento
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewCloneModal(true)}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Clon
          </motion.button>
        </motion.div>

        {/* Métricas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
          >
            <h3 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Total de Clones</h3>
            <p className="text-3xl text-neurolink-matrixGreen">{clones.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
          >
            <h3 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Usuarios Activos</h3>
            <p className="text-3xl text-neurolink-matrixGreen">
              {clones.reduce((acc, clone) => acc + clone.metrics.activeUsers, 0)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
          >
            <h3 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Ingresos Totales</h3>
            <p className="text-3xl text-neurolink-matrixGreen">
              ${clones.reduce((acc, clone) => acc + clone.metrics.totalRevenue, 0).toFixed(2)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
          >
            <h3 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Suscripciones</h3>
            <p className="text-3xl text-neurolink-matrixGreen">
              {clones.reduce((acc, clone) => acc + clone.metrics.subscriptions, 0)}
            </p>
          </motion.div>
        </div>

        {/* Lista de clones */}
        <div className="space-y-4">
          {clones.map(clone => (
            <motion.div
              key={clone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden"
            >
              <button
                onClick={() => setExpandedClone(expandedClone === clone.id ? null : clone.id)}
                className="w-full px-6 py-4 flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={clone.logo}
                    alt={clone.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-orbitron text-neurolink-coldWhite">{clone.name}</h3>
                    <p className="text-neurolink-coldWhite/70">{clone.subdomain}.neurolink.app</p>
                  </div>
                </div>
                {expandedClone === clone.id ? (
                  <ChevronUp className="w-5 h-5 text-neurolink-coldWhite" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neurolink-coldWhite" />
                )}
              </button>

              <AnimatePresence>
                {expandedClone === clone.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                        <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Usuarios Activos</h4>
                        <p className="text-2xl text-neurolink-matrixGreen">{clone.metrics.activeUsers}</p>
                      </div>
                      <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                        <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Ingresos</h4>
                        <p className="text-2xl text-neurolink-matrixGreen">${clone.metrics.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="bg-neurolink-cyberBlue/10 rounded-lg p-4">
                        <h4 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Suscripciones</h4>
                        <p className="text-2xl text-neurolink-matrixGreen">{clone.metrics.subscriptions}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <a
                        href={`https://${clone.subdomain}.neurolink.app`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Visitar Sitio
                      </a>
                      <button className="flex-1 px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2">
                        <Settings className="w-5 h-5" />
                        Configurar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de nuevo clon */}
      <AnimatePresence>
        {showNewCloneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl p-6 w-full max-w-2xl border border-neurolink-cyberBlue/30"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
                Crear Nuevo Clon
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-neurolink-coldWhite/70 font-orbitron mb-2">
                    Nombre del Clon
                  </label>
                  <input
                    type="text"
                    value={newClone.name}
                    onChange={e => setNewClone({ ...newClone, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    placeholder="Ej: MiClon IA"
                  />
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite/70 font-orbitron mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <button className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Subir Logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite/70 font-orbitron mb-2">
                    Colores
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-neurolink-coldWhite/70 text-sm mb-1">
                        Primario
                      </label>
                      <input
                        type="color"
                        value={newClone.colors?.primary}
                        onChange={e => setNewClone({
                          ...newClone,
                          colors: { ...newClone.colors!, primary: e.target.value }
                        })}
                        className="w-full h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-neurolink-coldWhite/70 text-sm mb-1">
                        Secundario
                      </label>
                      <input
                        type="color"
                        value={newClone.colors?.secondary}
                        onChange={e => setNewClone({
                          ...newClone,
                          colors: { ...newClone.colors!, secondary: e.target.value }
                        })}
                        className="w-full h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-neurolink-coldWhite/70 text-sm mb-1">
                        Acento
                      </label>
                      <input
                        type="color"
                        value={newClone.colors?.accent}
                        onChange={e => setNewClone({
                          ...newClone,
                          colors: { ...newClone.colors!, accent: e.target.value }
                        })}
                        className="w-full h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite/70 font-orbitron mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newClone.description}
                    onChange={e => setNewClone({ ...newClone, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    rows={3}
                    placeholder="Describe tu clon..."
                  />
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite/70 font-orbitron mb-2">
                    Subdominio
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newClone.subdomain}
                      onChange={e => setNewClone({ ...newClone, subdomain: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      placeholder="miclon"
                    />
                    <span className="text-neurolink-coldWhite/70">.neurolink.app</span>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowNewCloneModal(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateClone}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron hover:bg-neurolink-matrixGreen/90"
                  >
                    Crear Clon
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResellerDashboard; 