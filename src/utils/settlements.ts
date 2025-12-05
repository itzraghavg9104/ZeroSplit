import { Expense, User } from "@/types";

export interface Settlement {
    from: string;
    to: string;
    amount: number;
}

export const calculateSettlements = (expenses: Expense[], members: User[]): Settlement[] => {
    // 1. Calculate net balances
    const balances: Record<string, number> = {};

    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(expense => {
        const paidBy = expense.payerId;
        const amount = expense.amount;

        // Payer gets positive balance (owed money)
        balances[paidBy] = (balances[paidBy] || 0) + amount;

        // Splitters get negative balance (owe money)
        expense.splits.forEach(split => {
            balances[split.memberId] = (balances[split.memberId] || 0) - split.amount;
        });
    });

    // 2. Separate into debtors and creditors
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        // Round to 2 decimal places to avoid floating point errors
        const roundedAmount = Math.round(amount * 100) / 100;

        if (roundedAmount < -0.01) {
            debtors.push({ id, amount: roundedAmount });
        } else if (roundedAmount > 0.01) {
            creditors.push({ id, amount: roundedAmount });
        }
    });

    // Sort by magnitude (descending) to optimize graph
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    // 3. Match them up (Minimize transactions approach)
    const settlements: Settlement[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what debtor owes and creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Record settlement
        settlements.push({
            from: debtor.id,
            to: creditor.id,
            amount: Math.round(amount * 100) / 100
        });

        // Update remaining amounts
        debtor.amount += amount;
        creditor.amount -= amount;

        // Move to next provided they are settled (close to 0)
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return settlements;
};
