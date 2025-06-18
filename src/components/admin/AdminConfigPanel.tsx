import React from 'react';
import LevelsSection from './LevelsSection';

function TarjetaResumen({ titulo, valor, subvalor, icono, color }: any) {
  return (
    <div style={{
      background: '#23232b',
      borderRadius: 16,
      padding: 24,
      minWidth: 220,
      minHeight: 110,
      color: '#fff',
      boxShadow: '0 2px 8px #0004',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      border: `2px solid ${color || '#FFD700'}`,
      marginRight: 24,
      marginBottom: 24
    }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || '#FFD700', marginBottom: 8 }}>{icono} {titulo}</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{valor}</div>
      {subvalor && <div style={{ fontSize: 14, color: '#FFD700', marginTop: 4 }}>{subvalor}</div>}
    </div>
  );
}

export default function AdminConfigPanel({ selected }: { selected: string }) {
  return (
    <main style={{ flex: 1, padding: 40, background: '#23232b', minHeight: '100vh' }}>
      {selected === 'welcome' && (
        <>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            <TarjetaResumen titulo="Miembros" valor="1,250" subvalor="+5% este mes" icono="👥" color="#FFD700" />
            <TarjetaResumen titulo="Ventas" valor="$12,500" subvalor="+12% este mes" icono="💰" color="#FFD700" />
            <TarjetaResumen titulo="Nuevos" valor="45" subvalor="+8% este mes" icono="✨" color="#FFD700" />
            <TarjetaResumen titulo="Conversión" valor="3.2%" subvalor="-2% este mes" icono="📈" color="#FFD700" />
          </div>
          <div style={{ background: '#18181b', borderRadius: 16, padding: 32, color: '#fff', minHeight: 220, boxShadow: '0 2px 8px #0004' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FFD700', marginBottom: 16 }}>Bienvenido al Panel de Administración</div>
            <div style={{ fontSize: 16, color: '#fff' }}>Aquí podrás gestionar todos los aspectos de tu comunidad, miembros, ventas, canales y más. Pronto verás gráficas y tablas aquí.</div>
          </div>
        </>
      )}
      {selected === 'levels' && <LevelsSection />}
      {selected === 'channels' && <div style={{ color: '#fff' }}>Canales (aquí irá la gestión de canales)</div>}
      {selected === 'mainMenu' && <div style={{ color: '#fff' }}>Menú Principal (aquí irá la configuración del menú principal)</div>}
      {selected === 'members' && <div style={{ color: '#fff' }}>Miembros (aquí irá la gestión de miembros)</div>}
      {selected === 'events' && <div style={{ color: '#fff' }}>Eventos (aquí irá la gestión de eventos)</div>}
      {selected === 'chats' && <div style={{ color: '#fff' }}>Chats (aquí irá la gestión de chats)</div>}
      {selected === 'affiliates' && <div style={{ color: '#fff' }}>Afiliados (aquí irá la gestión de afiliados)</div>}
      {selected === 'payments' && <div style={{ color: '#fff' }}>Métodos de Cobro (aquí irá la gestión de métodos de cobro)</div>}
      {selected === 'salesHistory' && <div style={{ color: '#fff' }}>Historial de Ventas (aquí irá el historial de ventas)</div>}
      {selected === 'transactions' && <div style={{ color: '#fff' }}>Transacciones (aquí irá la gestión de transacciones)</div>}
      {selected === 'cryptoTransactions' && <div style={{ color: '#fff' }}>Transacciones Crypto (aquí irá la gestión de transacciones cripto)</div>}
      {selected === 'profile' && <div style={{ color: '#fff' }}>Perfil (aquí irá la configuración del perfil)</div>}
      {selected === 'account' && <div style={{ color: '#fff' }}>Cuenta (aquí irá la configuración de la cuenta)</div>}
      {selected === 'password' && <div style={{ color: '#fff' }}>Contraseña (aquí irá el cambio de contraseña)</div>}
      {selected === 'paymentHistory' && <div style={{ color: '#fff' }}>Historial de Pagos (aquí irá el historial de pagos)</div>}
      {selected === 'invites' && <div style={{ color: '#fff' }}>Invitados (aquí irá la gestión de invitados)</div>}
      {selected === 'commissions' && <div style={{ color: '#fff' }}>Comisiones (aquí irá la gestión de comisiones)</div>}
      {selected === 'wallet' && <div style={{ color: '#fff' }}>Billetera (aquí irá la gestión de la billetera)</div>}
      {selected === 'domain' && <div style={{ color: '#fff' }}>Dominio (aquí irá la configuración del dominio personalizado)</div>}
      {selected === 'about' && <div style={{ color: '#fff' }}>Página Pública (aquí irá la edición de la página pública de la comunidad)</div>}
    </main>
  );
} 