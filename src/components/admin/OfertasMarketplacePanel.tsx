import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit2, Trash2, Eye, 
  Star, DollarSign, Users, TrendingUp, Save, X,
  GraduationCap, Briefcase, Settings, Package,
  AlertTriangle, CheckCircle, Clock, Target
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';
import { OfertasMarketplaceService } from '../../services/ofertasMarketplaceService';
import type { OfertaMarketplace } from '../../services/ofertasMarketplaceService';

const OfertasMarketplacePanel: React.FC = () => {
  const [ofertas, setOfertas] = useState<OfertaMarketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOferta, setEditingOferta] = useState<OfertaMarketplace | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_producto: 'curso' as const,
    precio: 0,
    precio_original: 0,
    moneda: 'USD',
    imagen_url: '',
    proveedor: 'ScaleXone',
    categoria: 'Cursos de Trading',
    rating: 4.8,
    reviews: 0,
    ventas_totales: 0,
    caracteristicas: [''],
    duracion_horas: 0,
    nivel: 'Principiante',
    instructor: '',
    certificado: false,
    duracion_dias: 0,
    incluye_soporte: true,
    tipo_entrega: 'digital',
    afilible: true,
    niveles_comision: 3,
    comision_nivel1: 25,
    comision_nivel2: 15,
    comision_nivel3: 10,
    activo: true,
    destacado: false,
    orden: 0
  });

  const categorias = [
    'Cursos de Trading',
    'Marketing Digital', 
    'Automatización',
    'Consultoría Business',
    'Herramientas Premium',
    'Coaching Personal'
  ];

  const tiposProducto = [
    { value: 'curso', label: 'Curso', icon: GraduationCap },
    { value: 'servicio', label: 'Servicio', icon: Briefcase },
    { value: 'herramienta', label: 'Herramienta', icon: Settings },
    { value: 'producto_fisico', label: 'Producto Físico', icon: Package }
  ];

  useEffect(() => {
    cargarOfertas();
  }, []);

  const cargarOfertas = async () => {
    setLoading(true);
    try {
      const data = await OfertasMarketplaceService.obtenerOfertas({});
      setOfertas(data);
    } catch (error) {
      console.error('Error cargando ofertas:', error);
      toast.error('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const getIconByType = (tipo: string) => {
    const iconMap = {
      curso: GraduationCap,
      servicio: Briefcase,
      herramienta: Settings,
      producto_fisico: Package
    };
    const Icon = iconMap[tipo as keyof typeof iconMap] || Star;
    return <Icon className="w-5 h-5" />;
  };

  const getColorByType = (tipo: string) => {
    const colorMap = {
      curso: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30',
      servicio: 'from-purple-500/20 to-indigo-600/20 border-purple-500/30',
      herramienta: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30',
      producto_fisico: 'from-green-500/20 to-emerald-600/20 border-green-500/30'
    };
    return colorMap[tipo as keyof typeof colorMap] || 'from-gray-500/20 to-slate-600/20 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-300">Cargando ofertas del marketplace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🛒 Ofertas Marketplace ScaleXone</h1>
            <p className="text-gray-300">Gestiona las ofertas del marketplace de afiliados</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Oferta</span>
          </button>
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
              <p className="text-green-300 text-sm">Ofertas Activas</p>
              <p className="text-white text-2xl font-bold">
                {ofertas.filter(o => o.activo).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Afiliables</p>
              <p className="text-white text-2xl font-bold">
                {ofertas.filter(o => o.afilible).length}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-lg p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm">Destacadas</p>
              <p className="text-white text-2xl font-bold">
                {ofertas.filter(o => o.destacado).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Mensaje si no hay ofertas */}
      {ofertas.length === 0 ? (
        <div className="bg-gray-900/50 rounded-xl p-12 border border-gray-700 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No hay ofertas aún</h3>
          <p className="text-gray-400 mb-6">
            Ejecuta el script SQL primero para crear la tabla y luego podrás crear ofertas desde aquí.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Primera Oferta</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertas.map((oferta) => (
            <motion.div
              key={oferta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${getColorByType(oferta.tipo_producto)} backdrop-blur-sm rounded-xl p-6 border hover:shadow-xl transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/10 rounded-lg text-amber-400">
                    {getIconByType(oferta.tipo_producto)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg line-clamp-1">{oferta.titulo}</h3>
                    <p className="text-gray-300 text-sm">{oferta.proveedor}</p>
                  </div>
                </div>
              </div>

              {/* Precios */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-white">${oferta.precio}</div>
                {oferta.precio_original && (
                  <div className="text-sm text-gray-400 line-through">${oferta.precio_original}</div>
                )}
              </div>

              {/* Métricas */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white">{oferta.rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{oferta.ventas_totales}</span>
                </div>
              </div>

              {/* Comisiones */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="text-white text-sm font-medium mb-2">Comisiones:</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{oferta.comision_nivel1}%</div>
                    <div className="text-gray-400">N1</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">{oferta.comision_nivel2}%</div>
                    <div className="text-gray-400">N2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">{oferta.comision_nivel3}%</div>
                    <div className="text-gray-400">N3</div>
                  </div>
                </div>
              </div>

              {/* Estados */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  oferta.activo 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {oferta.activo ? 'Activa' : 'Inactiva'}
                </span>
                
                <div className="flex items-center space-x-2">
                  {oferta.afilible && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      Afilible
                    </span>
                  )}
                  {oferta.destacado && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs">
                      Destacada
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfertasMarketplacePanel;
