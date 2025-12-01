import React, { useState } from 'react';
import { LogOut, MonitorSmartphone, Users } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onSwitchAccount }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-orange-500 text-white shadow-md w-full h-16 flex items-center justify-between px-4 sm:px-8 z-20 relative">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-full">
            <MonitorSmartphone className="text-orange-500 w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">FlowCash</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="hidden sm:flex items-center gap-2 text-sm bg-orange-600/50 py-1 px-3 rounded-full hover:bg-orange-600/70 transition-colors cursor-pointer"
            title="Trocar conta"
          >
            <img src={user.avatarUrl} alt="User" className="w-6 h-6 rounded-full border border-white" />
            <span className="font-medium truncate max-w-[150px]">{user.email}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl z-50">
              <button
                onClick={() => {
                  onSwitchAccount();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-2 rounded-t-lg transition-colors"
              >
                <Users size={18} className="text-orange-500" />
                <span className="font-medium">Trocar Conta</span>
              </button>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 rounded-b-lg transition-colors text-red-600"
              >
                <LogOut size={18} />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={onLogout}
          className="sm:hidden flex items-center gap-2 hover:bg-orange-600 px-3 py-1.5 rounded transition-colors text-sm font-semibold"
        >
          <span>Sair</span>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;