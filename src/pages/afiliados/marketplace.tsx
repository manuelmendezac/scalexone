import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Clock, GraduationCap, Briefcase, ChevronDown, Send, Heart, DollarSign, TrendingUp, Settings, Shield, Award, Eye, Zap, Calendar, BarChart3, Target, MousePointer, ShoppingCart, Percent, RefreshCw, Download, Filter as FilterIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

// Interfaces para los productos del marketplace
interface CursoMarketplace {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  instructor: string;
  duracion_horas?: number;
  nivel?: string;
  rating: number;
  estudiantes?: number;
  categoria?: string;
  activo: boolean;
  // Campos de afiliación
  afilible?: boolean;
  niveles_comision?: number;
  comision_nivel1?: number;
  comision_nivel2?: number;
  comision_nivel3?: number;
  tipo_producto?: 'curso' | 'suscripcion';
}

interface ServicioMarketplace {
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
  // Campos de afiliación
  afilible?: boolean;
  niveles_comision?: number;
  comision_nivel1?: number;
  comision_nivel2?: number;
  comision_nivel3?: number;
  tipo_producto?: 'servicio' | 'suscripcion';
  tipo_pago?: 'pago_unico' | 'suscripcion';
  duracion_dias?: number;
}

type ProductoMarketplace = (CursoMarketplace | ServicioMarketplace) & {
  tabla_origen: 'cursos' | 'servicios';
};

interface SolicitudAfiliacion {
  id: string;
  producto_id: string;
  tabla_producto: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
}

const MarketplaceAfiliados: React.FC = () => {
  const [productos, setProductos] = useState<ProductoMarketplace[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('comision');

  const categorias = [
    'Todos', 
    '📚 Cursos Premium', 
    '🔧 Servicios Profesionales', 
    '💻 Software & SaaS', 
    '💎 Membresías VIP',
    '🏃‍♂️ Coaching Personal',
    '📈 Marketing Digital',
    '⚙️ Automatización',
    '🎨 Diseño',
    '📊 Consultoría Business'
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      await cargarProductosMarketplace();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await cargarSolicitudes(user.id);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosMarketplace = async () => {
    try {
      // Cargar cursos afiliables
      const { data: cursos, error: errorCursos } = await supabase
        .from('cursos_marketplace')
        .select('*')
        .eq('afilible', true)
        .eq('activo', true);

      // Cargar servicios afiliables
      const { data: servicios, error: errorServicios } = await supabase
        .from('servicios_marketplace')
        .select('*')
        .eq('afilible', true)
        .eq('activo', true);

      if (errorCursos) {
        console.error('Error cargando cursos:', errorCursos);
      }
      if (errorServicios) {
        console.error('Error cargando servicios:', errorServicios);
      }

      // Combinar y mapear datos
      const productosMap: ProductoMarketplace[] = [
        ...(cursos || []).map(curso => ({
          ...curso,
          tabla_origen: 'cursos' as const,
          // Mapear campos para consistencia
          proveedor: curso.instructor,
          reviews: curso.estudiantes || 0
        })),
        ...(servicios || []).map(servicio => ({
          ...servicio,
          tabla_origen: 'servicios' as const,
          // Mapear campos para consistencia
          instructor: servicio.proveedor,
          estudiantes: servicio.reviews || 0
        }))
      ];

      setProductos(productosMap);
    } catch (error) {
      console.error('Error cargando productos marketplace:', error);
      toast.error('Error cargando productos del marketplace');
    }
  };

  const cargarSolicitudes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('solicitudes_afiliacion')
        .select('*')
        .eq('usuario_id', userId)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  };

  const enviarSolicitudAfiliacion = async (producto: ProductoMarketplace) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes estar autenticado para solicitar afiliación');
        return;
      }

      // Verificar si ya existe una solicitud
      const { data: solicitudExistente } = await supabase
        .from('solicitudes_afiliacion')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('producto_id', producto.id)
        .eq('tabla_producto', producto.tabla_origen)
        .single();

      if (solicitudExistente) {
        toast.error('Ya has enviado una solicitud para este producto');
        return;
      }

      const { error } = await supabase
        .from('solicitudes_afiliacion')
        .insert({
          usuario_id: user.id,
          producto_id: producto.id,
          tabla_producto: producto.tabla_origen,
          estado: 'pendiente'
        });

      if (error) throw error;

      toast.success('¡Solicitud de afiliación enviada exitosamente!');
      await cargarSolicitudes(user.id);
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error enviando solicitud de afiliación');
    }
  };

  const getCategoriaDisplay = (producto: ProductoMarketplace) => {
    if (producto.tabla_origen === 'cursos') {
      return '📚 Cursos Premium';
    }
    
    if (producto.tabla_origen === 'servicios') {
      const categoria = (producto as ServicioMarketplace).categoria?.toLowerCase() || '';
      
      if (['software', 'saas', 'app', 'plataforma', 'sistema', 'herramienta', 'automatización'].some(tech => categoria.includes(tech))) {
        return '💻 Software & SaaS';
      }
      
      if (['vip', 'premium', 'exclusivo', 'elite', 'membresía'].some(vip => categoria.includes(vip))) {
        return '💎 Membresías VIP';
      }
      
      if (['coaching', 'mentor', 'personal'].some(coach => categoria.includes(coach))) {
        return '🏃‍♂️ Coaching Personal';
      }
      
      if (['marketing', 'publicidad', 'seo', 'social'].some(market => categoria.includes(market))) {
        return '📈 Marketing Digital';
      }
      
      if (['diseño', 'gráfico', 'ui', 'ux'].some(design => categoria.includes(design))) {
        return '🎨 Diseño';
      }
      
      if (['consultoría', 'business', 'estrategia', 'negocio'].some(business => categoria.includes(business))) {
        return '📊 Consultoría Business';
      }
      
      return '🔧 Servicios Profesionales';
    }
    
    return '🔧 Servicios Profesionales';
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchesSearch = producto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (producto.tabla_origen === 'cursos' 
                           ? (producto as CursoMarketplace).instructor?.toLowerCase().includes(searchTerm.toLowerCase())
                           : (producto as ServicioMarketplace).proveedor?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'Todos' || getCategoriaDisplay(producto) === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'comision':
        return (b.comision_nivel1 || 0) - (a.comision_nivel1 || 0);
      case 'popularidad':
        const aReviews = a.tabla_origen === 'cursos' ? (a as CursoMarketplace).estudiantes || 0 : (a as ServicioMarketplace).reviews || 0;
        const bReviews = b.tabla_origen === 'cursos' ? (b as CursoMarketplace).estudiantes || 0 : (b as ServicioMarketplace).reviews || 0;
        return bReviews - aReviews;
      case 'precio-desc':
        return b.precio - a.precio;
      case 'precio-asc':
        return a.precio - b.precio;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const renderProductoCard = (producto: ProductoMarketplace) => {
    const categoriaDisplay = getCategoriaDisplay(producto);
    
    const getColorScheme = () => {
      if (categoriaDisplay.includes('Cursos')) return 'from-amber-500/20 to-yellow-600/20 border-amber-500/30';
      if (categoriaDisplay.includes('Software')) return 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30';
      return 'from-purple-500/20 to-indigo-600/20 border-purple-500/30';
    };

    const getBadgeColor = () => {
      if (categoriaDisplay.includes('Cursos')) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      if (categoriaDisplay.includes('Software')) return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    };

    const getTipoInfo = () => {
      if (producto.tabla_origen === 'cursos') {
        const curso = producto as CursoMarketplace;
        const duracion = curso.duracion_horas ? `${curso.duracion_horas}h` : 'N/A';
        const nivel = curso.nivel || 'Todos';
        return { duracion, nivel, tipo: 'Curso' };
      } else {
        const servicio = producto as ServicioMarketplace;
        let tipoDisplay = 'Servicio';
        let duracionDisplay = 'N/A';
        
        if (servicio.tipo_pago === 'suscripcion') {
          tipoDisplay = 'Suscripción';
          if (servicio.duracion_dias && servicio.duracion_dias > 0) {
            duracionDisplay = servicio.duracion_dias === 30 ? '1 mes' : 
                            servicio.duracion_dias === 365 ? '1 año' : 
                            `${servicio.duracion_dias} días`;
          }
        } else {
          tipoDisplay = 'Pago Único';
          duracionDisplay = 'Permanente';
        }
        
        return { duracion: duracionDisplay, nivel: 'Profesional', tipo: tipoDisplay };
      }
    };

    const getDescripcionHotmart = () => {
      if (producto.tabla_origen === 'cursos') {
        return "Curso completo con metodología probada. Acceso vitalicio + certificado. Material actualizado y soporte incluido.";
      } else {
        return "Servicio profesional de alta calidad. Resultados garantizados. Soporte técnico incluido.";
      }
    };

    const tipoInfo = getTipoInfo();

    return (
      <motion.div
        key={producto.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={`bg-gradient-to-br ${getColorScheme()} rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border cursor-pointer group`}
      >
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
            {producto.imagen_url ? (
              <img 
                src={producto.imagen_url} 
                alt={producto.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-300">
                {producto.tabla_origen === 'cursos' ? (
                  <GraduationCap className="w-16 h-16 mx-auto mb-2" />
                ) : (
                  <Briefcase className="w-16 h-16 mx-auto mb-2" />
                )}
                <span className="text-sm">Imagen próximamente</span>
              </div>
            )}
          </div>
          
          <div className={`absolute top-3 left-3 px-2 py-1 ${getBadgeColor()} rounded-full text-xs font-medium`}>
            {categoriaDisplay.replace(/[📚🔧💻💎🏃‍♂️📈⚙️🎨📊]/g, '').trim()}
          </div>
          
          <div className="absolute top-3 right-3 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-bold border border-green-500/30">
            {producto.comision_nivel1}% comisión
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-white text-lg font-bold mb-2 group-hover:text-amber-300 transition-colors">
              {producto.titulo}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {getDescripcionHotmart()}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{tipoInfo.duracion}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{tipoInfo.nivel}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{producto.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">${producto.precio.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">
                por {producto.tabla_origen === 'cursos' ? 
                  (producto as CursoMarketplace).instructor : 
                  (producto as ServicioMarketplace).proveedor}
              </div>
            </div>

            <button
              onClick={() => enviarSolicitudAfiliacion(producto)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Solicitar Afiliación
            </button>
          </div>

          {producto.niveles_comision && producto.niveles_comision > 1 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-300 text-xs font-medium mb-2">Estructura de Comisiones:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-green-400 font-bold">{producto.comision_nivel1}%</div>
                  <div className="text-gray-500">Nivel 1</div>
                </div>
                {producto.comision_nivel2 && (
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">{producto.comision_nivel2}%</div>
                    <div className="text-gray-500">Nivel 2</div>
                  </div>
                )}
                {producto.comision_nivel3 && (
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">{producto.comision_nivel3}%</div>
                    <div className="text-gray-500">Nivel 3</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header estilo Hotmart para Marketplace */}
      <div className="bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
              🛒 Marketplace de Afiliados
            </h1>
            <p className="text-gray-300 text-lg">
              Descubre productos premium con las mejores comisiones del mercado. Gana dinero promocionando lo que realmente funciona.
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <Shield className="w-4 h-4" />
                <span>Pagos garantizados</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Zap className="w-4 h-4" />
                <span>Comisiones hasta 30%</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Award className="w-4 h-4" />
                <span>Productos verificados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda mejorados */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cursos, servicios, membresías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 min-w-[200px]"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="comision">🔥 Mayor Comisión</option>
              <option value="popularidad">⭐ Más Populares</option>
              <option value="precio-desc">💰 Mayor Precio</option>
              <option value="precio-asc">💡 Menor Precio</option>
              <option value="rating">⭐ Mejor Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Productos Disponibles</p>
              <p className="text-white text-2xl font-bold">{productos.length}</p>
              <p className="text-blue-200 text-xs mt-1">Listos para promocionar</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Comisión Promedio</p>
              <p className="text-white text-2xl font-bold">
                {productos.length > 0 ? Math.round(productos.reduce((acc, p) => acc + (p.comision_nivel1 || 0), 0) / productos.length) : 0}%
              </p>
              <p className="text-green-200 text-xs mt-1">Por venta directa</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Mis Solicitudes</p>
              <p className="text-white text-2xl font-bold">{solicitudes.length}</p>
              <p className="text-purple-200 text-xs mt-1">En total</p>
            </div>
            <Send className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-lg p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm font-medium">Aprobadas</p>
              <p className="text-white text-2xl font-bold">
                {solicitudes.filter(s => s.estado === 'aprobada').length}
              </p>
              <p className="text-amber-200 text-xs mt-1">Listas para vender</p>
            </div>
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Grid de productos estilo Hotmart */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {selectedCategory === 'Todos' ? 'Todos los Productos' : selectedCategory}
          </h2>
          <div className="text-gray-400 text-sm">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {productosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-gray-400 text-xl mb-3">🔍 No se encontraron productos</div>
            <p className="text-gray-500 mb-4">Intenta ajustar tus filtros de búsqueda o explora otras categorías</p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchTerm('');
              }}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-yellow-700 transition-all"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map(renderProductoCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceAfiliados;
