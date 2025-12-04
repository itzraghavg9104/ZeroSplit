"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, TrendingDown, Users } from "lucide-react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";
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
                    // TODO: Calculate actual balance from expenses
                    const balance = 0;
                    groupsData.push({ ...group, balance });
                }

                setGroups(groupsData);

                // Calculate totals
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
            <Sidebar />

            <main className="p-4 md:p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Hello, {user.firstName || "User"}
                        </h1>
                        <p className="text-muted mt-1">Here&apos;s your balance summary</p>
                    </div>
                    <Link href="/profile">
                        <Avatar
                            src={user.profilePicture}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            size="md"
                        />
                    </Link>
                </div>

                {/* Balance Summary */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-success/10 rounded-2xl border border-success/20">
                        <div className="flex items-center gap-2 text-success mb-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm font-medium">You are owed</span>
                        </div>
                        <p className="text-2xl font-bold text-success">
                            {formatCurrency(totalBalance.owed, user.currency)}
                        </p>
                    </div>
                    <div className="p-4 bg-danger/10 rounded-2xl border border-danger/20">
                        <div className="flex items-center gap-2 text-danger mb-2">
                            <TrendingDown className="w-5 h-5" />
                            <span className="text-sm font-medium">You owe</span>
                        </div>
                        <p className="text-2xl font-bold text-danger">
                            {formatCurrency(totalBalance.owe, user.currency)}
                        </p>
                    </div>
                </div>

                {/* Groups Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Your Groups
                    </h2>
                    <Link href="/create-group">
                        <Button size="sm">
                            <Plus className="w-4 h-4" />
                            New Group
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-20 bg-card rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                        <Users className="w-12 h-12 text-muted mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No groups yet</h3>
                        <p className="text-muted text-sm mb-4">
                            Create a group to start splitting expenses
                        </p>
                        <Link href="/create-group">
                            <Button>Create Your First Group</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {groups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/group/${group.id}`}
                                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        {group.image ? (
                                            <img
                                                src={group.image}
                                                alt={group.name}
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <Users className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{group.name}</h3>
                                        <p className="text-sm text-muted">
                                            {group.members.length} members
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`text-right ${group.balance > 0
                                            ? "text-success"
                                            : group.balance < 0
                                                ? "text-danger"
                                                : "text-muted"
                                        }`}
                                >
                                    <p className="font-semibold">
                                        {group.balance === 0
                                            ? "Settled"
                                            : formatCurrency(Math.abs(group.balance), user.currency)}
                                    </p>
                                    {group.balance !== 0 && (
                                        <p className="text-xs">
                                            {group.balance > 0 ? "get back" : "owe"}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
