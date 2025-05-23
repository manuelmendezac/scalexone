import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';
import { Brain, Command } from 'lucide-react';
import AIConsole from './AIConsole';
import ImpactGoals from './ImpactGoals';

interface Node {
  id: string;
  label: string;
  type: 'skill' | 'knowledge' | 'profile';
  x: number;
  y: number;
  connections: string[];
}

interface Connection {
  id: string;
  source: string;
  target: string;
}

const CognitiveDashboard = () => {
  const { 
    userName, 
    userProfile, 
    skills, 
    knowledgeSources,
    messages,
    cognitiveProfile
  } = useNeuroState();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [trainingLevel, setTrainingLevel] = useState(0);

  // Calcular nivel de entrenamiento basado en interacciones
  useEffect(() => {
    const messageCount = messages.length;
    const skillCount = skills.length;
    const knowledgeCount = knowledgeSources.length;
    
    const total = (messageCount * 0.4) + (skillCount * 0.3) + (knowledgeCount * 0.3);
    setTrainingLevel(Math.min(Math.round((total / 100) * 100), 100));
  }, [messages, skills, knowledgeSources]);

  // Generar nodos y conexiones para el mapa mental
  useEffect(() => {
    const newNodes: Node[] = [];
    const newConnections: Connection[] = [];

    // Agregar nodos de habilidades
    skills.forEach((skill, index) => {
      const angle = (index / skills.length) * 2 * Math.PI;
      const radius = 200;
      newNodes.push({
        id: skill.id,
        label: skill.name,
        type: 'skill',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        connections: []
      });
    });

    // Agregar nodos de conocimiento
    knowledgeSources.forEach((source, index) => {
      const angle = (index / knowledgeSources.length) * 2 * Math.PI;
      const radius = 150;
      newNodes.push({
        id: source.id,
        label: source.name,
        type: 'knowledge',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        connections: []
      });
    });

    // Crear conexiones entre nodos relacionados
    skills.forEach(skill => {
      knowledgeSources.forEach(source => {
        if (source.category === skill.category) {
          newConnections.push({
            id: `${skill.id}-${source.id}`,
            source: skill.id,
            target: source.id
          });
        }
      });
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, [skills, knowledgeSources]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'skill':
        return 'text-neurolink-matrixGreen';
      case 'knowledge':
        return 'text-neurolink-cyberBlue';
      case 'profile':
        return 'text-neurolink-coldWhite';
      default:
        return 'text-neurolink-coldWhite';
    }
  };

  const getTrainingStatus = (level: number) => {
    if (level < 30) return 'Inicial';
    if (level < 70) return 'En Entrenamiento';
    return 'Avanzado';
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-4 md:p-6">
      {/* Barra Superior */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border-2 border-neurolink-cyberBlue/30">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-8 h-8 text-neurolink-matrixGreen" />
            <h1 className="text-2xl md:text-3xl font-futuristic text-neurolink-coldWhite">
              Centro de Mando de tu Mente
            </h1>
            <Command className="w-8 h-8 text-neurolink-cyberBlue" />
          </div>
          <p className="text-center text-neurolink-coldWhite/60 mt-2">
            Tablero Cognitivo de NeuroLink AI
          </p>
        </div>
      </motion.div>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AIConsole - Izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="h-[600px] lg:h-[calc(100vh-200px)]"
        >
          <AIConsole />
        </motion.div>

        {/* ImpactGoals - Derecha */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="h-[600px] lg:h-[calc(100vh-200px)] overflow-y-auto"
        >
          <ImpactGoals />
        </motion.div>
      </div>

      {/* Sección Inferior */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
          <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
            Estado del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30">
              <h3 className="text-neurolink-coldWhite font-futuristic mb-2">
                Memoria Activa
              </h3>
              <p className="text-neurolink-coldWhite/60">
                Procesando y analizando datos cognitivos...
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neurolink-matrixGreen/10 border border-neurolink-matrixGreen/30">
              <h3 className="text-neurolink-coldWhite font-futuristic mb-2">
                Objetivos Diarios
              </h3>
              <p className="text-neurolink-coldWhite/60">
                Seguimiento de metas y progreso...
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30">
              <h3 className="text-neurolink-coldWhite font-futuristic mb-2">
                Análisis Cognitivo
              </h3>
              <p className="text-neurolink-coldWhite/60">
                Evaluando patrones de aprendizaje...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CognitiveDashboard; 