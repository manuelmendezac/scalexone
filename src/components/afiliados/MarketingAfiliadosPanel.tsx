import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Clock, GraduationCap, Briefcase, ChevronDown, Send, Heart, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

interface Producto {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  proveedor: string;
  categoria: string;
  rating: number;
  reviews: number;
  activo: boolean;
  tipo_producto: string;
  duracion_dias?: number;
  comision_nivel1: number;
  comision_nivel2: number;
  comision_nivel3: number;
  afilible: boolean;
}

interface SolicitudAfiliacion {
  id: string;
  producto_id: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
  producto?: Producto;
}

const MarketingAfiliadosPanel: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('popularidad');
  const [showSolicitudes, setShowSolicitudes] = useState(false);

  const categorias = ['Todos', 'Cursos', 'Servicios', 'Software & SaaS', 'Productos Físicos', 'Propiedades'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar todos los productos afiliables del marketplace
      await cargarProductos();
      
      // Cargar solicitudes del usuario
      await cargarSolicitudes(user.id);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      // Cargar cursos
      const { data: cursosData } = await supabase
        .from('cursos_marketplace')
        .select('*')
        .eq('activo', true);

      // Cargar servicios
      const { data: serviciosData } = await supabase
        .from('servicios_marketplace')
        .select('*')
        .eq('activo', true)
        .eq('afilible', true);

      const cursosFormateados: Producto[] = (cursosData || []).map(curso => ({
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        precio: curso.precio || 0,
        imagen_url: curso.imagen_url,
        proveedor: curso.instructor || 'ScaleXone',
        categoria: 'Cursos',
        rating: curso.rating || 4.8,
        reviews: curso.estudiantes || 0,
        activo: curso.activo,
        tipo_producto: 'curso',
        comision_nivel1: 25,
        comision_nivel2: 15,
        comision_nivel3: 10,
        afilible: true
      }));

      const serviciosFormateados: Producto[] = (serviciosData || []).map(servicio => ({
        id: servicio.id,
        titulo: servicio.titulo,
        descripcion: servicio.descripcion,
        precio: servicio.precio || 0,
        imagen_url: servicio.imagen_url,
        proveedor: servicio.proveedor || 'ScaleXone',
        categoria: servicio.tipo_producto === 'suscripcion' ? 'Software & SaaS' : 'Servicios',
        rating: servicio.rating || 4.8,
        reviews: servicio.reviews || 0,
        activo: servicio.activo,
        tipo_producto: servicio.tipo_producto || 'servicio',
        duracion_dias: servicio.duracion_dias,
        comision_nivel1: servicio.comision_nivel1 || 20,
        comision_nivel2: servicio.comision_nivel2 || 15,
        comision_nivel3: servicio.comision_nivel3 || 10,
        afilible: servicio.afilible || false
      }));

      setProductos([...cursosFormateados, ...serviciosFormateados]);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const cargarSolicitudes = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('solicitudes_afiliacion')
        .select(`
          *,
          producto:producto_id (titulo, precio, imagen_url)
        `)
        .eq('usuario_id', userId)
        .order('fecha_solicitud', { ascending: false });

      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  };

  const enviarSolicitudAfiliacion = async (producto: Producto) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes estar logueado');
        return;
      }

      // Verificar si ya existe una solicitud
      const { data: existente } = await supabase
        .from('solicitudes_afiliacion')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('producto_id', producto.id)
        .single();

      if (existente) {
        toast.error('Ya tienes una solicitud pendiente para este producto');
        return;
      }

      // Crear nueva solicitud
      const { error } = await supabase
        .from('solicitudes_afiliacion')
        .insert([{
          usuario_id: user.id,
          producto_id: producto.id,
          tipo_producto: producto.tipo_producto,
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Solicitud enviada exitosamente');
      await cargarSolicitudes(user.id);
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud');
    }
  };

  const productosFiltrados = React.useMemo(() => {
    let items = productos;
    
    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      items = items.filter(item => item.categoria === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      items = items.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
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
        case 'comision':
          return b.comision_nivel1 - a.comision_nivel1;
        case 'popularidad':
        default:
          return b.reviews - a.reviews;
      }
    });

    return items;
  }, [productos, searchTerm, selectedCategory, sortBy]);

  const renderProductCard = (producto: Producto) => {
    const solicitudExistente = solicitudes.find(s => s.producto_id === producto.id);
    const esSuscripcion = producto.tipo_producto === 'suscripcion';
    
    const colorScheme = esSuscripcion 
      ? { 
          border: 'border-cyan-500/20 hover:border-cyan-400/40',
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          text: 'text-cyan-400',
          button: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
          bg: 'from-cyan-900/30 to-blue-900/30'
        }
      : producto.categoria === 'Cursos'
      ? {
          border: 'border-amber-500/20 hover:border-amber-400/40',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-500',
          text: 'text-amber-400',
          button: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500',
          bg: 'from-amber-900/30 to-yellow-900/30'
        }
      : {
          border: 'border-purple-500/20 hover:border-purple-400/40',
          badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
          text: 'text-purple-400',
          button: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500',
          bg: 'from-purple-900/30 to-pink-900/30'
        };

    return (
      <motion.div
        key={producto.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl ${colorScheme.border} transition-all group cursor-pointer overflow-hidden shadow-lg hover:shadow-xl`}
      >
        {/* Imagen */}
        <div className="relative">
          <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
            {producto.imagen_url ? (
              <img 
                src={producto.imagen_url} 
                alt={producto.titulo} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorScheme.bg}`}>
                {producto.categoria === 'Cursos' ? (
                  <GraduationCap size={48} className={colorScheme.text} />
                ) : (
                  <Briefcase size={48} className={colorScheme.text} />
                )}
              </div>
            )}
            
            {/* Badge de comisión */}
            <div className="absolute top-3 left-3">
              <span className={`${colorScheme.badge} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                {producto.comision_nivel1}% Comisión
              </span>
            </div>
            
            {/* Rating */}
            <div className="absolute top-3 right-3">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <Star className={`w-3 h-3 ${colorScheme.text} fill-current`} />
                <span className="text-white text-xs font-semibold">{producto.rating}</span>
              </div>
            </div>

            {/* Estado de solicitud */}
            {solicitudExistente && (
              <div className="absolute bottom-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                  solicitudExistente.estado === 'aprobada' ? 'bg-green-500' :
                  solicitudExistente.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {solicitudExistente.estado === 'aprobada' ? '✓ Aprobado' :
                   solicitudExistente.estado === 'rechazada' ? '✗ Rechazado' : '⏳ Pendiente'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="p-6">
          <h3 className="text-gray-900 font-bold text-lg mb-2 line-clamp-2">
            {producto.titulo}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {producto.descripcion}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{producto.reviews} reviews</span>
            </div>
            <div className={`bg-gray-100 ${colorScheme.text} px-2 py-1 rounded-full text-xs font-semibold`}>
              {producto.categoria}
            </div>
          </div>
          
          {/* Proveedor */}
          <div className="text-sm text-gray-500 mb-4">
            Por: <span className={`${colorScheme.text} font-semibold`}>{producto.proveedor}</span>
          </div>

          {/* Comisiones */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Comisiones:</span>
              <div className="flex gap-2">
                <span className="text-green-600 font-semibold">N1: {producto.comision_nivel1}%</span>
                <span className="text-blue-600 font-semibold">N2: {producto.comision_nivel2}%</span>
                <span className="text-purple-600 font-semibold">N3: {producto.comision_nivel3}%</span>
              </div>
            </div>
          </div>
          
          {/* Precio y Botón */}
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold bg-gradient-to-r ${esSuscripcion ? 'from-cyan-600 to-blue-600' : producto.categoria === 'Cursos' ? 'from-amber-600 to-yellow-600' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
              ${producto.precio}
              {esSuscripcion && producto.duracion_dias && (
                <span className="text-sm text-gray-500 font-normal">
                  /{producto.duracion_dias === 30 ? 'mes' : producto.duracion_dias === 365 ? 'año' : `${producto.duracion_dias}d`}
                </span>
              )}
            </div>
            <button 
              onClick={() => enviarSolicitudAfiliacion(producto)}
              disabled={!!solicitudExistente}
              className={`${colorScheme.button} text-white font-bold px-6 py-2 rounded-lg text-sm shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {solicitudExistente ? (
                <>
                  <Heart size={16} />
                  {solicitudExistente.estado === 'aprobada' ? 'Afiliado' : 
                   solicitudExistente.estado === 'rechazada' ? 'Rechazado' : 'Pendiente'}
                </>
              ) : (
                <>
                  <Send size={16} />
                  Solicitar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🚀 Marketing de Afiliados
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Descubre productos increíbles para promocionar y generar comisiones. ¡Únete a nuestro programa de afiliados estilo Hotmart!
            </p>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{productos.length}</div>
              <div className="text-blue-200 text-sm">Productos Disponibles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{solicitudes.filter(s => s.estado === 'aprobada').length}</div>
              <div className="text-blue-200 text-sm">Afiliaciones Activas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{solicitudes.filter(s => s.estado === 'pendiente').length}</div>
              <div className="text-blue-200 text-sm">Solicitudes Pendientes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">25%</div>
              <div className="text-blue-200 text-sm">Comisión Promedio</div>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos para afiliar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-gray-800 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              {/* Filtro de categoría */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
              </div>

              {/* Ordenamiento */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="popularidad">Más Popular</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Valorado</option>
                  <option value="comision">Mayor Comisión</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
              </div>

              {/* Toggle solicitudes */}
              <button
                onClick={() => setShowSolicitudes(!showSolicitudes)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  showSolicitudes 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Mis Solicitudes ({solicitudes.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {showSolicitudes ? (
          /* Panel de solicitudes */
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mis Solicitudes de Afiliación</h2>
            
            {solicitudes.length === 0 ? (
              <div className="text-center py-12">
                <Send size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Sin solicitudes aún</h3>
                <p className="text-gray-500">¡Comienza enviando solicitudes para productos que te interesen!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-white rounded-lg border p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {solicitud.producto?.imagen_url ? (
                          <img src={solicitud.producto.imagen_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{solicitud.producto?.titulo || 'Producto'}</h3>
                        <p className="text-sm text-gray-600">Solicitud enviada: {new Date(solicitud.fecha_solicitud).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Precio: ${solicitud.producto?.precio || 0}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                        solicitud.estado === 'rechazada' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {solicitud.estado === 'aprobada' ? '✓ Aprobada' :
                         solicitud.estado === 'rechazada' ? '✗ Rechazada' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grid de productos */
          <div>
            {/* Indicador de filtro activo */}
            {selectedCategory !== 'Todos' && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-800 font-medium">
                      Mostrando <span className="font-bold">{productosFiltrados.length}</span> productos de: 
                      <span className="font-bold ml-1">{selectedCategory}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCategory('Todos')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Quitar filtro ✕
                  </button>
                </div>
              </div>
            )}

            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Search size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {productosFiltrados.map(renderProductCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingAfiliadosPanel; 