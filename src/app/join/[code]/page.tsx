"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Users, Check, X, ArrowRight, Loader2 } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types";

export default function JoinGroupPage() {
    const router = useRouter();
    const params = useParams();
    const inviteCode = params.code as string;
    const { user, loading: authLoading } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");
    const [alreadyMember, setAlreadyMember] = useState(false);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const q = query(
                    collection(db, "groups"),
                    where("inviteCode", "==", inviteCode)
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setError("Invalid or expired invite link");
                } else {
                    const groupData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Group;
                    setGroup(groupData);

                    if (user && groupData.members.includes(user.id)) {
                        setAlreadyMember(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching group:", err);
                setError("Failed to load group information");
            } finally {
                setIsLoading(false);
            }
        };

        if (inviteCode) {
            fetchGroup();
        }
    }, [inviteCode, user]);

    const handleJoin = async () => {
        if (!user || !group) return;

        setIsJoining(true);
        try {
            await updateDoc(doc(db, "groups", group.id), {
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

            router.push(`/group/${group.id}`);
        } catch (err) {
            console.error("Error joining group:", err);
            setError("Failed to join group. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
        },
        card: {
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "var(--color-card)",
            borderRadius: "24px",
            border: "1px solid var(--color-border)",
            padding: "32px",
            textAlign: "center" as const,
        },
        iconContainer: {
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        iconSuccess: {
            backgroundColor: "rgba(0, 149, 246, 0.1)",
        },
        iconError: {
            backgroundColor: "rgba(239, 68, 68, 0.1)",
        },
        title: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
        },
        subtitle: {
            fontSize: "15px",
            color: "var(--color-muted)",
            marginBottom: "24px",
        },
        groupName: {
            fontSize: "20px",
            fontWeight: 600,
            color: "#0095F6",
            marginBottom: "8px",
        },
        memberCount: {
            fontSize: "14px",
            color: "var(--color-muted)",
            marginBottom: "24px",
        },
        btn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            marginBottom: "12px",
        },
        primaryBtn: {
            backgroundColor: "#0095F6",
            color: "white",
        },
        secondaryBtn: {
            backgroundColor: "transparent",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
        },
        loader: {
            width: "32px",
            height: "32px",
            border: "3px solid var(--color-border)",
            borderTopColor: "#0095F6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
        },
        loginPrompt: {
            padding: "20px",
            backgroundColor: "rgba(0, 149, 246, 0.05)",
            borderRadius: "12px",
            marginBottom: "20px",
        },
    };

    if (authLoading || isLoading) {
        return (
            <div style={styles.page}>
                <div style={styles.loader} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconContainer, ...styles.iconError }}>
                        <X size={40} color="#ef4444" />
                    </div>
                    <h1 style={styles.title}>Oops!</h1>
                    <p style={styles.subtitle}>{error}</p>
                    <Link href="/">
                        <button style={{ ...styles.btn, ...styles.secondaryBtn }}>
                            Go Home
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (alreadyMember && group) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconContainer, ...styles.iconSuccess }}>
                        <Check size={40} color="#22c55e" />
                    </div>
                    <h1 style={styles.title}>Already a Member!</h1>
                    <p style={styles.subtitle}>You're already part of this group</p>
                    <p style={styles.groupName}>{group.name}</p>
                    <Link href={`/group/${group.id}`}>
                        <button style={{ ...styles.btn, ...styles.primaryBtn }}>
                            Open Group
                            <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconContainer, ...styles.iconSuccess }}>
                        <Users size={40} color="#0095F6" />
                    </div>
                    <h1 style={styles.title}>Join Group</h1>
                    {group && (
                        <>
                            <p style={styles.groupName}>{group.name}</p>
                            <p style={styles.memberCount}>{group.members.length} members</p>
                        </>
                    )}
                    <div style={styles.loginPrompt}>
                        <p style={{ fontWeight: 500, marginBottom: "4px" }}>Sign in to join</p>
                        <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
                            Create an account or log in to join this group
                        </p>
                    </div>
                    <Link href={`/signup?redirect=/join/${inviteCode}`}>
                        <button style={{ ...styles.btn, ...styles.primaryBtn }}>
                            Sign Up
                            <ArrowRight size={18} />
                        </button>
                    </Link>
                    <Link href={`/login?redirect=/join/${inviteCode}`}>
                        <button style={{ ...styles.btn, ...styles.secondaryBtn }}>
                            I have an account
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={{ ...styles.iconContainer, ...styles.iconSuccess }}>
                    <Users size={40} color="#0095F6" />
                </div>
                <h1 style={styles.title}>You're Invited!</h1>
                <p style={styles.subtitle}>You've been invited to join</p>
                {group && (
                    <>
                        <p style={styles.groupName}>{group.name}</p>
                        <p style={styles.memberCount}>{group.members.length} members</p>
                    </>
                )}
                <button
                    style={{ ...styles.btn, ...styles.primaryBtn, opacity: isJoining ? 0.7 : 1 }}
                    onClick={handleJoin}
                    disabled={isJoining}
                >
                    {isJoining ? (
                        <>
                            <div style={{
                                width: "18px",
                                height: "18px",
                                border: "2px solid rgba(255,255,255,0.3)",
                                borderTopColor: "white",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                            }} />
                            Joining...
                        </>
                    ) : (
                        <>
                            Join Group
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
                <Link href="/groups">
                    <button style={{ ...styles.btn, ...styles.secondaryBtn }}>
                        Maybe Later
                    </button>
                </Link>
            </div>
        </div>
    );
}
