import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SplitType, Expense } from '../types';

interface AddExpenseFormProps {
  onClose: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onClose }) => {
  const { currentGroup, currentUser, addExpense } = useApp();
  
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [payerId, setPayerId] = useState<string>(currentUser.id);
  
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    currentGroup.members.map(m => m.id)
  );

  const [manualAmounts, setManualAmounts] = useState<{ [key: string]: string }>({});

  const numericAmount = parseFloat(amount) || 0;
  const totalManualSplit = (Object.values(manualAmounts) as string[]).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const remaining = numericAmount - totalManualSplit;
  const isCustomValid = Math.abs(remaining) < 0.1;

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(prev => prev.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds(prev => [...prev, id]);
    }
  };

  const handleManualChange = (id: string, val: string) => {
    setManualAmounts(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    if (splitType === 'CUSTOM' && !isCustomValid) return;

    let splitDetails: { [userId: string]: number } = {};

    if (splitType === 'EQUAL') {
      const splitAmount = numericAmount / selectedMemberIds.length;
      selectedMemberIds.forEach(id => {
        splitDetails[id] = parseFloat(splitAmount.toFixed(2));
      });
    } else {
      (Object.entries(manualAmounts) as [string, string][]).forEach(([id, val]) => {
        if (parseFloat(val) > 0) {
          splitDetails[id] = parseFloat(val);
        }
      });
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      groupId: currentGroup.id,
      payerId,
      amount: numericAmount,
      description,
      date: new Date().toISOString(),
      splitType,
      splitDetails
    };

    addExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-[480px] mx-auto bg-white dark:bg-black animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6">
        <button onClick={onClose} className="p-2 -ml-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
          <X size={28} />
        </button>
        <span className="text-sm font-bold uppercase tracking-widest text-gray-500">New Expense</span>
        <button 
          onClick={handleSubmit} 
          disabled={!amount || !description || (splitType === 'CUSTOM' && !isCustomValid)}
          className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all ${
            amount && description && (splitType !== 'CUSTOM' || isCustomValid)
              ? 'bg-black text-white dark:bg-white dark:text-black hover:scale-105' 
              : 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600'
          }`}
        >
          SAVE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-10">
        {/* Amount Input */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="relative w-full text-center">
            <span className="absolute top-2 left-1/2 -translate-x-[60px] text-4xl font-light text-gray-300 dark:text-gray-700">$</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-center text-7xl font-bold outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800 bg-transparent text-black dark:text-white"
              autoFocus
            />
          </div>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note..."
            className="w-full text-center text-xl outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 bg-transparent text-gray-600 dark:text-gray-300 font-medium"
          />
        </div>

        {/* Payer Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid By</label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {currentGroup.members.map(member => (
              <button
                key={member.id}
                onClick={() => setPayerId(member.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                  payerId === member.id 
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                    : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                <img src={member.avatarUrl} alt={member.name} className="w-5 h-5 rounded-full grayscale" />
                <span className="text-xs font-bold">{member.id === currentUser.id ? 'You' : member.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Split Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Split Details</label>
             <div className="flex gap-4 text-xs font-bold">
               <button 
                 onClick={() => setSplitType('EQUAL')}
                 className={`transition-colors ${splitType === 'EQUAL' ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-0.5' : 'text-gray-300 dark:text-gray-700'}`}
               >
                 EQUAL
               </button>
               <button 
                 onClick={() => setSplitType('CUSTOM')}
                 className={`transition-colors ${splitType === 'CUSTOM' ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-0.5' : 'text-gray-300 dark:text-gray-700'}`}
               >
                 UNEVEN
               </button>
             </div>
          </div>

          <div className="space-y-4">
            {currentGroup.members.map(member => {
              const isSelected = selectedMemberIds.includes(member.id);
              const isEqualShare = splitType === 'EQUAL' && isSelected ? (numericAmount / selectedMemberIds.length).toFixed(2) : null;
              
              return (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     {/* Checkbox for Equal Split */}
                     {splitType === 'EQUAL' && (
                        <button 
                          onClick={() => toggleMember(member.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-black border-black dark:bg-white dark:border-white text-white dark:text-black' : 'border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={4} />}
                        </button>
                     )}
                     <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-80" />
                     <span className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</span>
                  </div>

                  {splitType === 'EQUAL' ? (
                     <div className={`text-sm font-bold ${isSelected ? 'text-black dark:text-white' : 'text-gray-200 dark:text-gray-800'}`}>
                       ${isSelected ? isEqualShare : '0.00'}
                     </div>
                  ) : (
                    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 pb-1 focus-within:border-black dark:focus-within:border-white transition-colors">
                      <span className="text-gray-300 dark:text-gray-700 text-sm font-light">$</span>
                      <input 
                        type="number"
                        placeholder="0"
                        value={manualAmounts[member.id] || ''}
                        onChange={(e) => handleManualChange(member.id, e.target.value)}
                        className="w-20 text-right text-sm font-bold outline-none bg-transparent text-black dark:text-white placeholder:text-gray-200"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Validation Message for Custom Split */}
          {splitType === 'CUSTOM' && (
             <div className={`text-center text-xs font-bold uppercase tracking-wide mt-4 py-3 rounded-xl border ${
               Math.abs(remaining) < 0.1 
                ? 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-500' 
                : 'bg-black text-white dark:bg-white dark:text-black border-black'
             }`}>
                {Math.abs(remaining) < 0.1 
                  ? "Amounts match total" 
                  : `${remaining > 0 ? '$' + remaining.toFixed(2) + ' LEFT TO SPLIT' : '$' + Math.abs(remaining).toFixed(2) + ' OVER LIMIT'}`
                }
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseForm;