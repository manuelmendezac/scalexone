import React from 'react';
import { FaHome, FaLayerGroup, FaUsers, FaComments, FaCogs, FaWallet, FaChartBar, FaUserShield, FaKey, FaUserFriends, FaMoneyBillWave, FaHistory, FaGlobe, FaRegAddressBook, FaSitemap, FaLock, FaUserCircle, FaRegCreditCard, FaCoins } from 'react-icons/fa';

const menuItems = [
  { label: 'Bienvenida', key: 'welcome', icon: <FaHome /> },
  { label: 'Niveles', key: 'levels', icon: <FaLayerGroup /> },
  { label: 'Canales', key: 'channels', icon: <FaSitemap /> },
  { label: 'Menú Principal', key: 'mainMenu', icon: <FaCogs /> },
  { label: 'Miembros', key: 'members', icon: <FaUsers /> },
  { label: 'Eventos', key: 'events', icon: <FaRegAddressBook /> },
  { label: 'Chats', key: 'chats', icon: <FaComments /> },
  { label: 'Afiliados', key: 'affiliates', icon: <FaUserFriends /> },
  { label: 'Métodos de Cobro', key: 'payments', icon: <FaMoneyBillWave /> },
  { label: 'Historial de Ventas', key: 'salesHistory', icon: <FaHistory /> },
  { label: 'Transacciones', key: 'transactions', icon: <FaChartBar /> },
  { label: 'Transacciones Crypto', key: 'cryptoTransactions', icon: <FaCoins /> },
  { label: 'Perfil', key: 'profile', icon: <FaUserCircle /> },
  { label: 'Cuenta', key: 'account', icon: <FaUserShield /> },
  { label: 'Contraseña', key: 'password', icon: <FaKey /> },
  { label: 'Historial de Pagos', key: 'paymentHistory', icon: <FaRegCreditCard /> },
  { label: 'Invitados', key: 'invites', icon: <FaUserFriends /> },
  { label: 'Comisiones', key: 'commissions', icon: <FaMoneyBillWave /> },
  { label: 'Billetera', key: 'wallet', icon: <FaWallet /> },
  { label: 'Dominio', key: 'domain', icon: <FaGlobe /> },
  { label: 'Página Pública', key: 'about', icon: <FaGlobe /> },
];

export default function AdminSidebar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return (
    <aside style={{ background: '#18181b', color: '#fff', width: 260, minHeight: '100vh', display: 'flex', flexDirection: 'column', borderRight: '2px solid #23232b', boxShadow: '2px 0 8px #0002' }}>
      <div style={{ fontSize: 28, fontWeight: 700, margin: '32px 0 24px 0', color: '#FFD700', textAlign: 'center', letterSpacing: 1 }}>Panel Admin</div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map(item => (
          <button
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: selected === item.key ? '#FFD700' : 'transparent',
              color: selected === item.key ? '#18181b' : '#fff',
              fontWeight: selected === item.key ? 700 : 500,
              fontSize: 18,
              border: 'none',
              borderRadius: 8,
              margin: '0 16px',
              padding: '12px 18px',
              marginBottom: 6,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              boxShadow: selected === item.key ? '0 2px 8px #FFD70044' : 'none',
            }}
            onClick={() => onSelect(item.key)}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
} 