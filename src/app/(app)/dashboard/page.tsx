"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, TrendingDown, Users, ChevronRight, Mail, AlertTriangle } from "lucide-react";
import { collection, query, where, getDocs, onSnapshot, arrayUnion, deleteDoc, doc, updateDoc, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group, Invite, Expense } from "@/types";
import { calculateSettlements } from "@/utils/settlements";
import { logActivity } from "@/utils/activity";
import MobileNav from "@/components/layout/MobileNav";
import { formatCurrency } from "@/lib/utils";

interface GroupWithBalance extends Group {
    balance: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [groups, setGroups] = useState<GroupWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalBalance, setTotalBalance] = useState({ owed: 0, owe: 0 });

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const [invites, setInvites] = useState<Invite[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // 1. Listen to Groups
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "groups"),
            where("members", "array-contains", user.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const groupsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Group));
            // Initialize with 0 balance, will update when expenses load
            setGroups(groupsData.map(g => ({ ...g, balance: 0 })));
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching groups:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Listen to Expenses (for Balance Calculation)
    useEffect(() => {
        if (!user || groups.length === 0) return;

        // Firestore 'in' limit is 30. If > 30, we might need multiple queries or limit.
        // For now assuming < 30 groups.
        const groupIds = groups.map(g => g.id).slice(0, 30);

        if (groupIds.length === 0) return;

        const q = query(
            collection(db, "expenses"),
            where("groupId", "in", groupIds)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expensesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
            setExpenses(expensesData);
        }, (err) => {
            console.error("Error fetching expenses:", err);
        });

        return () => unsubscribe();
    }, [user, groups.length]); // Dependency on groups.length to re-subscribe if new group added

    // 3. Listen to Invites
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "invites"),
            where("toUserId", "==", user.id),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const invitesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invite));
            setInvites(invitesData);
        }, (err) => {
            console.error("Error fetching invites:", err);
        });

        return () => unsubscribe();
    }, [user]);

    // Calculate Balances when Groups or Expenses change
    useEffect(() => {
        if (!user || groups.length === 0) {
            setTotalBalance({ owed: 0, owe: 0 });
            return;
        }

        const newGroupsWithBalance = groups.map(group => {
            const groupExpenses = expenses.filter(e => e.groupId === group.id);
            // Calculate settlements for this group using utility
            // Settlement Logic:
            // Net balance for a user = (Amount user paid) - (Amount user share)
            // Or use calculateSettlements utility which gives "who owes who".
            // But here we just want "My Net Balance".

            let myBalance = 0;
            groupExpenses.forEach(expense => {
                if (expense.payerId === user.id) {
                    myBalance += expense.amount;
                }
                const mySplit = expense.splits.find(s => s.memberId === user.id);
                if (mySplit) {
                    myBalance -= mySplit.amount;
                }
            });
            return { ...group, balance: myBalance };
        });

        // Only update groups state if balances actually changed to avoid loop? 
        // But we are setting 'groups' state which triggers this effect...
        // Wait, 'groups' state currently holds Balance too.
        // Better to separate 'groups metadata' and 'calculated balances'.
        // But 'groups' dependency is necessary.
        // To avoid infinite loop (groups change -> calc -> setGroups -> groups change),
        // I should NOT setGroups here if I can avoid it.
        // OR: use a separate state `groupBalances: Record<string, number>`.
        // Let's refactor `groups` state: `groups` (from firestore) and `balances` (calculated).
        // BUT, `GroupWithBalance` is used in render.
        // I'll update `totalBalance` here and compute `GroupWithBalance` during render or in a memo.

        let totalOwed = 0;
        let totalOwe = 0;

        newGroupsWithBalance.forEach(g => {
            if (g.balance > 0) totalOwed += g.balance;
            if (g.balance < 0) totalOwe += Math.abs(g.balance);
        });
        setTotalBalance({ owed: totalOwed, owe: totalOwe });

        // Update groups state ONLY if it's different? 
        // Actually, Step 1 useEffect setsGroups. Step 2 loads expenses. Step 4 calcs balances.
        // If I setGroups here, it re-runs Step 4. Infinite loop likely if object reference changes.
        // I will use a separate state `groupBalances` or just derive in render?
        // Let's derive in render! simpler.

    }, [expenses, user, groups.length]); // logic moved to render

    const handleAcceptInvite = async (invite: Invite) => {
        if (!user) return;
        try {
            // Update Group Members
            await updateDoc(doc(db, "groups", invite.groupId), {
                members: arrayUnion(user.id),
                memberDetails: arrayUnion({
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    joinedAt: Timestamp.now(),
                }),
                updatedAt: Timestamp.now(),
            });

            // Update Invite Status (or delete)
            await deleteDoc(doc(db, "invites", invite.id));

            await logActivity(
                user.id,
                "joined_group",
                `joined the group via invite`,
                invite.groupId,
                invite.groupName
            );

            alert(`Joined ${invite.groupName} successfully!`);
        } catch (error) {
            console.error("Error accepting invite:", error);
            alert("Failed to accept invite");
        }
    };

    const handleDeclineInvite = async (inviteId: string) => {
        try {
            await deleteDoc(doc(db, "invites", inviteId));
        } catch (error) {
            console.error("Error declining invite:", error);
        }
    };

    // Derived Groups with Balance
    const displayedGroups = groups.map(g => {
        const groupExpenses = expenses.filter(e => e.groupId === g.id);
        let myBalance = 0;
        if (user) {
            groupExpenses.forEach(expense => {
                if (expense.payerId === user.id) {
                    myBalance += expense.amount;
                }
                const mySplit = expense.splits.find(s => s.memberId === user.id);
                if (mySplit) {
                    myBalance -= mySplit.amount;
                }
            });
        }
        return { ...g, balance: myBalance };
    });


    if (loading || !user) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--color-background)"
            }}>
                <div style={{
                    width: "32px",
                    height: "32px",
                    border: "3px solid var(--color-border)",
                    borderTopColor: "#0095F6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
            </div>
        );
    }

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "80px",
        },
        main: {
            padding: "16px",
            maxWidth: "600px",
            margin: "0 auto",
        },
        greeting: {
            marginBottom: "24px",
        },
        greetingTitle: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "4px",
        },
        greetingSubtitle: {
            color: "var(--color-muted)",
            fontSize: "14px",
        },
        balanceGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "24px",
        },
        balanceCard: {
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid",
        },
        balanceCardGreen: {
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderColor: "rgba(34, 197, 94, 0.2)",
        },
        balanceCardRed: {
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.2)",
        },
        balanceLabel: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            marginBottom: "8px",
        },
        balanceAmount: {
            fontSize: "22px",
            fontWeight: 700,
        },
        sectionHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
        },
        sectionTitle: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            fontWeight: 600,
        },
        newGroupBtn: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
        },
        emptyState: {
            textAlign: "center" as const,
            padding: "48px 24px",
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
        },
        emptyIcon: {
            width: "48px",
            height: "48px",
            margin: "0 auto 16px",
            color: "var(--color-muted)",
        },
        emptyTitle: {
            fontWeight: 600,
            marginBottom: "8px",
        },
        emptyText: {
            color: "var(--color-muted)",
            fontSize: "14px",
            marginBottom: "20px",
        },
        createBtn: {
            padding: "12px 24px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
        },
        groupList: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "12px",
        },
        groupCard: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            textDecoration: "none",
            color: "inherit",
        },
        groupInfo: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        groupIcon: {
            width: "48px",
            height: "48px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        },
        groupName: {
            fontWeight: 600,
            marginBottom: "2px",
        },
        groupMembers: {
            fontSize: "13px",
            color: "var(--color-muted)",
        },
        groupBalance: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        balanceText: {
            textAlign: "right" as const,
        },
        skeleton: {
            height: "80px",
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            animation: "pulse 2s ease-in-out infinite",
        },
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                {/* Greeting */}
                <div style={styles.greeting}>
                    <h1 style={styles.greetingTitle}>
                        Hello, {user.firstName || "there"} 👋
                    </h1>
                    <p style={styles.greetingSubtitle}>Here&apos;s your balance summary</p>
                </div>

                {/* Payment Reminder */}
                {(!user.paymentDetails?.upiId && !user.paymentDetails?.bankAccountNumber) && (
                    <div style={{
                        marginBottom: "24px",
                        padding: "16px",
                        backgroundColor: "rgba(234, 179, 8, 0.1)", // Yellow tint
                        border: "1px solid rgba(234, 179, 8, 0.2)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px"
                    }}>
                        <AlertTriangle size={20} color="#ca8a04" style={{ marginTop: "2px" }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, color: "#a16207", marginBottom: "4px" }}>
                                Payment details missing
                            </p>
                            <p style={{ fontSize: "13px", color: "#a16207", marginBottom: "8px" }}>
                                Your friends won&apos;t be able to settle up directly until you add your payment info.
                            </p>
                            <Link href="/onboarding">
                                <button style={{
                                    backgroundColor: "#ca8a04",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}>
                                    Add Details
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pending Invites */}
                {invites.length > 0 && (
                    <div style={{ marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Mail size={18} />
                            Pending Invites
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {invites.map(invite => (
                                <div key={invite.id} style={{
                                    padding: "16px",
                                    backgroundColor: "var(--color-card)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "16px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between"
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{invite.groupName}</p>
                                        <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>Invited by {invite.invitedByName}</p>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => handleAcceptInvite(invite)}
                                            style={{
                                                padding: "8px 16px", backgroundColor: "#22c55e", color: "white",
                                                border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px"
                                            }}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleDeclineInvite(invite.id)}
                                            style={{
                                                padding: "8px 16px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444",
                                                border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px"
                                            }}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Balance Summary */}
                <div style={styles.balanceGrid}>
                    <div style={{ ...styles.balanceCard, ...styles.balanceCardGreen }}>
                        <div style={{ ...styles.balanceLabel, color: "#22c55e" }}>
                            <TrendingUp size={18} />
                            <span>You are owed</span>
                        </div>
                        <p style={{ ...styles.balanceAmount, color: "#22c55e" }}>
                            {formatCurrency(totalBalance.owed, user.currency)}
                        </p>
                    </div>
                    <div style={{ ...styles.balanceCard, ...styles.balanceCardRed }}>
                        <div style={{ ...styles.balanceLabel, color: "#ef4444" }}>
                            <TrendingDown size={18} />
                            <span>You owe</span>
                        </div>
                        <p style={{ ...styles.balanceAmount, color: "#ef4444" }}>
                            {formatCurrency(totalBalance.owe, user.currency)}
                        </p>
                    </div>
                </div>

                {/* Groups Section */}
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        <Users size={20} />
                        Your Groups
                    </h2>
                    <Link href="/create-group">
                        <button style={styles.newGroupBtn}>
                            <Plus size={16} />
                            New
                        </button>
                    </Link>
                </div>

                {isLoading ? (
                    <div style={styles.groupList}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={styles.skeleton} />
                        ))}
                    </div>
                ) : displayedGroups.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Users style={styles.emptyIcon} />
                        <h3 style={styles.emptyTitle}>No groups yet</h3>
                        <p style={styles.emptyText}>
                            Create a group to start splitting expenses
                        </p>
                        <Link href="/create-group">
                            <button style={styles.createBtn}>Create Your First Group</button>
                        </Link>
                    </div>
                ) : (
                    <div style={styles.groupList}>
                        {displayedGroups.map((group) => (
                            <Link key={group.id} href={`/group/${group.id}`} style={styles.groupCard}>
                                <div style={styles.groupInfo}>
                                    <div style={styles.groupIcon}>
                                        {group.image ? (
                                            <img
                                                src={group.image}
                                                alt={group.name}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <Users size={24} color="#0095F6" />
                                        )}
                                    </div>
                                    <div>
                                        <p style={styles.groupName}>{group.name}</p>
                                        <p style={styles.groupMembers}>{group.members.length} members</p>
                                    </div>
                                </div>
                                <div style={styles.groupBalance}>
                                    <div style={styles.balanceText}>
                                        <p style={{
                                            fontWeight: 600,
                                            color: group.balance > 0 ? "#22c55e" : group.balance < 0 ? "#ef4444" : "var(--color-muted)"
                                        }}>
                                            {group.balance === 0 ? "Settled" : formatCurrency(Math.abs(group.balance), user.currency)}
                                        </p>
                                        {group.balance !== 0 && (
                                            <p style={{ fontSize: "12px", color: group.balance > 0 ? "#22c55e" : "#ef4444" }}>
                                                {group.balance > 0 ? "get back" : "owe"}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight size={20} color="var(--color-muted)" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
