"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, TrendingDown, Users, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types";
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

    useEffect(() => {
        const fetchGroups = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, "groups"),
                    where("members", "array-contains", user.id)
                );
                const snapshot = await getDocs(q);
                const groupsData: GroupWithBalance[] = [];

                for (const docSnap of snapshot.docs) {
                    const group = { id: docSnap.id, ...docSnap.data() } as Group;
                    const balance = 0;
                    groupsData.push({ ...group, balance });
                }

                setGroups(groupsData);

                let owed = 0;
                let owe = 0;
                groupsData.forEach((g) => {
                    if (g.balance > 0) owed += g.balance;
                    else if (g.balance < 0) owe += Math.abs(g.balance);
                });
                setTotalBalance({ owed, owe });
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchGroups();
    }, [user]);

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
                ) : groups.length === 0 ? (
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
                        {groups.map((group) => (
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
