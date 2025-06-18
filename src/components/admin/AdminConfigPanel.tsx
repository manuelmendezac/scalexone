import React from 'react';
import LevelsSection from './LevelsSection';

export default function AdminConfigPanel({ selected }: { selected: string }) {
  return (
    <main className="flex-1 p-8 bg-[#23232b] min-h-screen">
      {selected === 'welcome' && <div>Bienvenida (aquí irá la info de bienvenida y dashboard)</div>}
      {selected === 'levels' && <LevelsSection />}
      {selected === 'channels' && <div>Canales (aquí irá la gestión de canales)</div>}
      {selected === 'mainMenu' && <div>Menú Principal (aquí irá la configuración del menú principal)</div>}
      {selected === 'members' && <div>Miembros (aquí irá la gestión de miembros)</div>}
      {selected === 'events' && <div>Eventos (aquí irá la gestión de eventos)</div>}
      {selected === 'chats' && <div>Chats (aquí irá la gestión de chats)</div>}
      {selected === 'affiliates' && <div>Afiliados (aquí irá la gestión de afiliados)</div>}
      {selected === 'payments' && <div>Métodos de Cobro (aquí irá la gestión de métodos de cobro)</div>}
      {selected === 'salesHistory' && <div>Historial de Ventas (aquí irá el historial de ventas)</div>}
      {selected === 'transactions' && <div>Transacciones (aquí irá la gestión de transacciones)</div>}
      {selected === 'cryptoTransactions' && <div>Transacciones Crypto (aquí irá la gestión de transacciones cripto)</div>}
      {selected === 'profile' && <div>Perfil (aquí irá la configuración del perfil)</div>}
      {selected === 'account' && <div>Cuenta (aquí irá la configuración de la cuenta)</div>}
      {selected === 'password' && <div>Contraseña (aquí irá el cambio de contraseña)</div>}
      {selected === 'paymentHistory' && <div>Historial de Pagos (aquí irá el historial de pagos)</div>}
      {selected === 'invites' && <div>Invitados (aquí irá la gestión de invitados)</div>}
      {selected === 'commissions' && <div>Comisiones (aquí irá la gestión de comisiones)</div>}
      {selected === 'wallet' && <div>Billetera (aquí irá la gestión de la billetera)</div>}
      {selected === 'domain' && <div>Dominio (aquí irá la configuración del dominio personalizado)</div>}
      {selected === 'about' && <div>Página Pública (aquí irá la edición de la página pública de la comunidad)</div>}
    </main>
  );
} 