import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Plus, X, Save, Clock, Filter } from 'lucide-react';

interface RegistroCognitivo {
  id: string;
  fecha: string;
  titulo: string;
  contenido: string;
  categoria: 'reflexion' | 'tarea' | 'idea' | 'conversacion' | 'aprendizaje';
}

const CATEGORIAS = [
  { id: 'reflexion', label: 'Reflexión', color: 'text-purple-400' },
  { id: 'tarea', label: 'Tarea', color: 'text-blue-400' },
  { id: 'idea', label: 'Idea', color: 'text-green-400' },
  { id: 'conversacion', label: 'Conversación', color: 'text-yellow-400' },
  { id: 'aprendizaje', label: 'Aprendizaje', color: 'text-red-400' }
];

const REGISTROS_INICIALES: RegistroCognitivo[] = [
  {
    id: '1',
    fecha: '2024-03-20T10:30:00',
    titulo: 'Insight sobre productividad',
    contenido: 'La clave está en dividir las tareas grandes en microtareas de 25 minutos.',
    categoria: 'reflexion'
  },
  {
    id: '2',
    fecha: '2024-03-20T09:15:00',
    titulo: 'Implementar sistema de hábitos',
    contenido: 'Crear un sistema de seguimiento de hábitos diarios con recompensas.',
    categoria: 'tarea'
  },
  {
    id: '3',
    fecha: '2024-03-19T16:45:00',
    titulo: 'Nueva metodología de estudio',
    contenido: 'Combinar el método Feynman con mapas mentales para mejor retención.',
    categoria: 'aprendizaje'
  }
];

const MemoryCore = () => {
  const [registros, setRegistros] = useState<RegistroCognitivo[]>(REGISTROS_INICIALES);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState<Partial<RegistroCognitivo>>({
    titulo: '',
    contenido: '',
    categoria: 'reflexion'
  });
  const [guardando, setGuardando] = useState(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simular guardado local
    const registrosGuardados = localStorage.getItem('registrosCognitivos');
    if (registrosGuardados) {
      setRegistros(JSON.parse(registrosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('registrosCognitivos', JSON.stringify(registros));
  }, [registros]);

  const filtrarRegistros = () => {
    return registros.filter(registro => {
      const coincideCategoria = !filtroCategoria || registro.categoria === filtroCategoria;
      const coincideBusqueda = !busqueda || 
        registro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        registro.contenido.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  };

  const guardarNuevoRegistro = () => {
    if (nuevoRegistro.titulo && nuevoRegistro.contenido) {
      const registro: RegistroCognitivo = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        titulo: nuevoRegistro.titulo,
        contenido: nuevoRegistro.contenido,
        categoria: nuevoRegistro.categoria as RegistroCognitivo['categoria']
      };
      setRegistros([registro, ...registros]);
      setNuevoRegistro({ titulo: '', contenido: '', categoria: 'reflexion' });
      setMostrarNuevo(false);
    }
  };

  const simularAutoGuardado = () => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    setGuardando(true);
    autoSaveTimeout.current = setTimeout(() => {
      setGuardando(false);
    }, 1000);
  };

  const eliminarRegistro = (id: string) => {
    setRegistros(registros.filter(r => r.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-neurolink-blackGlass"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron text-neurolink-coldWhite flex items-center gap-3">
            <Brain className="w-8 h-8" />
            Núcleo de Memoria
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarNuevo(true)}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
              hover:bg-neurolink-matrixGreen/30 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Registro
          </motion.button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neurolink-coldWhite/50" size={20} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en registros..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                  text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Filter className="text-neurolink-coldWhite/50" size={20} />
            {CATEGORIAS.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltroCategoria(filtroCategoria === cat.id ? '' : cat.id)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filtroCategoria === cat.id
                    ? `${cat.color} border-current bg-current/10`
                    : 'text-neurolink-coldWhite/50 border-neurolink-coldWhite/30 hover:border-current'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtrarRegistros().map(registro => (
              <motion.div
                key={registro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-orbitron text-neurolink-coldWhite">
                        {registro.titulo}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-sm border ${
                        CATEGORIAS.find(c => c.id === registro.categoria)?.color
                      } border-current/30 bg-current/10`}>
                        {CATEGORIAS.find(c => c.id === registro.categoria)?.label}
                      </span>
                    </div>
                    <p className="text-neurolink-coldWhite/70 mb-2">
                      {registro.contenido}
                    </p>
                    <div className="flex items-center gap-2 text-neurolink-coldWhite/50 text-sm">
                      <Clock size={16} />
                      {new Date(registro.fecha).toLocaleString()}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => eliminarRegistro(registro.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-400/10"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal de Nuevo Registro */}
        <AnimatePresence>
          {mostrarNuevo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-neurolink-background rounded-lg p-6 w-full max-w-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                    Nuevo Registro Cognitivo
                  </h2>
                  <button
                    onClick={() => setMostrarNuevo(false)}
                    className="p-2 rounded-lg text-neurolink-coldWhite/50 hover:text-neurolink-coldWhite"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={nuevoRegistro.titulo}
                    onChange={(e) => {
                      setNuevoRegistro({ ...nuevoRegistro, titulo: e.target.value });
                      simularAutoGuardado();
                    }}
                    placeholder="Título del registro..."
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                      text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen"
                  />
                  <textarea
                    value={nuevoRegistro.contenido}
                    onChange={(e) => {
                      setNuevoRegistro({ ...nuevoRegistro, contenido: e.target.value });
                      simularAutoGuardado();
                    }}
                    placeholder="Contenido del registro..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                      text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen"
                  />
                  <div className="flex items-center gap-4">
                    <select
                      value={nuevoRegistro.categoria}
                      onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, categoria: e.target.value as RegistroCognitivo['categoria'] })}
                      className="px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                        text-neurolink-coldWhite focus:outline-none focus:border-neurolink-matrixGreen"
                    >
                      {CATEGORIAS.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex-1 flex items-center gap-2">
                      {guardando && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-neurolink-matrixGreen"
                        >
                          <Save size={16} />
                          <span className="text-sm">Guardando...</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMostrarNuevo(false)}
                      className="px-4 py-2 rounded-lg text-neurolink-coldWhite/50 hover:text-neurolink-coldWhite"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={guardarNuevoRegistro}
                      className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
                        hover:bg-neurolink-matrixGreen/30 transition-colors"
                    >
                      Guardar Registro
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MemoryCore; 