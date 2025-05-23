import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  Upload,
  FileText,
  BookOpen,
  Brain,
  X,
  File,
  FileType,
  FileSpreadsheet,
  FileCode,
  Tag,
  Clock,
  Download,
  MessageSquare,
  Link,
  Sparkles,
  BookMarked,
  Lightbulb
} from 'lucide-react';

interface Documento {
  id: string;
  titulo: string;
  tipo: 'pdf' | 'docx' | 'txt' | 'csv';
  fecha: Date;
  tamaño: number;
  etiquetas: string[];
  categoria: string;
  url: string;
  esRecomendado?: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  color: string;
}

const CATEGORIAS: Categoria[] = [
  { id: 'ventas', nombre: 'Ventas', icono: <Sparkles className="w-5 h-5" />, color: 'text-neurolink-cyberBlue' },
  { id: 'productividad', nombre: 'Productividad', icono: <Lightbulb className="w-5 h-5" />, color: 'text-neurolink-cyberGreen' },
  { id: 'finanzas', nombre: 'Finanzas', icono: <FileSpreadsheet className="w-5 h-5" />, color: 'text-neurolink-cyberPurple' },
  { id: 'tecnologia', nombre: 'Tecnología', icono: <FileCode className="w-5 h-5" />, color: 'text-neurolink-cyberYellow' },
  { id: 'marketing', nombre: 'Marketing', icono: <BookMarked className="w-5 h-5" />, color: 'text-neurolink-cyberRed' }
];

const RECURSOS_RECOMENDADOS: Record<string, Documento[]> = {
  visionario: [
    {
      id: '1',
      titulo: 'Guía de Validación de Startups',
      tipo: 'pdf',
      fecha: new Date(),
      tamaño: 2.5,
      etiquetas: ['startup', 'validación', 'MVP'],
      categoria: 'ventas',
      url: '/recursos/guia-validacion.pdf',
      esRecomendado: true
    },
    {
      id: '2',
      titulo: 'Estrategias de Crecimiento Exponencial',
      tipo: 'docx',
      fecha: new Date(),
      tamaño: 1.8,
      etiquetas: ['crecimiento', 'estrategia', 'escalabilidad'],
      categoria: 'productividad',
      url: '/recursos/estrategias-crecimiento.docx',
      esRecomendado: true
    }
  ],
  consultor_ia: [
    {
      id: '3',
      titulo: 'Ética en IA: Guía Práctica',
      tipo: 'pdf',
      fecha: new Date(),
      tamaño: 3.2,
      etiquetas: ['ética', 'IA', 'responsabilidad'],
      categoria: 'tecnologia',
      url: '/recursos/etica-ia.pdf',
      esRecomendado: true
    }
  ]
};

const KnowledgeVault = () => {
  const { modo } = useParams<{ modo: string }>();
  const [documentos, setDocumentos] = useState<Documento[]>(RECURSOS_RECOMENDADOS[modo || ''] || []);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
  const [mostrarSubida, setMostrarSubida] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !['pdf', 'docx', 'txt', 'csv'].includes(extension)) {
        alert('Tipo de archivo no soportado');
        return;
      }

      const nuevoDocumento: Documento = {
        id: Date.now().toString(),
        titulo: file.name,
        tipo: extension as 'pdf' | 'docx' | 'txt' | 'csv',
        fecha: new Date(),
        tamaño: file.size / (1024 * 1024), // Convertir a MB
        etiquetas: [],
        categoria: 'productividad', // Categoría por defecto
        url: URL.createObjectURL(file)
      };

      setDocumentos(prev => [...prev, nuevoDocumento]);
    });
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'docx': return <File className="w-5 h-5" />;
      case 'txt': return <FileType className="w-5 h-5" />;
      case 'csv': return <FileSpreadsheet className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const documentosFiltrados = categoriaActiva === 'todas'
    ? documentos
    : documentos.filter(doc => doc.categoria === categoriaActiva);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Bóveda de Conocimiento
          </h2>
          <p className="text-neurolink-coldWhite/70">
            Almacena y gestiona tu conocimiento personal
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMostrarSubida(true)}
          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 
            text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
            transition-colors flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span>Subir Documento</span>
        </motion.button>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCategoriaActiva('todas')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap
            ${categoriaActiva === 'todas'
              ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue'
              : 'bg-neurolink-background/50 text-neurolink-coldWhite/70 hover:bg-neurolink-cyberBlue/10'
            }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Todos</span>
        </motion.button>
        {CATEGORIAS.map(categoria => (
          <motion.button
            key={categoria.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategoriaActiva(categoria.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap
              ${categoriaActiva === categoria.id
                ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue'
                : 'bg-neurolink-background/50 text-neurolink-coldWhite/70 hover:bg-neurolink-cyberBlue/10'
              }`}
          >
            {categoria.icono}
            <span>{categoria.nombre}</span>
          </motion.button>
        ))}
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {documentosFiltrados.map(doc => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-neurolink-background/50 rounded-xl border border-neurolink-cyberBlue/30 
                p-4 space-y-4 hover:border-neurolink-cyberBlue/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20">
                    {getIconoTipo(doc.tipo)}
                  </div>
                  <div>
                    <h3 className="font-orbitron text-neurolink-coldWhite">
                      {doc.titulo}
                    </h3>
                    <p className="text-sm text-neurolink-coldWhite/70">
                      {doc.tipo.toUpperCase()} • {doc.tamaño.toFixed(1)} MB
                    </p>
                  </div>
                </div>
                {doc.esRecomendado && (
                  <span className="px-2 py-1 rounded-full text-xs bg-neurolink-cyberBlue/20 
                    text-neurolink-cyberBlue">
                    Recomendado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {doc.etiquetas.map(etiqueta => (
                  <span
                    key={etiqueta}
                    className="px-2 py-1 rounded-full text-xs bg-neurolink-background/50 
                      text-neurolink-coldWhite/70"
                  >
                    {etiqueta}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-neurolink-coldWhite/70">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{doc.fecha.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{CATEGORIAS.find(c => c.id === doc.categoria)?.nombre}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-neurolink-cyberBlue/20 
                    text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
                    transition-colors flex items-center justify-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">Entrenar IA</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-neurolink-background/50 
                    text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20 
                    transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Descargar</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal de Subida */}
      <AnimatePresence>
        {mostrarSubida && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 
                p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron text-neurolink-coldWhite">
                  Subir Documento
                </h3>
                <button
                  onClick={() => setMostrarSubida(false)}
                  className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20 
                    text-neurolink-coldWhite/70 hover:text-neurolink-coldWhite"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neurolink-cyberBlue/30 
                    rounded-lg p-8 text-center cursor-pointer hover:border-neurolink-cyberBlue/50 
                    transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-neurolink-cyberBlue" />
                  <p className="text-neurolink-coldWhite">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-neurolink-coldWhite/70 mt-1">
                    PDF, DOCX, TXT, CSV (máx. 10MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMostrarSubida(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-background/50 
                      text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20 
                      transition-colors"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeVault; 