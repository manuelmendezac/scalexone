import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 bg-transparent">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default DashboardLayout; 