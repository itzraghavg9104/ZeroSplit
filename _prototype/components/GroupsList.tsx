import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GroupsList: React.FC = () => {
  const { currentGroup } = useApp();

  // Dummy groups for prototype
  const groups = [
    { ...currentGroup, id: 'g1', balance: 120.50 },
    { id: 'g2', name: 'Housemates 🏠', members: [], balance: -45.00, coverImage: 'https://picsum.photos/800/400?random=10' },
    { id: 'g3', name: 'Friday Poker ♠️', members: [], balance: 0.00, coverImage: 'https://picsum.photos/800/400?random=11' },
    { id: 'g4', name: 'Paris 2024 🇫🇷', members: [], balance: 350.25, coverImage: 'https://picsum.photos/800/400?random=12' },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-full pb-10">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">Your Groups</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">You are owed <span className="text-black dark:text-white font-bold">$470.75</span> in total</p>
      </div>

      <div className="space-y-1">
        {groups.map((group, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer group border-b border-gray-50 dark:border-gray-900">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative">
                 <img src={group.coverImage} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">{group.name}</h3>
                <p className={`text-xs font-bold mt-1 ${
                    group.balance > 0 ? 'text-green-600 dark:text-green-400' : 
                    group.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                }`}>
                  {group.balance === 0 ? 'Settled' : group.balance > 0 ? `Owes you $${group.balance.toFixed(2)}` : `You owe $${Math.abs(group.balance).toFixed(2)}`}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 dark:text-gray-700" />
          </div>
        ))}
      </div>

      <div className="px-6 mt-8">
        <button className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all group">
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          <span>Create New Group</span>
        </button>
      </div>
    </div>
  );
};

export default GroupsList;