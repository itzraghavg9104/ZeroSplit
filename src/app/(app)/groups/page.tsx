"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users, ChevronRight, Link2, X, ArrowRight } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types";
import MobileNav from "@/components/layout/MobileNav";
import GroupActionModal from "@/components/ui/GroupActionModal";

export default function GroupsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showGroupModal, setShowGroupModal] = useState(false);

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
                const groupsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Group[];
                setGroups(groupsData);
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
        header: {
            marginBottom: "20px",
        },
        title: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px",
        },
        actions: {
            display: "flex",
            gap: "10px",
        },
        actionBtn: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            border: "none",
        },
        createBtn: {
            backgroundColor: "#0095F6",
            color: "white",
        },
        joinBtn: {
            backgroundColor: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
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
        modal: {
            position: "fixed" as const,
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 200,
        },
        modalContent: {
            width: "100%",
            maxWidth: "500px",
            backgroundColor: "var(--color-background)",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            padding: "24px",
        },
        modalHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
        },
        modalTitle: {
            fontSize: "18px",
            fontWeight: 600,
        },
        closeBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
        },
        inputGroup: {
            marginBottom: "16px",
        },
        label: {
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
        },
        input: {
            width: "100%",
            padding: "14px 16px",
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "16px",
            textTransform: "uppercase" as const,
            letterSpacing: "3px",
            textAlign: "center" as const,
            outline: "none",
        },
        error: {
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "13px",
            textAlign: "center" as const,
        },
        submitBtn: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "16px",
        },
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Groups</h1>
                </div>

                {isLoading ? (
                    <div style={styles.groupList}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                height: "80px",
                                backgroundColor: "var(--color-card)",
                                borderRadius: "16px",
                            }} />
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Users style={styles.emptyIcon} strokeWidth={1} />
                        <h3 style={styles.emptyTitle}>No groups yet</h3>
                        <p style={styles.emptyText}>
                            Create a new group or join one using an invite code
                        </p>
                        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                            <button
                                style={{ ...styles.actionBtn, ...styles.createBtn, width: "100%" }}
                                onClick={() => setShowGroupModal(true)}
                            >
                                Create or Join
                            </button>
                        </div>
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
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* FAB */}
            <button
                onClick={() => setShowGroupModal(true)}
                style={{
                    position: "fixed",
                    bottom: "90px",
                    right: "20px",
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#0095F6",
                    borderRadius: "16px",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0, 149, 246, 0.4)",
                    cursor: "pointer",
                    zIndex: 50
                }}
            >
                <Plus size={28} />
            </button>


            {/* Group Action Modal */}
            <GroupActionModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
            />
        </div >
    );
}
