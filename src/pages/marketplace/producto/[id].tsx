// Force redeploy: 0.1
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase';
import { BookOpen, Users, Award, PlayCircle, Star, ArrowLeft, ShoppingCart, CheckCircle, Info, Calendar, Globe, Users as UsersIcon, Video, Radio, BookOpenCheck, BellRing, Globe2, ShieldCheck, XCircle } from 'lucide-react';
import HeroEditableSection from '../../../components/HeroEditableSection';
import IncluyeAccesoEditableSection from '../../../components/IncluyeAccesoEditableSection';
import BloqueTextosAutoridadEditableSection from '../../../components/BloqueTextosAutoridadEditableSection';
import BloqueAutoridadEditableSection from '../../../components/BloqueAutoridadEditableSection';
import MembresiasEditableSection from '../../../components/MembresiasEditableSection';
import TestimoniosEditableSection from '../../../components/TestimoniosEditableSection';
import FAQEditableSection from '../../../components/FAQEditableSection';

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
  incluye_acceso_datos?: { // datos de la sección "¿QUÉ INCLUYE TU ACCESO?"
    sesiones_en_vivo?: {
      titulo: string;
      descripcion: string;
    }[];
    bonos?: {
      titulo: string;
      descripcion: string;
    }[];
    alertas?: {
      titulo: string;
      descripcion: string;
    }[];
    comunidad?: {
      titulo: string;
      descripcion: string;
    }[];
    bonos_premium?: {
      titulo: string;
      descripcion: string;
    }[];
  };
  bloque_textos_autoridad_datos?: {
    titulo: string;
    subtitulo: string;
    texto_destacado: string;
    frase: string;
    bullets: {
      tipo: 'negativo' | 'positivo';
      texto: string;
    }[];
  };
  bloque_autoridad_datos?: {
    avatar_url: string;
    nombre: string;
    especialidades: string;
    banderas: string[];
    estadisticas: {
      años_experiencia: string;
      paises: string;
      estudiantes: string;
      comunidad: string;
    };
    chips: string[];
  };
  membresias?: {
    titulo_seccion: string;
    subtitulo: string;
    planes: {
      nombre: string;
      precio: number;
      tipo_pago: 'pago_unico' | 'suscripcion';
      duracion_texto: string;
      descripcion: string;
      destacado: boolean;
      caracteristicas: {
        texto: string;
        incluida: boolean;
      }[];
      principal: boolean;
    }[];
  };
  testimonios_datos?: {
    testimonios: {
      texto: string;
      autor: string;
      fecha: string;
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
  const [isAdmin, setIsAdmin] = useState(false);
  
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
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
  }, []);

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

  useEffect(() => {
    // No forzar membresias: null, solo dejarlo undefined si no existe
  }, [producto]);

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

  // Obtener el plan principal (o el primero si no hay principal)
  const membresias = producto.membresias?.planes || [];
  const planPrincipal = membresias.find(p => p.principal) || membresias[0];

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
                  {/* Precio eliminado de la portada, solo se muestra el tipo de plan principal */}
                  {planPrincipal && (
                    <>
                      <span className="text-yellow-400 text-5xl font-bold">
                        ${planPrincipal.precio}
                      </span>
                      <span className="bg-purple-400/10 text-purple-300 text-xs font-bold px-2 py-1 rounded-full">
                        {planPrincipal.tipo_pago === 'pago_unico' ? 'PAGO ÚNICO' : planPrincipal.duracion_texto?.toUpperCase() || 'SUSCRIPCIÓN'}
                      </span>
                    </>
                  )}
              </div>

              <div className="mt-6">
                <button
                  className={`w-full ${theme.button} py-4 px-6 rounded-lg text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2`}
                  onClick={handleScrollToMembresias}
                >
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
            {themeType === 'curso' ? (
              <>
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
              </>
            ) : (
              <>
                {/* Tipo de Servicio/Software */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <Globe size={24} className={theme.text} />
                  <span className="text-sm text-gray-400">Tipo</span>
                  <span className="text-lg font-semibold text-white">{producto.categoria || (themeType === 'software' ? 'Software/SaaS' : 'Servicio Digital')}</span>
                </div>
                {/* Modalidad */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <Video size={24} className={theme.text} />
                  <span className="text-sm text-gray-400">Modalidad</span>
                  <span className="text-lg font-semibold text-white">Online</span>
                </div>
                {/* Tiempo de Entrega */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <Calendar size={24} className={theme.text} />
                  <span className="text-sm text-gray-400">Entrega</span>
                  <span className="text-lg font-semibold text-white">A convenir</span>
                </div>
                {/* Valoración */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <Star size={24} className={theme.text} />
                  <span className="text-sm text-gray-400">Valoración</span>
                  <span className="text-lg font-semibold text-white">{producto.rating ? `${producto.rating}/5` : '5/5'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nueva Sección de Video y Puntos Clave */}
      <div className="py-16 sm:py-24">
        <HeroEditableSection producto={producto} isAdmin={isAdmin} onUpdate={nuevosDatos => setProducto(p => ({ ...p!, portada_datos: nuevosDatos }))} />
      </div>

      {/* SECCIÓN ¿QUÉ INCLUYE TU ACCESO? (Versión Fiel al Ejemplo) */}
      <div id="incluye-acceso">
        <IncluyeAccesoEditableSection producto={producto} isAdmin={isAdmin} onUpdate={(nuevosDatos: any) => setProducto(p => ({ ...p!, incluye_acceso_datos: nuevosDatos }))} />
      </div>

      {/* SECCIÓN "CONOCE AL EXPERTO" RESTAURADA (SIN BOTÓN) */}
      <div className="bg-gray-900/50 py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 relative">
          {/* Columna Izquierda (Contenido Principal que se desplaza) */}
          <div className="w-full md:w-7/12">
            <BloqueTextosAutoridadEditableSection producto={producto} isAdmin={isAdmin} onUpdate={nuevosDatos => setProducto(p => ({ ...p!, bloque_textos_autoridad_datos: nuevosDatos }))} />
          </div>

          {/* Columna Derecha (Contenedor para la Tarjeta Sticky) */}
          <div className="w-full md:w-5/12">
            <div className="sticky top-24">
              <BloqueAutoridadEditableSection producto={producto} isAdmin={isAdmin} onUpdate={nuevosDatos => setProducto(p => ({ ...p!, bloque_autoridad_datos: nuevosDatos }))} />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE MEMBRESÍAS - EDITABLE */}
      <div ref={membresiasRef}>
        <MembresiasEditableSection producto={producto} isAdmin={isAdmin} onUpdate={(nuevosDatos: any) => setProducto(p => ({ ...p!, membresias: nuevosDatos }))} />
      </div>

      {/* Sección de Testimonios */}
      <TestimoniosEditableSection producto={producto} isAdmin={isAdmin} onUpdate={(nuevosDatos: any) => setProducto(p => ({ ...p!, testimonios_datos: nuevosDatos }))} />

      {/* Sección de FAQ (Editable) */}
      <FAQEditableSection producto={producto} isAdmin={isAdmin} onUpdate={(nuevosDatos: any) => setProducto(p => ({ ...p!, faq_datos: nuevosDatos }))} />

      {/* Sección Final CTA */}
      <div className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Listo para empezar?</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Únete a cientos de profesionales que ya están transformando su negocio. No esperes más para alcanzar tus metas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <button
              className={`w-full max-w-md ${theme.button} py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2`}
              onClick={handleScrollToMembresias}
            >
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
