import React from 'react';
import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black flex items-center justify-between px-4 z-30 border-b border-gray-800">
      <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
      <button onClick={onMenuClick} className="text-white p-2">
        <Menu size={24} />
      </button>
    </header>
  );
};

export default AdminHeader; 