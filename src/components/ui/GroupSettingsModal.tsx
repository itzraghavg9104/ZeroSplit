"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Edit2, Check, AlertTriangle } from "lucide-react";
import { deleteDoc, doc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Group } from "@/types";

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group;
}

export default function GroupSettingsModal({ isOpen, onClose, group }: GroupSettingsModalProps) {
    const router = useRouter();
    const [view, setView] = useState<"menu" | "edit" | "delete">("menu");
    const [newName, setNewName] = useState(group.name);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpdateGroup = async () => {
        if (!newName.trim()) return;
        setIsLoading(true);
        try {
            await updateDoc(doc(db, "groups", group.id), {
                name: newName.trim()
            });
            onClose();
            setView("menu");
        } catch (error) {
            console.error("Error updating group:", error);
            alert("Failed to update group");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        setIsLoading(true);
        try {
            const batch = writeBatch(db);

            // 1. Delete All Expenses
            const expensesQuery = query(collection(db, "expenses"), where("groupId", "==", group.id));
            const expensesSnapshot = await getDocs(expensesQuery);
            expensesSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 2. Delete All Invites
            const invitesQuery = query(collection(db, "invites"), where("groupId", "==", group.id));
            const invitesSnapshot = await getDocs(invitesQuery);
            invitesSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 3. Delete All Activities
            const activitiesQuery = query(collection(db, "activities"), where("groupId", "==", group.id));
            const activitiesSnapshot = await getDocs(activitiesQuery);
            activitiesSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 4. Delete All Settlements
            const settlementsQuery = query(collection(db, "settlements"), where("groupId", "==", group.id));
            const settlementsSnapshot = await getDocs(settlementsQuery);
            settlementsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Commit the batch for sub-collections first
            // We do this BEFORE deleting the group so that 'isGroupOwner' security rules (which read the group doc) 
            // will pass successfully. If we delete the group in the same batch, the 'get' call in rules might fail.
            await batch.commit();

            // 5. Delete Group Document separately
            await deleteDoc(doc(db, "groups", group.id));

            router.push("/groups");
        } catch (error) {
            console.error("Error deleting group:", error);
            alert("Failed to delete group");
            setIsLoading(false);
        }
    };

    const styles = {
        overlay: {
            position: "fixed" as const,
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
        },
        content: {
            backgroundColor: "var(--color-card)",
            width: "90%",
            maxWidth: "400px",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid var(--color-border)",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
        },
        title: {
            fontSize: "18px",
            fontWeight: 600,
        },
        closeBtn: {
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
            padding: "4px",
        },
        menuBtn: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "16px",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "15px",
            color: "var(--color-foreground)",
        },
        deleteBtn: {
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            borderColor: "rgba(239, 68, 68, 0.2)",
        },
        input: {
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            marginBottom: "16px",
            fontSize: "15px",
        },
        primaryBtn: {
            width: "100%",
            padding: "12px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        },
        dangerBtn: {
            width: "100%",
            padding: "12px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
        },
        label: {
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-muted)",
        }
    };

    const renderMenu = () => (
        <>
            <div style={styles.header}>
                <h2 style={styles.title}>Group Settings</h2>
                <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <button onClick={() => setView("edit")} style={styles.menuBtn}>
                <Edit2 size={20} />
                Edit Group Details
            </button>
            <button onClick={() => setView("delete")} style={{ ...styles.menuBtn, ...styles.deleteBtn }}>
                <Trash2 size={20} />
                Delete Group
            </button>
        </>
    );

    const renderEdit = () => (
        <>
            <div style={styles.header}>
                <h2 style={styles.title}>Edit Group</h2>
                <button onClick={() => setView("menu")} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <div>
                <label style={styles.label}>Group Name</label>
                <input
                    style={styles.input}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter group name"
                />
                <button
                    onClick={handleUpdateGroup}
                    disabled={isLoading || !newName.trim()}
                    style={{ ...styles.primaryBtn, opacity: isLoading ? 0.7 : 1 }}
                >
                    {isLoading ? "Saving..." : <>Save Changes <Check size={18} /></>}
                </button>
            </div>
        </>
    );

    const renderDelete = () => (
        <>
            <div style={styles.header}>
                <h2 style={{ ...styles.title, color: "#ef4444" }}>Delete Group?</h2>
                <button onClick={() => setView("menu")} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                    width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
                }}>
                    <AlertTriangle size={32} color="#ef4444" />
                </div>
                <p style={{ marginBottom: "24px", color: "var(--color-muted)", lineHeight: "1.5" }}>
                    Are you sure you want to delete <strong>{group.name}</strong>?<br />
                    This action cannot be undone and will delete all expenses and data associated with this group.
                </p>
                <button
                    onClick={handleDeleteGroup}
                    disabled={isLoading}
                    style={{ ...styles.dangerBtn, opacity: isLoading ? 0.7 : 1 }}
                >
                    {isLoading ? "Deleting..." : "Yes, Delete Group"}
                </button>
                <button
                    onClick={() => setView("menu")}
                    style={{
                        marginTop: "12px", background: "none", border: "none",
                        color: "var(--color-muted)", cursor: "pointer", fontSize: "14px"
                    }}
                >
                    Cancel
                </button>
            </div>
        </>
    );

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.content} onClick={e => e.stopPropagation()}>
                {view === "menu" && renderMenu()}
                {view === "edit" && renderEdit()}
                {view === "delete" && renderDelete()}
            </div>
        </div>
    );
}
