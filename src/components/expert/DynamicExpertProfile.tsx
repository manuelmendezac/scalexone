import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Rocket, 
  TrendingUp, 
  Home, 
  User, 
  GraduationCap,
  Play,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';
import { Particles } from 'react-particles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

interface Skill {
  id: string;
  nombre: string;
  nivel: number;
  tipo: 'habilidad' | 'herramienta' | 'conocimiento';
  xp: number;
}

interface TestPregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  tipo: 'habilidad' | 'herramienta' | 'conocimiento';
}

const preguntasTest: TestPregunta[] = [
  {
    id: 1,
    pregunta: '¿En qué área te consideras más fuerte?',
    opciones: ['Desarrollo', 'Diseño', 'Marketing', 'Negocios', 'Ciencia'],
    tipo: 'habilidad'
  },
  {
    id: 2,
    pregunta: '¿Qué herramientas utilizas con más frecuencia?',
    opciones: ['Herramientas de código', 'Herramientas de diseño', 'Herramientas de análisis', 'Herramientas de comunicación'],
    tipo: 'herramienta'
  },
  {
    id: 3,
    pregunta: '¿Qué tipo de conocimiento te gustaría profundizar?',
    opciones: ['Técnico', 'Creativo', 'Estratégico', 'Científico'],
    tipo: 'conocimiento'
  }
];

function DynamicExpertProfile() {
  const { modo } = useParams<{ modo: string }>();
  const navigate = useNavigate();
  const [testCompletado, setTestCompletado] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [inventario, setInventario] = useState<Skill[]>([]);
  const [mostrarAgregarSkill, setMostrarAgregarSkill] = useState(false);
  const [nuevaSkill, setNuevaSkill] = useState({ nombre: '', tipo: 'habilidad' as const });
  const [xpTotal, setXpTotal] = useState(0);
  const [nivelExperto, setNivelExperto] = useState(1);
  const [metaUsuario, setMetaUsuario] = useState<string>("");
  const [metaConfirmada, setMetaConfirmada] = useState(false);
  const [saltado, setSaltado] = useState(false);

  useEffect(() => {
    // Cargar inventario guardado
    const inventarioGuardado = localStorage.getItem('inventario_experto');
    if (inventarioGuardado) {
      setInventario(JSON.parse(inventarioGuardado));
    }
    
    // Marcar módulo como completado
    localStorage.setItem('modulo_experto_completado_fecha', new Date().toISOString().slice(0,10));
  }, []);

  const handleTestSubmit = (respuesta: string) => {
    const pregunta = preguntasTest[preguntaActual];
    setRespuestas(prev => ({
      ...prev,
      [pregunta.id]: respuesta
    }));

    if (preguntaActual < preguntasTest.length - 1) {
      setPreguntaActual(prev => prev + 1);
    } else {
      setTestCompletado(true);
      // Generar skills iniciales basadas en respuestas
      const skillsIniciales = Object.entries(respuestas).map(([id, respuesta]) => ({
        id: Math.random().toString(36).substr(2, 9),
        nombre: respuesta,
        nivel: 1,
        tipo: preguntasTest.find(p => p.id === parseInt(id))?.tipo || 'habilidad',
        xp: 0
      }));
      setInventario(skillsIniciales);
      localStorage.setItem('inventario_experto', JSON.stringify(skillsIniciales));
    }
  };

  const agregarSkill = () => {
    if (nuevaSkill.nombre.trim()) {
      const skill: Skill = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: nuevaSkill.nombre,
        nivel: 1,
        tipo: nuevaSkill.tipo,
        xp: 0
      };
      const nuevoInventario = [...inventario, skill];
      setInventario(nuevoInventario);
      localStorage.setItem('inventario_experto', JSON.stringify(nuevoInventario));
      setNuevaSkill({ nombre: '', tipo: 'habilidad' });
      setMostrarAgregarSkill(false);
    }
  };

  const mejorarSkill = (skillId: string) => {
    const nuevoInventario = inventario.map(skill => {
      if (skill.id === skillId) {
        const nuevaXp = skill.xp + 10;
        const nuevoNivel = Math.floor(nuevaXp / 100) + 1;
        return { ...skill, xp: nuevaXp, nivel: nuevoNivel };
      }
      return skill;
    });
    setInventario(nuevoInventario);
    localStorage.setItem('inventario_experto', JSON.stringify(nuevoInventario));
    
    // Actualizar XP total y nivel experto
    const xpTotal = nuevoInventario.reduce((acc, skill) => acc + skill.xp, 0);
    setXpTotal(xpTotal);
    setNivelExperto(Math.floor(xpTotal / 1000) + 1);
  };

  // Paso inicial: input de meta/interés
  if (!metaConfirmada && !saltado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 max-w-xl mx-auto w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">¿Cuál es tu meta, propósito o interés principal como experto digital?</h2>
          <input
            type="text"
            value={metaUsuario}
            onChange={e => setMetaUsuario(e.target.value)}
            placeholder="Ejemplo: Convertirme en referente de IA educativa"
            className="w-full p-4 rounded-lg bg-gray-700 text-white mb-4 text-lg"
          />
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMetaConfirmada(true)}
              disabled={!metaUsuario.trim()}
              className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 font-bold disabled:opacity-50"
            >
              Confirmar
            </button>
            <button
              onClick={() => setSaltado(true)}
              className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 font-bold"
            >
              Saltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mensaje si se saltó la meta
  const mensajeIntro = saltado
    ? "¡Perfecto! Analizaremos tu perfil y te haremos preguntas para potenciar tus habilidades."
    : metaUsuario
      ? `Tu meta: "${metaUsuario}"`
      : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Perfil Experto Dinámico</h1>
            {mensajeIntro && (
              <div className="mt-2 text-purple-300 italic text-lg animate-glow-sci-fi">{mensajeIntro}</div>
            )}
          </div>
          <button
            onClick={() => navigate('/centro-entrenamiento')}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver al Centro
          </button>
        </div>

        {!testCompletado ? (
          <div className="bg-gray-800 rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Test de Perfil Experto</h2>
            <p className="text-xl mb-4">{preguntasTest[preguntaActual].pregunta}</p>
            <div className="grid gap-4">
              {preguntasTest[preguntaActual].opciones.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => handleTestSubmit(opcion)}
                  className="p-4 bg-purple-700 rounded-lg hover:bg-purple-600 transition-colors text-left"
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tu Inventario Experto</h2>
                <button
                  onClick={() => setMostrarAgregarSkill(true)}
                  className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {inventario.map(skill => (
                  <div key={skill.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{skill.nombre}</h3>
                        <p className="text-sm text-gray-300">Nivel {skill.nivel}</p>
                      </div>
                      <button
                        onClick={() => mejorarSkill(skill.id)}
                        className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                      >
                        <StarIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(skill.xp % 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Progreso Experto</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold">Nivel Experto: {nivelExperto}</h3>
                  <p className="text-sm text-gray-300">XP Total: {xpTotal}</p>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(xpTotal % 1000) / 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Transition show={mostrarAgregarSkill}>
        <Dialog
          open={mostrarAgregarSkill}
          onClose={() => setMostrarAgregarSkill(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-gray-800 rounded-xl p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-xl font-bold">Agregar Nueva Habilidad</Dialog.Title>
                <button
                  onClick={() => setMostrarAgregarSkill(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={nuevaSkill.nombre}
                    onChange={(e) => setNuevaSkill(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full p-2 bg-gray-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={nuevaSkill.tipo}
                    onChange={(e) => setNuevaSkill(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full p-2 bg-gray-700 rounded-lg"
                  >
                    <option value="habilidad">Habilidad</option>
                    <option value="herramienta">Herramienta</option>
                    <option value="conocimiento">Conocimiento</option>
                  </select>
                </div>

                <button
                  onClick={agregarSkill}
                  className="w-full p-3 bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Agregar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default DynamicExpertProfile; 