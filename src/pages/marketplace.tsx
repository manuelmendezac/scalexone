import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, GraduationCap, Briefcase, Package, Home, Search, Filter, Star, Users, Play, Clock, DollarSign, ChevronDown } from 'lucide-react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  instructor: string;
  duracion_horas: number;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  rating: number;
  estudiantes: number;
  community_id?: string;
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

type Categoria = 'todos' | 'cursos' | 'servicios' | 'productos' | 'propiedades';

const Marketplace: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroOrden, setFiltroOrden] = useState<'precio' | 'rating' | 'popularidad'>('popularidad');

  const categorias = [
    { key: 'todos', label: 'Todos', icon: <ShoppingBag size={20} />, color: 'from-purple-500 to-pink-500' },
    { key: 'cursos', label: 'Cursos', icon: <GraduationCap size={20} />, color: 'from-blue-500 to-cyan-500' },
    { key: 'servicios', label: 'Servicios', icon: <Briefcase size={20} />, color: 'from-green-500 to-emerald-500' },
    { key: 'productos', label: 'Productos Físicos', icon: <Package size={20} />, color: 'from-orange-500 to-red-500' },
    { key: 'propiedades', label: 'Propiedades', icon: <Home size={20} />, color: 'from-indigo-500 to-purple-500' },
  ];

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
    } catch (error) {
      console.error('Error cargando datos del marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarElementos = () => {
    let elementos: any[] = [];
    
    if (categoriaActiva === 'todos' || categoriaActiva === 'cursos') {
      elementos = [...elementos, ...cursos.map(c => ({ ...c, tipo: 'curso' }))];
    }
    
    if (categoriaActiva === 'todos' || categoriaActiva === 'servicios') {
      elementos = [...elementos, ...servicios.map(s => ({ ...s, tipo: 'servicio' }))];
    }

    // Filtrar por búsqueda
    if (busqueda) {
      elementos = elementos.filter(item => 
        item.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Ordenar
    elementos.sort((a, b) => {
      switch (filtroOrden) {
        case 'precio':
          return a.precio - b.precio;
        case 'rating':
          return b.rating - a.rating;
        case 'popularidad':
          return (b.estudiantes || b.reviews || 0) - (a.estudiantes || a.reviews || 0);
        default:
          return 0;
      }
    });

    return elementos;
  };

  const renderCursoCard = (curso: Curso) => (
    <motion.div
      key={curso.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-400/40 transition-all group cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
          {curso.imagen_url ? (
            <img src={curso.imagen_url} alt={curso.titulo} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <GraduationCap size={48} className="text-cyan-400" />
          )}
        </div>
        <div className="absolute top-2 right-2 bg-cyan-500 text-black px-2 py-1 rounded-full text-xs font-bold">
          CURSO
        </div>
      </div>
      
      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-300 transition-colors">
        {curso.titulo}
      </h3>
      
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {curso.descripcion}
      </p>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-yellow-400 text-sm font-semibold">{curso.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Users size={14} />
          <span>{curso.estudiantes} estudiantes</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Clock size={14} />
          <span>{curso.duracion_horas}h</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-cyan-400">
          ${curso.precio}
        </div>
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform">
          Ver Curso
        </button>
      </div>
    </motion.div>
  );

  const renderServicioCard = (servicio: Servicio) => (
    <motion.div
      key={servicio.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all group cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
          {servicio.imagen_url ? (
            <img src={servicio.imagen_url} alt={servicio.titulo} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Briefcase size={48} className="text-green-400" />
          )}
        </div>
        <div className="absolute top-2 right-2 bg-green-500 text-black px-2 py-1 rounded-full text-xs font-bold">
          SERVICIO
        </div>
      </div>
      
      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-green-300 transition-colors">
        {servicio.titulo}
      </h3>
      
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {servicio.descripcion}
      </p>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-yellow-400 text-sm font-semibold">{servicio.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Users size={14} />
          <span>{servicio.reviews} reviews</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        Por: <span className="text-green-400 font-semibold">{servicio.proveedor}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-green-400">
          ${servicio.precio}
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform">
          Contratar
        </button>
      </div>
    </motion.div>
  );

  const elementosFiltrados = filtrarElementos();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              ScaleXone Marketplace
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Descubre cursos, servicios y productos que impulsan tu crecimiento
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar en el marketplace..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <select
              value={filtroOrden}
              onChange={(e) => setFiltroOrden(e.target.value as any)}
              className="bg-gray-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="popularidad">Más Popular</option>
              <option value="precio">Menor Precio</option>
              <option value="rating">Mejor Valorado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categorias.map((categoria) => (
            <motion.button
              key={categoria.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategoriaActiva(categoria.key as Categoria)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                categoriaActiva === categoria.key
                  ? `bg-gradient-to-r ${categoria.color} text-white shadow-lg`
                  : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'
              }`}
            >
              {categoria.icon}
              <span>{categoria.label}</span>
              {categoria.key === 'productos' || categoria.key === 'propiedades' ? (
                <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">PRÓXIMAMENTE</span>
              ) : null}
            </motion.button>
          ))}
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-400">
            Mostrando {elementosFiltrados.length} resultado{elementosFiltrados.length !== 1 ? 's' : ''}
            {categoriaActiva !== 'todos' && ` en ${categorias.find(c => c.key === categoriaActiva)?.label}`}
          </p>
        </div>

        {/* Grid de elementos */}
        {elementosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {elementosFiltrados.map((elemento) => 
              elemento.tipo === 'curso' 
                ? renderCursoCard(elemento)
                : renderServicioCard(elemento)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-400">
              {busqueda 
                ? `No hay elementos que coincidan con "${busqueda}"`
                : `No hay elementos disponibles en ${categorias.find(c => c.key === categoriaActiva)?.label}`
              }
            </p>
          </div>
        )}

        {/* Secciones próximamente */}
        {(categoriaActiva === 'todos' || categoriaActiva === 'productos') && (
          <div className="mt-12 p-8 bg-black rounded-xl border border-orange-500/20">
            <div className="text-center">
              <Package size={48} className="text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-400 mb-2">Productos Físicos</h3>
              <p className="text-gray-300 mb-4">
                Próximamente: Libros, merchandising, equipos y más productos físicos
              </p>
              <div className="text-sm text-orange-300">🚀 Fase 3 - En desarrollo</div>
            </div>
          </div>
        )}

        {(categoriaActiva === 'todos' || categoriaActiva === 'propiedades') && (
          <div className="mt-8 p-8 bg-black rounded-xl border border-indigo-500/20">
            <div className="text-center">
              <Home size={48} className="text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-indigo-400 mb-2">Propiedades Inmobiliarias</h3>
              <p className="text-gray-300 mb-4">
                Próximamente: Inversiones inmobiliarias, propiedades en renta y más
              </p>
              <div className="text-sm text-indigo-300">🏠 Fase 4 - En desarrollo</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace; 