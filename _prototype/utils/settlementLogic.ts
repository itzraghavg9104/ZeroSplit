import { Expense, User, Settlement } from '../types';

/**
 * Calculates the minimum number of transactions required to settle debts.
 */
export const calculateSettlements = (expenses: Expense[], groupMembers: User[]): Settlement[] => {
  const balances: { [userId: string]: number } = {};

  // Initialize balances for all members
  groupMembers.forEach(member => {
    balances[member.id] = 0;
  });

  // Calculate net balance for each user
  expenses.forEach(expense => {
    // Payer gets positive balance (money owed TO them)
    // We assume the payer paid the FULL amount initially
    if (balances[expense.payerId] === undefined) balances[expense.payerId] = 0;
    balances[expense.payerId] += expense.amount;

    // Debtors get negative balance (money they OWE)
    Object.entries(expense.splitDetails).forEach(([userId, amountOwed]) => {
      if (balances[userId] === undefined) balances[userId] = 0;
      balances[userId] -= amountOwed;
    });
  });

  // Separate into debtors (owe money) and creditors (owed money)
  // Use simple objects to track ID and Amount
  let debtors: { id: string; amount: number }[] = [];
  let creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    // rounding to 2 decimal places to avoid floating point errors
    const roundedBalance = Math.round(balance * 100) / 100;
    
    if (roundedBalance < -0.01) {
      debtors.push({ id: userId, amount: roundedBalance });
    } else if (roundedBalance > 0.01) {
      creditors.push({ id: userId, amount: roundedBalance });
    }
  });

  const settlements: Settlement[] = [];

  // Greedy algorithm to minimize transactions
  // 1. Sort both lists by magnitude (optional, but helps match big debts to big credits)
  // For standard "minimize cash flow", sorting helps, but precise optimality is NP-hard. 
  // However, the greedy approach works perfectly for simple tripartite graphs often found in bill splitting.
  
  // Sort by absolute value descending
  debtors.sort((a, b) => a.amount - b.amount); // Most negative first
  creditors.sort((a, b) => b.amount - a.amount); // Most positive first

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The amount to settle is the minimum of what the debtor owes and what the creditor is owed
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    
    // Round to 2 decimals
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: roundedAmount,
      });
    }

    // Adjust balances
    debtor.amount += amount;
    creditor.amount -= amount;

    // Check if settled (allow tiny floating point margin)
    if (Math.abs(debtor.amount) < 0.01) {
      i++;
    }
    if (Math.abs(creditor.amount) < 0.01) {
      j++;
    }
  }

  return settlements;
};

/**
 * Helper to calculate current user's net balance for display
 */
export const calculateUserNetBalance = (userId: string, expenses: Expense[]): number => {
  let balance = 0;
  
  expenses.forEach(expense => {
    if (expense.payerId === userId) {
      balance += expense.amount;
    }
    const owed = expense.splitDetails[userId] || 0;
    balance -= owed;
  });

  return Math.round(balance * 100) / 100;
};