import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PagoExitoso() {
  const router = useRouter();
  const { session_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      // Aquí puedes hacer una llamada a tu API para verificar el pago
      // y actualizar el estado en tu base de datos
      console.log('Sesión de pago completada:', session_id);
      setIsLoading(false);
    }
  }, [session_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 text-lg">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de éxito */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente. Recibirás un email de confirmación 
          con los detalles de tu compra y las instrucciones de acceso.
        </p>

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">
            ID de Sesión: <span className="font-mono text-xs">{session_id}</span>
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link 
            href="/marketplace"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Continuar Comprando
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
            <a href="mailto:soporte@scalexone.com" className="text-green-600 hover:text-green-700">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 