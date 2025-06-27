import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  Copy,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  MousePointer,
  UserPlus,
  Settings,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  BarChart3,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Award,
  Target
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

interface CodigoAfiliado {
  id: string;
  codigo: string;
  nombre_personalizado: string;
  descripcion: string;
  activo: boolean;
  clicks_totales: number;
  conversiones_totales: number;
  created_at: string;
}

interface EstadisticasAfiliado {
  user_id: string;
  codigo: string;
  nombre_personalizado: string;
  clicks_totales: number;
  conversiones_totales: number;
  tasa_conversion: number;
  total_comisiones: number;
  comisiones_pendientes: number;
  comisiones_pagadas: number;
  usuarios_referidos: number;
  activo: boolean;
}

interface ClickAfiliado {
  id: string;
  created_at: string;
  pais: string;
  ciudad: string;
  dispositivo: string;
  navegador: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  convertido: boolean;
}

const AfiliadosComunidadPanel: React.FC = () => {
  const [codigos, setCodigos] = useState<CodigoAfiliado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAfiliado[]>([]);
  const [clicks, setClicks] = useState<ClickAfiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoAfiliado | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [newCodigo, setNewCodigo] = useState({
    nombre_personalizado: '',
    descripcion: ''
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener códigos de afiliado del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: codigosData, error: codigosError } = await supabase
        .from('codigos_afiliado')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (codigosError) throw codigosError;
      setCodigos(codigosData || []);

      // Obtener estadísticas
      const { data: statsData, error: statsError } = await supabase
        .from('estadisticas_afiliado')
        .select('*')
        .eq('user_id', user.id);

      if (statsError) throw statsError;
      setEstadisticas(statsData || []);

      // Obtener clicks recientes
      if (codigosData && codigosData.length > 0) {
        const { data: clicksData, error: clicksError } = await supabase
          .from('clicks_afiliado')
          .select(`
            id, created_at, pais, ciudad, dispositivo, navegador,
            utm_source, utm_medium, utm_campaign, convertido,
            codigos_afiliado!inner(user_id)
          `)
          .eq('codigos_afiliado.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (clicksError) throw clicksError;
        setClicks(clicksData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos de afiliados');
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generar código único
      const { data, error } = await supabase.rpc('generar_codigo_afiliado', {
        user_uuid: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  };

  const handleCreateCodigo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const codigoGenerado = await generateAffiliateCode();

      const { error } = await supabase
        .from('codigos_afiliado')
        .insert([{
          user_id: user.id,
          codigo: codigoGenerado,
          nombre_personalizado: newCodigo.nombre_personalizado,
          descripcion: newCodigo.descripcion
        }]);

      if (error) throw error;

      toast.success('Código de afiliado creado exitosamente');
      setShowCreateModal(false);
      setNewCodigo({ nombre_personalizado: '', descripcion: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating code:', error);
      toast.error('Error al crear código de afiliado');
    }
  };

  const handleUpdateCodigo = async () => {
    if (!selectedCodigo) return;

    try {
      const { error } = await supabase
        .from('codigos_afiliado')
        .update({
          nombre_personalizado: newCodigo.nombre_personalizado,
          descripcion: newCodigo.descripcion
        })
        .eq('id', selectedCodigo.id);

      if (error) throw error;

      toast.success('Código actualizado exitosamente');
      setShowEditModal(false);
      setSelectedCodigo(null);
      setNewCodigo({ nombre_personalizado: '', descripcion: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating code:', error);
      toast.error('Error al actualizar código');
    }
  };

  const handleToggleActive = async (codigo: CodigoAfiliado) => {
    try {
      const { error } = await supabase
        .from('codigos_afiliado')
        .update({ activo: !codigo.activo })
        .eq('id', codigo.id);

      if (error) throw error;

      toast.success(`Código ${codigo.activo ? 'desactivado' : 'activado'} exitosamente`);
      fetchData();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('Error al cambiar estado del código');
    }
  };

  const handleDeleteCodigo = async (codigo: CodigoAfiliado) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este código?')) return;

    try {
      const { error } = await supabase
        .from('codigos_afiliado')
        .delete()
        .eq('id', codigo.id);

      if (error) throw error;

      toast.success('Código eliminado exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error('Error al eliminar código');
    }
  };

  const handleCopyLink = async (codigo: string) => {
    const link = `${window.location.origin}/registro?ref=${codigo}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Error al copiar enlace');
    }
  };

  const handleShareLink = async (codigo: string) => {
    const link = `${window.location.origin}/registro?ref=${codigo}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¡Únete a ScaleXone!',
          text: 'Descubre una comunidad increíble de emprendedores y creadores de contenido',
          url: link
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink(codigo);
    }
  };

  const openEditModal = (codigo: CodigoAfiliado) => {
    setSelectedCodigo(codigo);
    setNewCodigo({
      nombre_personalizado: codigo.nombre_personalizado,
      descripcion: codigo.descripcion
    });
    setShowEditModal(true);
  };

  const totalStats = estadisticas.reduce((acc, stat) => ({
    clicks: acc.clicks + stat.clicks_totales,
    conversiones: acc.conversiones + stat.conversiones_totales,
    comisiones: acc.comisiones + stat.total_comisiones,
    pendientes: acc.pendientes + stat.comisiones_pendientes,
    referidos: acc.referidos + stat.usuarios_referidos
  }), { clicks: 0, conversiones: 0, comisiones: 0, pendientes: 0, referidos: 0 });

  const conversionRate = totalStats.clicks > 0 ? (totalStats.conversiones / totalStats.clicks * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Marketing de Afiliados
          </h1>
          <p className="text-gray-600 mt-1">
            Genera enlaces y atrae nuevos miembros a la comunidad ScaleXone
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Enlace
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'enlaces', label: 'Enlaces', icon: Link },
            { key: 'estadisticas', label: 'Estadísticas', icon: TrendingUp },
            { key: 'comisiones', label: 'Comisiones', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <MousePointer className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.clicks.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversiones</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.conversiones}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comisiones</p>
                  <p className="text-2xl font-bold text-gray-900">${totalStats.comisiones.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-50">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Referidos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.referidos}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {clicks.slice(0, 5).map((click) => (
                <div key={click.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${click.convertido ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {click.convertido ? 'Conversión' : 'Click'} desde {click.pais || 'Desconocido'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(click.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {click.dispositivo && (
                      <span className="flex items-center gap-1">
                        {click.dispositivo === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        {click.dispositivo}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {clicks.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enlaces Tab */}
      {activeTab === 'enlaces' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {codigos.map((codigo) => (
              <motion.div
                key={codigo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${codigo.activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {codigo.nombre_personalizado || `Enlace ${codigo.codigo}`}
                      </h3>
                      <p className="text-sm text-gray-500">{codigo.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(codigo)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(codigo)}
                      className={`p-2 transition-colors ${
                        codigo.activo ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCodigo(codigo)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border">
                    <code className="text-sm text-gray-700 font-mono">
                      {window.location.origin}/registro?ref={codigo.codigo}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopyLink(codigo.codigo)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShareLink(codigo.codigo)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{codigo.clicks_totales}</p>
                    <p className="text-sm text-gray-500">Clicks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{codigo.conversiones_totales}</p>
                    <p className="text-sm text-gray-500">Conversiones</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {codigo.clicks_totales > 0 ? ((codigo.conversiones_totales / codigo.clicks_totales) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm text-gray-500">Tasa</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {codigos.length === 0 && (
              <div className="text-center py-12">
                <Link className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes enlaces de afiliado</h3>
                <p className="text-gray-500 mb-4">Crea tu primer enlace para empezar a generar comisiones</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Crear Primer Enlace
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crear Nuevo Enlace de Afiliado
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Enlace
                  </label>
                  <input
                    type="text"
                    value={newCodigo.nombre_personalizado}
                    onChange={(e) => setNewCodigo({ ...newCodigo, nombre_personalizado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Enlace Principal, Redes Sociales..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newCodigo.descripcion}
                    onChange={(e) => setNewCodigo({ ...newCodigo, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe para qué vas a usar este enlace..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCodigo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Enlace
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Editar Enlace de Afiliado
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Enlace
                  </label>
                  <input
                    type="text"
                    value={newCodigo.nombre_personalizado}
                    onChange={(e) => setNewCodigo({ ...newCodigo, nombre_personalizado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newCodigo.descripcion}
                    onChange={(e) => setNewCodigo({ ...newCodigo, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdateCodigo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Actualizar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AfiliadosComunidadPanel; 