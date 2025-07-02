import React from 'react';

export default function MetodosCobroPanel() {
  return (
    <div className="metodos-cobro-panel max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Métodos de Cobro</h2>
      <p className="mb-6 text-gray-300">
        Aquí podrás gestionar y conectar los métodos de cobro para recibir pagos en tu comunidad. Actualmente solo Stripe está activo. Próximamente podrás conectar tu propio Stripe (Stripe Connect), PayPal, pagos locales y contraentrega.
      </p>
      <div className="metodo-cobro bg-gray-800 rounded-lg p-4 flex items-center mb-4 border-2 border-green-400">
        <img src="/images/stripe-logo.svg" alt="Stripe" style={{height: 32, marginRight: 16}} />
        <div className="flex-1">
          <strong>Stripe (Empresa)</strong>
          <p className="text-green-400">Activo y conectado. Todos los pagos se procesan con la cuenta principal de ScaleXone.</p>
        </div>
        <button className="btn btn-success" disabled>Configurado</button>
      </div>
      <div className="metodo-cobro bg-gray-700 rounded-lg p-4 flex items-center mb-4 opacity-80 border border-blue-400">
        <img src="/images/stripe-logo.svg" alt="Stripe Connect" style={{height: 32, marginRight: 16}} />
        <div className="flex-1">
          <strong>Stripe Connect (Próximamente)</strong>
          <p className="text-blue-300">Permite que cada admin conecte su propia cuenta Stripe y reciba pagos directos. ¡Muy pronto!</p>
        </div>
        <button className="btn btn-secondary" disabled>En desarrollo</button>
      </div>
      <div className="metodo-cobro bg-gray-700 rounded-lg p-4 flex items-center mb-4 opacity-60">
        <img src="/images/paypal-logo.svg" alt="PayPal" style={{height: 32, marginRight: 16}} />
        <div className="flex-1">
          <strong>PayPal</strong>
          <p className="text-yellow-400">Próximamente podrás conectar tu cuenta PayPal para recibir pagos.</p>
        </div>
        <button className="btn btn-secondary" disabled>En desarrollo</button>
      </div>
      <div className="metodo-cobro bg-gray-700 rounded-lg p-4 flex items-center mb-4 opacity-60">
        <img src="/images/yape-logo.svg" alt="Yape" style={{height: 32, marginRight: 8}} />
        <img src="/images/plin-logo.svg" alt="Plin" style={{height: 32, marginRight: 8}} />
        <img src="/images/nequi-logo.svg" alt="Nequi" style={{height: 32, marginRight: 16}} />
        <div className="flex-1">
          <strong>Pagos Locales</strong>
          <p className="text-yellow-400">Próximamente (Yape, Plin, Nequi...)</p>
        </div>
        <button className="btn btn-secondary" disabled>En desarrollo</button>
      </div>
      <div className="metodo-cobro bg-gray-700 rounded-lg p-4 flex items-center opacity-60">
        <span style={{fontSize: 32, marginRight: 16}}>📦</span>
        <div className="flex-1">
          <strong>Contraentrega</strong>
          <p className="text-yellow-400">Próximamente para productos físicos. Permite cobrar al entregar el producto.</p>
        </div>
        <button className="btn btn-secondary" disabled>En desarrollo</button>
      </div>
      <div className="mt-8 p-4 bg-gray-900 rounded-lg text-gray-400 text-sm">
        <strong>¿Cómo funciona Stripe Connect?</strong>
        <ul className="list-disc ml-6 mt-2">
          <li>Podrás conectar tu propia cuenta Stripe y recibir pagos directos.</li>
          <li>La plataforma gestionará la conexión y los permisos de forma segura.</li>
          <li>Podrás ver el estado de conexión y cambiar/desconectar tu cuenta cuando quieras.</li>
          <li>Mientras tanto, todos los pagos se procesan con la cuenta principal de ScaleXone.</li>
        </ul>
      </div>
    </div>
  );
} 