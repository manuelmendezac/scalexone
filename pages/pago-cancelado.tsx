import React from 'react';
import Link from 'next/link';

export default function PagoCancelado() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de cancelación */}
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-8 h-8 text-yellow-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago Cancelado
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          Tu pago ha sido cancelado. No se ha realizado ningún cargo a tu cuenta. 
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda? Nuestro equipo está disponible para asistirte.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link 
            href="/marketplace"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver al Marketplace
          </Link>
          
          <Link 
            href="/dashboard"
            className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Tienes alguna pregunta?{' '}
            <a href="mailto:soporte@scalexone.com" className="text-blue-600 hover:text-blue-700">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 