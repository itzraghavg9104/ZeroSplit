"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, ChevronRight, Link2, ArrowRight } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface GroupActionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GroupActionModal({ isOpen, onClose }: GroupActionModalProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [view, setView] = useState<"actions" | "join">("actions");
    const [inviteCode, setInviteCode] = useState("");
    const [joinError, setJoinError] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    if (!isOpen) return null;

    const handleJoinGroup = async () => {
        if (!inviteCode.trim() || !user) return;

        setIsJoining(true);
        setJoinError("");

        try {
            const code = inviteCode.trim().toUpperCase();
            const q = query(
                collection(db, "groups"),
                where("inviteCode", "==", code)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setJoinError("Invalid invite code. Please check and try again.");
                return;
            }

            const groupDoc = snapshot.docs[0];
            const groupData = groupDoc.data();

            if (groupData.members.includes(user.id)) {
                setJoinError("You're already a member of this group!");
                return;
            }

            // Create member details object
            const newMemberDetails = {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                joinedAt: Timestamp.now(),
                // Add profile picture if available, though typically we might fetch fresh
                // But for the array, we can store it.
                // Existing groups page didn't store profilePicture explicitly in memberDetails based on my read
                // but we can add it if we want. For now I'll stick to exact parity with GroupsPage logic
                // to avoid schema inconsistencies, unless I see GroupsPage doing it.
                // Checking GroupsPage logic from previous view... 
                // GroupsPage used: id, username, firstName, lastName, email, joinedAt.
            };

            await updateDoc(doc(db, "groups", groupDoc.id), {
                members: arrayUnion(user.id),
                memberDetails: arrayUnion(newMemberDetails),
                updatedAt: Timestamp.now(),
            });

            handleClose();
            router.push(`/group/${groupDoc.id}`);
        } catch (error) {
            console.error("Error joining group:", error);
            setJoinError("Failed to join group. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    const handleClose = () => {
        setView("actions");
        setInviteCode("");
        setJoinError("");
        onClose();
    };

    const styles = {
        modal: {
            position: "fixed" as const,
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-end", // Bottom sheet on mobile
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
            // For desktop, maybe center it? But bottom sheet style is nice for actions
            // typically on mobile. On desktop it might look weird at bottom.
            // Let's add media query logic via JS or just generic styles that work okay for both.
            // Or use similar styling to GroupsPage which was bottom-aligned.
            paddingBottom: "40px",
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
            color: "var(--color-foreground)",
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
        actionBtn: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            padding: "16px",
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            cursor: "pointer",
            textAlign: "left" as const,
            marginBottom: "12px",
        },
        iconCircle: {
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px", // for icon size control if needed
        },
        textContainer: {
            flex: 1,
        },
        btnTitle: {
            fontWeight: 600,
            fontSize: "16px",
            color: "var(--color-foreground)",
            marginBottom: "2px",
        },
        btnDesc: {
            fontSize: "13px",
            color: "var(--color-muted)",
        },
        inputGroup: {
            marginBottom: "16px",
        },
        label: {
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--color-foreground)",
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
        error: {
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "13px",
            textAlign: "center" as const,
        },
    };

    return (
        <div style={styles.modal} onClick={handleClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>
                        {view === "actions" ? "New Group" : "Join Group"}
                    </h2>
                    <button style={styles.closeBtn} onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {view === "actions" ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Link href="/create-group" style={{ textDecoration: "none" }} onClick={handleClose}>
                            <button style={styles.actionBtn}>
                                <div style={{ ...styles.iconCircle, backgroundColor: "rgba(0, 149, 246, 0.1)", color: "#0095F6" }}>
                                    <Plus size={24} />
                                </div>
                                <div style={styles.textContainer}>
                                    <p style={styles.btnTitle}>Create New Group</p>
                                    <p style={styles.btnDesc}>Start a clean slate for expenses</p>
                                </div>
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </button>
                        </Link>

                        <button
                            style={styles.actionBtn}
                            onClick={() => setView("join")}
                        >
                            <div style={{ ...styles.iconCircle, backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                                <Link2 size={24} />
                            </div>
                            <div style={styles.textContainer}>
                                <p style={styles.btnTitle}>Join Existing Group</p>
                                <p style={styles.btnDesc}>Use an invite code to join</p>
                            </div>
                            <ChevronRight size={20} color="var(--color-muted)" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Enter Invite Code</label>
                            <input
                                type="text"
                                placeholder="ABCD1234"
                                value={inviteCode}
                                onChange={(e) => {
                                    setInviteCode(e.target.value.toUpperCase());
                                    setJoinError("");
                                }}
                                style={styles.input}
                                maxLength={8}
                                autoFocus
                            />
                        </div>

                        {joinError && <p style={styles.error}>{joinError}</p>}

                        <button
                            style={{ ...styles.submitBtn, opacity: isJoining || !inviteCode.trim() ? 0.6 : 1 }}
                            onClick={handleJoinGroup}
                            disabled={isJoining || !inviteCode.trim()}
                        >
                            {isJoining ? (
                                "Joining..."
                            ) : (
                                <>
                                    Join Group
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setView("actions")}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: "none",
                                border: "none",
                                color: "var(--color-muted)",
                                fontSize: "14px",
                                cursor: "pointer",
                                marginTop: "8px"
                            }}
                        >
                            Back to options
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
