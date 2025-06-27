import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Clock, GraduationCap, ShoppingCart, Briefcase, Home, MapPin, ChevronDown } from 'lucide-react';
import { supabase } from '../supabase';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  instructor: string;
  duracion_horas: number;
  nivel: string;
  rating: number;
  estudiantes: number;
  community_id: string;
  activo: boolean;
  categoria?: string;
}

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  proveedor: string;
  categoria: string;
  rating: number;
  reviews: number;
}

const Marketplace: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('popularidad');

  const categorias = ['Todos', 'Cursos', 'Servicios', 'Productos Físicos', 'Propiedades'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar cursos desde la nueva tabla
      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos_marketplace')
        .select('*')
        .eq('activo', true);

      if (cursosError) throw cursosError;

      const cursosFormateados: Curso[] = (cursosData || []).map(curso => ({
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        precio: curso.precio || 0,
        imagen_url: curso.imagen_url,
        instructor: curso.instructor || 'ScaleXone',
        duracion_horas: curso.duracion_horas || 0,
        nivel: curso.nivel || 'Principiante',
        rating: curso.rating || 4.8,
        estudiantes: curso.estudiantes || 0,
        community_id: curso.community_id,
        activo: curso.activo,
        categoria: 'Cursos'
      }));

      setCursos(cursosFormateados);

      // Datos simulados para servicios (Fase 2)
      const serviciosSimulados: Servicio[] = [
        {
          id: 'srv-1',
          titulo: 'Consultoría Estratégica 1:1',
          descripcion: 'Sesión personalizada de estrategia empresarial con expertos en escalabilidad.',
          precio: 150,
          imagen_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=300&fit=crop',
          proveedor: 'ScaleXone Consulting',
          categoria: 'Servicios',
          rating: 4.9,
          reviews: 127
        },
        {
          id: 'srv-2',
          titulo: 'Diseño de Funnel Completo',
          descripcion: 'Creación de funnel de ventas optimizado desde landing hasta checkout.',
          precio: 500,
          imagen_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
          proveedor: 'Funnel Masters',
          categoria: 'Servicios',
          rating: 4.8,
          reviews: 89
        },
        {
          id: 'srv-3',
          titulo: 'Automatización WhatsApp Business',
          descripcion: 'Setup completo de chatbot y automatización para WhatsApp Business.',
          precio: 300,
          imagen_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
          proveedor: 'AutoBot Pro',
          categoria: 'Servicios',
          rating: 4.7,
          reviews: 156
        }
      ];

      setServicios(serviciosSimulados);

    } catch (error: any) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const itemsFiltrados = React.useMemo(() => {
    let items: (Curso | Servicio)[] = [];
    
    if (selectedCategory === 'Todos' || selectedCategory === 'Cursos') {
      items = [...items, ...cursos];
    }
    
    if (selectedCategory === 'Todos' || selectedCategory === 'Servicios') {
      items = [...items, ...servicios];
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      items = items.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    items.sort((a, b) => {
      switch (sortBy) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'rating':
          return b.rating - a.rating;
        case 'popularidad':
        default:
          const aPopularidad = 'estudiantes' in a ? a.estudiantes : a.reviews;
          const bPopularidad = 'estudiantes' in b ? b.estudiantes : b.reviews;
          return bPopularidad - aPopularidad;
      }
    });

    return items;
  }, [cursos, servicios, searchTerm, selectedCategory, sortBy]);

  const renderCursoCard = (curso: Curso) => (
    <motion.div
      key={curso.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
    >
      {/* Imagen Principal */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-black relative">
          {curso.imagen_url ? (
            <img 
              src={curso.imagen_url} 
              alt={curso.titulo} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-yellow-900/20">
              <GraduationCap size={64} className="text-amber-400" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Badge de Curso */}
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              CURSO
            </span>
          </div>
          
          {/* Rating y Estudiantes */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-amber-400 text-xs font-semibold">{curso.rating}</span>
            </div>
          </div>
          
          {/* Información en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors">
              {curso.titulo}
            </h3>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2 opacity-90">
              {curso.descripcion}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{curso.estudiantes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{curso.duracion_horas}h</span>
                </div>
                <div className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  {curso.nivel}
                </div>
              </div>
            </div>
            
            {/* Precio y Botón */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  ${curso.precio}
                </div>
                <div className="text-xs text-gray-400">
                  por {curso.instructor}
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold px-6 py-2.5 rounded-full text-sm shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
                Ver
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderServicioCard = (servicio: Servicio) => (
    <motion.div
      key={servicio.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
    >
      {/* Imagen Principal */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-black relative">
          {servicio.imagen_url ? (
            <img 
              src={servicio.imagen_url} 
              alt={servicio.titulo} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
              <Briefcase size={64} className="text-purple-400" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Badge de Servicio */}
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              SERVICIO
            </span>
          </div>
          
          {/* Rating y Reviews */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-purple-400 fill-current" />
              <span className="text-purple-400 text-xs font-semibold">{servicio.rating}</span>
            </div>
          </div>
          
          {/* Información en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {servicio.titulo}
            </h3>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2 opacity-90">
              {servicio.descripcion}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{servicio.reviews} reviews</span>
                </div>
                <div className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                  Servicio
                </div>
              </div>
            </div>
            
            {/* Precio y Botón */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  ${servicio.precio}
                </div>
                <div className="text-xs text-gray-400">
                  por {servicio.proveedor}
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
                Contratar
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCard = (item: Curso | Servicio) => {
    if ('duracion_horas' in item) {
      return renderCursoCard(item as Curso);
    } else {
      return renderServicioCard(item as Servicio);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/10 to-yellow-900/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-6">
              🛒 Marketplace ScaleXone
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Descubre cursos premium, servicios especializados y herramientas para escalar tu negocio al siguiente nivel
            </p>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar cursos, servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-3">
              {/* Filtro de categoría */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-gray-900/50 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 cursor-pointer backdrop-blur-sm"
                >
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* Ordenamiento */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-900/50 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 cursor-pointer backdrop-blur-sm"
                >
                  <option value="popularidad">Más Popular</option>
                  <option value="rating">Mejor Rating</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-2xl p-6 text-center border border-amber-500/20">
            <div className="text-3xl font-bold text-amber-400 mb-2">{cursos.length}</div>
            <div className="text-sm text-gray-400">Cursos Premium</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 text-center border border-purple-500/20">
            <div className="text-3xl font-bold text-purple-400 mb-2">{servicios.length}</div>
            <div className="text-sm text-gray-400">Servicios Expert</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-6 text-center border border-green-500/20">
            <div className="text-3xl font-bold text-green-400 mb-2">0</div>
            <div className="text-sm text-gray-400">Productos</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-2xl p-6 text-center border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
            <div className="text-sm text-gray-400">Propiedades</div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {itemsFiltrados.map(renderCard)}
        </div>

        {/* Estado vacío */}
        {itemsFiltrados.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-4">No se encontraron resultados</h3>
            <p className="text-gray-400 text-lg">
              Intenta con otros términos de búsqueda o cambia los filtros
            </p>
          </div>
        )}

        {/* Secciones futuras (Fase 3 y 4) */}
        {selectedCategory === 'Todos' && (
          <div className="mt-16 space-y-8">
            {/* Fase 3: Productos Físicos */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-12 border border-green-500/20 text-center">
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-3xl font-bold text-green-400 mb-4">Productos Físicos</h3>
              <p className="text-gray-300 mb-6 text-lg max-w-2xl mx-auto">
                Próximamente: Herramientas, libros exclusivos y productos físicos que potencian tu crecimiento
              </p>
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-6 py-3 rounded-full font-semibold">
                🚀 Fase 3 - En Desarrollo
              </div>
            </div>

            {/* Fase 4: Propiedades */}
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-2xl p-12 border border-blue-500/20 text-center">
              <div className="text-6xl mb-6">🏡</div>
              <h3 className="text-3xl font-bold text-blue-400 mb-4">Propiedades Inmobiliarias</h3>
              <p className="text-gray-300 mb-6 text-lg max-w-2xl mx-auto">
                Próximamente: Inversiones inmobiliarias, propiedades en renta y oportunidades únicas de inversión
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-6 py-3 rounded-full font-semibold">
                🏠 Fase 4 - Planificado
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace; 