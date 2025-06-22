import React from 'react';
import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4 z-40">
      <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
      <button onClick={toggleSidebar} className="text-white">
        <Menu size={24} />
      </button>
    </div>
  );
};

export default AdminHeader; 