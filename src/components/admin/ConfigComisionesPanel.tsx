import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Percent,
  Save,
  RotateCcw,
  Settings,
  UserPlus,
  Crown,
  ShoppingCart,
  Briefcase,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

interface ConfigComision {
  id: string;
  tipo_evento: string;
  monto_fijo: number;
  porcentaje: number;
  descripcion: string;
  activo: boolean;
}

const tiposEventos = [
  {
    key: 'registro_comunidad',
    label: 'Registro en Comunidad',
    icon: UserPlus,
    color: 'blue',
    tipo: 'monto_fijo',
    descripcion: 'Comisión fija por cada nuevo registro en la comunidad'
  },
  {
    key: 'suscripcion_premium',
    label: 'Suscripción Premium',
    icon: Crown,
    color: 'yellow',
    tipo: 'porcentaje',
    descripcion: 'Porcentaje de comisión por suscripciones premium'
  },
  {
    key: 'compra_curso_marketplace',
    label: 'Compra de Curso',
    icon: ShoppingCart,
    color: 'green',
    tipo: 'porcentaje',
    descripcion: 'Porcentaje de comisión por compras de cursos en marketplace'
  },
  {
    key: 'compra_servicio_marketplace',
    label: 'Compra de Servicio',
    icon: Briefcase,
    color: 'purple',
    tipo: 'porcentaje',
    descripcion: 'Porcentaje de comisión por compras de servicios en marketplace'
  },
  {
    key: 'renovacion_suscripcion',
    label: 'Renovación Suscripción',
    icon: RefreshCw,
    color: 'indigo',
    tipo: 'porcentaje',
    descripcion: 'Porcentaje de comisión por renovaciones de suscripción'
  }
];

const ConfigComisionesPanel: React.FC = () => {
  const [comisiones, setComisiones] = useState<ConfigComision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalComisiones, setOriginalComisiones] = useState<ConfigComision[]>([]);

  useEffect(() => {
    fetchComisiones();
  }, []);

  const fetchComisiones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('config_comisiones')
        .select('*')
        .order('tipo_evento');

      if (error) throw error;

      const comisionesData = data || [];
      setComisiones(comisionesData);
      setOriginalComisiones(JSON.parse(JSON.stringify(comisionesData)));
    } catch (error) {
      console.error('Error fetching comisiones:', error);
      toast.error('Error al cargar configuración de comisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleComisionChange = (tipoEvento: string, field: 'monto_fijo' | 'porcentaje' | 'activo', value: number | boolean) => {
    setComisiones(prev => 
      prev.map(comision => 
        comision.tipo_evento === tipoEvento 
          ? { ...comision, [field]: value }
          : comision
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Actualizar cada comisión
      for (const comision of comisiones) {
        const { error } = await supabase
          .from('config_comisiones')
          .update({
            monto_fijo: comision.monto_fijo,
            porcentaje: comision.porcentaje,
            activo: comision.activo
          })
          .eq('tipo_evento', comision.tipo_evento);

        if (error) throw error;
      }

      toast.success('Configuración de comisiones guardada exitosamente');
      setHasChanges(false);
      setOriginalComisiones(JSON.parse(JSON.stringify(comisiones)));
    } catch (error) {
      console.error('Error saving comisiones:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setComisiones(JSON.parse(JSON.stringify(originalComisiones)));
    setHasChanges(false);
    toast.success('Cambios revertidos');
  };

  const handleResetDefaults = async () => {
    if (!confirm('¿Estás seguro de que quieres restaurar los valores por defecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setSaving(true);

      const defaultValues = {
        'registro_comunidad': { monto_fijo: 5.00, porcentaje: 0 },
        'suscripcion_premium': { monto_fijo: 0, porcentaje: 30.00 },
        'compra_curso_marketplace': { monto_fijo: 0, porcentaje: 25.00 },
        'compra_servicio_marketplace': { monto_fijo: 0, porcentaje: 20.00 },
        'renovacion_suscripcion': { monto_fijo: 0, porcentaje: 15.00 }
      };

      for (const [tipoEvento, valores] of Object.entries(defaultValues)) {
        const { error } = await supabase
          .from('config_comisiones')
          .update({
            monto_fijo: valores.monto_fijo,
            porcentaje: valores.porcentaje,
            activo: true
          })
          .eq('tipo_evento', tipoEvento);

        if (error) throw error;
      }

      toast.success('Valores por defecto restaurados');
      await fetchComisiones();
      setHasChanges(false);
    } catch (error) {
      console.error('Error resetting defaults:', error);
      toast.error('Error al restaurar valores por defecto');
    } finally {
      setSaving(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Configuración de Comisiones
          </h1>
          <p className="text-gray-600 mt-2">
            Personaliza los porcentajes y montos de comisión para tu marca blanca
          </p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Revertir
            </motion.button>
          )}
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Valores por Defecto
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Información sobre Comisiones
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Monto Fijo:</strong> Se paga una cantidad específica en dólares por cada evento</li>
              <li>• <strong>Porcentaje:</strong> Se paga un % del valor total de la transacción</li>
              <li>• <strong>Estado:</strong> Activa/desactiva el tipo de comisión completamente</li>
              <li>• Los cambios se aplican inmediatamente a nuevas conversiones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comisiones Grid */}
      <div className="grid gap-6">
        {tiposEventos.map((tipoEvento) => {
          const comision = comisiones.find(c => c.tipo_evento === tipoEvento.key);
          if (!comision) return null;

          const IconComponent = tipoEvento.icon;

          return (
            <motion.div
              key={tipoEvento.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
                comision.activo ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(tipoEvento.color)}`}>
                    <IconComponent className={`w-6 h-6 ${getIconColorClasses(tipoEvento.color)}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tipoEvento.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tipoEvento.descripcion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comision.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {comision.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comision.activo}
                      onChange={(e) => handleComisionChange(comision.tipo_evento, 'activo', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monto Fijo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Monto Fijo (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={comision.monto_fijo}
                      onChange={(e) => handleComisionChange(comision.tipo_evento, 'monto_fijo', parseFloat(e.target.value) || 0)}
                      disabled={!comision.activo}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !comision.activo ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      } ${tipoEvento.tipo === 'monto_fijo' ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  </div>
                  {tipoEvento.tipo === 'monto_fijo' && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Recomendado para este tipo de evento
                    </p>
                  )}
                </div>

                {/* Porcentaje */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Porcentaje (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={comision.porcentaje}
                      onChange={(e) => handleComisionChange(comision.tipo_evento, 'porcentaje', parseFloat(e.target.value) || 0)}
                      disabled={!comision.activo}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !comision.activo ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      } ${tipoEvento.tipo === 'porcentaje' ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  </div>
                  {tipoEvento.tipo === 'porcentaje' && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Recomendado para este tipo de evento
                    </p>
                  )}
                </div>
              </div>

              {/* Advertencia si ambos valores están configurados */}
              {comision.monto_fijo > 0 && comision.porcentaje > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Si configuras tanto monto fijo como porcentaje, se aplicará el monto fijo y se ignorará el porcentaje.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-6 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </motion.button>
        </motion.div>
      )}

      {/* Preview de Comisiones */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vista Previa de Comisiones Activas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comisiones.filter(c => c.activo).map((comision) => {
            const tipoEvento = tiposEventos.find(t => t.key === comision.tipo_evento);
            if (!tipoEvento) return null;

            return (
              <div key={comision.tipo_evento} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <tipoEvento.icon className={`w-5 h-5 ${getIconColorClasses(tipoEvento.color)}`} />
                  <span className="font-medium text-gray-900">{tipoEvento.label}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {comision.monto_fijo > 0 ? (
                    <span className="font-semibold text-green-600">${comision.monto_fijo.toFixed(2)} fijo</span>
                  ) : (
                    <span className="font-semibold text-blue-600">{comision.porcentaje}% del valor</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConfigComisionesPanel; 