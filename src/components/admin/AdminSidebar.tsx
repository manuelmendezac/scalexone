import React from 'react';

const menuItems = [
  { label: 'Bienvenida', key: 'welcome' },
  { label: 'Niveles', key: 'levels' },
  { label: 'Canales', key: 'channels' },
  { label: 'Menú Principal', key: 'mainMenu' },
  { label: 'Miembros', key: 'members' },
  { label: 'Eventos', key: 'events' },
  { label: 'Chats', key: 'chats' },
  { label: 'Afiliados', key: 'affiliates' },
  { label: 'Métodos de Cobro', key: 'payments' },
  { label: 'Historial de Ventas', key: 'salesHistory' },
  { label: 'Transacciones', key: 'transactions' },
  { label: 'Transacciones Crypto', key: 'cryptoTransactions' },
  { label: 'Perfil', key: 'profile' },
  { label: 'Cuenta', key: 'account' },
  { label: 'Contraseña', key: 'password' },
  { label: 'Historial de Pagos', key: 'paymentHistory' },
  { label: 'Invitados', key: 'invites' },
  { label: 'Comisiones', key: 'commissions' },
  { label: 'Billetera', key: 'wallet' },
  { label: 'Dominio', key: 'domain' },
  { label: 'Página Pública', key: 'about' },
];

export default function AdminSidebar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return (
    <aside className="bg-[#18181b] text-white w-64 min-h-screen flex flex-col py-6 px-2 border-r border-[#23232b]">
      <div className="text-2xl font-bold mb-8 text-yellow-400 text-center">Panel Admin</div>
      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${selected === item.key ? 'bg-yellow-400 text-black' : 'hover:bg-[#23232b]'}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
} 