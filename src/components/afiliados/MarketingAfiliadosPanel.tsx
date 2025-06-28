import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Clock, GraduationCap, Briefcase, ChevronDown, Send, Heart, DollarSign, TrendingUp, Settings, Shield, Award, Eye, Zap, Calendar, BarChart3, Target, MousePointer, ShoppingCart, Percent, RefreshCw, Download, Filter as FilterIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

// Interfaces para el Dashboard
interface DashboardMetrics {
  totalEarnings: number;
  pendingEarnings: number;
  refunds: number;
  refundPercentage: number;
  totalSales: number;
  totalClicks: number;
  totalLeads: number;
  conversionRate: number;
  paymentsGenerated: number;
  paymentsReceived: number;
}

interface EarningsData {
  date: string;
  earnings: number;
}

interface TopAffiliate {
  id: string;
  name: string;
  avatar: string;
  earnings: number;
  rank: number;
}

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

const MarketingAfiliadosPanel: React.FC = () => {
  const [productos, setProductos] = useState<ProductoMarketplace[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('comision');
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  
  // Estado del Dashboard
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dateFilter, setDateFilter] = useState('7d');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalEarnings: 1247.85,
    pendingEarnings: 324.50,
    refunds: 0.00,
    refundPercentage: 0,
    totalSales: 23,
    totalClicks: 1847,
    totalLeads: 142,
    conversionRate: 7.7,
    paymentsGenerated: 8,
    paymentsReceived: 5
  });
  
  // Datos del gráfico de ingresos (últimos 7 días)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([
    { date: '2024-01-15', earnings: 125 },
    { date: '2024-01-16', earnings: 180 },
    { date: '2024-01-17', earnings: 245 },
    { date: '2024-01-18', earnings: 190 },
    { date: '2024-01-19', earnings: 310 },
    { date: '2024-01-20', earnings: 420 },
    { date: '2024-01-21', earnings: 380 }
  ]);
  
  // Top afiliados para gamificación
  const [topAfiliates, setTopAfiliates] = useState<TopAffiliate[]>([
    { id: '1', name: 'Ana García', avatar: '👩‍💼', earnings: 2847.50, rank: 1 },
    { id: '2', name: 'Carlos Ruiz', avatar: '👨‍💻', earnings: 2134.20, rank: 2 },
    { id: '3', name: 'Laura Martín', avatar: '👩‍🚀', earnings: 1856.75, rank: 3 },
    { id: '4', name: 'Diego López', avatar: '👨‍🎯', earnings: 1423.90, rank: 4 },
    { id: '5', name: 'Sofia Torres', avatar: '👩‍🎨', earnings: 1247.85, rank: 5 }
  ]);

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
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar productos del marketplace
      await cargarProductosMarketplace();
      
      // Cargar solicitudes del usuario
      await cargarSolicitudes(user.id);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos del marketplace');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosMarketplace = async () => {
    try {
      // Cargar cursos afiliables
      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos_marketplace')
        .select('*')
        .eq('activo', true)
        .eq('afilible', true);

      if (cursosError) throw cursosError;

      // Cargar servicios afiliables
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios_marketplace')
        .select('*')
        .eq('activo', true)
        .eq('afilible', true);

      if (serviciosError) throw serviciosError;

      // Combinar y etiquetar datos
      const cursosConEtiqueta: ProductoMarketplace[] = (cursosData || []).map(curso => ({
        ...curso,
        tabla_origen: 'cursos' as const,
        proveedor: curso.instructor, // Mapear instructor a proveedor para consistencia
        reviews: curso.estudiantes || 0 // Mapear estudiantes a reviews
      }));

      const serviciosConEtiqueta: ProductoMarketplace[] = (serviciosData || []).map(servicio => ({
        ...servicio,
        tabla_origen: 'servicios' as const
      }));

      const todosProductos = [...cursosConEtiqueta, ...serviciosConEtiqueta];
      setProductos(todosProductos);

      console.log(`✅ Cargados ${todosProductos.length} productos afiliables:`, {
        cursos: cursosConEtiqueta.length,
        servicios: serviciosConEtiqueta.length
      });

    } catch (error) {
      console.error('Error cargando productos del marketplace:', error);
      toast.error('Error al cargar los productos del marketplace');
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
        toast.error('Debes estar logueado para solicitar afiliación');
        return;
      }

      // Verificar si ya existe una solicitud
      const { data: existente } = await supabase
        .from('solicitudes_afiliacion')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('producto_id', producto.id)
        .eq('tabla_producto', producto.tabla_origen)
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
          tabla_producto: producto.tabla_origen,
          tipo_producto: producto.tipo_producto || (producto.tabla_origen === 'cursos' ? 'curso' : 'servicio'),
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString(),
          comision_esperada: producto.comision_nivel1 || 25,
          mensaje_solicitud: `Solicitud de afiliación para ${producto.titulo}`
        }]);

      if (error) throw error;

      toast.success('🎉 Solicitud enviada exitosamente');
      await cargarSolicitudes(user.id);
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud');
    }
  };

  // Función para obtener categoría display
  const getCategoriaDisplay = (producto: ProductoMarketplace) => {
    if (producto.tabla_origen === 'cursos') {
      return '📚 Cursos Premium';
    }
    
    // Para servicios, usar la categoría real
    switch (producto.categoria) {
      case 'Consultoría': return '📊 Consultoría Business';
      case 'Marketing': return '📈 Marketing Digital';
      case 'Automatización': return '⚙️ Automatización';
      case 'Diseño': return '🎨 Diseño';
      case 'Coaching': return '🏃‍♂️ Coaching Personal';
      case 'Software':
      case 'SaaS':
      case 'Herramientas':
      case 'Tecnología':
        return '💻 Software & SaaS';
      default:
        if (producto.tipo_producto === 'suscripcion') {
          return '💎 Membresías VIP';
        }
        return '🔧 Servicios Profesionales';
    }
  };

  const productosFiltrados = React.useMemo(() => {
    let items = productos;
    
    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      items = items.filter(item => getCategoriaDisplay(item) === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      items = items.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ('proveedor' in item ? item.proveedor : item.instructor).toLowerCase().includes(searchTerm.toLowerCase())
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
          return (b.comision_nivel1 || 0) - (a.comision_nivel1 || 0);
        case 'popularidad':
        default:
          const aPopular = ('reviews' in a ? a.reviews : a.estudiantes || 0);
          const bPopular = ('reviews' in b ? b.reviews : b.estudiantes || 0);
          return bPopular - aPopular;
      }
    });

    return items;
  }, [productos, searchTerm, selectedCategory, sortBy]);

  const renderProductoCard = (producto: ProductoMarketplace) => {
    const solicitudExistente = solicitudes.find(s => 
      s.producto_id === producto.id && s.tabla_producto === producto.tabla_origen
    );
    
    const esServicio = producto.tabla_origen === 'servicios';
    const esCurso = producto.tabla_origen === 'cursos';
    const esSuscripcion = producto.tipo_producto === 'suscripcion';
    
    // Determinar esquema de colores según tipo
    const getColorScheme = () => {
      if (esCurso) {
        return {
          gradient: 'from-amber-500/20 to-yellow-600/20',
          border: 'border-amber-500/30',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-600',
          icon: 'text-amber-400',
          button: 'from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
        };
      } else if (esSuscripcion || producto.categoria?.toLowerCase().includes('software') || producto.categoria?.toLowerCase().includes('saas')) {
        return {
          gradient: 'from-cyan-500/20 to-blue-600/20',
          border: 'border-cyan-500/30',
          badge: 'bg-gradient-to-r from-cyan-500 to-blue-600',
          icon: 'text-cyan-400',
          button: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
        };
      } else {
        return {
          gradient: 'from-purple-500/20 to-indigo-600/20',
          border: 'border-purple-500/30',
          badge: 'bg-gradient-to-r from-purple-500 to-indigo-600',
          icon: 'text-purple-400',
          button: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
        };
      }
    };

    const colorScheme = getColorScheme();
    
    // Información específica por tipo
    const getTipoInfo = () => {
      if (esCurso) {
        const curso = producto as CursoMarketplace;
        return {
          icon: <GraduationCap className="w-5 h-5" />,
          tipo: 'Curso Premium',
          detalles: `${curso.duracion_horas || 0}h • ${curso.nivel || 'Intermedio'}`,
          proveedor: curso.instructor || 'ScaleXone Academy',
          metricas: `${curso.estudiantes || 0} estudiantes`
        };
      } else {
        const servicio = producto as ServicioMarketplace;
        const icono = esSuscripcion ? <Settings className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />;
        const tipo = esSuscripcion ? 'Membresía Premium' : 'Servicio Profesional';
        const detalles = servicio.tipo_pago === 'pago_unico' ? 'Pago único' : 
          servicio.duracion_dias ? `${servicio.duracion_dias} días` : 'Suscripción mensual';
        
        return {
          icon: icono,
          tipo,
          detalles,
          proveedor: servicio.proveedor || 'ScaleXone',
          metricas: `${servicio.reviews || 0} reviews`
        };
      }
    };

    const tipoInfo = getTipoInfo();

    // Descripción estilo Hotmart
    const getDescripcionHotmart = () => {
      const base = producto.descripcion || '';
      const categoriaDisplay = getCategoriaDisplay(producto);
      
      if (esCurso) {
        const curso = producto as CursoMarketplace;
        return `🎓 Curso completo de ${categoriaDisplay.replace('📚 ', '')} con metodología probada. Acceso vitalicio a ${curso.duracion_horas || 0} horas de contenido premium + certificado de finalización. Ideal para ${curso.nivel || 'todos los niveles'}.`;
      } else {
        const servicio = producto as ServicioMarketplace;
        const tipoTexto = servicio.tipo_pago === 'pago_unico' ? 'inversión única' : 'suscripción mensual';
        return `⭐ ${categoriaDisplay.replace(/🔧|💻|💎|📊|📈|⚙️|🎨|🏃‍♂️ /, '')} profesional de alta calidad. ${base} Resultados garantizados con ${tipoTexto}. Soporte incluido.`;
      }
    };

    return (
      <motion.div
        key={`${producto.tabla_origen}-${producto.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${colorScheme.gradient} backdrop-blur-sm rounded-xl border ${colorScheme.border} hover:shadow-xl transition-all duration-300 overflow-hidden group`}
      >
        {/* Imagen principal */}
        <div className="relative h-44 bg-gray-800 overflow-hidden">
          {producto.imagen_url ? (
            <img 
              src={producto.imagen_url} 
              alt={producto.titulo}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorScheme.gradient.replace('/20', '/40')}`}>
              <div className={colorScheme.icon}>
                {tipoInfo.icon}
              </div>
            </div>
          )}
          
          {/* Badge superior */}
          <div className="absolute top-3 left-3">
            <span className={`${colorScheme.badge} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
              {tipoInfo.tipo}
            </span>
          </div>
          
          {/* Rating superior derecho */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className={`w-3 h-3 ${colorScheme.icon} fill-current`} />
              <span className={`${colorScheme.icon} text-xs font-semibold`}>{producto.rating}</span>
            </div>
          </div>

          {/* Badge de comisión destacada */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-bold">{producto.comision_nivel1 || 25}%</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5">
          {/* Título y proveedor */}
          <div className="mb-3">
            <h3 className={`text-white font-bold text-lg mb-1 line-clamp-2 group-hover:${colorScheme.icon} transition-colors`}>
              {producto.titulo}
            </h3>
            <p className="text-gray-400 text-sm">Por: <span className={`${colorScheme.icon} font-medium`}>{tipoInfo.proveedor}</span></p>
          </div>
          
          {/* Descripción estilo Hotmart */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
            {getDescripcionHotmart()}
          </p>
          
          {/* Métricas principales */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{tipoInfo.metricas}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">{tipoInfo.detalles}</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${colorScheme.badge.replace('bg-gradient-to-r', 'bg-opacity-20')} ${colorScheme.icon}`}>
              {getCategoriaDisplay(producto).split(' ').slice(1).join(' ')}
            </div>
          </div>

          {/* Estructura de comisiones */}
          <div className="bg-black/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-medium">Estructura de Comisiones</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-green-400 font-bold text-sm">{producto.comision_nivel1 || 25}%</div>
                <div className="text-gray-400">Directo</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-sm">{producto.comision_nivel2 || 15}%</div>
                <div className="text-gray-400">Nivel 2</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-sm">{producto.comision_nivel3 || 8}%</div>
                <div className="text-gray-400">Nivel 3</div>
              </div>
            </div>
          </div>

          {/* Precio y botón de acción */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className={`text-2xl font-bold bg-gradient-to-r ${colorScheme.badge.replace('bg-gradient-to-r', '')} bg-clip-text text-transparent`}>
                ${producto.precio}
              </div>
              {esSuscripcion && (
                <div className="text-gray-400 text-xs">
                  {(producto as ServicioMarketplace).tipo_pago === 'suscripcion' ? '/mes' : 'único'}
                </div>
              )}
            </div>
            
            {/* Botón de solicitud */}
            {solicitudExistente ? (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                solicitudExistente.estado === 'pendiente' 
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                  : solicitudExistente.estado === 'aprobada'
                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {solicitudExistente.estado === 'pendiente' && '⏳ Pendiente'}
                {solicitudExistente.estado === 'aprobada' && '✅ Aprobada'}
                {solicitudExistente.estado === 'rechazada' && '❌ Rechazada'}
              </div>
            ) : (
              <button
                onClick={() => enviarSolicitudAfiliacion(producto)}
                className={`bg-gradient-to-r ${colorScheme.button} text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                <Send className="w-4 h-4" />
                <span>Solicitar</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Función para renderizar el gráfico simple de ingresos
  const renderEarningsChart = () => {
    const maxEarnings = Math.max(...earningsData.map(d => d.earnings));
    const chartHeight = 120;
    
    return (
      <div className="mt-4">
        <div className="flex items-end space-x-2 h-32">
          {earningsData.map((data, index) => {
            const height = (data.earnings / maxEarnings) * chartHeight;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-md transition-all duration-300 hover:opacity-80 relative group"
                  style={{ height: `${height}px`, minHeight: '8px' }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${data.earnings}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(data.date).getDate()}/{new Date(data.date).getMonth() + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Dashboard Principal
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">🏆 Panel de Control de Afiliados</h2>
            <p className="text-gray-400">Monitorea tu rendimiento y maximiza tus ganancias</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="year">Este año</option>
            </select>
            
            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 border border-orange-500/30">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico de Ingresos */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">📊 Gráfico de Ingresos</h3>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total del período</div>
            <div className="text-2xl font-bold text-orange-400">
              ${earningsData.reduce((acc, curr) => acc + curr.earnings, 0).toLocaleString()}
            </div>
          </div>
        </div>
        {renderEarningsChart()}
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-300 text-sm font-medium">💰 Total</p>
              <p className="text-white text-3xl font-bold">${dashboardMetrics.totalEarnings.toLocaleString()}</p>
              <p className="text-green-200 text-xs mt-1">Ingresos acumulados</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-300 text-sm font-medium">🔄 Reembolsada</p>
              <p className="text-white text-3xl font-bold">${dashboardMetrics.refunds.toFixed(2)}</p>
              <p className="text-orange-200 text-xs mt-1">Tasa de reembolso</p>
            </div>
            <RefreshCw className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-300 text-sm font-medium">📈 % Reembolso</p>
              <p className="text-white text-3xl font-bold">{dashboardMetrics.refundPercentage}%</p>
              <p className="text-blue-200 text-xs mt-1">Porcentaje de devoluciones</p>
            </div>
            <Percent className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Desempeño */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Desempeño
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{dashboardMetrics.totalSales}</div>
            <div className="text-green-400 text-sm flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" />
              +15% esta semana
            </div>
            <div className="text-gray-400 text-sm mt-1">Ventas</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{dashboardMetrics.totalClicks.toLocaleString()}</div>
            <div className="text-blue-400 text-sm flex items-center justify-center gap-1 mt-1">
              <MousePointer className="w-4 h-4" />
              +8% vs anterior
            </div>
            <div className="text-gray-400 text-sm mt-1">Clics</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{dashboardMetrics.totalLeads}</div>
            <div className="text-purple-400 text-sm flex items-center justify-center gap-1 mt-1">
              <Users className="w-4 h-4" />
              Calidad alta
            </div>
            <div className="text-gray-400 text-sm mt-1">Leads</div>
          </div>
        </div>
      </div>

      {/* Pagos en Efectivo */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-400" />
          Pagos en Efectivo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{dashboardMetrics.paymentsGenerated}</div>
            <div className="text-gray-400 text-sm mt-1">Generados</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{dashboardMetrics.paymentsReceived}</div>
            <div className="text-gray-400 text-sm mt-1">Pagados</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{dashboardMetrics.conversionRate}%</div>
            <div className="text-gray-400 text-sm mt-1">% Conversión</div>
          </div>
        </div>
      </div>

      {/* Top Afiliados - Gamificación */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🏆 Top Afiliados (Conquistas)
          </h3>
          <button className="text-orange-400 hover:text-orange-300 text-sm">Ver todas</button>
        </div>
        
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {topAfiliates.map((affiliate, index) => (
            <motion.div
              key={affiliate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                index === 2 ? 'bg-gradient-to-r from-orange-400 to-yellow-600' :
                'bg-gradient-to-r from-purple-500 to-blue-600'
              }`}>
                {affiliate.avatar}
              </div>
              <div className="text-white text-sm font-medium">{affiliate.name.split(' ')[0]}</div>
              <div className="text-green-400 text-xs">${affiliate.earnings.toLocaleString()}</div>
              <div className="text-gray-500 text-xs">#{affiliate.rank}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <span className="ml-3 text-gray-300">Cargando marketplace de afiliados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegación Principal */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                🚀 Portal de Afiliados ScaleXone
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                Dashboard profesional para maximizar tus ganancias como afiliado
              </p>
            </div>
            <div className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-6 py-3 rounded-lg border border-orange-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold">${dashboardMetrics.totalEarnings.toLocaleString()}</div>
                <div className="text-xs opacity-80">Ganancias Totales</div>
              </div>
            </div>
          </div>
          
          {/* Tabs de Navegación */}
          <div className="border-b border-gray-600">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === 'dashboard'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Dashboard Principal
              </button>
              <button
                onClick={() => setActiveSection('marketplace')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === 'marketplace'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Marketplace de Productos
              </button>
              <button
                onClick={() => setShowSolicitudes(!showSolicitudes)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  showSolicitudes
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                <Heart className="w-5 h-5" />
                Mis Solicitudes ({solicitudes.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido Según Sección Activa */}
      {activeSection === 'dashboard' && renderDashboard()}
      
      {activeSection === 'marketplace' && (
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
      )}

      {/* Panel de solicitudes */}
      {showSolicitudes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900/50 rounded-xl border border-gray-700"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Mis Solicitudes de Afiliación
            </h2>
            {solicitudes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">¡Comienza tu journey como afiliado!</div>
                <p className="text-gray-500">Solicita afiliación a los productos que te interesen y empieza a ganar comisiones</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between border border-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {solicitud.tabla_producto === 'cursos' ? (
                          <GraduationCap className="w-6 h-6 text-white" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {solicitud.tabla_producto === 'cursos' ? 'Curso' : 'Servicio'} • ID: {solicitud.producto_id.slice(-8)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      solicitud.estado === 'pendiente' 
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                        : solicitud.estado === 'aprobada'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {solicitud.estado === 'pendiente' && '⏳ En revisión'}
                      {solicitud.estado === 'aprobada' && '✅ Aprobada'}
                      {solicitud.estado === 'rechazada' && '❌ Rechazada'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketingAfiliadosPanel; 