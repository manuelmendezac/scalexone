import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile,
  Frown,
  Meh,
  Heart,
  Brain,
  Target,
  Calendar,
  BarChart2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Emocion {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  color: string;
  valor: number;
  descripcion: string;
}

interface RegistroEmocional {
  id: string;
  emocion: Emocion;
  intensidad: number;
  fecha: Date;
  notas: string;
}

const EMOCIONES: Emocion[] = [
  {
    id: 'feliz',
    nombre: 'Feliz',
    icono: <Smile className="w-6 h-6" />,
    color: 'text-neurolink-cyberGreen',
    valor: 5,
    descripcion: 'Sentimiento de alegría y satisfacción'
  },
  {
    id: 'triste',
    nombre: 'Triste',
    icono: <Frown className="w-6 h-6" />,
    color: 'text-neurolink-cyberBlue',
    valor: 2,
    descripcion: 'Sentimiento de melancolía o desánimo'
  },
  {
    id: 'neutral',
    nombre: 'Neutral',
    icono: <Meh className="w-6 h-6" />,
    color: 'text-neurolink-cyberYellow',
    valor: 3,
    descripcion: 'Estado de calma y equilibrio'
  },
  {
    id: 'energetico',
    nombre: 'Energético',
    icono: <Heart className="w-6 h-6" />,
    color: 'text-neurolink-cyberRed',
    valor: 4,
    descripcion: 'Lleno de energía y motivación'
  },
  {
    id: 'frustrado',
    nombre: 'Frustrado',
    icono: <AlertCircle className="w-6 h-6" />,
    color: 'text-neurolink-cyberPurple',
    valor: 1,
    descripcion: 'Sentimiento de bloqueo o dificultad'
  }
];

const MENSAJES_POSITIVOS = [
  "¡Excelente estado de ánimo! Aprovecha esta energía.",
  "Tu equilibrio emocional es notable. Sigue así.",
  "La calma que muestras es perfecta para el aprendizaje.",
  "Tu energía positiva es contagiosa. ¡Sigue brillando!",
  "Estás en un gran momento para alcanzar tus metas."
];

const MENSAJES_NEGATIVOS = [
  "Recuerda que cada día es una nueva oportunidad.",
  "La frustración es temporal, tu potencial es permanente.",
  "Tómate un momento para respirar y recargar energías.",
  "Pequeños pasos llevan a grandes cambios.",
  "Tu bienestar es prioridad. ¿Qué te ayudaría ahora?"
];

const EmotionTuner = () => {
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<Emocion | null>(null);
  const [intensidad, setIntensidad] = useState(5);
  const [notas, setNotas] = useState('');
  const [registros, setRegistros] = useState<RegistroEmocional[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [mensajeSistema, setMensajeSistema] = useState<string | null>(null);

  // Cargar registros del localStorage al iniciar
  useEffect(() => {
    const registrosGuardados = localStorage.getItem('registrosEmocionales');
    if (registrosGuardados) {
      setRegistros(JSON.parse(registrosGuardados));
    }
  }, []);

  // Guardar registros en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('registrosEmocionales', JSON.stringify(registros));
  }, [registros]);

  const registrarEmocion = () => {
    if (!emocionSeleccionada) return;

    const nuevoRegistro: RegistroEmocional = {
      id: Date.now().toString(),
      emocion: emocionSeleccionada,
      intensidad,
      fecha: new Date(),
      notas
    };

    setRegistros(prev => [nuevoRegistro, ...prev]);
    setEmocionSeleccionada(null);
    setIntensidad(5);
    setNotas('');

    // Generar mensaje del sistema
    const mensajes = emocionSeleccionada.valor >= 3 ? MENSAJES_POSITIVOS : MENSAJES_NEGATIVOS;
    setMensajeSistema(mensajes[Math.floor(Math.random() * mensajes.length)]);

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => setMensajeSistema(null), 5000);
  };

  const datosGrafico = {
    labels: registros.slice(0, 7).map(r => 
      new Date(r.fecha).toLocaleDateString('es-ES', { weekday: 'short' })
    ).reverse(),
    datasets: [
      {
        label: 'Estado Emocional',
        data: registros.slice(0, 7).map(r => r.emocion.valor * r.intensidad / 5).reverse(),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Sintonizador Emocional
          </h2>
          <p className="text-neurolink-coldWhite/70">
            Registra y analiza tu estado emocional
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarGrafico(!mostrarGrafico)}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 
              text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
              transition-colors flex items-center gap-2"
          >
            {mostrarGrafico ? <Calendar className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
            <span>{mostrarGrafico ? 'Ver Registros' : 'Ver Gráfico'}</span>
          </motion.button>
        </div>
      </div>

      {/* Mensaje del Sistema */}
      <AnimatePresence>
        {mensajeSistema && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-neurolink-cyberBlue/20 
              border border-neurolink-cyberBlue/30"
          >
            <div className="flex items-center gap-2 text-neurolink-cyberBlue">
              <Brain className="w-5 h-5" />
              <p>{mensajeSistema}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector de Emociones */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {EMOCIONES.map(emocion => (
          <motion.button
            key={emocion.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEmocionSeleccionada(emocion)}
            className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2
              ${emocionSeleccionada?.id === emocion.id
                ? 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/50'
                : 'bg-neurolink-background/50 border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/50'
              }`}
          >
            <div className={`p-2 rounded-lg ${emocion.color}`}>
              {emocion.icono}
            </div>
            <span className="text-neurolink-coldWhite text-sm">
              {emocion.nombre}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Intensidad y Notas */}
      {emocionSeleccionada && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-neurolink-coldWhite/70 mb-2">
              Intensidad: {intensidad}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensidad}
              onChange={(e) => setIntensidad(Number(e.target.value))}
              className="w-full h-2 bg-neurolink-background/50 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-neurolink-cyberBlue"
            />
          </div>

          <div>
            <label className="block text-sm text-neurolink-coldWhite/70 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="¿Qué te llevó a sentirte así?"
              className="w-full px-4 py-2 rounded-lg bg-neurolink-background/50 
                border border-neurolink-cyberBlue/30 text-neurolink-coldWhite 
                placeholder-neurolink-coldWhite/50 focus:outline-none 
                focus:border-neurolink-cyberBlue min-h-[100px] resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={registrarEmocion}
            className="w-full py-3 rounded-xl bg-neurolink-cyberBlue/20 
              text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
              transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Registrar Emoción</span>
          </motion.button>
        </motion.div>
      )}

      {/* Visualización */}
      {mostrarGrafico ? (
        <div className="bg-neurolink-background/50 rounded-xl border border-neurolink-cyberBlue/30 p-4">
          <h3 className="font-orbitron text-neurolink-coldWhite mb-4">
            Tendencias Emocionales
          </h3>
          <Line data={datosGrafico} options={opcionesGrafico} />
        </div>
      ) : (
        <div className="space-y-4">
          {registros.map(registro => (
            <motion.div
              key={registro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neurolink-background/50 rounded-xl border border-neurolink-cyberBlue/30 
                p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${registro.emocion.color}`}>
                    {registro.emocion.icono}
                  </div>
                  <div>
                    <h4 className="font-orbitron text-neurolink-coldWhite">
                      {registro.emocion.nombre}
                    </h4>
                    <p className="text-sm text-neurolink-coldWhite/70">
                      {new Date(registro.fecha).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neurolink-coldWhite/70">
                    Intensidad: {registro.intensidad}
                  </span>
                  {registro.emocion.valor >= 3 ? (
                    <TrendingUp className="w-4 h-4 text-neurolink-cyberGreen" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-neurolink-cyberRed" />
                  )}
                </div>
              </div>
              {registro.notas && (
                <p className="text-neurolink-coldWhite/70 text-sm">
                  {registro.notas}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionTuner; 