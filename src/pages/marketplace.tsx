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
  tipo_producto?: 'servicio' | 'suscripcion';
  tipo_pago?: 'pago_unico' | 'suscripcion';
  duracion_dias?: number;
}

const Marketplace: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('popularidad');

  const categorias = ['Todos', 'Cursos', 'Servicios', 'Software & SaaS', 'Productos Físicos', 'Propiedades'];

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

      // Cargar servicios desde la base de datos real
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios_marketplace')
        .select('*')
        .eq('activo', true);

      if (serviciosError) {
        console.warn('Error cargando servicios desde BD, usando datos simulados:', serviciosError);
        // Fallback a datos simulados si la tabla no existe aún
        const serviciosSimulados: Servicio[] = [
          {
            id: 'srv-1',
            titulo: 'Consultoría Estratégica 1:1',
            descripcion: 'Sesión personalizada de estrategia empresarial con expertos en escalabilidad.',
            precio: 150,
            imagen_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=300&fit=crop',
            proveedor: 'ScaleXone Consulting',
            categoria: 'Consultoría',
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
            categoria: 'Marketing',
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
            categoria: 'Automatización',
            rating: 4.7,
            reviews: 156
          }
        ];
        setServicios(serviciosSimulados);
      } else {
        // Usar servicios reales de la base de datos
        const serviciosFormateados: Servicio[] = (serviciosData || []).map(servicio => ({
          id: servicio.id,
          titulo: servicio.titulo,
          descripcion: servicio.descripcion,
          precio: servicio.precio || 0,
          imagen_url: servicio.imagen_url,
          proveedor: servicio.proveedor || 'ScaleXone',
          categoria: servicio.categoria || 'Servicios',
          rating: servicio.rating || 4.8,
          reviews: servicio.reviews || 0,
          tipo_producto: servicio.tipo_producto || 'servicio',
          tipo_pago: servicio.tipo_pago || 'pago_unico',
          duracion_dias: servicio.duracion_dias
        }));
        setServicios(serviciosFormateados);
      }

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
      // Servicios tradicionales + servicios de suscripción con categorías de servicios
      const categoriasServicios = ['Consultoría', 'Diseño', 'Marketing', 'Automatización', 'Desarrollo', 'Coaching', 'Otros'];
      const serviciosReales = servicios.filter(s => 
        s.tipo_producto !== 'suscripcion' || 
        (s.tipo_producto === 'suscripcion' && categoriasServicios.includes(s.categoria))
      );
      items = [...items, ...serviciosReales];
    }

    if (selectedCategory === 'Todos' || selectedCategory === 'Software & SaaS') {
      // Solo suscripciones con categorías específicas de software/tecnología
      const categoriasSoftware = ['Software', 'SaaS', 'Herramientas', 'Tecnología', 'Plataforma'];
      const suscripcionesSoftware = servicios.filter(s => 
        s.tipo_producto === 'suscripcion' && 
        (categoriasSoftware.includes(s.categoria) || s.categoria.toLowerCase().includes('software') || s.categoria.toLowerCase().includes('saas'))
      );
      items = [...items, ...suscripcionesSoftware];
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
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all group cursor-pointer overflow-hidden"
    >
      {/* Imagen horizontal tipo Netflix/Instagram */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-800 relative overflow-hidden">
          {curso.imagen_url ? (
            <img 
              src={curso.imagen_url} 
              alt={curso.titulo} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/30 to-yellow-900/30">
              <GraduationCap size={48} className="text-amber-400" />
            </div>
          )}
          
          {/* Badge de Curso */}
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              CURSO
            </span>
          </div>
          
          {/* Rating */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-amber-400 text-xs font-semibold">{curso.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información separada debajo */}
      <div className="p-6">
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
          {curso.titulo}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {curso.descripcion}
        </p>
        
        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{curso.estudiantes} estudiantes</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{curso.duracion_horas}h</span>
          </div>
          <div className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs">
            {curso.nivel}
          </div>
        </div>
        
        {/* Instructor */}
        <div className="text-sm text-gray-400 mb-4">
          Por: <span className="text-amber-400 font-semibold">{curso.instructor}</span>
        </div>
        
        {/* Precio y Botón */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            ${curso.precio}
          </div>
          <button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold px-6 py-2 rounded-lg text-sm shadow-lg transform transition-all duration-200 hover:scale-105">
            Ver
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderServicioCard = (servicio: Servicio) => {
    const esSuscripcion = servicio.tipo_producto === 'suscripcion';
    
    // ✅ DETERMINAR CATEGORÍA REAL BASADA EN LA CATEGORÍA DEL SERVICIO
    const categoriasServicios = ['Consultoría', 'Diseño', 'Marketing', 'Automatización', 'Desarrollo', 'Coaching', 'Otros'];
    const esServicioReal = categoriasServicios.includes(servicio.categoria);
    const esSoftwareSaaS = !esServicioReal && (esSuscripcion || servicio.categoria.toLowerCase().includes('software') || servicio.categoria.toLowerCase().includes('saas'));
    
    const colorScheme = esSoftwareSaaS 
      ? { 
          border: 'border-cyan-500/20 hover:border-cyan-400/40',
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          text: 'text-cyan-400',
          button: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
          bg: 'from-cyan-900/30 to-blue-900/30',
          category: 'bg-cyan-500/20 text-cyan-400'
        }
      : {
          border: 'border-purple-500/20 hover:border-purple-400/40',
          badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
          text: 'text-purple-400',
          button: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500',
          bg: 'from-purple-900/30 to-pink-900/30',
          category: 'bg-purple-500/20 text-purple-400'
        };

    const formatDuracion = (dias: number) => {
      if (dias === 30) return '/mes';
      if (dias === 365) return '/año';
      if (dias === 7) return '/semana';
      return `/${dias} días`;
    };

    return (
      <motion.div
        key={servicio.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={`bg-gray-900/50 rounded-xl ${colorScheme.border} transition-all group cursor-pointer overflow-hidden`}
      >
        {/* Imagen horizontal tipo Netflix/Instagram */}
        <div className="relative">
          <div className="w-full h-48 bg-gray-800 relative overflow-hidden">
            {servicio.imagen_url ? (
              <img 
                src={servicio.imagen_url} 
                alt={servicio.titulo} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorScheme.bg}`}>
                <Briefcase size={48} className={colorScheme.text} />
              </div>
            )}
            
            {/* Badge de tipo - ✅ CORREGIDO PARA MOSTRAR CATEGORÍA REAL */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`${colorScheme.badge} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                {esSoftwareSaaS ? 'SOFTWARE & SAAS' : 'SERVICIO'}
              </span>
              {esSuscripcion && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  SUSCRIPCIÓN
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="absolute top-3 right-3">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <Star className={`w-3 h-3 ${colorScheme.text} fill-current`} />
                <span className={`${colorScheme.text} text-xs font-semibold`}>{servicio.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información separada debajo */}
        <div className="p-6">
          <h3 className={`text-white font-bold text-lg mb-2 group-hover:${colorScheme.text} transition-colors line-clamp-2`}>
            {servicio.titulo}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {servicio.descripcion}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{servicio.reviews} reviews</span>
            </div>
            
            {/* ✅ BADGES MEJORADOS SEGÚN TIPO_PAGO */}
            <div className="flex gap-2">
              <div className={`${colorScheme.category} px-2 py-1 rounded-full text-xs font-medium`}>
                {servicio.tipo_pago === 'suscripcion' ? '🔄 Suscripción' : '💵 Pago Único'}
              </div>
            </div>
          </div>
          
          {/* Proveedor */}
          <div className="text-sm text-gray-400 mb-4">
            Por: <span className={`${colorScheme.text} font-semibold`}>{servicio.proveedor}</span>
          </div>
          
          {/* Precio y Botón */}
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold bg-gradient-to-r ${esSuscripcion ? 'from-cyan-400 to-blue-500' : 'from-purple-400 to-pink-500'} bg-clip-text text-transparent`}>
              ${servicio.precio}
              {/* ✅ MOSTRAR SUFIJO SEGÚN TIPO_PAGO */}
              {servicio.tipo_pago === 'suscripcion' && servicio.duracion_dias && (
                <span className="text-sm text-gray-400 font-normal">
                  {formatDuracion(servicio.duracion_dias)}
                </span>
              )}
              {servicio.tipo_pago === 'pago_unico' && (
                <span className="text-sm text-gray-400 font-normal"> único</span>
              )}
            </div>
            
            {/* ✅ BOTÓN SEGÚN TIPO_PAGO */}
            <button className={`${colorScheme.button} text-white font-bold px-6 py-2 rounded-lg text-sm shadow-lg transform transition-all duration-200 hover:scale-105`}>
              {servicio.tipo_pago === 'suscripcion' ? 'Suscribirse' : 'Contratar'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

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

      {/* Indicador de filtro activo */}
      {selectedCategory !== 'Todos' && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-200 font-medium">
                Mostrando <span className="text-amber-400 font-bold">{itemsFiltrados.length}</span> productos de: 
                <span className="text-amber-400 font-bold ml-1">{selectedCategory}</span>
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory('Todos')}
              className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <span>Quitar filtro</span>
              <span className="text-xs">✕</span>
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas de categorías - Ahora clickeables como filtros */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {/* Cursos Premium */}
          <motion.div 
            onClick={() => setSelectedCategory('Cursos')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-2xl p-4 text-center border transition-all duration-300 cursor-pointer
              ${selectedCategory === 'Cursos' 
                ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/20' 
                : 'border-amber-500/20 hover:border-amber-400/60'
              }`}
          >
            <div className="text-2xl lg:text-3xl font-bold text-amber-400 mb-1">{cursos.length}</div>
            <div className="text-xs lg:text-sm text-gray-400">Cursos Premium</div>
            <div className="text-xs text-amber-500/70 mt-1">Click para filtrar</div>
          </motion.div>

          {/* Servicios Expert */}
          <motion.div 
            onClick={() => setSelectedCategory('Servicios')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-4 text-center border transition-all duration-300 cursor-pointer
              ${selectedCategory === 'Servicios' 
                ? 'border-purple-400 ring-2 ring-purple-400/50 shadow-lg shadow-purple-400/20' 
                : 'border-purple-500/20 hover:border-purple-400/60'
              }`}
          >
            <div className="text-2xl lg:text-3xl font-bold text-purple-400 mb-1">
              {(() => {
                const categoriasServicios = ['Consultoría', 'Diseño', 'Marketing', 'Automatización', 'Desarrollo', 'Coaching', 'Otros'];
                return servicios.filter(s => 
                  s.tipo_producto !== 'suscripcion' || 
                  (s.tipo_producto === 'suscripcion' && categoriasServicios.includes(s.categoria))
                ).length;
              })()}
            </div>
            <div className="text-xs lg:text-sm text-gray-400">Servicios Expert</div>
            <div className="text-xs text-purple-500/70 mt-1">Click para filtrar</div>
          </motion.div>

          {/* Software & SaaS */}
          <motion.div 
            onClick={() => setSelectedCategory('Software & SaaS')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-4 text-center border transition-all duration-300 cursor-pointer
              ${selectedCategory === 'Software & SaaS' 
                ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-400/20' 
                : 'border-cyan-500/20 hover:border-cyan-400/60'
              }`}
          >
            <div className="text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">
              {(() => {
                const categoriasSoftware = ['Software', 'SaaS', 'Herramientas', 'Tecnología', 'Plataforma'];
                return servicios.filter(s => 
                  s.tipo_producto === 'suscripcion' && 
                  (categoriasSoftware.includes(s.categoria) || s.categoria.toLowerCase().includes('software') || s.categoria.toLowerCase().includes('saas'))
                ).length;
              })()}
            </div>
            <div className="text-xs lg:text-sm text-gray-400">Software & SaaS</div>
            <div className="text-xs text-cyan-500/70 mt-1">Click para filtrar</div>
          </motion.div>

          {/* Productos */}
          <motion.div 
            onClick={() => setSelectedCategory('Productos Físicos')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-4 text-center border transition-all duration-300 cursor-pointer
              ${selectedCategory === 'Productos Físicos' 
                ? 'border-green-400 ring-2 ring-green-400/50 shadow-lg shadow-green-400/20' 
                : 'border-green-500/20 hover:border-green-400/60'
              }`}
          >
            <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-1">0</div>
            <div className="text-xs lg:text-sm text-gray-400">Productos</div>
            <div className="text-xs text-green-500/70 mt-1">Click para filtrar</div>
          </motion.div>

          {/* Propiedades */}
          <motion.div 
            onClick={() => setSelectedCategory('Propiedades')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-2xl p-4 text-center border transition-all duration-300 cursor-pointer
              ${selectedCategory === 'Propiedades' 
                ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-400/20' 
                : 'border-blue-500/20 hover:border-blue-400/60'
              }`}
          >
            <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-xs lg:text-sm text-gray-400">Propiedades</div>
            <div className="text-xs text-blue-500/70 mt-1">Click para filtrar</div>
          </motion.div>

          {/* Botón para mostrar todos */}
          <motion.div 
            onClick={() => setSelectedCategory('Todos')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-2xl p-4 text-center border transition-all duration-300 cursor-pointer
              ${selectedCategory === 'Todos' 
                ? 'border-gray-400 ring-2 ring-gray-400/50 shadow-lg shadow-gray-400/20' 
                : 'border-gray-600/20 hover:border-gray-400/60'
              }`}
          >
            <div className="text-2xl lg:text-3xl font-bold text-gray-400 mb-1">🌟</div>
            <div className="text-xs lg:text-sm text-gray-400">Ver Todos</div>
            <div className="text-xs text-gray-500/70 mt-1">Mostrar todo</div>
          </motion.div>
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