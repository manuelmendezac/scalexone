import React, { useState } from 'react';
import { StripeService } from '../services/stripeService';
import type { StripeProductData } from '../services/stripeService';

interface StripePaymentButtonProps {
  productData: StripeProductData;
  customerEmail?: string;
  metadata?: Record<string, any>;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  productData,
  customerEmail,
  metadata = {},
  className = '',
  children,
  disabled = false,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      await StripeService.processPayment(productData, customerEmail, metadata);
      onSuccess?.();
    } catch (error) {
      console.error('Error en el pago:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return 'Procesando...';
    }
    
    if (productData.tipo_pago === 'suscripcion') {
      return children || `Suscribirse por $${productData.precio}/mes`;
    }
    
    return children || `Comprar por $${productData.precio}`;
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={`
        px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
        ${productData.tipo_pago === 'suscripcion' 
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
          : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
        }
        ${disabled || isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-lg transform hover:scale-105'
        }
        ${className}
      `}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {getButtonText()}
    </button>
  );
};

// Componente específico para cursos
export const CoursePaymentButton: React.FC<{
  curso: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    tipo_pago: 'pago_unico' | 'suscripcion';
  };
  customerEmail?: string;
  className?: string;
}> = ({ curso, customerEmail, className }) => {
  const productData: StripeProductData = {
    nombre: curso.nombre,
    descripcion: curso.descripcion,
    precio: curso.precio,
    tipo_pago: curso.tipo_pago,
  };

  const metadata = {
    curso_id: curso.id,
    tipo_producto: 'curso',
  };

  return (
    <StripePaymentButton
      productData={productData}
      customerEmail={customerEmail}
      metadata={metadata}
      className={className}
    />
  );
};

// Componente específico para servicios
export const ServicePaymentButton: React.FC<{
  servicio: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    tipo_pago: 'pago_unico' | 'suscripcion';
  };
  customerEmail?: string;
  className?: string;
}> = ({ servicio, customerEmail, className }) => {
  const productData: StripeProductData = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    precio: servicio.precio,
    tipo_pago: servicio.tipo_pago,
  };

  const metadata = {
    servicio_id: servicio.id,
    tipo_producto: 'servicio',
  };

  return (
    <StripePaymentButton
      productData={productData}
      customerEmail={customerEmail}
      metadata={metadata}
      className={className}
    />
  );
}; 