import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Shield, Database, Play, Edit3, Power,
  Trash2, CheckCircle, XCircle, AlertTriangle,
  Lock, Key, RefreshCw, Brain
} from 'lucide-react';
import { useStore } from '../store/store';

interface APIConnection {
  id: string;
  nombre: string;
  url: string;
  tipo: 'REST' | 'GraphQL';
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  estado: 'activa' | 'inactiva' | 'error';
  ultimoAcceso?: Date;
  autorizadaParaClon: boolean;
  instruccionesInterpretacion: string;
}

const METODOS = ['GET', 'POST', 'PUT', 'DELETE'];
const TIPOS_API = ['REST', 'GraphQL'];

const RESPUESTA_SIMULADA = {
  success: true,
  data: {
    mensaje: "Conexión exitosa",
    timestamp: new Date().toISOString(),
    status: 200
  }
};

export const NeuroAPIConnector: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [conexionActual, setConexionActual] = useState<Partial<APIConnection>>({
    tipo: 'REST',
    metodo: 'GET',
    headers: {},
    estado: 'inactiva',
    autorizadaParaClon: false,
    instruccionesInterpretacion: ''
  });
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'warning'; mensaje: string } | null>(null);
  const [probandoConexion, setProbandoConexion] = useState(false);

  const handleAgregarHeader = () => {
    if (headerKey && headerValue) {
      setConexionActual(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [headerKey]: headerValue
        }
      }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const handleGuardarConexion = () => {
    if (!conexionActual.nombre || !conexionActual.url) {
      setFeedback({
        tipo: 'error',
        mensaje: 'El nombre y la URL son obligatorios'
      });
      return;
    }

    // Aquí se implementaría la lógica real de guardado
    const nuevaConexion: APIConnection = {
      ...conexionActual as APIConnection,
      id: Date.now().toString(),
      estado: 'inactiva',
      ultimoAcceso: new Date()
    };

    setFeedback({
      tipo: 'success',
      mensaje: 'Conexión guardada exitosamente'
    });
    setMostrarFormulario(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleProbarConexion = async (id: string) => {
    setProbandoConexion(true);
    setFeedback({
      tipo: 'warning',
      mensaje: 'Probando conexión...'
    });

    // Simulamos una llamada API
    await new Promise(resolve => setTimeout(resolve, 1500));

    setProbandoConexion(false);
    setFeedback({
      tipo: 'success',
      mensaje: 'Conexión exitosa'
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neurolink-dark/80 backdrop-blur-sm rounded-xl border-2 border-neurolink-matrixGreen p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite flex items-center space-x-2">
            <Link2 className="w-8 h-8 text-neurolink-cyberBlue" />
            <span>Conector de APIs</span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue text-neurolink-dark
              font-orbitron flex items-center space-x-2"
          >
            <Database className="w-5 h-5" />
            <span>Nueva Conexión</span>
          </motion.button>
        </div>

        {/* Formulario de Conexión */}
        <AnimatePresence>
          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="space-y-4 bg-neurolink-dark/50 p-6 rounded-xl border border-neurolink-matrixGreen/30">
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Nombre de la Conexión</label>
                  <input
                    type="text"
                    value={conexionActual.nombre || ''}
                    onChange={(e) => setConexionActual({ ...conexionActual, nombre: e.target.value })}
                    className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                      text-neurolink-coldWhite"
                    placeholder="Mi API Externa"
                  />
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite mb-2">URL de la API</label>
                  <input
                    type="text"
                    value={conexionActual.url || ''}
                    onChange={(e) => setConexionActual({ ...conexionActual, url: e.target.value })}
                    className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                      text-neurolink-coldWhite"
                    placeholder="https://api.ejemplo.com/v1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neurolink-coldWhite mb-2">Tipo de API</label>
                    <div className="flex space-x-2">
                      {TIPOS_API.map(tipo => (
                        <motion.button
                          key={tipo}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConexionActual({ ...conexionActual, tipo: tipo as 'REST' | 'GraphQL' })}
                          className={`flex-1 p-2 rounded-lg font-orbitron
                            ${conexionActual.tipo === tipo
                              ? 'bg-neurolink-cyberBlue text-neurolink-dark'
                              : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-cyberBlue/30'
                            }`}
                        >
                          {tipo}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-neurolink-coldWhite mb-2">Método</label>
                    <div className="flex space-x-2">
                      {METODOS.map(metodo => (
                        <motion.button
                          key={metodo}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConexionActual({ ...conexionActual, metodo: metodo as 'GET' | 'POST' | 'PUT' | 'DELETE' })}
                          className={`flex-1 p-2 rounded-lg font-orbitron text-sm
                            ${conexionActual.metodo === metodo
                              ? 'bg-neurolink-cyberBlue text-neurolink-dark'
                              : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-cyberBlue/30'
                            }`}
                        >
                          {metodo}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Headers</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={headerKey}
                      onChange={(e) => setHeaderKey(e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                        text-neurolink-coldWhite"
                      placeholder="Key"
                    />
                    <input
                      type="text"
                      value={headerValue}
                      onChange={(e) => setHeaderValue(e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                        text-neurolink-coldWhite"
                      placeholder="Value"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAgregarHeader}
                      className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue
                        border border-neurolink-cyberBlue/30"
                    >
                      Agregar
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(conexionActual.headers || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-2 rounded-lg bg-neurolink-dark/30
                          border border-neurolink-matrixGreen/20"
                      >
                        <span className="text-neurolink-coldWhite/80">{key}: {value}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const { [key]: _, ...restHeaders } = conexionActual.headers || {};
                            setConexionActual({ ...conexionActual, headers: restHeaders });
                          }}
                          className="text-neurolink-matrixGreen/70 hover:text-neurolink-matrixGreen"
                        >
                          <XCircle className="w-5 h-5" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Instrucciones para el Clon</label>
                  <textarea
                    value={conexionActual.instruccionesInterpretacion || ''}
                    onChange={(e) => setConexionActual({ ...conexionActual, instruccionesInterpretacion: e.target.value })}
                    className="w-full h-32 p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                      text-neurolink-coldWhite resize-none"
                    placeholder="Describe cómo el clon debe interpretar y utilizar los datos de esta API..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={conexionActual.autorizadaParaClon || false}
                    onChange={(e) => setConexionActual({ ...conexionActual, autorizadaParaClon: e.target.checked })}
                    className="w-4 h-4 rounded border-neurolink-matrixGreen/30"
                  />
                  <label className="text-neurolink-coldWhite flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-neurolink-cyberBlue" />
                    <span>Autorizar acceso al clon</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMostrarFormulario(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                      border border-neurolink-matrixGreen/30"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGuardarConexion}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark
                      font-orbitron flex items-center space-x-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Guardar Conexión</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Conexiones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-orbitron text-neurolink-coldWhite">
              Conexiones Activas
            </h3>
            <div className="flex items-center space-x-2 text-neurolink-coldWhite/60">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Última sincronización: hace 5 minutos</span>
            </div>
          </div>

          {/* Ejemplo de conexión */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-neurolink-dark/50 border border-neurolink-matrixGreen/30"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-orbitron text-neurolink-coldWhite flex items-center space-x-2">
                  <Database className="w-5 h-5 text-neurolink-cyberBlue" />
                  <span>API de Ejemplo</span>
                </h4>
                <p className="text-neurolink-coldWhite/60 text-sm mt-1">
                  https://api.ejemplo.com/v1
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-neurolink-cyberBlue/20
                    text-neurolink-cyberBlue border border-neurolink-cyberBlue/30"
                  >
                    REST
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-neurolink-matrixGreen/20
                    text-neurolink-matrixGreen border border-neurolink-matrixGreen/30"
                  >
                    GET
                  </span>
                  <span className="text-neurolink-coldWhite/60 text-xs">
                    Último acceso: hace 2 horas
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleProbarConexion('1')}
                  className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-cyberBlue
                    hover:bg-neurolink-cyberBlue/10"
                  disabled={probandoConexion}
                >
                  <Play className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
                    hover:bg-neurolink-matrixGreen/10"
                >
                  <Edit3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite/60
                    hover:bg-neurolink-dark/30"
                >
                  <Power className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-neurolink-dark/50 text-red-400
                    hover:bg-red-400/10"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Mensaje de Seguridad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 rounded-lg bg-neurolink-dark/30 border border-neurolink-cyberBlue/30
              text-neurolink-coldWhite/80"
          >
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-neurolink-cyberBlue flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-orbitron text-neurolink-cyberBlue mb-2">Seguridad</h4>
                <p className="text-sm">
                  Los tokens y claves de API se almacenan de forma segura y encriptada.
                  No compartas información sensible en las instrucciones para el clon.
                  Las conexiones inactivas se desactivarán automáticamente después de 30 días sin uso.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

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