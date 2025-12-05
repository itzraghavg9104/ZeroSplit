"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Users, DollarSign, UserPlus, Check, Clock } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
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

    useEffect(() => {
        const fetchActivities = async () => {
            if (!user) return;

            try {
                // For now, we'll create some placeholder activities
                // In production, this would fetch from Firestore activities collection
                setActivities([]);
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchActivities();
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
                    <h1 style={styles.title}>Activity</h1>
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
                            return (
                                <div key={activity.id} style={styles.activityCard}>
                                    <div style={styles.activityIcon}>
                                        <Icon size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.activityContent}>
                                        <p style={styles.activityMessage}>{activity.message}</p>
                                        <p style={styles.activityTime}>
                                            <Clock size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                                            Just now
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
