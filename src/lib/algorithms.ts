/**
 * Min-Cash-Flow Algorithm to minimize the number of transactions
 * for settling debts within a group.
 */

export interface Transaction {
    from: string;
    to: string;
    amount: number;
}

export interface Balance {
    id: string;
    name: string;
    balance: number; // positive = owed, negative = owes
}

/**
 * Calculates net balances from expenses
 */
export function calculateBalances(
    expenses: {
        payerId: string;
        splits: { memberId: string; amount: number }[];
    }[]
): Map<string, number> {
    const balances = new Map<string, number>();

    for (const expense of expenses) {
        // Payer is owed money
        const totalPaid = expense.splits.reduce((sum, split) => sum + split.amount, 0);
        balances.set(expense.payerId, (balances.get(expense.payerId) || 0) + totalPaid);

        // Each member owes their share
        for (const split of expense.splits) {
            balances.set(split.memberId, (balances.get(split.memberId) || 0) - split.amount);
        }
    }

    return balances;
}

/**
 * Simplifies debts using the Min-Cash-Flow algorithm
 * This minimizes the number of transactions needed to settle all debts
 */
export function simplifyDebts(balances: Map<string, number>): Transaction[] {
    const transactions: Transaction[] = [];

    // Separate into creditors (positive balance) and debtors (negative balance)
    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];

    for (const [id, balance] of balances) {
        if (balance > 0.01) {
            creditors.push({ id, amount: balance });
        } else if (balance < -0.01) {
            debtors.push({ id, amount: Math.abs(balance) });
        }
    }

    // Sort by amount (descending) for optimization
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Greedy matching
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0.01) {
            transactions.push({
                from: debtor.id,
                to: creditor.id,
                amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return transactions;
}

/**
 * Split expense equally among selected members
 */
export function splitEqually(
    totalAmount: number,
    memberIds: string[]
): { memberId: string; amount: number }[] {
    const perPerson = Math.round((totalAmount / memberIds.length) * 100) / 100;
    const remainder = Math.round((totalAmount - perPerson * memberIds.length) * 100) / 100;

    return memberIds.map((memberId, index) => ({
        memberId,
        amount: index === 0 ? perPerson + remainder : perPerson,
    }));
}

/**
 * Validate custom split amounts
 */
export function validateCustomSplit(
    totalAmount: number,
    splits: { memberId: string; amount: number }[]
): { valid: boolean; message?: string } {
    const sum = splits.reduce((acc, split) => acc + split.amount, 0);
    const roundedSum = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(totalAmount * 100) / 100;

    if (Math.abs(roundedSum - roundedTotal) > 0.01) {
        return {
            valid: false,
            message: `Split amounts (${roundedSum}) must equal total (${roundedTotal})`,
        };
    }

    for (const split of splits) {
        if (split.amount < 0) {
            return {
                valid: false,
                message: "Split amounts cannot be negative",
            };
        }
    }

    return { valid: true };
}
