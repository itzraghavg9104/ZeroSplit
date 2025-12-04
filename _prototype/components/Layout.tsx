import React, { ReactNode } from 'react';
import { Home, Grid, UserCircle, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'home' | 'groups' | 'profile';
  onTabChange: (tab: 'home' | 'groups' | 'profile') => void;
  onAddClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex justify-center items-start transition-colors duration-200">
      {/* Mobile Constraint Container */}
      <div className="w-full max-w-[480px] min-h-screen bg-white dark:bg-black shadow-2xl relative flex flex-col border-x border-gray-100 dark:border-gray-900">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          {children}
        </main>

        {/* Bottom Navigation - Frosted Glass Effect */}
        <nav className="fixed bottom-0 w-full max-w-[480px] bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 px-8 py-4 flex justify-between items-center z-40 pb-safe">
          <button 
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${activeTab === 'home' ? 'text-black dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}
          >
            <Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          </button>

          <button 
            onClick={() => onTabChange('groups')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${activeTab === 'groups' ? 'text-black dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}
          >
            <Grid size={28} strokeWidth={activeTab === 'groups' ? 2.5 : 2} />
          </button>

          {/* Floating Action Button (Center) */}
          <div className="relative -top-6">
            <button 
               onClick={onAddClick}
               className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 rounded-full shadow-xl flex items-center justify-center transform transition-transform active:scale-95 hover:scale-105 ring-4 ring-white dark:ring-black"
            >
              <Plus size={32} strokeWidth={2.5} />
            </button>
          </div>

          {/* Placeholder for balance/spacer if needed, otherwise Profile */}
           <button 
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${activeTab === 'profile' ? 'text-black dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}
          >
            <UserCircle size={28} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;