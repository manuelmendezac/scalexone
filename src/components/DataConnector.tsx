import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Link,
  FileText,
  Youtube,
  BookOpen,
  Globe,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface FuenteDatos {
  id: string;
  tipo: 'archivo' | 'enlace' | 'api';
  nombre: string;
  url?: string;
  archivo?: File;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  progreso?: number;
  fecha: Date;
}

const TIPOS_ARCHIVO_PERMITIDOS = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX'
};

const PLATAFORMAS_SOPORTADAS = [
  { id: 'youtube', nombre: 'YouTube', icono: <Youtube className="w-5 h-5" /> },
  { id: 'medium', nombre: 'Medium', icono: <BookOpen className="w-5 h-5" /> },
  { id: 'notion', nombre: 'Notion', icono: <FileText className="w-5 h-5" /> },
  { id: 'otro', nombre: 'Otro', icono: <Globe className="w-5 h-5" /> }
];

const DataConnector = () => {
  const [fuentes, setFuentes] = useState<FuenteDatos[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoFuente, setTipoFuente] = useState<'archivo' | 'enlace' | 'api'>('archivo');
  const [url, setUrl] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const procesarArchivo = async (archivo: File) => {
    const nuevaFuente: FuenteDatos = {
      id: Date.now().toString(),
      tipo: 'archivo',
      nombre: archivo.name,
      archivo,
      estado: 'procesando',
      progreso: 0,
      fecha: new Date()
    };

    setFuentes(prev => [nuevaFuente, ...prev]);

    // Simulación de procesamiento
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFuentes(prev =>
        prev.map(f =>
          f.id === nuevaFuente.id
            ? { ...f, progreso: i, estado: i === 100 ? 'completado' : 'procesando' }
            : f
        )
      );
    }
  };

  const procesarEnlace = async () => {
    if (!url.trim()) return;

    const nuevaFuente: FuenteDatos = {
      id: Date.now().toString(),
      tipo: 'enlace',
      nombre: url,
      url,
      estado: 'procesando',
      fecha: new Date()
    };

    setFuentes(prev => [nuevaFuente, ...prev]);

    // Simulación de procesamiento
    setTimeout(() => {
      setFuentes(prev =>
        prev.map(f =>
          f.id === nuevaFuente.id ? { ...f, estado: 'completado' } : f
        )
      );
    }, 2000);

    setUrl('');
    setMostrarFormulario(false);
  };

  const conectarAPI = async () => {
    const nuevaFuente: FuenteDatos = {
      id: Date.now().toString(),
      tipo: 'api',
      nombre: 'Conexión API',
      estado: 'procesando',
      fecha: new Date()
    };

    setFuentes(prev => [nuevaFuente, ...prev]);

    // Simulación de conexión
    setTimeout(() => {
      setFuentes(prev =>
        prev.map(f =>
          f.id === nuevaFuente.id ? { ...f, estado: 'completado' } : f
        )
      );
    }, 2000);

    setMostrarFormulario(false);
  };

  const eliminarFuente = (id: string) => {
    setFuentes(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Conector de Datos
          </h2>
          <p className="text-neurolink-coldWhite/70">
            Conecta tus fuentes de información con tu IA
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 
            text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30 
            transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Fuente</span>
        </motion.button>
      </div>

      {/* Formulario de Nueva Fuente */}
      <AnimatePresence>
        {mostrarFormulario && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 rounded-xl border border-neurolink-cyberBlue/30 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron text-neurolink-coldWhite">
                Agregar Nueva Fuente
              </h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20 
                  text-neurolink-coldWhite/70 hover:text-neurolink-coldWhite"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selector de Tipo */}
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTipoFuente('archivo')}
                  className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2
                    ${tipoFuente === 'archivo'
                      ? 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/50'
                      : 'bg-neurolink-background/50 border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/50'
                    }`}
                >
                  <Upload className="w-6 h-6 text-neurolink-coldWhite" />
                  <span className="text-neurolink-coldWhite text-sm">
                    Archivo
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTipoFuente('enlace')}
                  className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2
                    ${tipoFuente === 'enlace'
                      ? 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/50'
                      : 'bg-neurolink-background/50 border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/50'
                    }`}
                >
                  <Link className="w-6 h-6 text-neurolink-coldWhite" />
                  <span className="text-neurolink-coldWhite text-sm">
                    Enlace
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTipoFuente('api')}
                  className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2
                    ${tipoFuente === 'api'
                      ? 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/50'
                      : 'bg-neurolink-background/50 border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/50'
                    }`}
                >
                  <Globe className="w-6 h-6 text-neurolink-coldWhite" />
                  <span className="text-neurolink-coldWhite text-sm">
                    API
                  </span>
                </motion.button>
              </div>

              {/* Contenido según tipo */}
              {tipoFuente === 'archivo' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-neurolink-cyberBlue/30 
                    rounded-xl p-8 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const archivo = e.dataTransfer.files[0];
                      if (archivo && TIPOS_ARCHIVO_PERMITIDOS[archivo.type as keyof typeof TIPOS_ARCHIVO_PERMITIDOS]) {
                        procesarArchivo(archivo);
                      }
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.txt,.docx"
                      onChange={(e) => {
                        const archivo = e.target.files?.[0];
                        if (archivo) {
                          procesarArchivo(archivo);
                        }
                      }}
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-neurolink-cyberBlue" />
                    <p className="text-neurolink-coldWhite mb-2">
                      Arrastra y suelta tu archivo aquí
                    </p>
                    <p className="text-neurolink-coldWhite/50 text-sm mb-4">
                      o
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 
                        text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30 
                        transition-colors"
                    >
                      Seleccionar Archivo
                    </motion.button>
                    <p className="text-neurolink-coldWhite/50 text-sm mt-4">
                      Formatos soportados: PDF, TXT, DOCX
                    </p>
                  </div>
                </div>
              )}

              {tipoFuente === 'enlace' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PLATAFORMAS_SOPORTADAS.map(plataformaItem => (
                      <motion.button
                        key={plataformaItem.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPlataforma(plataformaItem.id)}
                        className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2
                          ${plataformaItem.id === plataforma
                            ? 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/50'
                            : 'bg-neurolink-background/50 border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/50'
                          }`}
                      >
                        <div className="text-neurolink-coldWhite">
                          {plataformaItem.icono}
                        </div>
                        <span className="text-neurolink-coldWhite text-sm">
                          {plataformaItem.nombre}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="relative">
                    <Link className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neurolink-coldWhite/50" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Pega el enlace aquí..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-neurolink-background/50 
                        border border-neurolink-cyberBlue/30 text-neurolink-coldWhite 
                        placeholder-neurolink-coldWhite/50 focus:outline-none 
                        focus:border-neurolink-cyberBlue"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={procesarEnlace}
                    className="w-full py-3 rounded-xl bg-neurolink-matrixGreen/20 
                      text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30 
                      transition-colors flex items-center justify-center gap-2"
                  >
                    <Link className="w-5 h-5" />
                    <span>Conectar Enlace</span>
                  </motion.button>
                </div>
              )}

              {tipoFuente === 'api' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-neurolink-cyberBlue/10 
                    border border-neurolink-cyberBlue/30"
                  >
                    <p className="text-neurolink-coldWhite/70 text-sm">
                      La conexión con APIs externas estará disponible próximamente.
                      Esta funcionalidad permitirá integrar datos de servicios como
                      Notion, Google Drive, y más.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={conectarAPI}
                    className="w-full py-3 rounded-xl bg-neurolink-matrixGreen/20 
                      text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30 
                      transition-colors flex items-center justify-center gap-2"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Simular Conexión API</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Fuentes */}
      <div className="space-y-4">
        {fuentes.map(fuente => (
          <motion.div
            key={fuente.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 rounded-xl border border-neurolink-cyberBlue/30 
              p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {fuente.tipo === 'archivo' && <FileText className="w-5 h-5 text-neurolink-cyberBlue" />}
                {fuente.tipo === 'enlace' && <Link className="w-5 h-5 text-neurolink-cyberBlue" />}
                {fuente.tipo === 'api' && <Globe className="w-5 h-5 text-neurolink-cyberBlue" />}
                <div>
                  <h4 className="font-orbitron text-neurolink-coldWhite">
                    {fuente.nombre}
                  </h4>
                  <p className="text-sm text-neurolink-coldWhite/70">
                    {new Date(fuente.fecha).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {fuente.estado === 'procesando' && (
                  <Loader2 className="w-5 h-5 text-neurolink-cyberBlue animate-spin" />
                )}
                {fuente.estado === 'completado' && (
                  <CheckCircle className="w-5 h-5 text-neurolink-matrixGreen" />
                )}
                {fuente.estado === 'error' && (
                  <AlertCircle className="w-5 h-5 text-neurolink-cyberRed" />
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => eliminarFuente(fuente.id)}
                  className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20 
                    text-neurolink-coldWhite/70 hover:text-neurolink-coldWhite"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {fuente.estado === 'procesando' && fuente.progreso !== undefined && (
              <div className="w-full h-1 bg-neurolink-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fuente.progreso}%` }}
                  className="h-full bg-neurolink-matrixGreen"
                />
              </div>
            )}

            {fuente.url && (
              <a
                href={fuente.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-neurolink-cyberBlue 
                  hover:text-neurolink-cyberBlue/70 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver enlace</span>
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DataConnector; 