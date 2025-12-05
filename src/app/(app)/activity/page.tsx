"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Users, DollarSign, UserPlus, Check, Clock } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import MobileNav from "@/components/layout/MobileNav";

interface Activity {
    id: string;
    type: "expense_added" | "expense_updated" | "member_joined" | "settlement" | "group_created";
    message: string;
    groupId?: string;
    groupName?: string;
    createdAt: Date | Timestamp;
    userId: string;
}

export default function ActivityPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!user) return;

            try {
                // 1. Get user's groups
                const groupsQuery = query(collection(db, "groups"), where("members", "array-contains", user.id));
                const groupsSnapshot = await getDocs(groupsQuery);
                const groupIds = groupsSnapshot.docs.map(d => d.id);

                if (groupIds.length === 0) {
                    setActivities([]);
                    return;
                }

                // 2. Fetch activities
                // Note: If index is missing, this might fail. Ensure composite index (groupId ASC, createdAt DESC).
                // Querying logic:
                let q;
                if (groupIds.length <= 10) {
                    q = query(
                        collection(db, "activities"),
                        where("groupId", "in", groupIds),
                        orderBy("createdAt", "desc"),
                        limit(50)
                    );
                } else {
                    q = query(
                        collection(db, "activities"),
                        where("groupId", "in", groupIds.slice(0, 10)),
                        orderBy("createdAt", "desc"),
                        limit(50)
                    );
                }

                const snapshot = await getDocs(q);
                let fetchedActivities = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Activity[];

                // Filter out cleared activities
                if (user.activityClearedAt) {
                    const clearedTime = user.activityClearedAt instanceof Timestamp ? user.activityClearedAt.toMillis() : 0;
                    fetchedActivities = fetchedActivities.filter(a => {
                        const t = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
                        return t > clearedTime;
                    });
                }

                setActivities(fetchedActivities);
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchActivities();

        // Mark as read on unmount
        return () => {
            if (user) {
                updateDoc(doc(db, "users", user.id), {
                    lastReadActivityTime: Timestamp.now()
                }).catch(err => console.error("Error updating read time:", err));
            }
        };
    }, [user]);

    const handleClearActivity = async () => {
        if (!user) return;
        if (!confirm("Clear all activities?")) return;

        setClearing(true);
        try {
            await updateDoc(doc(db, "users", user.id), {
                activityClearedAt: Timestamp.now()
            });
            setActivities([]); // clear locally
        } catch (error) {
            console.error("Error clearing activity:", error);
        } finally {
            setClearing(false);
        }
    };

    const formatTime = (timestamp: Date | Timestamp) => {
        if (!timestamp) return "";
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000; // seconds

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

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

    const getActivityIcon = (type: Activity["type"]) => {
        switch (type) {
            case "expense_added":
            case "expense_updated":
                return DollarSign;
            case "member_joined":
                return UserPlus;
            case "settlement":
                return Check;
            case "group_created":
                return Users;
            default:
                return Bell;
        }
    };

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
        header: {
            marginBottom: "24px",
        },
        title: {
            fontSize: "24px",
            fontWeight: 700,
        },
        emptyState: {
            textAlign: "center" as const,
            padding: "60px 24px",
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
        },
        emptyIcon: {
            width: "64px",
            height: "64px",
            margin: "0 auto 20px",
            color: "var(--color-muted)",
        },
        emptyTitle: {
            fontWeight: 600,
            fontSize: "18px",
            marginBottom: "8px",
        },
        emptyText: {
            color: "var(--color-muted)",
            fontSize: "14px",
        },
        activityList: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "12px",
        },
        activityCard: {
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "16px",
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
        },
        activityIcon: {
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        activityContent: {
            flex: 1,
        },
        activityMessage: {
            fontSize: "14px",
            lineHeight: 1.5,
            marginBottom: "4px",
        },
        activityTime: {
            fontSize: "12px",
            color: "var(--color-muted)",
        },
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h1 style={styles.title}>Activity</h1>
                        {activities.length > 0 && (
                            <button onClick={handleClearActivity} style={{ color: "var(--color-muted)", background: "none", border: "none", fontSize: "14px", cursor: "pointer" }}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div style={styles.activityList}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                height: "72px",
                                backgroundColor: "var(--color-card)",
                                borderRadius: "12px",
                            }} />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Bell style={styles.emptyIcon} strokeWidth={1} />
                        <h3 style={styles.emptyTitle}>No activity yet</h3>
                        <p style={styles.emptyText}>
                            When you add expenses or join groups,<br />your activity will show up here.
                        </p>
                    </div>
                ) : (
                    <div style={styles.activityList}>
                        {activities.map((activity) => {
                            const Icon = getActivityIcon(activity.type);
                            const lastRead = user?.lastReadActivityTime instanceof Timestamp ? user.lastReadActivityTime.toMillis() : 0;
                            const activityTime = activity.createdAt instanceof Timestamp ? activity.createdAt.toMillis() : 0;
                            const isUnread = activityTime > lastRead;

                            return (
                                <div key={activity.id} style={{
                                    ...styles.activityCard,
                                    backgroundColor: isUnread ? "rgba(0, 149, 246, 0.05)" : "var(--color-card)",
                                }}>
                                    <div style={styles.activityIcon}>
                                        <Icon size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.activityContent}>
                                        <p style={{
                                            ...styles.activityMessage,
                                            fontWeight: isUnread ? 600 : 400
                                        }}>{activity.message}</p>
                                        <p style={styles.activityTime}>
                                            <Clock size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                            {formatTime(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
