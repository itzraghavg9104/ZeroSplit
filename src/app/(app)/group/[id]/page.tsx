"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Share2,
    Settings,
    Users,
    Receipt,
    Calculator,
    Copy,
    Check,
} from "lucide-react";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group, Expense, User } from "@/types";
import { simplifyDebts, calculateBalances, Transaction } from "@/lib/algorithms";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

type TabType = "expenses" | "balances" | "settle";

export default function GroupDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;
    const { user } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("expenses");
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    useEffect(() => {
        const fetchGroupData = async () => {
            if (!user) return;

            try {
                // Fetch group
                const groupDoc = await getDoc(doc(db, "groups", groupId));
                if (!groupDoc.exists()) {
                    router.push("/dashboard");
                    return;
                }
                const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
                setGroup(groupData);

                // Fetch members
                const memberDocs = await Promise.all(
                    groupData.members.map((id) => getDoc(doc(db, "users", id)))
                );
                const membersData = memberDocs
                    .filter((d) => d.exists())
                    .map((d) => ({ id: d.id, ...d.data() } as User));
                setMembers(membersData);

                // Fetch expenses
                const expensesQuery = query(
                    collection(db, "expenses"),
                    where("groupId", "==", groupId),
                    orderBy("createdAt", "desc")
                );
                const expensesSnapshot = await getDocs(expensesQuery);
                const expensesData = expensesSnapshot.docs.map(
                    (d) => ({ id: d.id, ...d.data() } as Expense)
                );
                setExpenses(expensesData);

                // Calculate simplified debts
                const balances = calculateBalances(expensesData);
                const simplified = simplifyDebts(balances);
                setTransactions(simplified);
            } catch (error) {
                console.error("Error fetching group:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupData();
    }, [user, groupId, router]);

    const copyInviteLink = () => {
        if (!group) return;
        const link = `${window.location.origin}/join/${group.inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMemberName = (id: string) => {
        const member = members.find((m) => m.id === id);
        return member ? `${member.firstName} ${member.lastName}`.trim() : "Unknown";
    };

    if (isLoading || !group) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
            <Sidebar />

            <main className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-background border-b border-border">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="text-muted hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="font-semibold">{group.name}</h1>
                                <p className="text-xs text-muted">
                                    {members.length} members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={copyInviteLink}
                                className="p-2 text-muted hover:text-foreground transition-colors"
                                title="Share invite link"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-success" />
                                ) : (
                                    <Share2 className="w-5 h-5" />
                                )}
                            </button>
                            <Link
                                href={`/group/${groupId}/settings`}
                                className="p-2 text-muted hover:text-foreground transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        {[
                            { id: "expenses" as TabType, label: "Expenses", icon: Receipt },
                            { id: "balances" as TabType, label: "Balances", icon: Calculator },
                            { id: "settle" as TabType, label: "Settle", icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-muted hover:text-foreground"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {activeTab === "expenses" && (
                        <div className="space-y-3">
                            {expenses.length === 0 ? (
                                <div className="text-center py-12">
                                    <Receipt className="w-12 h-12 text-muted mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">No expenses yet</h3>
                                    <p className="text-muted text-sm mb-4">
                                        Add your first expense to start tracking
                                    </p>
                                </div>
                            ) : (
                                expenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="p-4 bg-card rounded-xl border border-border"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium">{expense.description}</h3>
                                                <p className="text-sm text-muted mt-0.5">
                                                    {getMemberName(expense.payerId)} paid
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatCurrency(expense.amount, user?.currency)}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {formatRelativeTime(expense.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "balances" && (
                        <div className="space-y-3">
                            {members.map((member) => {
                                const balances = calculateBalances(expenses);
                                const balance = balances.get(member.id) || 0;
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={member.profilePicture}
                                                firstName={member.firstName}
                                                lastName={member.lastName}
                                                size="sm"
                                            />
                                            <div>
                                                <p className="font-medium">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                                {member.id === user?.id && (
                                                    <p className="text-xs text-muted">You</p>
                                                )}
                                            </div>
                                        </div>
                                        <p
                                            className={`font-semibold ${balance > 0
                                                    ? "text-success"
                                                    : balance < 0
                                                        ? "text-danger"
                                                        : "text-muted"
                                                }`}
                                        >
                                            {balance === 0
                                                ? "Settled"
                                                : `${balance > 0 ? "+" : ""}${formatCurrency(balance, user?.currency)}`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === "settle" && (
                        <div className="space-y-3">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Check className="w-12 h-12 text-success mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">All settled up!</h3>
                                    <p className="text-muted text-sm">
                                        No pending transactions in this group
                                    </p>
                                </div>
                            ) : (
                                transactions.map((t, i) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-card rounded-xl border border-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                firstName={getMemberName(t.from)}
                                                size="sm"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {getMemberName(t.from)}{" "}
                                                    <span className="text-muted">pays</span>{" "}
                                                    {getMemberName(t.to)}
                                                </p>
                                                <p className="text-lg font-bold text-primary">
                                                    {formatCurrency(t.amount, user?.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* FAB */}
                <button
                    onClick={() => setShowExpenseModal(true)}
                    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all flex items-center justify-center"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </main>

            <BottomNav />
        </div>
    );
}
