import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import { useSyncUserProfile } from '../hooks/useSyncUserProfile';

const DashboardLayout = () => {
  useSyncUserProfile(); // Sincroniza los datos del usuario al cargar el layout

  return (
    <div className="flex min-h-screen" style={{ background: '#10192b' }}>
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 bg-transparent">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default DashboardLayout; 