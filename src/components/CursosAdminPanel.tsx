import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  orden: number;
}

const CursosAdminPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setAdminError('Error obteniendo usuario: ' + userError.message);
          setChecking(false);
          return;
        }
        if (!user) {
          setAdminError('No hay usuario autenticado.');
          setChecking(false);
          return;
        }
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        if (error) {
          setAdminError('Error consultando rol: ' + error.message);
          setChecking(false);
          return;
        }
        if (data?.rol === 'admin') {
          setIsAdmin(true);
        } else {
          setAdminError('No tienes permisos de administrador.');
        }
        setChecking(false);
      } catch (e: any) {
        setAdminError('Error inesperado: ' + e.message);
        setChecking(false);
      }
    }
    checkAdmin();
  }, []);

  if (checking) return <div style={{color: 'white', padding: 24}}>Verificando permisos de administrador...</div>;
  if (adminError) return <div style={{color: 'red', padding: 24}}>{adminError}</div>;
  if (isAdmin) return <div style={{color: 'lime', padding: 24}}>Eres admin. (Panel en construcción)</div>;
  return null;
};

export default CursosAdminPanel; 