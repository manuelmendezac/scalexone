import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase';
import { BookOpen, Users, Award, PlayCircle, Star, ArrowLeft, ShoppingCart, CheckCircle, Info, Calendar, Globe, Users as UsersIcon, Video, Radio, BookOpenCheck, BellRing, Globe2, ShieldCheck, XCircle } from 'lucide-react';

// Estructura de datos que esperamos de la BD
// Unificada para cursos y servicios del marketplace
type ProductoMarketplace = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  tipo_pago?: 'pago_unico' | 'suscripcion';
  categoria?: string;
  instructor?: string;
  caracteristicas?: string[];
  nivel?: string;
  duracion_horas?: number;
  estudiantes?: number;
  rating?: number;
  // --- CAMPOS PARA LA CARTA DE VENTAS (a definir) ---
  portada_datos?: { // datos de la sección HERO
    logo_url?: string;
    imagen_lateral_url?: string;
    video_url?: string;
    titulo?: string; // Puede sobreescribir el titulo principal
    descripcion?: string; // Puede sobreescribir la desc principal
    calificacion?: number;
    num_calificaciones?: number;
    boton_principal_texto?: string;
  };
  modulos_datos?: { // sección de Módulos o Temario
    titulo_seccion?: string;
    items: {
      icono_url?: string;
      titulo: string;
      descripcion: string;
      subtitulo?: string;
    }[];
  };
  comunidad_datos?: { // sección de Comunidad
    titulo_seccion?: string;
    descripcion?: string;
    imagen_fondo_url?: string;
    links: {
      texto: string;
      url: string;
      color?: string; // ej: 'red', 'green', 'blue'
    }[];
  };
  eventos_datos?: { // sección de Eventos en Vivo
    titulo_seccion?: string;
    descripcion?: string;
    imagen_fondo_url?: string;
    eventos: {
      titulo: string;
      dia: string;
      hora: string;
      plataforma: string;
    }[];
  };
  // etc... podríamos añadir más secciones como "bonus", "garantia", "faq"
};


const PaginaProductoMarketplace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<ProductoMarketplace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Función para obtener el icono de la plataforma (simplificada)
  const getPlataformaIcon = (plataforma: string) => {
    const p = plataforma?.toLowerCase() || '';
    if (p.includes('zoom')) return <UsersIcon className="text-blue-500" size={22} />;
    if (p.includes('meet')) return <UsersIcon className="text-green-500" size={22} />;
    return <Globe className="text-gray-400" size={22} />;
  };

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError("No se proporcionó un ID de producto.");
        return;
    }

    const fetchProducto = async () => {
      setLoading(true);
      setError(null);

      // Intenta buscar primero en cursos
      let { data: dataCurso, error: errorCurso } = await supabase
        .from('cursos_marketplace')
        .select('*')
        .eq('id', id)
        .single();

      if (dataCurso) {
        setProducto(dataCurso);
        setLoading(false);
        return;
      }

      // Si no se encontró en cursos, busca en servicios
      let { data: dataServicio, error: errorServicio } = await supabase
        .from('servicios_marketplace')
        .select('*')
        .eq('id', id)
        .single();

      if (dataServicio) {
        setProducto(dataServicio);
        setLoading(false);
        return;
      }
      
      // Si no se encuentra en ninguna tabla
      setError(`Producto con ID ${id} no encontrado. Es posible que el enlace sea incorrecto o que el producto ya no esté disponible.`);
      setLoading(false);
    };

    fetchProducto();
  }, [id]);

  const handleBack = () => {
    navigate('/marketplace');
  };

  // --- Renderizado ---
  if (loading) {
    return <div className="bg-black text-white min-h-screen flex justify-center items-center">Cargando producto...</div>;
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center p-4">
        <Info size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error al cargar el producto</h2>
        <p className="text-center text-gray-400">{error}</p>
        <button onClick={handleBack} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Volver al Marketplace
        </button>
      </div>
    );
  }

  if (!producto) {
    // Este estado no debería alcanzarse si la lógica anterior es correcta, pero es una buena práctica tenerlo.
    return <div className="bg-black text-white min-h-screen flex justify-center items-center">No se pudo cargar la información del producto.</div>;
  }

  // Usamos los datos de la carta de ventas si existen, si no, los datos base del producto
  const portada = producto.portada_datos;
  const titulo = portada?.titulo || producto.titulo;
  const descripcion = portada?.descripcion || producto.descripcion;

  // Renderizado de la página de producto con diseño
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative">
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Imagen de fondo (opcional, para dar profundidad) */}
        {producto.imagen_url && (
          <div 
            className="absolute top-0 left-0 w-full h-96 bg-cover bg-center opacity-20 blur-lg"
            style={{ backgroundImage: `url(${producto.imagen_url})` }}
          />
        )}
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Columna de la Imagen */}
            <div className="w-full h-auto bg-gray-900/50 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10">
              {producto.imagen_url ? (
                <img src={producto.imagen_url} alt={titulo} className="w-full h-full object-cover aspect-video"/>
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-800">
                  <PlayCircle size={64} className="text-gray-600" />
                </div>
              )}
            </div>

            {/* Columna de Información */}
            <div className="flex flex-col gap-4">
              <span className="font-bold text-cyan-400 uppercase tracking-wider">{producto.categoria || 'Producto'}</span>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white">{titulo}</h1>
              {producto.instructor && <p className="text-lg text-gray-300">Por: <span className="font-semibold">{producto.instructor}</span></p>}
              <p className="text-gray-400 text-lg">{descripcion}</p>

              <div className="flex items-baseline gap-4 mt-4">
                  <p className="text-yellow-400 text-5xl font-bold">
                    ${producto.precio}
                  </p>
                  {producto.tipo_pago === 'pago_unico' ? (
                     <span className="bg-yellow-400/10 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">PAGO ÚNICO</span>
                  ) : (
                    <span className="bg-purple-400/10 text-purple-300 text-xs font-bold px-2 py-1 rounded-full">SUSCRIPCIÓN</span>
                  )}
              </div>

              <div className="mt-6">
                <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-6 rounded-lg text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  {producto.tipo_pago === 'pago_unico' ? (
                    <>
                      <ShoppingCart size={20} /> Contratar Ahora
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} /> Suscribirse
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de Información Clave */}
      <div className="border-y border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-6">
            {producto.nivel && (
              <div className="flex flex-col items-center justify-center gap-1">
                <Award size={24} className="text-cyan-400" />
                <span className="text-sm text-gray-400">Nivel</span>
                <span className="text-lg font-semibold text-white">{producto.nivel}</span>
              </div>
            )}
            {producto.duracion_horas && (
              <div className="flex flex-col items-center justify-center gap-1">
                <PlayCircle size={24} className="text-cyan-400" />
                <span className="text-sm text-gray-400">Duración</span>
                <span className="text-lg font-semibold text-white">{producto.duracion_horas} horas</span>
              </div>
            )}
            {producto.estudiantes && (
              <div className="flex flex-col items-center justify-center gap-1">
                <Users size={24} className="text-cyan-400" />
                <span className="text-sm text-gray-400">Estudiantes</span>
                <span className="text-lg font-semibold text-white">{producto.estudiantes}</span>
              </div>
            )}
            {producto.rating && (
               <div className="flex flex-col items-center justify-center gap-1">
                <Star size={24} className="text-cyan-400" />
                <span className="text-sm text-gray-400">Valoración</span>
                <span className="text-lg font-semibold text-white">{producto.rating}/5</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nueva Sección de Video y Puntos Clave */}
      <div className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Columna de Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden group bg-black">
              <img 
                src="https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Video thumbnail" 
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button className="bg-white/10 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/20 transition-colors">
                  <PlayCircle size={64} />
                </button>
              </div>
            </div>

            {/* Columna de Texto */}
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Tu camino hacia el éxito empieza ahora.</h2>
              <p className="text-gray-400 text-lg">
                Con el respaldo de nuestra comunidad y expertos, te abrimos las puertas. Si...
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  <span className="text-white">¿Estás cansado de cursos teóricos que no llevan a ninguna parte?</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  <span className="text-white">¿Quieres resultados reales y operar con un equipo profesional?</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  <span className="text-white">¿Te gustaría aprender con respaldo global y acceso a capital?</span>
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105">
                  Entonces esto es para ti
                </button>
                <div className="flex flex-col items-start">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">+300 usuarios activos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN ¿QUÉ INCLUYE TU ACCESO? (Versión Fiel al Ejemplo) */}
      <div className="bg-black py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">¿QUÉ INCLUYE TU ACCESO?</h2>
                <p className="mt-4 text-lg text-gray-400">
                    Accede a una comunidad donde aprender, operar y crecer es parte del día a día.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Bloque 1: Sesiones en Vivo (Más alto) */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(29,78,216,0.15),_transparent_70%)] p-8 rounded-2xl border border-blue-800/50 shadow-2xl shadow-blue-500/10 lg:row-span-2 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16">
                       <Video size={56} className="text-blue-400 opacity-90"/>
                    </div>
                    <div className="flex-grow text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Sesiones de Trading en Vivo</h3>
                        <ul className="space-y-2 text-gray-400 text-left">
                            <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Operaciones en tiempo real con VicForex.</span></li>
                            <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Análisis, entradas, gestión del riesgo y cierre en vivo.</span></li>
                            <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Espacios interactivos para resolver dudas.</span></li>
                            <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Acceso a grabaciones 24/7.</span></li>
                        </ul>
                    </div>
                </div>

                {/* Bloque 2: Bonos */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(29,78,216,0.15),_transparent_70%)] p-8 rounded-2xl border border-blue-800/50 shadow-2xl shadow-blue-500/10 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16 items-center">
                        <BookOpenCheck size={52} className="text-cyan-400 opacity-90"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Bonos Vicforex</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Curso Fundamentos de Trading.</span></li>
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Curso Trading sistemático.</span></li>
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Checklists, herramientas y plantillas descargables.</span></li>
                    </ul>
                </div>

                {/* Bloque 3: Alertas */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_70%)] p-8 rounded-2xl border border-purple-800/50 shadow-2xl shadow-purple-500/10 flex flex-col h-full">
                   <div className="flex justify-center mb-6 h-16 items-center">
                        <BellRing size={52} className="text-purple-400 opacity-90"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Alertas en Tiempo Real</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Canal privado (Telegram o Discord).</span></li>
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Alertas de setups, noticias clave y oportunidades de entrada.</span></li>
                    </ul>
                </div>
                
                {/* Bloque 4: Comunidad */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.15),_transparent_70%)] p-8 rounded-2xl border border-green-800/50 shadow-2xl shadow-green-500/10 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16 items-center">
                       <Globe2 size={52} className="text-green-400 opacity-90"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Comunidad Global de Traders</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>LATAM, USA, Europa y Asia.</span></li>
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Comparte, aprende y crece con una red activa y profesional.</span></li>
                    </ul>
                </div>

                {/* Bloque 5: Bonos Premium */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.15),_transparent_70%)] p-8 rounded-2xl border border-yellow-800/50 shadow-2xl shadow-yellow-500/10 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16 items-center">
                        <ShieldCheck size={52} className="text-yellow-400 opacity-90"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Bonos Premium <span className="text-base font-normal text-gray-400">(Máximo 10)</span></h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Acceso gratuito al sistema de copytrading.</span></li>
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Sorteo de cuentas de $1000 dólares cada mes.</span></li>
                        <li className="flex gap-3"><CheckCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" /><span>Mentoría Dubai Trading Society.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

      {/* Sección Conoce al Experto (Sticky) */}
      <div className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Columna Izquierda (Scroll) */}
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">Trader Pro</span>
                <span className="bg-gray-700 text-gray-300 text-xs font-bold uppercase px-3 py-1 rounded-full">Especialista en Oro (XAU/USD)</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white">Conoce a VicForex</h2>
              <p className="text-2xl text-gray-400">Trader Profesional, Mentor e Inversionista</p>
              <p className="text-gray-300">
                Con más de 4 años operando de forma constante y disciplinada, VicForex ha perfeccionado un enfoque sólido basado en análisis técnico, acción del precio y gestión de riesgo inteligente. Su método se ha forjado operando en vivo, bajo condiciones reales de mercado, y ha sido validado día tras día, sin atajos ni promesas vacías.
              </p>

              <div className="bg-gray-900/50 p-6 rounded-2xl border border-blue-900/40">
                <p className="text-gray-300">
                  En la Trading Room VicForex no solo analiza, sino que opera en tiempo real. Comparte su proceso, su lectura del mercado y su toma de decisiones, ayudando a traders a salir de la teoría y desarrollar una mentalidad operativa profesional.
                </p>
                <blockquote className="my-4 border-l-4 border-blue-500 pl-4 italic text-gray-400">
                  "Una buena señal no es solo cuándo entrar. Es cuándo NO hacerlo. El silencio también es parte de una estrategia." – VicForex
                </blockquote>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                    <span>Nada de cursos grabados o fórmulas mágicas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                    <span>Acompañamiento real, entorno profesional y evolución constante junto a una comunidad comprometida, global y enfocada en el crecimiento real.</span>
                  </li>
                </ul>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all transform hover:scale-105">
                Aprende de alguien que opera lo que enseña
              </button>
            </div>

            {/* Columna Derecha (Sticky) */}
            <div className="relative h-full">
              <div className="lg:sticky lg:top-24">
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(29,78,216,0.15),_transparent_70%)] p-8 rounded-2xl border border-blue-800/50 shadow-2xl shadow-blue-500/10 text-center">
                  <img 
                    src="https://i.imgur.com/kS9k8yM.png" 
                    alt="Victor Acosta" 
                    className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-gray-700"
                  />
                  <h3 className="mt-6 text-3xl font-bold text-white tracking-wider">VICTOR ACOSTA</h3>
                  <div className="mt-4 flex justify-center items-center gap-2">
                    <img src="https://flagcdn.com/w40/mx.png" alt="Bandera México" className="w-6 h-auto" title="México"/>
                    <img src="https://flagcdn.com/w40/us.png" alt="Bandera USA" className="w-6 h-auto" title="USA"/>
                    <img src="https://flagcdn.com/w40/co.png" alt="Bandera Colombia" className="w-6 h-auto" title="Colombia"/>
                    <img src="https://flagcdn.com/w40/es.png" alt="Bandera España" className="w-6 h-auto" title="España"/>
                    <img src="https://flagcdn.com/w40/ve.png" alt="Bandera Venezuela" className="w-6 h-auto" title="Venezuela"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Testimonios (Placeholder) */}
      <div className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Lo que dicen nuestros clientes</h2>
              <p className="mt-4 text-lg text-gray-400">
                Resultados reales de personas reales.
              </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonio 1 */}
            <div className="bg-gray-900/50 p-6 rounded-lg shadow-lg">
              <p className="text-gray-300">"Este es el mejor producto que he comprado. Cambió completamente mi forma de trabajar y los resultados han sido increíbles. 100% recomendado."</p>
              <div className="mt-4 flex items-center gap-4">
                <img className="w-12 h-12 rounded-full object-cover" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar Cliente 1" />
                <div>
                  <p className="font-semibold text-white">Ana de Armas</p>
                  <p className="text-sm text-gray-500">CEO, Startup Innovadora</p>
                </div>
              </div>
            </div>
            {/* Testimonio 2 */}
            <div className="bg-gray-900/50 p-6 rounded-lg shadow-lg">
              <p className="text-gray-300">"Dudaba al principio, pero superó todas mis expectativas. El soporte es fantástico y el contenido es de primer nivel. ¡Gracias!"</p>
              <div className="mt-4 flex items-center gap-4">
                <img className="w-12 h-12 rounded-full object-cover" src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="Avatar Cliente 2" />
                <div>
                  <p className="font-semibold text-white">Carlos Pérez</p>
                  <p className="text-sm text-gray-500">Desarrollador Freelance</p>
                </div>
              </div>
            </div>
            {/* Testimonio 3 */}
            <div className="bg-gray-900/50 p-6 rounded-lg shadow-lg">
              <p className="text-gray-300">"Una inversión que se paga sola. Simple, directo al grano y con un impacto medible en mi negocio. No podría estar más contento."</p>
              <div className="mt-4 flex items-center gap-4">
                <img className="w-12 h-12 rounded-full object-cover" src="https://i.pravatar.cc/150?u=a042581f4e29026704f" alt="Avatar Cliente 3" />
                <div>
                  <p className="font-semibold text-white">Sofía Rodríguez</p>
                  <p className="text-sm text-gray-500">Manager de Marketing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de FAQ (Placeholder) */}
      <div className="bg-gray-900/50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Preguntas Frecuentes</h2>
              <p className="mt-4 text-lg text-gray-400">
                Resolvemos tus dudas para que tomes la mejor decisión.
              </p>
            </div>
            <div className="mt-12 max-w-3xl mx-auto space-y-4">
              {/* FAQ 1 */}
              <details className="p-4 bg-black/30 rounded-lg group">
                <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                  ¿Para quién es este producto?
                  <span className="group-open:rotate-45 transform transition-transform">+</span>
                </summary>
                <p className="mt-2 text-gray-400">Este producto está diseñado para emprendedores, creadores de contenido y profesionales que buscan optimizar su tiempo y maximizar su impacto.</p>
              </details>
              {/* FAQ 2 */}
              <details className="p-4 bg-black/30 rounded-lg group">
                <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                  ¿Qué pasa si no me gusta?
                  <span className="group-open:rotate-45 transform transition-transform">+</span>
                </summary>
                <p className="mt-2 text-gray-400">Ofrecemos una garantía de satisfacción de 7 días. Si no estás contento con tu compra, te devolvemos tu dinero, sin preguntas.</p>
              </details>
              {/* FAQ 3 */}
              <details className="p-4 bg-black/30 rounded-lg group">
                <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                  ¿Tendré acceso a actualizaciones?
                  <span className="group-open:rotate-45 transform transition-transform">+</span>
                </summary>
                <p className="mt-2 text-gray-400">Sí, todos los clientes reciben acceso a las futuras actualizaciones del producto sin coste adicional.</p>
              </details>
            </div>
        </div>
      </div>

      {/* Sección Final CTA */}
      <div className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Listo para empezar?</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Únete a cientos de profesionales que ya están transformando su negocio. No esperes más para alcanzar tus metas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <p className="text-yellow-400 text-6xl font-bold">${producto.precio}</p>
            <button className="w-full max-w-md bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              {producto.tipo_pago === 'pago_unico' ? (
                <>
                  <ShoppingCart size={22} /> Contratar Ahora
                </>
              ) : (
                <>
                  <CheckCircle size={22} /> Suscribirme Ahora
                </>
              )}
            </button>
            <p className="text-sm text-gray-500">Garantía de satisfacción de 7 días.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PaginaProductoMarketplace;
