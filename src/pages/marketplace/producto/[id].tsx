import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase';
import { BookOpen, Users, Award, PlayCircle, Star, ArrowLeft, ShoppingCart, CheckCircle, Info, Calendar, Globe, Users as UsersIcon } from 'lucide-react';

// Estructura de datos que esperamos de la BD
// Unificada para cursos y servicios del marketplace
type ProductoMarketplace = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  tipo_pago?: 'pago_unico' | 'suscripcion';
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
    if (!id) return;

    const fetchProducto = async () => {
      setLoading(true);
      setError(null);

      // Buscamos en ambas tablas. Usamos un RPC podría ser más eficiente,
      // pero para empezar esto es más claro.
      const fetchFromTable = async (tableName: string) => {
        return supabase.from(tableName).select('*').eq('id', id).single();
      };

      const { data: cursoData, error: cursoError } = await fetchFromTable('cursos_marketplace');
      if (cursoData) {
        setProducto(cursoData);
        setLoading(false);
        return;
      }

      const { data: servicioData, error: servicioError } = await fetchFromTable('servicios_marketplace');
      if (servicioData) {
        setProducto(servicioData);
        setLoading(false);
        return;
      }
      
      setError('Producto no encontrado. Es posible que el enlace sea incorrecto o que el producto ya no esté disponible.');
      setLoading(false);
    };

    fetchProducto();
  }, [id]);

  const handleBack = () => {
    navigate('/marketplace');
  };

  // --- Renderizado ---
  if (loading) {
    return <div className="bg-black text-white min-h-screen flex justify-center items-center">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center p-4">
        <Info size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-center">{error}</p>
        <button onClick={handleBack} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Volver al Marketplace
        </button>
      </div>
    );
  }

  if (!producto) return null;

  // Usamos los datos de la carta de ventas si existen, si no, los datos base del producto
  const portada = producto.portada_datos;
  const titulo = portada?.titulo || producto.titulo;
  const descripcion = portada?.descripcion || producto.descripcion;

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      
      {/* Botón flotante para volver */}
      <button 
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* --- SECCIÓN HERO (PORTADA) --- */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black z-10" />
        {portada?.imagen_lateral_url ? (
            <img src={portada.imagen_lateral_url} alt="Fondo" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
             <div className="absolute inset-0 bg-gray-800" />
        )}

        <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
                {portada?.logo_url && <img src={portada.logo_url} alt="Logo" className="h-12 mx-auto md:mx-0 mb-4"/>}
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">{titulo}</h1>
                <p className="text-lg md:text-xl text-gray-300 mb-6">{descripcion}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={20} className="fill-current" />
                        <strong>{portada?.calificacion || 5}</strong>
                    </div>
                    <span className="text-gray-400">({portada?.num_calificaciones || 0} calificaciones)</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <ShoppingCart size={22} className="inline mr-3" />
                    {portada?.boton_principal_texto || 'Comprar Ahora'}
                </button>
            </div>
            {portada?.video_url && (
                <div className="aspect-video bg-black/50 rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                    <iframe src={portada.video_url} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
                </div>
            )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16 md:py-24 space-y-16 md:space-y-24">
        {/* --- SECCIÓN MÓDULOS / TEMARIO --- */}
        {producto.modulos_datos && (
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{producto.modulos_datos.titulo_seccion || '¿Qué aprenderás?'}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {producto.modulos_datos.items.map((modulo, index) => (
                <div key={index} className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
                  {modulo.icono_url && <img src={modulo.icono_url} alt="" className="h-10 mb-4"/>}
                  <h3 className="font-bold text-xl mb-2 text-blue-300">{modulo.titulo}</h3>
                  <p className="text-gray-400">{modulo.descripcion}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- SECCIÓN COMUNIDAD Y EVENTOS (JUNTAS) --- */}
        {(producto.comunidad_datos || producto.eventos_datos) && (
            <section className="grid md:grid-cols-2 gap-8">
                {/* Comunidad */}
                {producto.comunidad_datos && (
                    <div className="relative p-8 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                        <h3 className="text-2xl font-bold mb-2">{producto.comunidad_datos.titulo_seccion || 'Únete a la Comunidad'}</h3>
                        <p className="text-gray-400 mb-6">{producto.comunidad_datos.descripcion}</p>
                        <div className="flex flex-wrap gap-2">
                            {producto.comunidad_datos.links.map((link, i) => (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm transition-colors">{link.texto}</a>
                            ))}
                        </div>
                    </div>
                )}
                {/* Eventos */}
                {producto.eventos_datos && (
                     <div className="relative p-8 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                        <h3 className="text-2xl font-bold mb-2">{producto.eventos_datos.titulo_seccion || 'Eventos Exclusivos'}</h3>
                         <ul className="space-y-4">
                             {producto.eventos_datos.eventos.map((evento, i) => (
                                 <li key={i} className="flex items-center gap-4">
                                     {getPlataformaIcon(evento.plataforma)}
                                     <div>
                                         <p className="font-semibold">{evento.titulo}</p>
                                         <p className="text-sm text-gray-400">{evento.dia} - {evento.hora}</p>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                     </div>
                )}
            </section>
        )}
      </main>

      <footer className="bg-gray-900 py-8 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {producto.titulo}. Un producto en ScaleXone.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaginaProductoMarketplace;
