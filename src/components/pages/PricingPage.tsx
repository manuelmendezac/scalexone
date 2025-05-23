import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Zap, 
  Database, 
  MessageSquare, 
  Settings, 
  ArrowRight,
  Building2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: {
    icon: JSX.Element;
    text: string;
  }[];
  cta: {
    text: string;
    link: string;
  };
  highlight?: boolean;
}

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      name: 'Hobby',
      price: 0,
      description: 'Perfecto para comenzar tu viaje con NeuroLink',
      features: [
        { icon: <Zap className="w-5 h-5" />, text: 'Hasta 5 módulos activos' },
        { icon: <Users className="w-5 h-5" />, text: '1 clon básico (sin personalización)' },
        { icon: <Sparkles className="w-5 h-5" />, text: 'Acceso limitado a IA (GPT-3.5)' },
        { icon: <Database className="w-5 h-5" />, text: '100MB de almacenamiento' },
        { icon: <MessageSquare className="w-5 h-5" />, text: 'Acceso a comunidad básica' }
      ],
      cta: {
        text: 'Empieza Gratis',
        link: '/register'
      }
    },
    {
      name: 'Pro',
      price: 20,
      description: 'Potencia tu productividad con características avanzadas',
      features: [
        { icon: <Zap className="w-5 h-5" />, text: 'Todos los módulos desbloqueados' },
        { icon: <Users className="w-5 h-5" />, text: '1 clon avanzado con memoria expandida' },
        { icon: <Sparkles className="w-5 h-5" />, text: 'Acceso a IA premium (GPT-4 y TTS)' },
        { icon: <Database className="w-5 h-5" />, text: '5GB de almacenamiento' },
        { icon: <Settings className="w-5 h-5" />, text: 'Personalización parcial del clon' },
        { icon: <Zap className="w-5 h-5" />, text: 'Créditos IA incluidos: 1000/mes' },
        { icon: <MessageSquare className="w-5 h-5" />, text: 'Soporte prioritario' }
      ],
      cta: {
        text: 'Actualizar',
        link: '/upgrade'
      },
      highlight: true
    },
    {
      name: 'Business',
      price: 40,
      description: 'Solución completa para equipos y empresas',
      features: [
        { icon: <Users className="w-5 h-5" />, text: 'Hasta 5 usuarios' },
        { icon: <Zap className="w-5 h-5" />, text: 'Multi-clon (gestión de clones)' },
        { icon: <Building2 className="w-5 h-5" />, text: 'Marca blanca, dashboard de equipo' },
        { icon: <Database className="w-5 h-5" />, text: '50GB de almacenamiento' },
        { icon: <Sparkles className="w-5 h-5" />, text: 'Créditos IA incluidos: 5000/mes' },
        { icon: <Settings className="w-5 h-5" />, text: 'Branding corporativo y acceso API' }
      ],
      cta: {
        text: 'Contactar Equipo Comercial',
        link: '/contact-sales'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neurolink-background to-neurolink-background/80 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-orbitron text-neurolink-coldWhite mb-6">
            Elige tu Plan <span className="text-neurolink-matrixGreen">NeuroLink</span>
          </h1>
          <p className="text-neurolink-coldWhite/70 text-lg max-w-2xl mx-auto">
            Desbloquea todo el potencial de la IA con nuestros planes diseñados para cada nivel de necesidad
          </p>
        </motion.div>

        {/* Selector de ciclo de facturación */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-1 border border-neurolink-cyberBlue/30">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-orbitron transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                  : 'text-neurolink-coldWhite/70 hover:text-neurolink-matrixGreen'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-orbitron transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                  : 'text-neurolink-coldWhite/70 hover:text-neurolink-matrixGreen'
              }`}
            >
              Anual <span className="text-xs">(20% off)</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de precios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-black/40 backdrop-blur-xl rounded-xl p-8 border ${
                plan.highlight
                  ? 'border-neurolink-matrixGreen shadow-lg shadow-neurolink-matrixGreen/20'
                  : 'border-neurolink-cyberBlue/30'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-neurolink-matrixGreen text-neurolink-dark px-4 py-1 rounded-full text-sm font-orbitron">
                    Más Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-orbitron text-neurolink-coldWhite mb-2">{plan.name}</h3>
              <p className="text-neurolink-coldWhite/70 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-orbitron text-neurolink-coldWhite">
                  ${billingCycle === 'yearly' ? (plan.price * 0.8).toFixed(2) : plan.price}
                </span>
                <span className="text-neurolink-coldWhite/70">/mes</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-neurolink-coldWhite">
                    <CheckCircle2 className="w-5 h-5 text-neurolink-matrixGreen" />
                    {feature.text}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.cta.link}
                className={`block w-full py-3 px-6 rounded-lg text-center font-orbitron transition-all ${
                  plan.highlight
                    ? 'bg-neurolink-matrixGreen text-neurolink-dark hover:bg-neurolink-matrixGreen/90'
                    : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30'
                }`}
              >
                {plan.cta.text}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <Link
            to="/white-label"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 transition-all font-orbitron"
          >
            ¿Eres agencia, escuela o empresa? Accede al licenciamiento White Label aquí
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage; 