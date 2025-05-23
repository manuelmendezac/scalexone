import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ZoomIn, ZoomOut, Link2, FileText, Star } from 'lucide-react';
import { useStore } from '../store/store';

const NODOS_EJEMPLO = [
  {
    id: '1',
    titulo: 'Neuroplasticidad',
    descripcion: 'Capacidad del cerebro para formar y reorganizar conexiones sinápticas.',
    tipo: 'concepto' as const,
    importancia: 'alto' as const,
    posicion: { x: 100, y: 100 },
    color: '#00ff9d'
  },
  {
    id: '2',
    titulo: 'Aprendizaje Adaptativo',
    descripcion: 'Proceso de ajuste continuo basado en retroalimentación.',
    tipo: 'idea' as const,
    importancia: 'medio' as const,
    posicion: { x: 300, y: 200 },
    color: '#00b8ff'
  },
  {
    id: '3',
    titulo: 'Memoria de Trabajo',
    descripcion: 'Sistema cognitivo para mantener y manipular información temporal.',
    tipo: 'concepto' as const,
    importancia: 'alto' as const,
    posicion: { x: 200, y: 300 },
    color: '#00ff9d'
  }
];

const CONEXIONES_EJEMPLO = [
  {
    id: '1',
    origen: '1',
    destino: '2',
    fuerza: 0.8,
    tipo: 'directa' as const
  },
  {
    id: '2',
    origen: '2',
    destino: '3',
    fuerza: 0.6,
    tipo: 'indirecta' as const
  }
];

export const SynapseMap: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<string | null>(null);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    knowledgeBase,
    nodosSinapsis,
    conexionesSinapsis,
    agregarNodoSinapsis,
    agregarConexionSinapsis
  } = useStore();

  // Generar nodos y conexiones de ejemplo si no hay datos
  useEffect(() => {
    if (nodosSinapsis.length === 0) {
      NODOS_EJEMPLO.forEach(nodo => agregarNodoSinapsis(nodo));
      CONEXIONES_EJEMPLO.forEach(conexion => agregarConexionSinapsis(conexion));
    }
  }, [nodosSinapsis.length]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handleNodeClick = (nodoId: string) => {
    setNodoSeleccionado(nodoId);
    setMostrarPanel(true);
  };

  const nodoActual = nodosSinapsis.find(n => n.id === nodoSeleccionado);
  const conexionesRelacionadas = conexionesSinapsis.filter(
    c => c.origen === nodoSeleccionado || c.destino === nodoSeleccionado
  );

  return (
    <div className="w-full h-full relative bg-neurolink-dark/50 backdrop-blur-sm rounded-lg border border-neurolink-neonBlue overflow-hidden">
      {/* Controles de zoom */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleZoom(0.1)}
          className="p-2 bg-neurolink-dark/50 text-neurolink-neonBlue rounded-lg 
            hover:bg-neurolink-neonBlue/10 transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleZoom(-0.1)}
          className="p-2 bg-neurolink-dark/50 text-neurolink-neonBlue rounded-lg 
            hover:bg-neurolink-neonBlue/10 transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Mapa de sinapsis */}
      <div
        ref={containerRef}
        className="w-full h-full relative"
        style={{
          transform: `scale(${zoom})`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Conexiones */}
        <svg className="absolute inset-0 w-full h-full">
          {conexionesSinapsis.map(conexion => {
            const origen = nodosSinapsis.find(n => n.id === conexion.origen);
            const destino = nodosSinapsis.find(n => n.id === conexion.destino);
            if (!origen || !destino) return null;

            return (
              <motion.path
                key={conexion.id}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                d={`M ${origen.posicion.x} ${origen.posicion.y} L ${destino.posicion.x} ${destino.posicion.y}`}
                stroke={conexion.tipo === 'directa' ? '#00ff9d' : '#00b8ff'}
                strokeWidth={2 * conexion.fuerza}
                fill="none"
                className="neural-glow"
              />
            );
          })}
        </svg>

        {/* Nodos */}
        {nodosSinapsis.map(nodo => (
          <motion.div
            key={nodo.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className={`absolute w-8 h-8 rounded-full cursor-pointer
              ${nodoSeleccionado === nodo.id ? 'ring-2 ring-neurolink-matrixGreen' : ''}`}
            style={{
              left: nodo.posicion.x,
              top: nodo.posicion.y,
              backgroundColor: nodo.color,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handleNodeClick(nodo.id)}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-neurolink-dark" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Panel lateral */}
      <AnimatePresence>
        {mostrarPanel && nodoActual && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-80 h-full bg-neurolink-dark/90 
              border-l border-neurolink-neonBlue p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-orbitron text-neurolink-neonBlue">{nodoActual.titulo}</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMostrarPanel(false)}
                className="text-neurolink-neonBlue/70 hover:text-neurolink-neonBlue"
              >
                ×
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-neurolink-coldWhite/70">{nodoActual.descripcion}</p>
              </div>

              <div>
                <h4 className="font-orbitron text-sm text-neurolink-matrixGreen mb-2">
                  Importancia
                </h4>
                <div className="flex space-x-2">
                  {['bajo', 'medio', 'alto'].map(nivel => (
                    <div
                      key={nivel}
                      className={`w-3 h-3 rounded-full ${
                        nodoActual.importancia === nivel
                          ? 'bg-neurolink-matrixGreen'
                          : 'bg-neurolink-neonBlue/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {nodoActual.fuente && (
                <div>
                  <h4 className="font-orbitron text-sm text-neurolink-matrixGreen mb-2">
                    Fuente
                  </h4>
                  <div className="flex items-center space-x-2 text-neurolink-coldWhite/70">
                    <FileText className="w-4 h-4" />
                    <span>{nodoActual.fuente.nombre}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-orbitron text-sm text-neurolink-matrixGreen mb-2">
                  Conexiones Relacionadas
                </h4>
                <div className="space-y-2">
                  {conexionesRelacionadas.map(conexion => {
                    const nodoRelacionado = nodosSinapsis.find(
                      n => n.id === (conexion.origen === nodoActual.id ? conexion.destino : conexion.origen)
                    );
                    if (!nodoRelacionado) return null;

                    return (
                      <motion.div
                        key={conexion.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-2 bg-neurolink-dark/50 border border-neurolink-neonBlue/30 
                          rounded-lg cursor-pointer"
                        onClick={() => handleNodeClick(nodoRelacionado.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <Link2 className="w-4 h-4 text-neurolink-matrixGreen" />
                          <span className="text-neurolink-coldWhite/70">
                            {nodoRelacionado.titulo}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 