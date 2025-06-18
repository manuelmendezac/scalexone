import React, { useState } from 'react';
import AdminSidebar from './admin/AdminSidebar';
import AdminConfigPanel from './admin/AdminConfigPanel';
import './ConfiguracionProyecto.css';
import NeonSpinner from './NeonSpinner';

const USUARIO_DEFAULT = {
  nombre: 'Manuel Méndez',
  email: 'manuel@email.com',
  tipo: 'Web3',
  membresia: 'Pro',
  suscripcion: 'Activa',
  creditos: 250,
  coins: 12,
  wallet: '0x1234...abcd',
  red: 'Polygon',
  puedeRetirar: true,
  puedeCrearMasAgentes: true
};

const PROYECTO_DEFAULT = {
  nombre: 'Mi Segundo Cerebro',
  dominio: 'miapp.com',
  soporte: 'soporte@miapp.com',
  idioma: 'Español',
  zonaHoraria: 'GMT-5',
  logo: '',
  maxAgentes: 10,
  maxUsuarios: 100,
  maxCreditos: 1000,
  maxAlmacenamiento: '2 GB',
};

const ConfiguracionProyecto: React.FC = () => {
  const [selected, setSelected] = useState('welcome');
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NeonSpinner size={64} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>
      <AdminSidebar selected={selected} onSelect={setSelected} />
      <AdminConfigPanel selected={selected} />
    </div>
  );
};

export default ConfiguracionProyecto; 