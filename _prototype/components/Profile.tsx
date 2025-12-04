import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser } = useApp();

  const MenuItem = ({ icon: Icon, label, value = "" }: { icon: any, label: string, value?: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-gray-900 cursor-pointer active:opacity-60">
      <div className="flex items-center gap-4">
        <Icon size={20} className="text-black dark:text-white" strokeWidth={1.5} />
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-medium text-gray-400">{value}</span>}
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-700" />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-black min-h-full pb-10">
      <div className="px-6 pt-12 pb-8 flex flex-col items-center border-b border-gray-50 dark:border-gray-900">
        <div className="w-24 h-24 rounded-full p-1 border-2 border-black dark:border-white mb-4">
           <img src={currentUser.avatarUrl} className="w-full h-full rounded-full object-cover grayscale" />
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white">{currentUser.name}</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">@username</p>
      </div>

      <div className="px-6 py-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preferences</h3>
        <MenuItem icon={Bell} label="Notifications" value="On" />
        <MenuItem icon={Moon} label="Dark Mode" value="System" />
        <MenuItem icon={DollarSign} label="Currency" value="USD ($)" />
      </div>

      <div className="px-6 py-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Support</h3>
        <MenuItem icon={Shield} label="Privacy & Security" />
        <MenuItem icon={HelpCircle} label="Help Center" />
      </div>

      <div className="px-6 mt-8">
        <button className="w-full py-4 bg-gray-50 dark:bg-gray-900 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
        <p className="text-center text-[10px] text-gray-300 dark:text-gray-700 mt-6 font-medium">
          SplitSync v1.0.0 (Prototype)
        </p>
      </div>
    </div>
  );
};

// Helper for icon
import { DollarSign } from 'lucide-react';

export default Profile;