import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Group, Expense } from '../types';

// Mock Data
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'You', avatarUrl: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: 'Alice', avatarUrl: 'https://picsum.photos/100/100?random=2' },
  { id: 'u3', name: 'Bob', avatarUrl: 'https://picsum.photos/100/100?random=3' },
  { id: 'u4', name: 'Charlie', avatarUrl: 'https://picsum.photos/100/100?random=4' },
];

const MOCK_GROUP: Group = {
  id: 'g1',
  name: 'Bali Trip 🌴',
  members: MOCK_USERS,
  coverImage: 'https://picsum.photos/800/400?random=5'
};

const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    groupId: 'g1',
    payerId: 'u1',
    amount: 120,
    description: 'Dinner at Beach Club',
    date: new Date(Date.now() - 86400000).toISOString(),
    splitType: 'EQUAL',
    splitDetails: { 'u1': 30, 'u2': 30, 'u3': 30, 'u4': 30 }
  },
  {
    id: 'e2',
    groupId: 'g1',
    payerId: 'u2',
    amount: 50,
    description: 'Taxi to Airport',
    date: new Date(Date.now() - 172800000).toISOString(),
    splitType: 'CUSTOM',
    splitDetails: { 'u1': 25, 'u2': 0, 'u3': 25, 'u4': 0 } // Alice treated herself and Bob paid nothing? Logic check: Alice paid 50. u1 owes 25, u3 owes 25. Alice owes 0. 
  }
];

interface AppContextType {
  currentUser: User;
  users: User[];
  groups: Group[];
  currentGroup: Group;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  getUser: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>(MOCK_USERS[0]);
  const [users] = useState<User[]>(MOCK_USERS);
  const [groups] = useState<Group[]>([MOCK_GROUP]);
  const [currentGroup] = useState<Group>(MOCK_GROUP);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const getUser = (id: string) => users.find(u => u.id === id);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      groups,
      currentGroup,
      expenses,
      addExpense,
      getUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};