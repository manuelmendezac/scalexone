import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Download,
  Link,
  Brain,
  Filter,
  Globe,
  Tag,
  Plus,
  BarChart2,
  MessageSquare,
  CreditCard,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interfaces
interface LeadMetric {
  id: string;
  source: string;
  funnel: string;
  clone: string;
  count: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  cpl: number;
}

interface Product {
  id: string;
  name: string;
  type: 'template' | 'course' | 'mentoring' | 'other';
  price: number;
  linkedLeads: number;
}

interface MonetizationRule {
  id: string;
  type: 'country' | 'source' | 'campaign';
  value: string;
  leadValue: number;
  isAutomatic: boolean;
}

// Componente Principal
const LeadMonetizationCenter: React.FC = () => {
  // Estados
  const [activeTab, setActiveTab] = useState<'metrics' | 'settings' | 'export'>('metrics');
  const [showAIRule, setShowAIRule] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Datos de ejemplo
  const metrics: LeadMetric[] = [
    {
      id: '1',
      source: 'Facebook Ads',
      funnel: 'Webinar de Alto Valor',
      clone: 'Vendedor Pro',
      count: 150,
      revenue: 1500,
      ctr: 3.2,
      conversionRate: 25,
      cpl: 10
    }
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Curso de Marketing Digital',
      type: 'course',
      price: 997,
      linkedLeads: 45
    }
  ];

  const rules: MonetizationRule[] = [
    {
      id: '1',
      type: 'country',
      value: 'México',
      leadValue: 15,
      isAutomatic: true
    }
  ];

  // Handlers
  const handleExportLeads = (format: 'csv' | 'xlsx') => {
    toast.success(`Base de datos exportada en formato ${format.toUpperCase()}`);
  };

  const handleIntegrateCRM = (platform: string) => {
    toast.success(`Integración con ${platform} iniciada`);
  };

  const handleCreateRule = (type: MonetizationRule['type']) => {
    setShowAIRule(true);
  };

  const handleLinkProduct = (product: Product) => {
    setSelectedProduct(product);
    toast.success(`Producto ${product.name} vinculado`);
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-2">
              Centro de Monetización
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Gestiona y monetiza tus leads
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIRule(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Sugerencia IA
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neurolink-cyberBlue/30">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'metrics'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'settings'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'export'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Exportación
          </button>
        </div>

        {/* Contenido Principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'metrics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Métricas Principales */}
              <div className="col-span-12 grid grid-cols-4 gap-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-neurolink-matrixGreen/20">
                      <Users className="w-6 h-6 text-neurolink-matrixGreen" />
                    </div>
                    <div>
                      <h3 className="text-neurolink-coldWhite/70 text-sm">Leads Totales</h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">1,234</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-400/20">
                      <DollarSign className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-neurolink-coldWhite/70 text-sm">Ingresos</h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">$12,340</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-400/20">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-neurolink-coldWhite/70 text-sm">Tasa de Conversión</h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">25%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-400/20">
                      <BarChart2 className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-neurolink-coldWhite/70 text-sm">CPL Promedio</h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">$10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Métricas */}
              <div className="col-span-12 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
                    Métricas por Fuente
                  </h2>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtrar
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-neurolink-coldWhite/70">
                        <th className="p-4">Fuente</th>
                        <th className="p-4">Funnel</th>
                        <th className="p-4">Clon</th>
                        <th className="p-4">Leads</th>
                        <th className="p-4">Ingresos</th>
                        <th className="p-4">CTR</th>
                        <th className="p-4">Conversión</th>
                        <th className="p-4">CPL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric) => (
                        <tr key={metric.id} className="border-t border-neurolink-cyberBlue/30">
                          <td className="p-4 text-neurolink-coldWhite">{metric.source}</td>
                          <td className="p-4 text-neurolink-coldWhite">{metric.funnel}</td>
                          <td className="p-4 text-neurolink-coldWhite">{metric.clone}</td>
                          <td className="p-4 text-neurolink-coldWhite">{metric.count}</td>
                          <td className="p-4 text-neurolink-coldWhite">${metric.revenue}</td>
                          <td className="p-4 text-neurolink-coldWhite">{metric.ctr}%</td>
                          <td className="p-4 text-neurolink-coldWhite">{metric.conversionRate}%</td>
                          <td className="p-4 text-neurolink-coldWhite">${metric.cpl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Reglas de Monetización */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
                    Reglas de Monetización
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleCreateRule('country')}
                      className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Nueva Regla
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {rule.type === 'country' && <Globe className="w-5 h-5 text-neurolink-matrixGreen" />}
                          {rule.type === 'source' && <Tag className="w-5 h-5 text-neurolink-matrixGreen" />}
                          {rule.type === 'campaign' && <MessageSquare className="w-5 h-5 text-neurolink-matrixGreen" />}
                          <div>
                            <h3 className="text-neurolink-coldWhite font-orbitron">
                              {rule.type === 'country' ? 'País' : rule.type === 'source' ? 'Fuente' : 'Campaña'}
                            </h3>
                            <p className="text-neurolink-coldWhite/70">{rule.value}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-neurolink-coldWhite font-orbitron">${rule.leadValue}</p>
                          <p className="text-neurolink-coldWhite/70 text-sm">
                            {rule.isAutomatic ? 'Automático' : 'Manual'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productos Vinculados */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
                    Productos Vinculados
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Vincular Producto
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {product.type === 'template' && <FileText className="w-5 h-5 text-neurolink-matrixGreen" />}
                          {product.type === 'course' && <CreditCard className="w-5 h-5 text-neurolink-matrixGreen" />}
                          {product.type === 'mentoring' && <MessageSquare className="w-5 h-5 text-neurolink-matrixGreen" />}
                          <div>
                            <h3 className="text-neurolink-coldWhite font-orbitron">{product.name}</h3>
                            <p className="text-neurolink-coldWhite/70">
                              {product.type === 'template' ? 'Plantilla' : 
                               product.type === 'course' ? 'Curso' : 'Mentoría'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-neurolink-coldWhite font-orbitron">${product.price}</p>
                          <p className="text-neurolink-coldWhite/70 text-sm">
                            {product.linkedLeads} leads vinculados
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Exportación de Leads */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Exportar Base de Datos
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Formato
                    </h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleExportLeads('csv')}
                        className="flex-1 px-4 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExportLeads('xlsx')}
                        className="flex-1 px-4 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Excel
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Filtros
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Incluir datos de conversión
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Incluir historial de interacciones
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integración con CRM */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Integración con CRM
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Plataformas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleIntegrateCRM('HubSpot')}
                        className="px-4 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <Link className="w-5 h-5" />
                        HubSpot
                      </button>
                      <button
                        onClick={() => handleIntegrateCRM('Salesforce')}
                        className="px-4 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <Link className="w-5 h-5" />
                        Salesforce
                      </button>
                      <button
                        onClick={() => handleIntegrateCRM('ActiveCampaign')}
                        className="px-4 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <Link className="w-5 h-5" />
                        ActiveCampaign
                      </button>
                      <button
                        onClick={() => handleIntegrateCRM('Mailchimp')}
                        className="px-4 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2"
                      >
                        <Link className="w-5 h-5" />
                        Mailchimp
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Configuración
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-neurolink-coldWhite/70 mb-2 block">
                          API Key
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Sincronización automática
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Regla IA */}
      <AnimatePresence>
        {showAIRule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Sugerencia de Valor por Lead
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                  <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                    Análisis de Mercado
                  </h3>
                  <p className="text-neurolink-coldWhite/70 mb-4">
                    Basado en el nicho, ubicación y comportamiento de tus leads, sugerimos un valor de $15 por lead.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neurolink-coldWhite/70">
                      <TrendingUp className="w-4 h-4" />
                      <span>Promedio del mercado: $12</span>
                    </div>
                    <div className="flex items-center gap-2 text-neurolink-coldWhite/70">
                      <Users className="w-4 h-4" />
                      <span>Calidad de leads: Alta</span>
                    </div>
                    <div className="flex items-center gap-2 text-neurolink-coldWhite/70">
                      <DollarSign className="w-4 h-4" />
                      <span>ROI estimado: 3.5x</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowAIRule(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Lógica para aplicar sugerencia
                      toast.success('Valor por lead actualizado');
                      setShowAIRule(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
                  >
                    Aplicar Sugerencia
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadMonetizationCenter; 