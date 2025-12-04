import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSettlements, calculateUserNetBalance } from '../utils/settlementLogic';
import { ArrowRight, Receipt, DollarSign, CheckCircle2, MoreHorizontal } from 'lucide-react';

const GroupDashboard: React.FC = () => {
  const { currentGroup, expenses, currentUser, getUser } = useApp();
  const [showSettlements, setShowSettlements] = useState(false);

  // Memoized Calculations
  const netBalance = useMemo(() => 
    calculateUserNetBalance(currentUser.id, expenses), 
    [currentUser.id, expenses]
  );

  const settlements = useMemo(() => 
    calculateSettlements(expenses, currentGroup.members),
    [expenses, currentGroup.members]
  );

  return (
    <div className="pb-10 bg-white dark:bg-black min-h-full">
      {/* Header Card */}
      <div className="px-6 pt-12 pb-6 bg-white dark:bg-black sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start mb-6">
           <div>
              <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Current Group</h2>
              <h1 className="text-3xl font-bold text-black dark:text-white mt-1">{currentGroup.name}</h1>
           </div>
           <button className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
             <MoreHorizontal size={24} />
           </button>
        </div>

        <div className="flex flex-col">
           <span className="text-sm text-gray-500 dark:text-gray-400">Your Net Balance</span>
           <div className={`text-5xl font-bold mt-2 tracking-tight ${netBalance >= 0 ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}>
              {netBalance < 0 && '-'}${Math.abs(netBalance).toFixed(2)}
           </div>
           <p className={`text-sm font-medium mt-2 px-3 py-1 rounded-full self-start inline-block ${
             netBalance === 0 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' :
             netBalance > 0 ? 'bg-black text-white dark:bg-white dark:text-black' : 
             'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
           }`}>
             {netBalance === 0 ? "Settled up" : netBalance > 0 ? "You are owed" : "You owe"}
           </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-6 mt-6">
        <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex">
          <button 
            onClick={() => setShowSettlements(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${!showSettlements ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-500'}`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setShowSettlements(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${showSettlements ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-500'}`}
          >
            Settle Up
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-4">
        {!showSettlements ? (
          /* Expense Feed */
          <div className="space-y-6">
            {expenses.length === 0 ? (
               <div className="text-center py-20 opacity-40">
                  <Receipt size={48} className="mx-auto mb-4" strokeWidth={1} />
                  <p className="text-sm font-medium">No expenses yet.</p>
               </div>
            ) : (
              expenses.map(expense => {
                const payer = getUser(expense.payerId);
                const userOwed = expense.splitDetails[currentUser.id] || 0;
                const userPaid = expense.payerId === currentUser.id;
                
                const date = new Date(expense.date);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={expense.id} className="flex items-center justify-between group py-2">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-xl border border-gray-100 dark:border-gray-800">
                          {expense.description.toLowerCase().includes('food') || expense.description.toLowerCase().includes('dinner') ? '🍔' : 
                           expense.description.toLowerCase().includes('taxi') || expense.description.toLowerCase().includes('uber') ? '🚕' : 
                           expense.description.toLowerCase().includes('flight') ? '✈️' : '🧾'}
                       </div>
                       <div>
                         <h3 className="text-base font-bold text-gray-900 dark:text-white leading-none mb-1.5">{expense.description}</h3>
                         <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                           {userPaid ? <span className="text-black dark:text-white">You paid</span> : <span>{payer?.name} paid</span>} • {dateStr}
                         </p>
                       </div>
                    </div>

                    <div className="text-right">
                       <div className="text-base font-bold text-gray-900 dark:text-white">${expense.amount.toFixed(0)}</div>
                       {userPaid ? (
                         <div className="text-xs font-semibold text-green-600 dark:text-green-400">Lent ${(expense.amount - (expense.splitDetails[currentUser.id] || 0)).toFixed(0)}</div>
                       ) : (
                         <div className="text-xs font-semibold text-red-600 dark:text-red-400">Owe ${userOwed.toFixed(0)}</div>
                       )}
                    </div>
                  </div>
                );
              })
            )}
            <div className="h-12"></div> {/* Spacer */}
          </div>
        ) : (
          /* Settlement Plan */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {settlements.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-black dark:text-white">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">All settled up!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No pending debts in this group.</p>
               </div>
            ) : (
              settlements.map((settlement, idx) => {
                const fromUser = getUser(settlement.from);
                const toUser = getUser(settlement.to);
                const isCurrentUserPayer = settlement.from === currentUser.id;
                const isCurrentUserReceiver = settlement.to === currentUser.id;

                return (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={fromUser?.avatarUrl} alt={fromUser?.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-80" />
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5 border border-gray-100 dark:border-gray-800">
                          <ArrowRight size={10} className="text-black dark:text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black dark:text-white">
                           {isCurrentUserPayer ? 'You' : fromUser?.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                          pays {isCurrentUserReceiver ? 'You' : toUser?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-black dark:text-white">${settlement.amount.toFixed(2)}</span>
                      {isCurrentUserPayer && (
                        <button className="text-[10px] font-bold bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full mt-1 active:opacity-80">
                          PAY
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-900">
               <div className="flex items-start gap-3 opacity-60">
                 <DollarSign size={16} className="mt-0.5" />
                 <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Graph Minimization</h4>
                   <p className="text-xs leading-relaxed">
                     Transactions are optimized to reduce the total number of transfers needed between group members.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDashboard;