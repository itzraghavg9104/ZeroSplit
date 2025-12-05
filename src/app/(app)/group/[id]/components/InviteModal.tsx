"use client";

import { useState } from "react";
import { X, Copy, Check, Search, Link2, UserPlus, Share2 } from "lucide-react";
import { User, Invite, Group } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { getInitials } from "@/lib/utils";
import { logActivity } from "@/utils/activity";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group;
    user: User;
    groupId: string;
}

export default function InviteModal({ isOpen, onClose, group, user, groupId }: InviteModalProps) {
    const [copied, setCopied] = useState(false);
    const [usernameSearch, setUsernameSearch] = useState("");
    const [searchResult, setSearchResult] = useState<User | null>(null);
    const [searchError, setSearchError] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);

    if (!isOpen) return null;

    const copyInviteLink = () => {
        const link = `${window.location.origin}/join/${group.inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const link = `${window.location.origin}/join/${group.inviteCode}`;
        const title = `Join ${group.name} on ZeroSplit`;
        const text = `${user.firstName} is inviting you to the group "${group.name}". Join using the link below to start splitting expenses fairly!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: link,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback to copy if share not supported
            copyInviteLink();
            alert("Link copied to clipboard! (Sharing not supported on this device)");
        }
    };


    const searchByUsername = async () => {
        if (!usernameSearch.trim()) return;

        setIsSearching(true);
        setSearchError("");
        setSearchResult(null);

        try {
            const username = usernameSearch.toLowerCase().replace("@", "");
            const q = query(
                collection(db, "users"),
                where("username", "==", username)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setSearchError("User not found");
            } else {
                const foundUser = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;

                if (group.members.includes(foundUser.id)) {
                    setSearchError("User is already a member");
                } else {
                    setSearchResult(foundUser);
                }
            }
        } catch (error) {
            setSearchError("Error searching for user");
        } finally {
            setIsSearching(false);
        }
    };

    const addMemberByUsername = async () => {
        if (!searchResult) return;

        setIsAddingMember(true);
        try {
            const invitesQuery = query(
                collection(db, "invites"),
                where("groupId", "==", groupId),
                where("toUserId", "==", searchResult.id),
                where("status", "==", "pending")
            );
            const existingInvites = await getDocs(invitesQuery);
            if (!existingInvites.empty) {
                setSearchError("User already invited");
                setIsAddingMember(false);
                return;
            }

            const inviteData: Omit<Invite, "id"> = {
                groupId,
                groupName: group.name,
                invitedBy: user.id,
                invitedByName: user.firstName,
                toUserId: searchResult.id,
                status: "pending",
                createdAt: Timestamp.now(),
            };

            await addDoc(collection(db, "invites"), inviteData);

            await logActivity(
                user.id,
                "member_joined", // Adjusted type to generic since "member_added" might fallback
                `invited ${searchResult.firstName} to join ${group.name}`,
                groupId,
                group.name
            );

            alert("Invite sent successfully!");
            onClose();
            setUsernameSearch("");
            setSearchResult(null);
        } catch (error) {
            console.error("Error sending invite:", error);
            setSearchError("Failed to send invite");
        } finally {
            setIsAddingMember(false);
        }
    };

    // Styles (Copied from page.tsx to maintain look)
    const styles = {
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
            maxHeight: "80vh",
            overflow: "auto",
        },
        modalHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
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
        inviteSection: {
            marginBottom: "24px",
        },
        inviteLabel: {
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-muted)",
            marginBottom: "8px",
        },
        inviteCode: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
        },
        codeText: {
            flex: 1,
            fontFamily: "monospace",
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "2px",
        },
        copyBtn: {
            padding: "8px 16px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
        },
        divider: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
        },
        dividerLine: {
            flex: 1,
            height: "1px",
            backgroundColor: "var(--color-border)",
        },
        searchBox: {
            display: "flex",
            gap: "8px",
        },
        searchInput: {
            flex: 1,
            padding: "12px 16px",
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "15px",
            outline: "none",
        },
        searchBtn: {
            padding: "12px 20px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
        },
        searchError: {
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "13px",
            textAlign: "center" as const,
        },
        searchResult: {
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
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
        actionBtn: {
            flex: 1,
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
            fontWeight: 500,
            cursor: "pointer",
        },
        actionBtnSecondary: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px",
            backgroundColor: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.modal} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Invite Members</h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={styles.inviteSection}>
                    <p style={styles.inviteLabel}>Invite via Link</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button style={styles.actionBtn} onClick={copyInviteLink}>
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                            <span>{copied ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <button style={styles.actionBtnSecondary} onClick={handleShare}>
                            <Share2 size={20} />
                            <span>Share</span>
                        </button>
                    </div>
                    <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--color-muted)", textAlign: "center" }}>
                        Code: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{group.inviteCode}</span>
                    </p>
                </div>

                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={{ fontSize: "13px", color: "var(--color-muted)" }}>or add by username</span>
                    <div style={styles.dividerLine} />
                </div>

                <div style={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={usernameSearch}
                        onChange={(e) => setUsernameSearch(e.target.value)}
                        style={styles.searchInput}
                        onKeyPress={(e) => e.key === "Enter" && searchByUsername()}
                    />
                    <button
                        style={styles.searchBtn}
                        onClick={searchByUsername}
                        disabled={isSearching}
                    >
                        {isSearching ? "..." : <Search size={18} />}
                    </button>
                </div>

                {searchError && <p style={styles.searchError}>{searchError}</p>}

                {searchResult && (
                    <div style={styles.searchResult}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={styles.memberAvatar}>
                                {getInitials(searchResult.firstName, searchResult.lastName)}
                            </div>
                            <div>
                                <p style={{ fontWeight: 500 }}>
                                    {searchResult.firstName} {searchResult.lastName}
                                </p>
                                <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
                                    @{searchResult.username}
                                </p>
                            </div>
                        </div>
                        <button
                            style={{ ...styles.addBtn, opacity: isAddingMember ? 0.7 : 1 }}
                            onClick={addMemberByUsername}
                            disabled={isAddingMember}
                        >
                            {isAddingMember ? "Adding..." : "Add to Group"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
