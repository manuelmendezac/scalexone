import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Clock, GraduationCap, Briefcase, ChevronDown, Send, Heart, DollarSign, TrendingUp, Settings, Shield, Award, Eye, Zap, Calendar, BarChart3, Target, MousePointer, ShoppingCart, Percent, RefreshCw, Download, Filter as FilterIcon, CheckCircle, Package } from 'lucide-react';
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
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col h-full">
        <div className="relative">
          <img src={producto.imagen_url} alt={producto.titulo} className="w-full h-48 object-cover" />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor()}`}>
              {categoriaDisplay.replace(/[📚🔧💻💎🏃‍♂️📈⚙️📊]/g, '').trim()}
            </span>
          </div>
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md self-start mb-2 ${getBadgeColor()}`}>
            {categoriaDisplay}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex-grow">{producto.titulo}</h3>
          <p className="text-gray-600 text-sm mb-4">
            {getDescripcionHotmart()}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-500 mb-4 border-t border-b border-gray-100 py-3">
            <div><strong className="block text-gray-700">{tipoInfo.duracion}</strong> Duración</div>
            <div><strong className="block text-gray-700">{tipoInfo.nivel}</strong> Nivel</div>
            <div><strong className="block text-gray-700">★ {producto.rating.toFixed(1)}</strong> Rating</div>
          </div>
          
          <div className="mt-auto pt-5 border-t border-gray-100">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Comisión de hasta</p>
              <p className="text-3xl font-bold text-green-600">${((producto.precio * (producto.comision_nivel1 || 0)) / 100).toFixed(2)} US$</p>
              <p className="text-sm text-gray-500 mt-1">Precio del producto: ${producto.precio.toFixed(2)} US$</p>
            </div>
            <button
              onClick={() => enviarSolicitudAfiliacion(producto)}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-center"
            >
              Solicitar Afiliación
            </button>

            {producto.niveles_comision && producto.niveles_comision > 1 && (
              <div className="bg-gray-50 rounded-lg p-3 text-center mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Estructura de Comisiones</p>
                <div className="flex justify-around text-xs">
                  <div className="text-green-700"><strong className="block text-lg">{producto.comision_nivel1}%</strong> Nivel 1</div>
                  <div className="text-blue-700"><strong className="block text-lg">{producto.comision_nivel2}%</strong> Nivel 2</div>
                  <div className="text-purple-700"><strong className="block text-lg">{producto.comision_nivel3}%</strong> Nivel 3</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
    <div className="p-4 sm:p-6 bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace de Afiliados</h1>
        <p className="text-gray-600 mt-2">Encuentra los mejores productos y servicios para promocionar.</p>
        <div className="mt-4 flex justify-center items-center space-x-6 text-sm text-gray-500">
          <span className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-1.5"/> Pagos garantizados</span>
          <span className="flex items-center"><TrendingUp className="w-4 h-4 text-blue-500 mr-1.5"/> Comisiones hasta 80%</span>
          <span className="flex items-center"><Shield className="w-4 h-4 text-purple-500 mr-1.5"/> Productos verificados</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-blue-100 rounded-lg p-3 mr-4"><Package className="w-6 h-6 text-blue-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Productos Disponibles</p>
            <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-green-100 rounded-lg p-3 mr-4"><DollarSign className="w-6 h-6 text-green-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Comisión Promedio</p>
            <p className="text-2xl font-bold text-gray-900">
              {productos.length > 0 ? Math.round(productos.reduce((acc, p) => acc + (p.comision_nivel1 || 0), 0) / productos.length) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-purple-100 rounded-lg p-3 mr-4"><Send className="w-6 h-6 text-purple-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Mis Solicitudes</p>
            <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-amber-100 rounded-lg p-3 mr-4"><Star className="w-6 h-6 text-amber-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Aprobadas</p>
            <p className="text-2xl font-bold text-gray-900">
              {solicitudes.filter(s => s.estado === 'aprobada').length}
            </p>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productosFiltrados.map((p) => (
          <div key={`${p.tabla_origen}-${p.id}`}>
            {renderProductoCard(p)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceAfiliados;
