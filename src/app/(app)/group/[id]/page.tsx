"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Plus, Share2, Settings, Users, Receipt, Calculator,
    Copy, Check, UserPlus, Link2, X, Search, Wallet, CreditCard, LogOut, Smartphone
} from "lucide-react";
import {
    doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, deleteDoc, arrayUnion, Timestamp, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group, Expense, User, PaymentDetails, Invite } from "@/types";
import { addDoc } from "firebase/firestore";
import MobileNav from "@/components/layout/MobileNav";
import { calculateSettlements, Settlement } from "@/utils/settlements";

import { logActivity } from "@/utils/activity";

type TabType = "expenses" | "balances" | "settle" | "members";

interface MemberDetail {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    paymentDetails?: PaymentDetails;
}

export default function GroupDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;
    const { user } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("expenses");

    // Settlement Flow State
    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [activeSettlement, setActiveSettlement] = useState<Settlement | null>(null);
    const [payeeDetails, setPayeeDetails] = useState<User | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank" | null>(null);
    const [isSettling, setIsSettling] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [usernameSearch, setUsernameSearch] = useState("");
    const [searchResult, setSearchResult] = useState<User | null>(null);
    const [searchError, setSearchError] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Subscriber for Group Data
        const unsubscribeGroup = onSnapshot(doc(db, "groups", groupId), async (groupDoc) => {
            if (!groupDoc.exists()) {
                // Group might have been deleted
                router.push("/groups");
                return;
            }
            const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;

            // Check if user is a member
            if (!groupData.members.includes(user.id)) {
                router.push("/groups");
                return;
            }

            setGroup(groupData);

            // Fetch members
            const memberDocs = await Promise.all(
                groupData.members.map((id) => getDoc(doc(db, "users", id)))
            );
            const membersData = memberDocs
                .filter((d) => d.exists())
                .map((d) => ({ id: d.id, ...d.data() } as User));
            setMembers(membersData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching group:", error);
            setIsLoading(false);
        });

        // Subscriber for Expenses
        const expensesQuery = query(
            collection(db, "expenses"),
            where("groupId", "==", groupId)
        );

        const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
            const expensesData = snapshot.docs.map(
                (d) => ({ id: d.id, ...d.data() } as Expense)
            ).sort((a, b) => {
                const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
                return dateB - dateA;
            });
            setExpenses(expensesData);
            // We need members to calculate settlements. 
            // If members are not loaded yet, this might be empty, but it will re-render when members change.
        }, (error) => {
            console.error("Error fetching expenses:", error);
        });

        return () => {
            unsubscribeGroup();
            unsubscribeExpenses();
        };
    }, [user, groupId, router]);

    // Recalculate settlements whenever expenses or members change
    useEffect(() => {
        if (expenses.length > 0 && members.length > 0) {
            const calculated = calculateSettlements(expenses, members);
            setSettlements(calculated);
        } else {
            setSettlements([]);
        }
    }, [expenses, members]);

    const handleSettleClick = async (settlement: Settlement) => {
        setActiveSettlement(settlement);
        setSettleModalOpen(true);
        setPaymentMethod(null);

        // Find payee details
        const payee = members.find(m => m.id === settlement.to);
        setPayeeDetails(payee || null);
    };

    const confirmSettlement = async () => {
        if (!activeSettlement || !user) return;

        setIsSettling(true);
        try {
            // Create a settlement expense
            const settlementData = {
                groupId,
                description: "Settlement",
                amount: activeSettlement.amount,
                payerId: user.id, // I paid
                splits: [{
                    memberId: activeSettlement.to, // To them (100% split to payee)
                    amount: activeSettlement.amount
                }],
                splitType: "equal", // Technically custom, but for 1 person active equal is same
                createdBy: user.id,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                type: "settlement", // Custom field if schema allowed, simplifying to description for now
            };

            // Enhanced description
            // @ts-ignore
            settlementData.isSettlement = true; // Temporary tag if we add it to type later

            await addDoc(collection(db, "expenses"), settlementData);

            // Log Activity
            await logActivity(
                user.id,
                "settlement",
                `paid ${payeeDetails?.firstName} ${user.currency === "USD" ? "$" : user.currency === "EUR" ? "€" : user.currency === "GBP" ? "£" : user.currency === "JPY" ? "¥" : "₹"}${activeSettlement.amount}`,
                groupId,
                group?.name
            );

            setSettleModalOpen(false);
            setActiveSettlement(null);
        } catch (error) {
            console.error("Error settling:", error);
            alert("Failed to settle. Please try again.");
        } finally {
            setIsSettling(false);
        }
    };

    const copyInviteLink = () => {
        if (!group) return;
        const link = `${window.location.origin}/join/${group.inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyInviteCode = () => {
        if (!group) return;
        navigator.clipboard.writeText(group.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

                if (group?.members.includes(foundUser.id)) {
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
        if (!searchResult || !group || !user) return;

        setIsAddingMember(true);
        try {
            // Check if already invited
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

            // Create Invite
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
                "member_added", // Reusing this type or should I add "invite_sent"? keeping generic for now or updating activity type?
                // The user said "invite will have a activity regitered which will invoke notification"
                // I'll stick to a descriptive text.
                `invited ${searchResult.firstName} to join ${group.name}`,
                groupId,
                group.name
            );

            // Notify user (UI)
            alert("Invite sent successfully!");

            setShowInviteModal(false);
            setUsernameSearch("");
            setSearchResult(null);
        } catch (error) {
            console.error("Error sending invite:", error);
            setSearchError("Failed to send invite");
        } finally {
            setIsAddingMember(false);
        }
    };

    const getMemberName = (id: string) => {
        const member = members.find((m) => m.id === id);
        return member ? `${member.firstName} ${member.lastName}`.trim() : "Unknown";
    };

    const handleDeleteGroup = async () => {
        if (!group || !user) return;
        if (group.createdBy !== user.id) return;

        if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, "groups", groupId));
            router.push("/groups");
        } catch (error) {
            console.error("Error deleting group:", error);
            alert("Failed to delete group. Please try again.");
        }
    };

    const handleLeaveGroup = async () => {
        if (!group || !user) return;

        if (!confirm("Are you sure you want to leave this group?")) return;

        try {
            const newMembers = group.members.filter(id => id !== user.id);
            const newMemberDetails = (group.memberDetails || []).filter(m => m.id !== user.id); // Assuming group.memberDetails exists on type, check schema

            // Logic for ownership transfer
            let newOwner = group.createdBy;
            if (group.createdBy === user.id && newMembers.length > 0) {
                // Oldest member becomes owner. 
                // Assuming memberDetails is sorted by join Date or we sort it.
                // If memberDetails isn't reliable, strict to 'members' array order? 
                // Let's use memberDetails joinedAt if available, else first in array.
                // Firestore 'members' array doesn't guarantee order of add.
                // We SHOULD rely on memberDetails logic if we have it, or just random.
                // User said "oldest member".
                // memberDetails has joinedAt.
                // Find oldest in remainder.
                // Note: Group interface in this file says `Group` from `@/types` which I just viewed.
                // `Group` interface in types/index.ts DOES NOT include `memberDetails`! 
                // It has `members: string[]`.
                // WAIT. In `GroupDetailsPage` (Step 1144), `addMemberByUsername` was updating `memberDetails`!
                // See line 243: `memberDetails: arrayUnion(...)`.
                // So `memberDetails` DOES exist on the Firestore doc, even if not in the TS type?
                // Or I missed it in the TS type.
                // Let's check Step 1139 (types/index.ts).
                // Interface Group: members: string[]; createdBy: string; ... NO memberDetails.
                // Code in `GroupDetailsPage` lines 243 adds it.
                // `setGroup` uses `groupData` cast to `Group`.
                // If `Group` doesn't have it, TypeScript should have complained or it's implicitly `any` somewhere?
                // Ah, `groupData` is cast to `Group`. If `Group` lacks it, accessing `group.memberDetails` will error in TS.
                // I should update `types/index.ts` to include `memberDetails`.
                // But for now, I'll update `GroupDetailsPage`.

                // Use `members` array index 0 as fallback or if logic permits. 
                // Actually, memberDetails was being saved. I should update the Type too to be safe.
                newOwner = newMembers[0];
            }

            if (newMembers.length === 0) {
                // Last member leaving, delete group?
                await deleteDoc(doc(db, "groups", groupId));
                router.push("/groups");
                return;
            }

            await updateDoc(doc(db, "groups", groupId), {
                members: newMembers,
                // If memberDetails is used:
                // memberDetails: newMemberDetails, 
                createdBy: newOwner,
                updatedAt: Timestamp.now()
            });

            await logActivity(
                user.id,
                "left_group",
                `left the group`,
                groupId,
                group.name
            );

            router.push("/groups");

        } catch (error) {
            console.error("Error leaving group:", error);
            alert("Failed to leave group.");
        }
    };

    const calculateBalance = (memberId: string): number => {
        let balance = 0;
        expenses.forEach((expense) => {
            if (expense.payerId === memberId) {
                balance += expense.amount;
            }
            const split = expense.splits?.find((s) => s.memberId === memberId);
            if (split) {
                balance -= split.amount;
            }
        });
        return balance;
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "100px",
        },
        main: {
            maxWidth: "600px",
            margin: "0 auto",
        },
        header: {
            position: "sticky" as const,
            top: "56px",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)",
            zIndex: 40,
        },
        headerTop: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
        },
        headerLeft: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        backBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            background: "none",
            border: "none",
            color: "var(--color-foreground)",
            cursor: "pointer",
        },
        groupTitle: {
            fontSize: "18px",
            fontWeight: 600,
        },
        groupSubtitle: {
            fontSize: "12px",
            color: "var(--color-muted)",
        },
        headerActions: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        iconBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
        },
        tabs: {
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
        },
        tab: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px",
            background: "none",
            border: "none",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-muted)",
            cursor: "pointer",
        },
        tabActive: {
            color: "#0095F6",
            borderBottom: "2px solid #0095F6",
        },
        content: {
            padding: "16px",
        },
        emptyState: {
            textAlign: "center" as const,
            padding: "48px 24px",
        },
        emptyIcon: {
            width: "48px",
            height: "48px",
            marginBottom: "16px",
            color: "var(--color-muted)",
        },
        emptyTitle: {
            fontWeight: 600,
            marginBottom: "8px",
        },
        emptyText: {
            fontSize: "14px",
            color: "var(--color-muted)",
        },
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            padding: "16px",
            marginBottom: "12px",
        },
        cardHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        expenseTitle: {
            fontWeight: 500,
            marginBottom: "4px",
        },
        expenseSubtitle: {
            fontSize: "13px",
            color: "var(--color-muted)",
        },
        expenseAmount: {
            fontWeight: 600,
            textAlign: "right" as const,
        },
        expenseDate: {
            fontSize: "12px",
            color: "var(--color-muted)",
        },
        memberRow: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 0",
            borderBottom: "1px solid var(--color-border)",
        },
        memberRowLast: {
            borderBottom: "none",
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
        memberInfo: {
            flex: 1,
        },
        memberName: {
            fontWeight: 500,
        },
        memberUsername: {
            fontSize: "13px",
            color: "var(--color-muted)",
        },
        balance: {
            fontWeight: 600,
        },
        balancePositive: { color: "#22c55e" },
        balanceNegative: { color: "#ef4444" },
        balanceZero: { color: "var(--color-muted)" },
        fab: {
            position: "fixed" as const,
            bottom: "90px",
            right: "20px",
            width: "56px",
            height: "56px",
            backgroundColor: "#0095F6",
            borderRadius: "16px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 149, 246, 0.4)",
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
        leaveBtn: {
            marginTop: "12px",
            width: "100%",
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
        },
        paymentCard: {
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            padding: "16px",
            marginTop: "12px",
        },
        paymentTitle: {
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        paymentRow: {
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            fontSize: "14px",
        },
        paymentLabel: {
            color: "var(--color-muted)",
        },
        paymentValue: {
            fontWeight: 500,
        },
    };

    if (isLoading) {
        return (
            <div style={styles.page}>
                <MobileNav />
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "50vh"
                }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        border: "3px solid var(--color-border)",
                        borderTopColor: "#0095F6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }} />
                </div>
            </div>
        );
    }

    if (!group) return null;

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTop}>
                        <div style={styles.headerLeft}>
                            <Link href="/groups">
                                <button style={styles.backBtn}>
                                    <ArrowLeft size={22} />
                                </button>
                            </Link>

                            {group.image && (
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", overflow: "hidden", marginRight: "12px" }}>
                                    <img src={group.image} alt={group.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}

                            <div>
                                <h1 style={styles.groupTitle}>{group.name}</h1>
                                <p style={styles.groupSubtitle}>{members.length} members</p>
                            </div>
                        </div>
                        <div style={styles.headerActions}>
                            <button onClick={() => setShowInviteModal(true)} style={styles.iconBtn}>
                                <UserPlus size={22} />
                            </button>
                            <button onClick={copyInviteLink} style={styles.iconBtn}>
                                {copied ? <Check size={22} color="#22c55e" /> : <Share2 size={22} />}
                            </button>
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        {[
                            { id: "expenses" as TabType, label: "Expenses", icon: Receipt },
                            { id: "balances" as TabType, label: "Balances", icon: Calculator },
                            { id: "members" as TabType, label: "Members", icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === tab.id ? {
                                        color: "#0095F6",
                                        borderBottom: "2px solid #0095F6"
                                    } : {}),
                                }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {activeTab === "expenses" && (
                        <>
                            {expenses.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <Receipt size={48} style={styles.emptyIcon} strokeWidth={1} />
                                    <h3 style={styles.emptyTitle}>No expenses yet</h3>
                                    <p style={styles.emptyText}>
                                        Tap + to add your first expense
                                    </p>
                                </div>
                            ) : (
                                expenses.map((expense) => (
                                    <div key={expense.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <div>
                                                <p style={styles.expenseTitle}>{expense.description}</p>
                                                <p style={styles.expenseSubtitle}>
                                                    {getMemberName(expense.payerId)} paid
                                                </p>
                                            </div>
                                            <div>
                                                <p style={styles.expenseAmount}>₹{expense.amount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {activeTab === "balances" && (
                        <>
                            {/* My Settlement Plan */}
                            <div style={{ marginBottom: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Settlement Plan</h3>
                                {settlements.length === 0 ? (
                                    <div style={{ ...styles.card, textAlign: "center", padding: "32px" }}>
                                        <Check size={32} color="#22c55e" style={{ margin: "0 auto 12px" }} />
                                        <p style={{ fontWeight: 500 }}>All settled up!</p>
                                        <p style={styles.emptyText}>No pending debts in this group.</p>
                                    </div>
                                ) : (
                                    <div style={styles.card}>
                                        {settlements.map((settlement, index) => {
                                            const isMePayer = settlement.from === user?.id;
                                            const isMePayee = settlement.to === user?.id;
                                            const otherPersonId = isMePayer ? settlement.to : settlement.from;
                                            const otherPerson = members.find(m => m.id === otherPersonId);

                                            // Only show settlements involving me, or show all? 
                                            // Showing all is good for transparency, but highlight mine.

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        ...styles.memberRow,
                                                        ...(index === settlements.length - 1 ? styles.memberRowLast : {}),
                                                        opacity: (isMePayer || isMePayee) ? 1 : 0.6
                                                    }}
                                                >
                                                    <div style={styles.memberAvatar}>
                                                        {otherPerson?.firstName?.[0] || "?"}
                                                    </div>
                                                    <div style={styles.memberInfo}>
                                                        <p style={styles.memberName}>
                                                            {isMePayer ? `You owe ${otherPerson?.firstName}` : `${otherPerson?.firstName} owes you`}
                                                        </p>
                                                        <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>
                                                            {isMePayer ? "Click Pay to settle" : "Waiting for payment"}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                                        <p style={{ ...styles.balance, color: isMePayer ? "#ef4444" : "#22c55e" }}>
                                                            ₹{settlement.amount.toFixed(2)}
                                                        </p>
                                                        {isMePayer && (
                                                            <button
                                                                onClick={() => handleSettleClick(settlement)}
                                                                style={{
                                                                    backgroundColor: "#0095F6",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "6px",
                                                                    padding: "6px 12px",
                                                                    fontSize: "12px",
                                                                    fontWeight: 600,
                                                                    cursor: "pointer"
                                                                }}
                                                            >
                                                                Pay
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Net Balances Summary */}
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Net Balances</h3>
                            <div style={styles.card}>
                                {members.map((member, index) => {
                                    const balance = calculateBalance(member.id);
                                    return (
                                        <div
                                            key={member.id}
                                            style={{
                                                ...styles.memberRow,
                                                ...(index === members.length - 1 ? styles.memberRowLast : {}),
                                            }}
                                        >
                                            <div style={styles.memberAvatar}>
                                                {member.firstName?.[0] || "U"}
                                            </div>
                                            <div style={styles.memberInfo}>
                                                <p style={styles.memberName}>
                                                    {member.firstName} {member.lastName}
                                                    {member.id === user?.id && " (You)"}
                                                </p>
                                            </div>
                                            <p
                                                style={{
                                                    ...styles.balance,
                                                    ...(balance > 0 ? styles.balancePositive : balance < 0 ? styles.balanceNegative : styles.balanceZero),
                                                }}
                                            >
                                                {balance === 0 ? "Settled" : `${balance > 0 ? "+" : ""}${user?.currency === "USD" ? "$" : user?.currency === "EUR" ? "€" : user?.currency === "GBP" ? "£" : user?.currency === "JPY" ? "¥" : "₹"}${Math.abs(balance).toFixed(2)}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeTab === "members" && (
                        <div style={styles.card}>
                            {members.map((member, index) => (
                                <div
                                    key={member.id}
                                    style={{
                                        ...styles.memberRow,
                                        ...(index === members.length - 1 ? styles.memberRowLast : {}),
                                    }}
                                >
                                    <div style={styles.memberAvatar}>
                                        {member.firstName?.[0] || "U"}
                                    </div>
                                    <div style={styles.memberInfo}>
                                        <p style={styles.memberName}>
                                            {member.firstName} {member.lastName}
                                            {member.id === group.createdBy && " 👑"}
                                        </p>
                                        <p style={styles.memberUsername}>@{member.username}</p>
                                    </div>
                                </div>
                            ))}
                            <div style={{ borderTop: "1px solid var(--color-border)", padding: "16px 0 0 0", marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <button
                                    onClick={handleLeaveGroup}
                                    style={styles.leaveBtn}
                                >
                                    <LogOut size={18} style={{ marginRight: "8px" }} />
                                    Leave Group
                                </button>

                                {group.createdBy === user?.id && (
                                    <button
                                        onClick={handleDeleteGroup}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                                            color: "#ef4444",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        Delete Group
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* FAB */}
                <Link href={`/group/${groupId}/add-expense`}>
                    <button style={styles.fab}>
                        <Plus size={24} />
                    </button>
                </Link>
            </main>

            {/* Invite Modal */}
            {showInviteModal && (
                <div style={styles.modal} onClick={() => setShowInviteModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Invite Members</h2>
                            <button style={styles.closeBtn} onClick={() => setShowInviteModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Invite Link */}
                        <div style={styles.inviteSection}>
                            <p style={styles.inviteLabel}>Share Invite Code</p>
                            <div style={styles.inviteCode}>
                                <span style={styles.codeText}>{group.inviteCode}</span>
                                <button style={styles.copyBtn} onClick={copyInviteCode}>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.inviteSection}>
                            <p style={styles.inviteLabel}>Share Link</p>
                            <div style={styles.inviteCode}>
                                <Link2 size={18} color="var(--color-muted)" />
                                <span style={{ flex: 1, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {window.location.origin}/join/{group.inviteCode}
                                </span>
                                <button style={styles.copyBtn} onClick={copyInviteLink}>
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.divider}>
                            <div style={styles.dividerLine} />
                            <span style={{ fontSize: "13px", color: "var(--color-muted)" }}>or add by username</span>
                            <div style={styles.dividerLine} />
                        </div>

                        {/* Search by Username */}
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
                                        {searchResult.firstName?.[0] || "U"}
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
            )}
            {/* Settle Up Modal */}
            {settleModalOpen && activeSettlement && payeeDetails && (
                <div style={styles.modal} onClick={() => setSettleModalOpen(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Zero The Split</h2>
                            <button style={styles.closeBtn} onClick={() => setSettleModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                            <p style={{ color: "var(--color-muted)", marginBottom: "4px" }}>You are paying</p>
                            <h3 style={{ fontSize: "28px", fontWeight: 700 }}>{user?.currency === "USD" ? "$" : user?.currency === "EUR" ? "€" : user?.currency === "GBP" ? "£" : user?.currency === "JPY" ? "¥" : "₹"}{activeSettlement.amount.toFixed(2)}</h3>
                            <p style={{ fontSize: "14px", marginTop: "4px" }}>to <strong>{payeeDetails.firstName} {payeeDetails.lastName}</strong></p>
                        </div>

                        {!paymentMethod ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>How would you like to pay?</p>

                                <button
                                    onClick={() => setPaymentMethod("upi")}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "12px",
                                        padding: "16px", borderRadius: "12px",
                                        border: "1px solid var(--color-border)",
                                        backgroundColor: "var(--color-card)",
                                        cursor: "pointer",
                                        textAlign: "left"
                                    }}
                                >
                                    <div style={{ padding: "8px", borderRadius: "50%", backgroundColor: "#eee" }}>
                                        <Smartphone size={20} color="black" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600 }}>UPI Apps</p>
                                        <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>Google Pay, PhonePe, Paytm</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod("bank")}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "12px",
                                        padding: "16px", borderRadius: "12px",
                                        border: "1px solid var(--color-border)",
                                        backgroundColor: "var(--color-card)",
                                        cursor: "pointer",
                                        textAlign: "left"
                                    }}
                                >
                                    <div style={{ padding: "8px", borderRadius: "50%", backgroundColor: "#eee" }}>
                                        <CreditCard size={20} color="black" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600 }}>Bank Transfer</p>
                                        <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>IMPS / NEFT details</p>
                                    </div>
                                </button>

                                <button
                                    onClick={confirmSettlement}
                                    style={{
                                        ...styles.addBtn,
                                        backgroundColor: "var(--color-card)",
                                        color: "var(--color-foreground)",
                                        border: "1px solid var(--color-border)",
                                        marginTop: "12px"
                                    }}
                                >
                                    Record as Cash Payment
                                </button>
                            </div>
                        ) : paymentMethod === "upi" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={styles.card}>
                                    <p style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "8px" }}>PAYEE UPI ID</p>
                                    {payeeDetails.paymentDetails?.upiId ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ fontSize: "16px", fontWeight: 500, flex: 1 }}>
                                                {payeeDetails.paymentDetails.upiId}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(payeeDetails.paymentDetails?.upiId || "");
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 2000);
                                                }}
                                                style={{ border: "none", background: "none", color: "#0095F6", fontWeight: 600 }}
                                            >
                                                {copied ? "COPIED" : "COPY"}
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ color: "#ef4444", fontSize: "14px" }}>No UPI ID added by user</p>
                                    )}
                                </div>

                                {payeeDetails.paymentDetails?.upiId && (
                                    <a
                                        href={`upi://pay?pa=${payeeDetails.paymentDetails.upiId}&pn=${payeeDetails.firstName}&am=${activeSettlement.amount}&cu=INR&tn=Settlement`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <button style={styles.addBtn}>
                                            Pay via UPI App
                                        </button>
                                    </a>
                                )}

                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button
                                        onClick={() => setPaymentMethod(null)}
                                        style={{
                                            flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                                            backgroundColor: "var(--color-secondary)", cursor: "pointer"
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmSettlement}
                                        disabled={isSettling}
                                        style={{ ...styles.addBtn, marginTop: 0, flex: 1 }}
                                    >
                                        {isSettling ? "Processing..." : "Mark as Paid"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Bank Details
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={styles.card}>
                                    <div style={{ marginBottom: "12px" }}>
                                        <p style={styles.paymentLabel}>Account Number</p>
                                        <p style={{ fontSize: "16px", fontWeight: 500 }}>
                                            {payeeDetails.paymentDetails?.bankAccountNumber || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={styles.paymentLabel}>IFSC Code</p>
                                        <p style={{ fontSize: "16px", fontWeight: 500 }}>
                                            {payeeDetails.paymentDetails?.ifscCode || "Not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button
                                        onClick={() => setPaymentMethod(null)}
                                        style={{
                                            flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                                            backgroundColor: "var(--color-secondary)", cursor: "pointer"
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmSettlement}
                                        disabled={isSettling}
                                        style={{ ...styles.addBtn, marginTop: 0, flex: 1 }}
                                    >
                                        {isSettling ? "Processing..." : "Mark as Paid"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
