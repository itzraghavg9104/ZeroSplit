"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    LogOut,
    Pencil,
    Plus,
    Settings,
    Trash2,
    UserPlus,
} from "lucide-react";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    updateDoc,
    onSnapshot,
    Timestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Group, Expense, User } from "@/types";
import MobileNav from "@/components/layout/MobileNav";
import { calculateSettlements, Settlement } from "@/utils/settlements";

import InviteModal from "./components/InviteModal";
import SettleModal from "./components/SettleModal";
import GroupSettingsModal from "@/components/ui/GroupSettingsModal";

type TabType = "expenses" | "balances" | "settle" | "members";
type DateValue = Date | { toDate: () => Date } | undefined;

const getTimeValue = (value: DateValue) => {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    return value.toDate().getTime();
};

const formatNameList = (names: string[]) => {
    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]}`;
    return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
};

export default function GroupDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;
    const { user } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("expenses");
    const [expandedExpenses, setExpandedExpenses] = useState<Record<string, boolean>>({});
    const [busyExpenseId, setBusyExpenseId] = useState<string | null>(null);

    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [activeSettlement, setActiveSettlement] = useState<Settlement | null>(null);
    const [payeeDetails, setPayeeDetails] = useState<User | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribeGroup = onSnapshot(doc(db, "groups", groupId), async (groupDoc) => {
            if (!groupDoc.exists()) {
                router.push("/groups");
                return;
            }

            const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;

            if (!groupData.members.includes(user.id)) {
                router.push("/groups");
                return;
            }

            setGroup(groupData);

            const memberDocs = await Promise.all(
                groupData.members.map((id) => getDoc(doc(db, "users", id)))
            );
            const membersData = memberDocs
                .filter((memberDoc) => memberDoc.exists())
                .map((memberDoc) => ({ id: memberDoc.id, ...memberDoc.data() } as User));

            setMembers(membersData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching group:", error);
            setIsLoading(false);
        });

        const expensesQuery = query(
            collection(db, "expenses"),
            where("groupId", "==", groupId)
        );

        const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
            const expensesData = snapshot.docs
                .map((expenseDoc) => ({ id: expenseDoc.id, ...expenseDoc.data() } as Expense))
                .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt));

            setExpenses(expensesData);
        }, (error) => {
            console.error("Error fetching expenses:", error);
        });

        return () => {
            unsubscribeGroup();
            unsubscribeExpenses();
        };
    }, [user, groupId, router]);

    useEffect(() => {
        if (expenses.length > 0 && members.length > 0) {
            setSettlements(calculateSettlements(expenses, members));
        } else {
            setSettlements([]);
        }
    }, [expenses, members]);

    const isSettlementExpense = (expense: Expense) =>
        expense.type === "settlement" || expense.isSettlement;

    const getMemberName = (id: string) => {
        const member = members.find((groupMember) => groupMember.id === id);
        return member ? `${member.firstName} ${member.lastName}`.trim() : "Unknown";
    };

    const getSplitSummary = (expense: Expense) => {
        const names = expense.splits.map((split) => getMemberName(split.memberId));
        if (names.length === 0) return "Split details unavailable";

        if (isSettlementExpense(expense)) {
            return `Recorded with ${formatNameList(names)}`;
        }

        return expense.splitType === "custom"
            ? `Split unequally between ${formatNameList(names)}`
            : `Split equally between ${formatNameList(names)}`;
    };

    const handleSettleClick = (settlement: Settlement) => {
        setActiveSettlement(settlement);

        const payee = members.find((member) => member.id === settlement.to);
        setPayeeDetails(payee || null);

        setSettleModalOpen(true);
    };

    const toggleExpenseDetails = (expenseId: string) => {
        setExpandedExpenses((prev) => ({
            ...prev,
            [expenseId]: !prev[expenseId],
        }));
    };

    const handleEditExpense = (expenseId: string) => {
        router.push(`/group/${groupId}/add-expense?expenseId=${expenseId}`);
    };

    const handleDeleteExpense = async (expense: Expense) => {
        if (!user) return;
        if (expense.createdBy !== user.id || isSettlementExpense(expense)) return;

        if (!confirm(`Delete "${expense.description}"? This cannot be undone.`)) {
            return;
        }

        setBusyExpenseId(expense.id);

        try {
            await deleteDoc(doc(db, "expenses", expense.id));

            setExpandedExpenses((prev) => {
                const next = { ...prev };
                delete next[expense.id];
                return next;
            });
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense.");
        } finally {
            setBusyExpenseId(null);
        }
    };

    const handleLeaveGroup = async () => {
        if (!group || !user) return;
        if (!confirm("Are you sure you want to leave this group?")) return;

        try {
            const newMembers = group.members.filter((id) => id !== user.id);
            let newOwner = group.createdBy;

            if (group.createdBy === user.id && newMembers.length > 0) {
                newOwner = newMembers[0];
            }

            if (newMembers.length === 0) {
                const batch = writeBatch(db);

                const expensesQuery = query(collection(db, "expenses"), where("groupId", "==", groupId));
                const expensesSnapshot = await getDocs(expensesQuery);
                expensesSnapshot.docs.forEach((expenseDoc) => {
                    batch.delete(expenseDoc.ref);
                });

                const invitesQuery = query(collection(db, "invites"), where("groupId", "==", groupId));
                const invitesSnapshot = await getDocs(invitesQuery);
                invitesSnapshot.docs.forEach((inviteDoc) => {
                    batch.delete(inviteDoc.ref);
                });

                const activitiesQuery = query(collection(db, "activities"), where("groupId", "==", groupId));
                const activitiesSnapshot = await getDocs(activitiesQuery);
                activitiesSnapshot.docs.forEach((activityDoc) => {
                    batch.delete(activityDoc.ref);
                });

                const settlementsQuery = query(collection(db, "settlements"), where("groupId", "==", groupId));
                const settlementsSnapshot = await getDocs(settlementsQuery);
                settlementsSnapshot.docs.forEach((settlementDoc) => {
                    batch.delete(settlementDoc.ref);
                });

                await batch.commit();
                await deleteDoc(doc(db, "groups", groupId));

                router.push("/groups");
                return;
            }

            const updatedGroupData: {
                members: string[];
                createdBy: string;
                updatedAt: Timestamp;
                memberDetails?: Group["memberDetails"];
            } = {
                members: newMembers,
                createdBy: newOwner,
                updatedAt: Timestamp.now(),
            };

            if (group.memberDetails) {
                updatedGroupData.memberDetails = group.memberDetails.filter(
                    (memberDetail) => memberDetail.id !== user.id
                );
            }

            await updateDoc(doc(db, "groups", groupId), updatedGroupData);

            router.push("/groups");
        } catch (error) {
            console.error("Error leaving group:", error);
            alert("Failed to leave group.");
        }
    };

    const calculateBalance = (memberId: string): number => {
        let balance = 0;

        expenses.forEach((expense) => {
            if (expense.payerId === memberId) {
                balance += expense.amount;
            }

            const split = expense.splits?.find((entry) => entry.memberId === memberId);
            if (split) {
                balance -= split.amount;
            }
        });

        return balance;
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "100px",
        },
        main: {
            maxWidth: "600px",
            margin: "0 auto",
        },
        header: {
            position: "sticky" as const,
            top: "56px",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)",
            zIndex: 40,
        },
        headerTop: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
        },
        headerLeft: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        backBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            background: "none",
            border: "none",
            color: "var(--color-foreground)",
            cursor: "pointer",
        },
        groupTitle: {
            fontSize: "18px",
            fontWeight: 600,
        },
        groupSubtitle: {
            fontSize: "12px",
            color: "var(--color-muted)",
        },
        headerActions: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        iconBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
        },
        tabs: {
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
        },
        tab: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px",
            background: "none",
            border: "none",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-muted)",
            cursor: "pointer",
        },
        tabActive: {
            color: "#0095F6",
            borderBottom: "2px solid #0095F6",
        },
        content: {
            padding: "16px",
        },
        emptyState: {
            textAlign: "center" as const,
            padding: "48px 24px",
        },
        emptyTitle: {
            fontWeight: 600,
            marginBottom: "8px",
        },
        emptyText: {
            fontSize: "14px",
            color: "var(--color-muted)",
        },
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            padding: "16px",
            marginBottom: "12px",
        },
        expenseTopRow: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
        },
        expenseText: {
            flex: 1,
            minWidth: 0,
        },
        expenseHeadingRow: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap" as const,
            marginBottom: "4px",
        },
        expenseTitle: {
            fontWeight: 500,
        },
        expenseSubtitle: {
            fontSize: "13px",
            color: "var(--color-muted)",
        },
        expenseAmount: {
            fontWeight: 600,
            textAlign: "right" as const,
            whiteSpace: "nowrap" as const,
        },
        splitSummary: {
            marginTop: "12px",
            fontSize: "14px",
            color: "var(--color-foreground)",
        },
        expenseMetaRow: {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "8px",
            marginTop: "12px",
        },
        metaPill: {
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 10px",
            borderRadius: "999px",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            fontSize: "12px",
            color: "var(--color-muted)",
        },
        typeBadge: {
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: "999px",
            backgroundColor: "rgba(0, 149, 246, 0.12)",
            color: "#0095F6",
            fontSize: "11px",
            fontWeight: 600,
        },
        typeBadgeSettlement: {
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            color: "#22c55e",
        },
        expenseActionsRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginTop: "14px",
            flexWrap: "wrap" as const,
        },
        detailBtn: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0",
            border: "none",
            background: "none",
            color: "#0095F6",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
        },
        actionGroup: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
        },
        actionBtn: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0",
            border: "none",
            background: "none",
            color: "var(--color-muted)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
        },
        dangerBtn: {
            color: "#ef4444",
        },
        splitDetails: {
            marginTop: "14px",
            paddingTop: "14px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column" as const,
            gap: "10px",
        },
        splitRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 0",
        },
        splitMemberName: {
            fontWeight: 500,
            fontSize: "14px",
        },
        splitMemberMeta: {
            fontSize: "12px",
            color: "var(--color-muted)",
            marginTop: "2px",
        },
        splitAmount: {
            fontWeight: 600,
            textAlign: "right" as const,
            whiteSpace: "nowrap" as const,
        },
        memberRow: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 0",
            borderBottom: "1px solid var(--color-border)",
        },
        memberAvatar: {
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0095F6, #00D4AA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: "16px",
        },
        balance: {
            fontWeight: 600,
        },
        balancePositive: { color: "#22c55e" },
        balanceNegative: { color: "#ef4444" },
        balanceZero: { color: "var(--color-muted)" },
        fab: {
            position: "fixed" as const,
            bottom: "90px",
            right: "20px",
            width: "56px",
            height: "56px",
            backgroundColor: "#0095F6",
            borderRadius: "16px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 149, 246, 0.4)",
        },
        addBtn: {
            marginTop: "12px",
            width: "100%",
            padding: "12px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
        },
        leaveBtn: {
            marginTop: "12px",
            width: "100%",
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
        },
    };

    if (isLoading) {
        return (
            <div style={styles.page}>
                <MobileNav />
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "50vh",
                }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        border: "3px solid var(--color-border)",
                        borderTopColor: "#0095F6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }} />
                </div>
            </div>
        );
    }

    if (!group) return null;

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <header style={styles.header}>
                    <div style={styles.headerTop}>
                        <div style={styles.headerLeft}>
                            <button onClick={() => router.push("/dashboard")} style={styles.backBtn}>
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 style={styles.groupTitle}>{group.name}</h1>
                                <p style={styles.groupSubtitle}>{members.length} members</p>
                            </div>
                        </div>
                        <div style={styles.headerActions}>
                            <button onClick={() => setShowInviteModal(true)} style={styles.iconBtn}>
                                <UserPlus size={24} />
                            </button>
                            {user && group && user.id === group.createdBy && (
                                <button onClick={() => setShowSettingsModal(true)} style={styles.iconBtn}>
                                    <Settings size={24} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        <button
                            style={{ ...styles.tab, ...(activeTab === "expenses" ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab("expenses")}
                        >
                            Expenses
                        </button>
                        <button
                            style={{ ...styles.tab, ...(activeTab === "balances" ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab("balances")}
                        >
                            Balances
                        </button>
                        <button
                            style={{ ...styles.tab, ...(activeTab === "members" ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab("members")}
                        >
                            Members
                        </button>
                    </div>
                </header>

                <div style={styles.content}>
                    {activeTab === "expenses" && (
                        <div>
                            {expenses.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <h3 style={styles.emptyTitle}>No expenses yet</h3>
                                    <p style={styles.emptyText}>Add an expense to start splitting</p>
                                </div>
                            ) : (
                                expenses.map((expense) => {
                                    const canManageExpense = user?.id === expense.createdBy && !isSettlementExpense(expense);
                                    const isExpanded = expandedExpenses[expense.id];
                                    const wasEdited = getTimeValue(expense.updatedAt) - getTimeValue(expense.createdAt) > 1000;
                                    const splitTypeLabel = isSettlementExpense(expense)
                                        ? "Settlement"
                                        : expense.splitType === "custom"
                                            ? "Unequal split"
                                            : "Equal split";
                                    const splitMeta = isSettlementExpense(expense)
                                        ? "Recorded payment"
                                        : expense.splitType === "custom"
                                            ? "Custom amounts"
                                            : "Even amounts";

                                    return (
                                        <div key={expense.id} style={styles.card}>
                                            <div style={styles.expenseTopRow}>
                                                <div style={styles.expenseText}>
                                                    <div style={styles.expenseHeadingRow}>
                                                        <p style={styles.expenseTitle}>{expense.description}</p>
                                                        <span
                                                            style={{
                                                                ...styles.typeBadge,
                                                                ...(isSettlementExpense(expense) ? styles.typeBadgeSettlement : {}),
                                                            }}
                                                        >
                                                            {splitTypeLabel}
                                                        </span>
                                                    </div>
                                                    <p style={styles.expenseSubtitle}>
                                                        Paid by {getMemberName(expense.payerId)} • {formatRelativeTime(expense.createdAt)}
                                                        {wasEdited && " • Edited"}
                                                    </p>
                                                </div>
                                                <p style={styles.expenseAmount}>
                                                    {formatCurrency(expense.amount, user?.currency)}
                                                </p>
                                            </div>

                                            <p style={styles.splitSummary}>{getSplitSummary(expense)}</p>

                                            <div style={styles.expenseMetaRow}>
                                                <span style={styles.metaPill}>
                                                    {expense.splits.length} {expense.splits.length === 1 ? "person" : "people"}
                                                </span>
                                                <span style={styles.metaPill}>{splitMeta}</span>
                                            </div>

                                            <div style={styles.expenseActionsRow}>
                                                <button
                                                    onClick={() => toggleExpenseDetails(expense.id)}
                                                    style={styles.detailBtn}
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    {isExpanded ? "Hide split details" : "Show split details"}
                                                </button>

                                                {canManageExpense && (
                                                    <div style={styles.actionGroup}>
                                                        <button
                                                            onClick={() => handleEditExpense(expense.id)}
                                                            style={styles.actionBtn}
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExpense(expense)}
                                                            disabled={busyExpenseId === expense.id}
                                                            style={{
                                                                ...styles.actionBtn,
                                                                ...styles.dangerBtn,
                                                                opacity: busyExpenseId === expense.id ? 0.6 : 1,
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                            {busyExpenseId === expense.id ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isExpanded && (
                                                <div style={styles.splitDetails}>
                                                    {expense.splits.map((split) => (
                                                        <div key={`${expense.id}-${split.memberId}`} style={styles.splitRow}>
                                                            <div>
                                                                <p style={styles.splitMemberName}>
                                                                    {getMemberName(split.memberId)}
                                                                    {split.memberId === user?.id && " (You)"}
                                                                </p>
                                                                <p style={styles.splitMemberMeta}>
                                                                    {split.memberId === expense.payerId
                                                                        ? "Included in split and paid"
                                                                        : "Included in this split"}
                                                                </p>
                                                            </div>
                                                            <p style={styles.splitAmount}>
                                                                {formatCurrency(split.amount, user?.currency)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === "balances" && (
                        <div>
                            {settlements.length === 0 && (
                                <div style={{
                                    textAlign: "center",
                                    padding: "24px",
                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                    borderRadius: "12px",
                                    marginBottom: "24px",
                                }}>
                                    <p style={{ fontWeight: 600, color: "#22c55e" }}>All settled up!</p>
                                </div>
                            )}

                            {settlements.map((settlement, idx) => {
                                const isMePayer = settlement.from === user?.id;

                                return (
                                    <div key={idx} style={styles.card}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={styles.memberAvatar}>
                                                    {getInitials(getMemberName(settlement.from))}
                                                </div>
                                                <div>
                                                    <p>
                                                        <strong>{getMemberName(settlement.from)}</strong> owes{" "}
                                                        <strong>{getMemberName(settlement.to)}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ ...styles.balance, color: "#ef4444" }}>
                                                    {formatCurrency(settlement.amount, user?.currency)}
                                                </p>
                                                {isMePayer && (
                                                    <button
                                                        onClick={() => handleSettleClick(settlement)}
                                                        style={{
                                                            marginTop: "8px",
                                                            fontSize: "12px",
                                                            padding: "6px 12px",
                                                            backgroundColor: "#22c55e",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Settle
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "24px 0 12px" }}>Net Balances</h3>
                            {members.map((member) => {
                                const balance = calculateBalance(member.id);

                                return (
                                    <div key={member.id} style={styles.memberRow}>
                                        <div style={styles.memberAvatar}>
                                            {getInitials(member.firstName, member.lastName)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 500 }}>{member.firstName} {member.lastName}</p>
                                        </div>
                                        <p style={{
                                            ...styles.balance,
                                            ...(balance > 0 ? styles.balancePositive : balance < 0 ? styles.balanceNegative : styles.balanceZero),
                                        }}>
                                            {balance === 0 ? "Settled" : formatCurrency(Math.abs(balance), user?.currency)}
                                            <span style={{ fontSize: "12px", color: "var(--color-muted)", fontWeight: 400, marginLeft: "4px" }}>
                                                {balance > 0 ? "gets back" : balance < 0 ? "owes" : ""}
                                            </span>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div>
                            {members.map((member) => (
                                <div key={member.id} style={styles.memberRow}>
                                    <div style={styles.memberAvatar}>
                                        {getInitials(member.firstName, member.lastName)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 500 }}>
                                            {member.firstName} {member.lastName}
                                            {member.id === user?.id && " (You)"}
                                            {member.id === group.createdBy && " 👑"}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>@{member.username}</p>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setShowInviteModal(true)}
                                style={{
                                    ...styles.addBtn,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Plus size={18} style={{ marginRight: "6px" }} /> Add Member
                            </button>

                            <button
                                onClick={handleLeaveGroup}
                                style={{
                                    ...styles.leaveBtn,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <LogOut size={18} style={{ marginRight: "6px" }} /> Leave Group
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <button
                onClick={() => router.push(`/group/${groupId}/add-expense`)}
                style={styles.fab}
            >
                <Plus size={24} />
            </button>

            {user && group && (
                <>
                    <InviteModal
                        isOpen={showInviteModal}
                        onClose={() => setShowInviteModal(false)}
                        group={group}
                        user={user}
                        groupId={groupId}
                    />

                    <SettleModal
                        isOpen={settleModalOpen}
                        onClose={() => setSettleModalOpen(false)}
                        settlement={activeSettlement}
                        payee={payeeDetails}
                        user={user}
                        groupId={groupId}
                        groupName={group.name}
                    />

                    <GroupSettingsModal
                        isOpen={showSettingsModal}
                        onClose={() => setShowSettingsModal(false)}
                        group={group}
                    />
                </>
            )}
        </div>
    );
}
