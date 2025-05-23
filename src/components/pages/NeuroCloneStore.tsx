import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Filter,
  Globe,
  MessageSquare,
  Star,
  Download,
  Plus,
  Settings,
  Lock,
  Crown,
  Users,
  MessageCircle,
  Target,
  DollarSign,
  CreditCard,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interfaces
interface Clone {
  id: string;
  name: string;
  description: string;
  niche: string;
  language: string;
  personality: string;
  objective: 'sales' | 'support' | 'motivation';
  price: number;
  points: number;
  isPremium: boolean;
  trainingData: {
    conversations: number;
    documents: number;
    customFields: string[];
  };
  rating: number;
  reviews: number;
  demoUrl: string;
}

interface FilterState {
  niche: string[];
  language: string[];
  objective: string[];
  priceRange: [number, number];
  isPremium: boolean | null;
}

// Componente Principal
const NeuroCloneStore: React.FC = () => {
  // Estados
  const [activeTab, setActiveTab] = useState<'store' | 'my-clones' | 'collaborative'>('store');
  const [selectedClone, setSelectedClone] = useState<Clone | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    niche: [],
    language: [],
    objective: [],
    priceRange: [0, 1000],
    isPremium: null
  });

  // Datos de ejemplo
  const clones: Clone[] = [
    {
      id: '1',
      name: 'Vendedor Pro',
      description: 'Clon especializado en ventas de alto valor y cierre de negocios',
      niche: 'ventas',
      language: 'es',
      personality: 'Profesional y persuasivo',
      objective: 'sales',
      price: 997,
      points: 500,
      isPremium: true,
      trainingData: {
        conversations: 1000,
        documents: 50,
        customFields: ['industria', 'presupuesto', 'tiempo_compra']
      },
      rating: 4.8,
      reviews: 124,
      demoUrl: 'https://demo.neurolink.ai/vendedor-pro'
    }
  ];

  const niches = [
    'coaching',
    'ventas',
    'bienes_raices',
    'salud',
    'educacion',
    'finanzas',
    'marketing',
    'tecnologia'
  ];

  const languages = [
    'es',
    'en',
    'pt',
    'fr',
    'de',
    'it'
  ];

  const objectives = [
    'sales',
    'support',
    'motivation'
  ];

  // Handlers
  const handleFilterChange = (type: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAddClone = (clone: Clone) => {
    toast.success(`Clon ${clone.name} agregado a tu cuenta`);
  };

  const handleRetrainClone = (clone: Clone) => {
    toast.success(`Iniciando reentrenamiento de ${clone.name}`);
  };

  const handleStartDemo = (clone: Clone) => {
    setSelectedClone(clone);
    setShowDemo(true);
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
              Marketplace de Clones IA
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Descubre y personaliza clones IA para tu negocio
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Plan Pro
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neurolink-cyberBlue/30">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'store'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('my-clones')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'my-clones'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Mis Clones
          </button>
          <button
            onClick={() => setActiveTab('collaborative')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'collaborative'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Colaborativo
          </button>
        </div>

        {/* Contenido Principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'store' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Filtros */}
              <div className="col-span-3 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Filtros
                </h2>
                <div className="space-y-6">
                  {/* Nicho */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Nicho
                    </h3>
                    <div className="space-y-2">
                      {niches.map((niche) => (
                        <div key={niche} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.niche.includes(niche)}
                            onChange={(e) => {
                              const newNiches = e.target.checked
                                ? [...filters.niche, niche]
                                : filters.niche.filter(n => n !== niche);
                              handleFilterChange('niche', newNiches);
                            }}
                            className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                          />
                          <label className="text-neurolink-coldWhite capitalize">
                            {niche.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Idioma */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Idioma
                    </h3>
                    <div className="space-y-2">
                      {languages.map((lang) => (
                        <div key={lang} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.language.includes(lang)}
                            onChange={(e) => {
                              const newLangs = e.target.checked
                                ? [...filters.language, lang]
                                : filters.language.filter(l => l !== lang);
                              handleFilterChange('language', newLangs);
                            }}
                            className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                          />
                          <label className="text-neurolink-coldWhite uppercase">
                            {lang}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Objetivo */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Objetivo
                    </h3>
                    <div className="space-y-2">
                      {objectives.map((obj) => (
                        <div key={obj} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.objective.includes(obj)}
                            onChange={(e) => {
                              const newObjs = e.target.checked
                                ? [...filters.objective, obj]
                                : filters.objective.filter(o => o !== obj);
                              handleFilterChange('objective', newObjs);
                            }}
                            className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                          />
                          <label className="text-neurolink-coldWhite capitalize">
                            {obj}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precio */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Rango de Precio
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-neurolink-coldWhite/70">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Tipo
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={filters.isPremium === null}
                          onChange={() => handleFilterChange('isPremium', null)}
                          className="w-4 h-4 border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Todos
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={filters.isPremium === true}
                          onChange={() => handleFilterChange('isPremium', true)}
                          className="w-4 h-4 border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite flex items-center gap-2">
                          Premium
                          <Crown className="w-4 h-4 text-yellow-400" />
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={filters.isPremium === false}
                          onChange={() => handleFilterChange('isPremium', false)}
                          className="w-4 h-4 border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Estándar
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Clones */}
              <div className="col-span-9 space-y-6">
                {clones.map((clone) => (
                  <motion.div
                    key={clone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
                  >
                    <div className="flex gap-6">
                      {/* Información Principal */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-2">
                              {clone.name}
                              {clone.isPremium && (
                                <Crown className="w-5 h-5 text-yellow-400 inline-block ml-2" />
                              )}
                            </h2>
                            <p className="text-neurolink-coldWhite/70">
                              {clone.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-orbitron text-neurolink-coldWhite">
                              ${clone.price}
                            </p>
                            <p className="text-neurolink-coldWhite/70">
                              {clone.points} puntos
                            </p>
                          </div>
                        </div>

                        {/* Detalles */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-neurolink-matrixGreen" />
                            <span className="text-neurolink-coldWhite capitalize">
                              {clone.niche.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-neurolink-matrixGreen" />
                            <span className="text-neurolink-coldWhite uppercase">
                              {clone.language}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-neurolink-matrixGreen" />
                            <span className="text-neurolink-coldWhite capitalize">
                              {clone.objective}
                            </span>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div>
                            <p className="text-neurolink-coldWhite/70 text-sm">
                              Conversaciones
                            </p>
                            <p className="text-neurolink-coldWhite font-orbitron">
                              {clone.trainingData.conversations}
                            </p>
                          </div>
                          <div>
                            <p className="text-neurolink-coldWhite/70 text-sm">
                              Documentos
                            </p>
                            <p className="text-neurolink-coldWhite font-orbitron">
                              {clone.trainingData.documents}
                            </p>
                          </div>
                          <div>
                            <p className="text-neurolink-coldWhite/70 text-sm">
                              Rating
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-neurolink-coldWhite font-orbitron">
                                {clone.rating}
                              </p>
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-neurolink-coldWhite/70">
                                ({clone.reviews})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleStartDemo(clone)}
                            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Probar Demo
                          </button>
                          <button
                            onClick={() => handleAddClone(clone)}
                            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Agregar a mi Cuenta
                          </button>
                          <button
                            onClick={() => handleRetrainClone(clone)}
                            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                          >
                            <Settings className="w-5 h-5" />
                            Reentrenar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'my-clones' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Mis Clones
              </h2>
              <p className="text-neurolink-coldWhite/70">
                Aquí podrás ver y gestionar tus clones personalizados
              </p>
            </motion.div>
          )}

          {activeTab === 'collaborative' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Marketplace Colaborativo
              </h2>
              <p className="text-neurolink-coldWhite/70">
                Vende tus clones IA y gana regalías
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Demo */}
      <AnimatePresence>
        {showDemo && selectedClone && (
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
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-4xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                  Demo: {selectedClone.name}
                </h2>
                <button
                  onClick={() => setShowDemo(false)}
                  className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Demo */}
              <div className="h-[600px] bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 p-6 flex flex-col">
                {/* Mensajes */}
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-neurolink-matrixGreen/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-neurolink-matrixGreen" />
                    </div>
                    <div className="flex-1">
                      <p className="text-neurolink-coldWhite">
                        ¡Hola! Soy {selectedClone.name}. ¿En qué puedo ayudarte hoy?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                  />
                  <button className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron">
                    Enviar
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

export default NeuroCloneStore; 