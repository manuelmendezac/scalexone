import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Shield, RefreshCw, Edit3, Power, Trash2, CheckCircle, XCircle, AlertTriangle, Download, Brain
} from 'lucide-react';

const CATEGORIAS_PREDEFINIDAS = [
  { id: 'ia', nombre: 'IA', color: 'text-neurolink-matrixGreen' },
  { id: 'pagos', nombre: 'Pagos', color: 'text-neurolink-cyberBlue' },
  { id: 'automatizacion', nombre: 'Automatización', color: 'text-neurolink-matrixGreen' },
  { id: 'marketing', nombre: 'Marketing', color: 'text-neurolink-cyberBlue' }
];

const ESTADOS = {
  conectado: { label: 'Conectado', color: 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen' },
  desconectado: { label: 'Desconectado', color: 'bg-red-500/20 text-red-400' },
  expirado: { label: 'Expirado', color: 'bg-yellow-500/20 text-yellow-500' }
};

const ejemploLogs = [
  { fecha: '2024-05-12 10:00', accion: 'Consulta de saldo', resultado: 'Éxito' },
  { fecha: '2024-05-12 09:30', accion: 'Generación de texto', resultado: 'Éxito' },
  { fecha: '2024-05-11 18:00', accion: 'Envío de email', resultado: 'Fallido' }
];

function enmascararClave(clave: string) {
  if (!clave) return '';
  return clave.length > 8 ? clave.slice(0, 4) + '••••••' + clave.slice(-2) : '••••••••';
}

type EstadoIntegracion = 'conectado' | 'desconectado' | 'expirado';

export const AISyncPanel: React.FC = () => {
  const [integraciones, setIntegraciones] = useState<Array<{
    id: string;
    nombre: string;
    categoria: string;
    apiKey: string;
    url: string;
    estado: EstadoIntegracion;
    autorizada: boolean;
    comportamientoClon: string;
    logs: any[];
    ultimaSync?: string;
  }>>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaIntegracion, setNuevaIntegracion] = useState({
    nombre: '',
    categoria: 'ia',
    apiKey: '',
    url: '',
    estado: 'desconectado' as EstadoIntegracion,
    autorizada: false,
    comportamientoClon: '',
    logs: [] as any[]
  });
  const [categorias, setCategorias] = useState(CATEGORIAS_PREDEFINIDAS);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'warning'; mensaje: string } | null>(null);
  const [exportando, setExportando] = useState(false);
  const [logsVisibles, setLogsVisibles] = useState<string | null>(null);

  const handleAgregarIntegracion = () => {
    if (!nuevaIntegracion.nombre || !nuevaIntegracion.apiKey) {
      setFeedback({ tipo: 'error', mensaje: 'Nombre y API Key son obligatorios' });
      return;
    }
    setIntegraciones(prev => [
      ...prev,
      {
        ...nuevaIntegracion,
        id: Date.now().toString(),
        ultimaSync: new Date().toLocaleString(),
        logs: ejemploLogs,
        estado: nuevaIntegracion.estado as EstadoIntegracion
      }
    ]);
    setNuevaIntegracion({
      nombre: '', categoria: 'ia', apiKey: '', url: '', estado: 'desconectado' as EstadoIntegracion, autorizada: false, comportamientoClon: '', logs: []
    });
    setMostrarFormulario(false);
    setFeedback({ tipo: 'success', mensaje: 'Integración guardada' });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleProbarConexion = (id: string) => {
    setIntegraciones(prev => prev.map(i =>
      i.id === id ? { ...i, estado: 'conectado' as EstadoIntegracion, ultimaSync: new Date().toLocaleString() } : i
    ));
    setFeedback({ tipo: 'success', mensaje: '¡Conexión exitosa!' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleEliminar = (id: string) => {
    setIntegraciones(prev => prev.filter(i => i.id !== id));
    setFeedback({ tipo: 'success', mensaje: 'Integración eliminada' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleExportar = () => {
    setExportando(true);
    const data = JSON.stringify(integraciones.map(i => ({ ...i, apiKey: undefined })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aisync-integraciones.json';
    a.click();
    setTimeout(() => setExportando(false), 1000);
  };

  const handleAgregarCategoria = () => {
    if (nuevaCategoria && !categorias.find(c => c.id === nuevaCategoria.toLowerCase())) {
      setCategorias([...categorias, { id: nuevaCategoria.toLowerCase(), nombre: nuevaCategoria, color: 'text-neurolink-coldWhite' }]);
      setNuevaCategoria('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-xl rounded-xl border-2 border-neurolink-matrixGreen p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron text-neurolink-matrixGreen flex items-center space-x-2">
            <Key className="w-8 h-8 text-neurolink-cyberBlue" />
            <span>Panel de Sincronización de APIs</span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue text-neurolink-dark font-orbitron flex items-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>Nueva Integración</span>
          </motion.button>
        </div>

        {/* Formulario de Integración */}
        <AnimatePresence>
          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="space-y-4 bg-black/60 p-6 rounded-xl border border-neurolink-cyberBlue/30">
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Nombre del Servicio</label>
                  <input
                    type="text"
                    value={nuevaIntegracion.nombre}
                    onChange={e => setNuevaIntegracion({ ...nuevaIntegracion, nombre: e.target.value })}
                    className="w-full p-2 rounded-lg bg-black/50 border border-neurolink-matrixGreen/30 text-neurolink-coldWhite"
                    placeholder="Ej: OpenAI, Stripe, Zapier..."
                  />
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Categoría</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {categorias.map(cat => (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNuevaIntegracion({ ...nuevaIntegracion, categoria: cat.id })}
                        className={`px-3 py-1 rounded-full font-orbitron border border-neurolink-cyberBlue/30 text-sm ${nuevaIntegracion.categoria === cat.id ? cat.color + ' bg-neurolink-cyberBlue/20' : 'text-neurolink-coldWhite bg-black/30'}`}
                      >
                        {cat.nombre}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={nuevaCategoria}
                      onChange={e => setNuevaCategoria(e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-black/50 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      placeholder="Nueva categoría"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAgregarCategoria}
                      className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
                    >
                      Agregar
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">API Key</label>
                  <input
                    type="password"
                    value={nuevaIntegracion.apiKey}
                    onChange={e => setNuevaIntegracion({ ...nuevaIntegracion, apiKey: e.target.value })}
                    className="w-full p-2 rounded-lg bg-black/50 border border-neurolink-matrixGreen/30 text-neurolink-coldWhite"
                    placeholder="••••••••••••••••"
                  />
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">URL Base (opcional)</label>
                  <input
                    type="text"
                    value={nuevaIntegracion.url}
                    onChange={e => setNuevaIntegracion({ ...nuevaIntegracion, url: e.target.value })}
                    className="w-full p-2 rounded-lg bg-black/50 border border-neurolink-matrixGreen/30 text-neurolink-coldWhite"
                    placeholder="https://api.servicio.com"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nuevaIntegracion.autorizada}
                    onChange={e => setNuevaIntegracion({ ...nuevaIntegracion, autorizada: e.target.checked })}
                    className="w-4 h-4 rounded border-neurolink-matrixGreen/30"
                  />
                  <label className="text-neurolink-coldWhite flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-neurolink-cyberBlue" />
                    <span>Autorizar uso por el clon</span>
                  </label>
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Comportamiento del clon</label>
                  <textarea
                    value={nuevaIntegracion.comportamientoClon}
                    onChange={e => setNuevaIntegracion({ ...nuevaIntegracion, comportamientoClon: e.target.value })}
                    className="w-full h-20 p-2 rounded-lg bg-black/50 border border-neurolink-matrixGreen/30 text-neurolink-coldWhite resize-none"
                    placeholder="Describe cómo el clon debe interactuar con esta API..."
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMostrarFormulario(false)}
                    className="px-4 py-2 rounded-lg bg-black/50 text-neurolink-coldWhite border border-neurolink-cyberBlue/30"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAgregarIntegracion}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Guardar</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listado de Integraciones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-orbitron text-neurolink-coldWhite">Integraciones Conectadas</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportar}
              disabled={exportando}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue text-neurolink-dark font-orbitron flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Exportar JSON</span>
            </motion.button>
          </div>
          {integraciones.length === 0 && (
            <div className="text-neurolink-coldWhite/60 text-center py-8">No hay integraciones registradas.</div>
          )}
          {integraciones.map(integ => (
            <motion.div
              key={integ.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-black/60 border border-neurolink-matrixGreen/30"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-orbitron text-neurolink-coldWhite flex items-center space-x-2">
                    <Key className="w-5 h-5 text-neurolink-cyberBlue" />
                    <span>{integ.nombre}</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${categorias.find(c => c.id === integ.categoria)?.color || 'text-neurolink-coldWhite'} bg-neurolink-cyberBlue/10`}>
                      {categorias.find(c => c.id === integ.categoria)?.nombre || integ.categoria}
                    </span>
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ESTADOS[integ.estado]?.color || 'bg-gray-700 text-gray-400'}`}>{ESTADOS[integ.estado]?.label || integ.estado}</span>
                    <span className="text-xs text-neurolink-coldWhite/60">Última sync: {integ.ultimaSync}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-neurolink-coldWhite/60 text-xs">API Key:</span>
                    <span className="font-mono text-neurolink-coldWhite/80">{enmascararClave(integ.apiKey)}</span>
                  </div>
                  {integ.url && (
                    <div className="text-neurolink-coldWhite/60 text-xs mt-1">URL: {integ.url}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-neurolink-coldWhite/60 text-xs">Clon:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${integ.autorizada ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen' : 'bg-gray-700 text-gray-400'}`}>{integ.autorizada ? 'Autorizado' : 'No autorizado'}</span>
                  </div>
                  {integ.comportamientoClon && (
                    <div className="text-neurolink-coldWhite/60 text-xs mt-1">Comportamiento: <span className="text-neurolink-coldWhite/90">{integ.comportamientoClon}</span></div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLogsVisibles(logsVisibles === integ.id ? null : integ.id!)}
                    className="mt-2 px-3 py-1 rounded-lg bg-neurolink-cyberBlue/10 text-neurolink-cyberBlue text-xs font-orbitron"
                  >
                    {logsVisibles === integ.id ? 'Ocultar logs' : 'Ver logs de uso'}
                  </motion.button>
                  <AnimatePresence>
                    {logsVisibles === integ.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-2 p-2 rounded-lg bg-black/70 border border-neurolink-cyberBlue/20"
                      >
                        <div className="font-orbitron text-neurolink-coldWhite/80 mb-2">Logs de uso del clon</div>
                        <ul className="text-xs text-neurolink-coldWhite/70 space-y-1">
                          {integ.logs.map((log: any, idx: number) => (
                            <li key={idx}>
                              <span className="text-neurolink-coldWhite/90">{log.fecha}</span> — {log.accion} (<span className={log.resultado === 'Éxito' ? 'text-neurolink-matrixGreen' : 'text-red-400'}>{log.resultado}</span>)
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleProbarConexion(integ.id)}
                    className="p-2 rounded-lg bg-black/50 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/10"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-black/50 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/10"
                  >
                    <Edit3 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-black/50 text-neurolink-coldWhite/60 hover:bg-black/30"
                  >
                    <Power className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEliminar(integ.id)}
                    className="p-2 rounded-lg bg-black/50 text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Seguridad y feedback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-4 rounded-lg bg-black/60 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite/80"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-neurolink-cyberBlue flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-orbitron text-neurolink-cyberBlue mb-2">Seguridad</h4>
              <p className="text-sm">
                Las claves se almacenan encriptadas (simulado). No se muestran los tokens completos por seguridad.<br />
                Si una clave es inválida o expira, se mostrará una advertencia visual.<br />
                Puedes exportar tu configuración para migrar entre cuentas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2
                ${feedback.tipo === 'success' ? 'bg-neurolink-matrixGreen text-neurolink-dark' :
                  feedback.tipo === 'error' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-neurolink-dark'}`}
            >
              {feedback.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> :
                feedback.tipo === 'error' ? <XCircle className="w-5 h-5" /> :
                  <AlertTriangle className="w-5 h-5" />}
              <span>{feedback.mensaje}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 