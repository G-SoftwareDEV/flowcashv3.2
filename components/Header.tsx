import React from 'react';
import { LogOut, MonitorSmartphone } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-orange-500 text-white shadow-md w-full h-16 flex items-center justify-between px-4 sm:px-8 z-20 relative">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-full">
            <MonitorSmartphone className="text-orange-500 w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">FlowCash</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm bg-orange-600/50 py-1 px-3 rounded-full">
            <img src={user.avatarUrl} alt="User" className="w-6 h-6 rounded-full border border-white" />
            <span className="font-medium truncate max-w-[150px]">{user.email}</span>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 hover:bg-orange-600 px-3 py-1.5 rounded transition-colors text-sm font-semibold"
        >
          <span>Sair</span>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;