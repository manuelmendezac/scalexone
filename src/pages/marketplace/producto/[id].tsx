import React, { useEffect, useState, useRef } from 'react';
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
  const membresiasRef = useRef<HTMLDivElement>(null);
  
  // Función para hacer scroll a la sección de membresías
  const handleScrollToMembresias = () => {
    membresiasRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
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

  // --- Lógica de Theming y Datos ---
  const getThemeType = (category?: string): 'curso' | 'servicio' | 'software' => {
    const cat = category?.toLowerCase() || '';
    if (['consultoría', 'marketing', 'estrategia', 'servicios'].some(c => cat.includes(c))) {
      return 'servicio';
    }
    if (['desarrollo', 'programación', 'diseño', 'trading', 'finanzas', 'curso', 'e-commerce'].some(c => cat.includes(c))) {
      return 'curso';
    }
    return 'software'; // Default para 'Software & SaaS' etc.
  };

  const themeConfig = {
    curso: { // Dorado
      text: 'text-amber-400',
      border: 'border-amber-500',
      accentBg: 'bg-amber-400/10',
      accentText: 'text-amber-300',
      button: 'bg-amber-500 hover:bg-amber-600 text-black font-bold',
      membershipButton: 'bg-amber-500 hover:bg-amber-600 text-black font-bold'
    },
    servicio: { // Fucsia/Púrpura
      text: 'text-fuchsia-400',
      border: 'border-fuchsia-500',
      accentBg: 'bg-fuchsia-400/10',
      accentText: 'text-fuchsia-300',
      button: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold',
      membershipButton: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold'
    },
    software: { // Celeste
      text: 'text-cyan-400',
      border: 'border-cyan-500',
      accentBg: 'bg-cyan-400/10',
      accentText: 'text-cyan-300',
      button: 'bg-cyan-500 hover:bg-cyan-600 text-black font-bold',
      membershipButton: 'bg-cyan-500 hover:bg-cyan-600 text-black font-bold'
    }
  };

  const themeType = getThemeType(producto.categoria);
  const theme = themeConfig[themeType];

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
            <div className={`w-full h-auto bg-gray-900/50 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10`}>
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
              <span className={`font-bold ${theme.text} uppercase tracking-wider`}>{producto.categoria || 'Producto'}</span>
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
                <button className={`w-full ${theme.button} py-4 px-6 rounded-lg text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2`}>
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
                <Award size={24} className={theme.text} />
                <span className="text-sm text-gray-400">Nivel</span>
                <span className="text-lg font-semibold text-white">{producto.nivel}</span>
              </div>
            )}
            {producto.duracion_horas && (
              <div className="flex flex-col items-center justify-center gap-1">
                <PlayCircle size={24} className={theme.text} />
                <span className="text-sm text-gray-400">Duración</span>
                <span className="text-lg font-semibold text-white">{producto.duracion_horas} horas</span>
              </div>
            )}
            {producto.estudiantes && (
              <div className="flex flex-col items-center justify-center gap-1">
                <Users size={24} className={theme.text} />
                <span className="text-sm text-gray-400">Estudiantes</span>
                <span className="text-lg font-semibold text-white">{producto.estudiantes}</span>
              </div>
            )}
            {producto.rating && (
               <div className="flex flex-col items-center justify-center gap-1">
                <Star size={24} className={theme.text} />
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
                <button 
                  onClick={handleScrollToMembresias}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 ${theme.button}`}
                >
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
                       <Video size={56} className={theme.text}/>
                    </div>
                    <div className="flex-grow text-center">
                        <h3 className="text-xl font-bold text-white mb-4">Sesiones de Trading en Vivo</h3>
                        <ul className="space-y-2 text-gray-400 text-left">
                            <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Operaciones en tiempo real con VicForex.</span></li>
                            <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Análisis, entradas, gestión del riesgo y cierre en vivo.</span></li>
                            <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Espacios interactivos para resolver dudas.</span></li>
                            <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Acceso a grabaciones 24/7.</span></li>
                        </ul>
                    </div>
                </div>

                {/* Bloque 2: Bonos */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(29,78,216,0.15),_transparent_70%)] p-8 rounded-2xl border border-blue-800/50 shadow-2xl shadow-blue-500/10 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16 items-center">
                        <BookOpenCheck size={52} className={theme.text}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Bonos Vicforex</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Curso Fundamentos de Trading.</span></li>
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Curso Trading sistemático.</span></li>
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Checklists, herramientas y plantillas descargables.</span></li>
                    </ul>
                </div>

                {/* Bloque 3: Alertas */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_70%)] p-8 rounded-2xl border border-purple-800/50 shadow-2xl shadow-purple-500/10 flex flex-col h-full">
                   <div className="flex justify-center mb-6 h-16 items-center">
                        <BellRing size={52} className={theme.text}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Alertas en Tiempo Real</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Canal privado (Telegram o Discord).</span></li>
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Alertas de setups, noticias clave y oportunidades de entrada.</span></li>
                    </ul>
                </div>
                
                {/* Bloque 4: Comunidad */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.15),_transparent_70%)] p-8 rounded-2xl border border-green-800/50 shadow-2xl shadow-green-500/10 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16 items-center">
                       <Globe2 size={52} className={theme.text}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Comunidad Global de Traders</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>LATAM, USA, Europa y Asia.</span></li>
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Comparte, aprende y crece con una red activa y profesional.</span></li>
                    </ul>
                </div>

                {/* Bloque 5: Bonos Premium */}
                <div className="bg-gray-900/70 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.15),_transparent_70%)] p-8 rounded-2xl border border-yellow-800/50 shadow-2xl shadow-yellow-500/10 flex flex-col h-full">
                    <div className="flex justify-center mb-6 h-16 items-center">
                        <ShieldCheck size={52} className={theme.text}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">Bonos Premium <span className="text-base font-normal text-gray-400">(Máximo 10)</span></h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Acceso gratuito al sistema de copytrading.</span></li>
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Sorteo de cuentas de $1000 dólares cada mes.</span></li>
                        <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0 mt-1`} /><span>Mentoría Dubai Trading Society.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
      {/* SECCIÓN "CONOCE AL EXPERTO" RESTAURADA (SIN BOTÓN) */}
      <div className="bg-gray-900/50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 relative">
          
          {/* Columna Izquierda (Contenido Principal que se desplaza) */}
          <div className="md:w-3/5 lg:w-3/5">
            <div className="max-w-none">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Con más de 4 años operando de forma constante y disciplinada, VicForex ha perfeccionado un enfoque sólido basado en análisis técnico, acción del precio y gestión de riesgo inteligente.</h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">Su método se ha forjado operando en vivo, bajo condiciones reales de mercado, y ha sido validado día tras día, sin atajos ni promesas vacías.</p>
              
              <div className="mt-10 text-base leading-7 text-gray-200">
                <div className="p-8 border border-gray-700 rounded-lg bg-gray-800/40">
                  <p>En la Trading Room VicForex no solo analiza, sino que opera en tiempo real. Comparte su proceso, su lectura del mercado y su toma de decisiones, ayudando a traders a salir de la teoría y desarrollar una mentalidad operativa profesional.</p>
                  <blockquote className={`italic text-gray-400 mt-4 border-l-2 ${theme.border} pl-4`}>
                    "Una buena señal no es solo cuándo entrar. Es cuándo NO hacerlo. El silencio también es parte de una estrategia." – VicForex
                  </blockquote>
                  <ul className="mt-8 space-y-4">
                    <li className="flex gap-x-3 items-start">
                      <XCircle className="mt-1 h-5 w-5 flex-none text-red-500" aria-hidden="true" />
                      <span><strong className="font-semibold text-white">Nada de cursos grabados o fórmulas mágicas.</strong></span>
                    </li>
                    <li className="flex gap-x-3 items-start">
                      <CheckCircle className="mt-1 h-5 w-5 flex-none text-green-500" aria-hidden="true" />
                      <span><strong className="font-semibold text-white">Acompañamiento real,</strong> entorno profesional, y evolución constante junto a una comunidad comprometida, global y enfocada en el crecimiento real.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha (Contenedor para la Tarjeta Sticky) */}
          <div className="md:w-2/5 lg:w-2/5">
            <div className="sticky top-24">
              <div className="rounded-2xl bg-gray-800/80 backdrop-blur-sm p-8 shadow-2xl shadow-blue-500/10 border border-gray-700 text-center">
                
                {/* Imagen del Ponente */}
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop" 
                  alt="Ponente" 
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-gray-700"
                />

                <h3 className="text-2xl font-bold leading-7 tracking-tight text-white">VICTOR ACOSTA</h3>
                <p className="text-sm leading-6 text-gray-400">Trading · Análisis Técnico · Mentalidad</p>
                <div className="flex items-center justify-center gap-x-2 mt-4">
                  <img src="https://flagcdn.com/w20/mx.png" alt="México" className="h-4 rounded-sm" />
                  <img src="https://flagcdn.com/w20/ar.png" alt="Argentina" className="h-4 rounded-sm" />
                  <img src="https://flagcdn.com/w20/pe.png" alt="Perú" className="h-4 rounded-sm" />
                  <img src="https://flagcdn.com/w20/co.png" alt="Colombia" className="h-4 rounded-sm" />
                  <img src="https://flagcdn.com/w20/ve.png" alt="Venezuela" className="h-4 rounded-sm" />
                  <img src="https://flagcdn.com/w20/cl.png" alt="Chile" className="h-4 rounded-sm" />
                  <img src="https://flagcdn.com/w20/es.png" alt="España" className="h-4 rounded-sm" />
                </div>
                
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h4 className="text-base font-semibold text-white mb-3">Estadísticas Clave</h4>
                  <ul className="space-y-3 text-sm text-gray-300 text-left">
                    <li className="flex justify-between"><span>Años de Experiencia</span> <span className={`font-mono ${theme.text}`}>4+</span></li>
                    <li className="flex justify-between"><span>Países</span> <span className={`font-mono ${theme.text}`}>7+</span></li>
                    <li className="flex justify-between"><span>Estudiantes</span> <span className={`font-mono ${theme.text}`}>1,200+</span></li>
                    <li className="flex justify-between"><span>Comunidad</span> <span className={`font-mono ${theme.text}`}>Activa</span></li>
                  </ul>
                </div>

                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h4 className="text-base font-semibold text-white mb-3">Enfocado en</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className={`${theme.accentBg} ${theme.accentText} text-xs font-medium px-2 py-1 rounded-full`}>Acción del Precio</span>
                    <span className={`${theme.accentBg} ${theme.accentText} text-xs font-medium px-2 py-1 rounded-full`}>Gestión de Riesgo</span>
                    <span className={`${theme.accentBg} ${theme.accentText} text-xs font-medium px-2 py-1 rounded-full`}>Psicotrading</span>
                    <span className={`${theme.accentBg} ${theme.accentText} text-xs font-medium px-2 py-1 rounded-full`}>Trading en Vivo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE MEMBRESÍAS - DISEÑO DETALLADO */}
      <div ref={membresiasRef} className="relative bg-black py-16 sm:py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,78,216,0.2)_0%,rgba(0,0,0,0)_70%)]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Elige tu plan de acceso</h2>
            <p className="mt-4 text-lg text-gray-400">Acceso inmediato a la comunidad, sesiones en vivo y todos los beneficios.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Plan Básico */}
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col h-full">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Star size={18} className={theme.text}/>Plan Básico</h3>
              <div className="flex items-baseline gap-3 my-4">
                <p className="text-5xl font-extrabold text-white">$99<span className="text-3xl font-bold">.00</span></p>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 text-xs font-semibold rounded">Mensual</span>
              </div>
              <p className="text-gray-400 mb-6 min-h-[40px]">Perfecto para dar tu primer paso.</p>
              <button className={`w-full ${theme.membershipButton} py-3 px-6 rounded-lg transition-all`}>Suscribirse</button>
              <p className="text-white font-semibold mt-8 mb-4">Lo que incluye:</p>
              <ul className="space-y-3 text-gray-300 flex-grow">
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Sesiones de Trading en Vivo</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Alertas en Tiempo Real</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Comunidad Global de Traders</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Bonos VicForex</li>
                <li className="flex gap-3 text-gray-500"><XCircle className="w-5 h-5 flex-shrink-0" />Bonos Premium</li>
                <li className="flex gap-3 text-gray-500"><XCircle className="w-5 h-5 flex-shrink-0" />Mentoría 1x1</li>
              </ul>
            </div>

            {/* Plan Pro (Destacado) */}
            <div className="relative bg-gray-900 p-8 rounded-2xl border-2 border-green-400 shadow-2xl shadow-green-500/20 flex flex-col h-full -my-4">
               <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                 <span className="bg-green-400 text-black text-sm font-bold uppercase px-4 py-1 rounded-full flex items-center gap-2"><Star size={16}/>El favorito de todos</span>
               </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Star size={18} className="text-green-400"/>Plan Pro</h3>
              <div className="flex items-baseline gap-3 my-4">
                <p className="text-5xl font-extrabold text-white">$147<span className="text-3xl font-bold">.00</span></p>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 text-xs font-semibold rounded">Trimestral</span>
              </div>
              <p className="text-gray-400 mb-6 min-h-[40px]">Ahorra $150 vs pagar mes a mes.</p>
              <button className="w-full bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-all">Suscribirse</button>
              <p className="text-white font-semibold mt-8 mb-4">Lo que incluye:</p>
              <ul className="space-y-3 text-gray-300 flex-grow">
                <li className="flex gap-3"><CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />Sesiones de Trading en Vivo</li>
                <li className="flex gap-3"><CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />Alertas en Tiempo Real</li>
                <li className="flex gap-3"><CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />Comunidad Global de Traders</li>
                <li className="flex gap-3"><CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />Bonos VicForex</li>
                <li className="flex gap-3"><CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />Bonos Premium</li>
                <li className="flex gap-3 text-gray-500"><XCircle className="w-5 h-5 flex-shrink-0" />Mentoría 1x1</li>
              </ul>
            </div>

            {/* Plan Avanzado */}
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col h-full">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Star size={18} className={theme.text}/>Plan Avanzado</h3>
              <div className="flex items-baseline gap-3 my-4">
                <p className="text-5xl font-extrabold text-white">$175<span className="text-3xl font-bold">.00</span></p>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 text-xs font-semibold rounded">Semestral</span>
              </div>
              <p className="text-gray-400 mb-6 min-h-[40px]">¡Menos de $1 por día!</p>
              <button className={`w-full ${theme.membershipButton} py-3 px-6 rounded-lg transition-all`}>Suscribirse</button>
              <p className="text-white font-semibold mt-8 mb-4">Lo que incluye:</p>
              <ul className="space-y-3 text-gray-300 flex-grow">
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Sesiones de Trading en Vivo</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Alertas en Tiempo Real</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Comunidad Global de Traders</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Bonos VicForex</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Bonos Premium</li>
                <li className="flex gap-3"><CheckCircle className={`${theme.text} w-5 h-5 flex-shrink-0`} />Mentoría 1x1</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Sección de Testimonios */}
      <div className="bg-black py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Lo que dicen nuestros clientes</h2>
            <p className="mt-4 text-lg text-gray-400">Únete a cientos de traders que han transformado su operativa.</p>
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
