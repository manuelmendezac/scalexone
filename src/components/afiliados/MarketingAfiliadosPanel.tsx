import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Clock, GraduationCap, Briefcase, ChevronDown, Send, Heart, DollarSign, TrendingUp, Settings } from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';
import { OfertasMarketplaceService } from '../../services/ofertasMarketplaceService';
import type { OfertaMarketplace } from '../../services/ofertasMarketplaceService';

interface SolicitudAfiliacion {
  id: string;
  producto_id: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
  producto?: OfertaMarketplace;
}

const MarketingAfiliadosPanel: React.FC = () => {
  const [ofertas, setOfertas] = useState<OfertaMarketplace[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('popularidad');
  const [showSolicitudes, setShowSolicitudes] = useState(false);

  const categorias = ['Todos', 'Cursos de Trading', 'Marketing Digital', 'Automatización', 'Consultoría Business', 'Herramientas Premium', 'Coaching Personal'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar ofertas afiliables del nuevo sistema
      await cargarOfertas();
      
      // Cargar solicitudes del usuario
      await cargarSolicitudes(user.id);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarOfertas = async () => {
    try {
      // Usar el nuevo servicio de ofertas
      const ofertasData = await OfertasMarketplaceService.obtenerOfertasAfiliables();
      setOfertas(ofertasData);
    } catch (error) {
      console.error('Error cargando ofertas:', error);
      toast.error('Error al cargar las ofertas del marketplace');
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

  const enviarSolicitudAfiliacion = async (oferta: OfertaMarketplace) => {
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
        .eq('producto_id', oferta.id)
        .single();

      if (existente) {
        toast.error('Ya tienes una solicitud pendiente para esta oferta');
        return;
      }

      // Crear nueva solicitud
      const { error } = await supabase
        .from('solicitudes_afiliacion')
        .insert([{
          usuario_id: user.id,
          producto_id: oferta.id,
          tipo_producto: oferta.tipo_producto,
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

  const ofertasFiltradas = React.useMemo(() => {
    let items = ofertas;
    
    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      items = items.filter(item => item.categoria === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      items = items.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          return a.comision_nivel1 - b.comision_nivel1;
        case 'popularidad':
        default:
          return b.ventas_totales - a.ventas_totales;
      }
    });

    return items;
  }, [ofertas, searchTerm, selectedCategory, sortBy]);

  const renderOfertaCard = (oferta: OfertaMarketplace) => {
    const solicitudExistente = solicitudes.find(s => s.producto_id === oferta.id);
    
    const getColorByType = (tipo: string) => {
      switch (tipo) {
        case 'curso': return 'from-amber-500/20 to-yellow-600/20 border-amber-500/30';
        case 'servicio': return 'from-purple-500/20 to-indigo-600/20 border-purple-500/30';
        case 'suscripcion': return 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30';
        default: return 'from-gray-500/20 to-slate-600/20 border-gray-500/30';
      }
    };

    const getIconByType = (tipo: string) => {
      switch (tipo) {
        case 'curso': return <GraduationCap className="w-5 h-5" />;
        case 'servicio': return <Briefcase className="w-5 h-5" />;
        case 'suscripcion': return <Settings className="w-5 h-5" />;
        default: return <Star className="w-5 h-5" />;
      }
    };

    return (
      <motion.div
        key={oferta.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${getColorByType(oferta.tipo_producto)} backdrop-blur-sm rounded-xl p-6 border hover:shadow-xl transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg text-amber-400">
              {getIconByType(oferta.tipo_producto)}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg line-clamp-1">{oferta.titulo}</h3>
              <p className="text-gray-300 text-sm">{oferta.proveedor}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">${oferta.precio}</div>
            {oferta.precio_original && (
              <div className="text-sm text-gray-400 line-through">${oferta.precio_original}</div>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div className="mb-4 rounded-lg overflow-hidden bg-black/20 h-32 flex items-center justify-center">
          {oferta.imagen_url ? (
            <img 
              src={oferta.imagen_url} 
              alt={oferta.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400">
              {getIconByType(oferta.tipo_producto)}
            </div>
          )}
        </div>

        {/* Descripción */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{oferta.descripcion}</p>

        {/* Métricas */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white">{oferta.rating}</span>
            <span className="text-gray-400">({oferta.reviews} reviews)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">{oferta.ventas_totales} ventas</span>
          </div>
        </div>

        {/* Comisiones */}
        <div className="bg-black/30 rounded-lg p-3 mb-4">
          <div className="text-white text-sm font-medium mb-2">Comisiones por Nivel:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-green-400 font-bold">{oferta.comision_nivel1}%</div>
              <div className="text-gray-400">Nivel 1</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{oferta.comision_nivel2}%</div>
              <div className="text-gray-400">Nivel 2</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold">{oferta.comision_nivel3}%</div>
              <div className="text-gray-400">Nivel 3</div>
            </div>
          </div>
        </div>

        {/* Detalles específicos por tipo */}
        {oferta.tipo_producto === 'curso' && oferta.duracion_horas && (
          <div className="flex items-center space-x-2 text-sm text-gray-300 mb-3">
            <Clock className="w-4 h-4" />
            <span>{oferta.duracion_horas} horas • {oferta.nivel}</span>
          </div>
        )}

        {oferta.tipo_producto === 'servicio' && oferta.duracion_dias && (
          <div className="flex items-center space-x-2 text-sm text-gray-300 mb-3">
            <Clock className="w-4 h-4" />
            <span>{oferta.duracion_dias} días de servicio</span>
          </div>
        )}

        {/* Categoría y tipo */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
            {oferta.categoria}
          </span>
          <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-300 capitalize">
            {oferta.tipo_producto.replace('_', ' ')}
          </span>
        </div>

        {/* Botón de acción */}
        {solicitudExistente ? (
          <div className={`w-full p-3 rounded-lg text-center text-sm font-medium ${
            solicitudExistente.estado === 'pendiente' 
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
              : solicitudExistente.estado === 'aprobada'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {solicitudExistente.estado === 'pendiente' && 'Solicitud Pendiente'}
            {solicitudExistente.estado === 'aprobada' && 'Afiliación Aprobada'}
            {solicitudExistente.estado === 'rechazada' && 'Solicitud Rechazada'}
          </div>
        ) : (
          <button
            onClick={() => enviarSolicitudAfiliacion(oferta)}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Solicitar Afiliación</span>
          </button>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <span className="ml-3 text-gray-300">Cargando ofertas del marketplace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-6 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              🛒 Marketplace de Afiliados ScaleXone
            </h1>
            <p className="text-gray-300">
              Descubre y solicita afiliación a los mejores productos y servicios del marketplace
            </p>
          </div>
          <button
            onClick={() => setShowSolicitudes(!showSolicitudes)}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Heart className="w-4 h-4" />
            <span>Mis Solicitudes ({solicitudes.length})</span>
          </button>
        </div>
      </div>

      {/* Mis Solicitudes Panel */}
      {showSolicitudes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900/50 rounded-xl border border-gray-700"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Mis Solicitudes de Afiliación</h2>
            {solicitudes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tienes solicitudes de afiliación aún</p>
            ) : (
              <div className="space-y-3">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Producto ID: {solicitud.producto_id}</h3>
                        <p className="text-gray-400 text-sm">
                          Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      solicitud.estado === 'pendiente' 
                        ? 'bg-yellow-500/20 text-yellow-300' 
                        : solicitud.estado === 'aprobada'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="popularidad">Más Populares</option>
              <option value="comision">Mayor Comisión</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">Total Ofertas</p>
              <p className="text-white text-2xl font-bold">{ofertas.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Comisión Promedio</p>
              <p className="text-white text-2xl font-bold">
                {ofertas.length > 0 ? Math.round(ofertas.reduce((acc, o) => acc + o.comision_nivel1, 0) / ofertas.length) : 0}%
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Mis Solicitudes</p>
              <p className="text-white text-2xl font-bold">{solicitudes.length}</p>
            </div>
            <Send className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-lg p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm">Aprobadas</p>
              <p className="text-white text-2xl font-bold">
                {solicitudes.filter(s => s.estado === 'aprobada').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Grid de ofertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ofertasFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No se encontraron ofertas</div>
            <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        ) : (
          ofertasFiltradas.map(renderOfertaCard)
        )}
      </div>
    </div>
  );
};

export default MarketingAfiliadosPanel; 