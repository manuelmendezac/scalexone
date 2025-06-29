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

  // Renderizado temporal para verificar que los datos se cargan
  return (
    <div className="bg-black text-white min-h-screen p-8">
       <button 
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">Datos del Producto (Prueba)</h1>
      <h2 className="text-2xl font-bold">{producto.titulo}</h2>
      <p className="text-gray-300 mt-2">{producto.descripcion}</p>
      <p className="text-yellow-400 text-3xl font-bold mt-4">${producto.precio}</p>
      <pre className="mt-8 bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto">
        {JSON.stringify(producto, null, 2)}
      </pre>
    </div>
  );
};

export default PaginaProductoMarketplace;
