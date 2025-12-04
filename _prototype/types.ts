export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  upiId?: string; // Optional for payment integration
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  coverImage?: string;
}

export type SplitType = 'EQUAL' | 'CUSTOM';

export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number;
  description: string;
  date: string;
  splitType: SplitType;
  // Map of userId -> amount owed by that user
  splitDetails: { [userId: string]: number };
}

export interface Settlement {
  from: string; // User ID who pays
  to: string;   // User ID who receives
  amount: number;
}