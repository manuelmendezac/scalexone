import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trash2, Edit2, FileText, Calendar, X, Save } from 'lucide-react';

interface Memoria {
  id: string;
  tipo: string;
  contenido: string;
  fecha: string;
  archivos?: {
    nombre: string;
    tipo: string;
  }[];
}

interface MemoriaEditando {
  id: string;
  contenido: string;
}

const categorias = [
  'Marketing Digital',
  'Bienes Raíces',
  'Medicina',
  'Programación',
  'Finanzas',
  'Educación',
  'Diseño',
  'Negocios',
  'Otro'
];

const MemoriaClon = () => {
  const [memorias, setMemorias] = useState<Memoria[]>([
    {
      id: '1',
      tipo: 'Marketing Digital',
      contenido: 'Estrategias de marketing en redes sociales para empresas B2B',
      fecha: '2024-03-15',
      archivos: [
        { nombre: 'estrategias-marketing.pdf', tipo: 'pdf' }
      ]
    },
    {
      id: '2',
      tipo: 'Programación',
      contenido: 'Patrones de diseño en React y TypeScript',
      fecha: '2024-03-14',
      archivos: [
        { nombre: 'patrones-react.docx', tipo: 'docx' },
        { nombre: 'ejemplos.txt', tipo: 'txt' }
      ]
    }
  ]);

  const [memoriaEditando, setMemoriaEditando] = useState<MemoriaEditando | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  const handleEliminar = (id: string) => {
    setMemorias(prev => prev.filter(memoria => memoria.id !== id));
  };

  const handleEditar = (memoria: Memoria) => {
    setMemoriaEditando({
      id: memoria.id,
      contenido: memoria.contenido
    });
  };

  const handleGuardarEdicion = () => {
    if (memoriaEditando) {
      setMemorias(prev =>
        prev.map(memoria =>
          memoria.id === memoriaEditando.id
            ? { ...memoria, contenido: memoriaEditando.contenido }
            : memoria
        )
      );
      setMemoriaEditando(null);
    }
  };

  const memoriasFiltradas = filtroCategoria
    ? memorias.filter(memoria => memoria.tipo === filtroCategoria)
    : memorias;

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
        <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-6 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neurolink-matrixGreen" />
          Memoria del Clon
        </h2>

        {/* Filtros de Categoría */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltroCategoria(null)}
              className={`px-3 py-1 rounded-lg text-sm transition-all
                ${!filtroCategoria
                  ? 'bg-neurolink-matrixGreen/20 text-neurolink-coldWhite border-2 border-neurolink-matrixGreen'
                  : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite'
                }
              `}
            >
              Todos
            </motion.button>
            {categorias.map(categoria => (
              <motion.button
                key={categoria}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltroCategoria(categoria)}
                className={`px-3 py-1 rounded-lg text-sm transition-all
                  ${filtroCategoria === categoria
                    ? 'bg-neurolink-matrixGreen/20 text-neurolink-coldWhite border-2 border-neurolink-matrixGreen'
                    : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite'
                  }
                `}
              >
                {categoria}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Lista de Memorias */}
        <div className="space-y-4">
          {memoriasFiltradas.map((memoria) => (
            <motion.div
              key={memoria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-black/20 border-2 border-neurolink-cyberBlue/30
                hover:border-neurolink-matrixGreen/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-futuristic text-neurolink-coldWhite mb-1">
                    {memoria.tipo}
                  </h3>
                  <div className="flex items-center text-neurolink-coldWhite/60 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatFecha(memoria.fecha)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEditar(memoria)}
                    className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20
                      text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEliminar(memoria.id)}
                    className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20
                      text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <p className="text-neurolink-coldWhite/80 mb-3">
                {memoria.contenido}
              </p>

              {memoria.archivos && memoria.archivos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {memoria.archivos.map((archivo, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-1 rounded-lg
                        bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30"
                    >
                      <FileText className="w-4 h-4 text-neurolink-cyberBlue" />
                      <span className="text-neurolink-coldWhite/60 text-sm">
                        {archivo.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Modal de Edición */}
        <AnimatePresence>
          {memoriaEditando && (
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
                className="bg-neurolink-background rounded-xl p-6 border-2 border-neurolink-cyberBlue/30
                  w-full max-w-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-futuristic text-neurolink-coldWhite">
                    Editar Memoria
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMemoriaEditando(null)}
                    className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20
                      text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <textarea
                  value={memoriaEditando.contenido}
                  onChange={(e) => setMemoriaEditando(prev => ({
                    ...prev!,
                    contenido: e.target.value
                  }))}
                  className="w-full h-32 bg-black/20 border-2 border-neurolink-cyberBlue/30
                    rounded-lg p-3 text-neurolink-coldWhite placeholder-neurolink-coldWhite/40
                    focus:outline-none focus:border-neurolink-matrixGreen transition-all
                    resize-none mb-4"
                />

                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMemoriaEditando(null)}
                    className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20
                      text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30
                      transition-all"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGuardarEdicion}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20
                      text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/30
                      transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoriaClon; 