"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DollarSign, Check, Divide, Calculator } from "lucide-react";
import { doc, getDoc, collection, addDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Expense, Group, User } from "@/types";
import MobileNav from "@/components/layout/MobileNav";
import { logActivity } from "@/utils/activity";
import { splitEqually, validateCustomSplit } from "@/lib/algorithms";
import { formatCurrency } from "@/lib/utils";

const getCurrencySymbol = (currency: string) => {
    switch (currency) {
        case "USD":
            return "$";
        case "EUR":
            return "€";
        case "GBP":
            return "£";
        case "JPY":
            return "¥";
        default:
            return currency === "INR" ? "₹" : currency;
    }
};

export default function AddExpensePage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const groupId = params.id as string;
    const expenseId = searchParams.get("expenseId");
    const isEditing = Boolean(expenseId);
    const { user } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [existingExpense, setExistingExpense] = useState<Expense | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        payerId: "",
        splitType: "equal" as "equal" | "custom",
    });
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

    const currencyCode = user?.currency || "INR";
    const currencySymbol = getCurrencySymbol(currencyCode);
    const selectedCustomTotal = selectedMembers.reduce((total, memberId) => {
        return total + (parseFloat(customAmounts[memberId] || "0") || 0);
    }, 0);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            setIsLoading(true);
            setError("");

            try {
                const groupDoc = await getDoc(doc(db, "groups", groupId));
                if (!groupDoc.exists()) {
                    setError("Group not found");
                    return;
                }

                const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
                if (!groupData.members.includes(user.id)) {
                    setError("You no longer have access to this group.");
                    return;
                }

                setGroup(groupData);

                const memberDocs = await Promise.all(
                    groupData.members.map((id) => getDoc(doc(db, "users", id)))
                );
                const membersData = memberDocs
                    .filter((memberDoc) => memberDoc.exists())
                    .map((memberDoc) => ({ id: memberDoc.id, ...memberDoc.data() } as User));

                setMembers(membersData);

                if (!expenseId) {
                    setExistingExpense(null);
                    setFormData({
                        description: "",
                        amount: "",
                        payerId: user.id,
                        splitType: "equal",
                    });
                    setSelectedMembers(membersData.map((member) => member.id));
                    setCustomAmounts({});
                    return;
                }

                const expenseDoc = await getDoc(doc(db, "expenses", expenseId));
                if (!expenseDoc.exists()) {
                    setError("Expense not found");
                    return;
                }

                const expenseData = { id: expenseDoc.id, ...expenseDoc.data() } as Expense;

                if (expenseData.groupId !== groupId) {
                    setError("Expense not found in this group.");
                    return;
                }

                if (expenseData.type === "settlement" || expenseData.isSettlement) {
                    setError("Settlement records can't be edited.");
                    return;
                }

                if (expenseData.createdBy !== user.id) {
                    setError("Only the person who added this expense can edit it.");
                    return;
                }

                const expenseCustomAmounts = expenseData.splits.reduce<Record<string, string>>(
                    (acc, split) => {
                        acc[split.memberId] = split.amount.toString();
                        return acc;
                    },
                    {}
                );

                setExistingExpense(expenseData);
                setFormData({
                    description: expenseData.description,
                    amount: expenseData.amount.toString(),
                    payerId: expenseData.payerId,
                    splitType: expenseData.splitType,
                });
                setSelectedMembers(expenseData.splits.map((split) => split.memberId));
                setCustomAmounts(expenseCustomAmounts);
            } catch (err) {
                console.error("Error loading expense form:", err);
                setError("Failed to load expense details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, groupId, expenseId]);

    const handleCustomAmountChange = (memberId: string, value: string) => {
        setCustomAmounts((prev) => ({
            ...prev,
            [memberId]: value,
        }));
    };

    const toggleMember = (memberId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const switchToCustomSplit = () => {
        const amount = parseFloat(formData.amount || "0");
        if (amount > 0 && selectedMembers.length > 0) {
            const equalSplits = splitEqually(amount, selectedMembers);
            setCustomAmounts((prev) => {
                const next = { ...prev };
                equalSplits.forEach((split) => {
                    if (!next[split.memberId]) {
                        next[split.memberId] = split.amount.toString();
                    }
                });
                return next;
            });
        }

        setFormData((prev) => ({ ...prev, splitType: "custom" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !group) return;

        const amount = parseFloat(formData.amount);
        if (!formData.description.trim()) {
            setError("Please enter a description");
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        if (!formData.payerId) {
            setError("Please select who paid");
            return;
        }
        if (selectedMembers.length === 0) {
            setError("Please select at least one member to split with");
            return;
        }

        let splits = splitEqually(amount, selectedMembers);

        if (formData.splitType === "custom") {
            const customSplits = selectedMembers.map((memberId) => {
                const memberAmount = parseFloat(customAmounts[memberId] || "0");

                return {
                    memberId,
                    amount: memberAmount,
                };
            });

            if (customSplits.some((split) => isNaN(split.amount) || split.amount < 0)) {
                setError("Please enter valid amounts for all selected members");
                return;
            }

            const validation = validateCustomSplit(amount, customSplits);
            if (!validation.valid) {
                setError(validation.message || "Split amounts must match the expense amount");
                return;
            }

            splits = customSplits;
        }

        setIsSaving(true);
        setError("");

        try {
            if (isEditing && expenseId) {
                await updateDoc(doc(db, "expenses", expenseId), {
                    description: formData.description.trim(),
                    amount,
                    payerId: formData.payerId,
                    splits,
                    splitType: formData.splitType,
                    updatedAt: Timestamp.now(),
                });

                await logActivity(
                    user.id,
                    "expense_updated",
                    `updated "${formData.description.trim()}"`,
                    groupId,
                    group.name
                );
            } else {
                const expenseData = {
                    groupId,
                    description: formData.description.trim(),
                    amount,
                    payerId: formData.payerId,
                    splits,
                    splitType: formData.splitType,
                    createdBy: user.id,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };

                await addDoc(collection(db, "expenses"), expenseData);

                await logActivity(
                    user.id,
                    "expense_added",
                    `added "${formData.description.trim()}"`,
                    groupId,
                    group.name
                );
            }

            router.push(`/group/${groupId}`);
        } catch (err) {
            console.error("Error saving expense:", err);
            setError(isEditing ? "Failed to update expense. Please try again." : "Failed to add expense. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "100px",
        },
        main: {
            padding: "16px",
            maxWidth: "500px",
            margin: "0 auto",
        },
        header: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
        },
        backBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            background: "none",
            border: "none",
            color: "var(--color-foreground)",
            cursor: "pointer",
        },
        title: {
            fontSize: "20px",
            fontWeight: 600,
        },
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "20px",
            marginBottom: "16px",
        },
        form: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "20px",
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "8px",
        },
        label: {
            fontSize: "14px",
            fontWeight: 600,
        },
        input: {
            width: "100%",
            padding: "14px 16px",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "16px",
            outline: "none",
        },
        amountInput: {
            fontSize: "24px",
            fontWeight: 600,
            textAlign: "center" as const,
        },
        error: {
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            color: "#ef4444",
            fontSize: "14px",
            textAlign: "center" as const,
        },
        sectionTitle: {
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
        },
        payerSelect: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "8px",
        },
        payerOption: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            backgroundColor: "var(--color-background)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
            transition: "all 0.2s",
        },
        payerOptionSelected: {
            borderColor: "var(--color-foreground)",
            backgroundColor: "var(--color-card)",
        },
        avatar: {
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "var(--color-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
            objectFit: "cover" as const,
        },
        memberName: {
            flex: 1,
            fontWeight: 500,
            fontSize: "15px",
        },
        checkIcon: {
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid var(--color-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        checkIconSelected: {
            backgroundColor: "var(--color-foreground)",
            borderColor: "var(--color-foreground)",
        },
        submitBtn: {
            width: "100%",
            padding: "16px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        },
        loader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
        },
        splitToggle: {
            display: "flex",
            backgroundColor: "var(--color-background)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "16px",
            border: "1px solid var(--color-border)",
        },
        toggleBtn: {
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "none",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
        },
        toggleBtnActive: {
            backgroundColor: "var(--color-foreground)",
            color: "var(--color-background)",
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        customAmountInput: {
            width: "90px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            fontSize: "14px",
            textAlign: "right" as const,
        },
    };

    if (isLoading) {
        return (
            <div style={styles.page}>
                <MobileNav />
                <div style={styles.loader}>
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

    if (error && (!group || (isEditing && !existingExpense))) {
        return (
            <div style={styles.page}>
                <MobileNav />
                <main style={styles.main}>
                    <div style={styles.error}>{error}</div>
                    <Link href={group ? `/group/${groupId}` : "/groups"}>
                        <button style={{ ...styles.submitBtn, marginTop: "16px" }}>
                            Back
                        </button>
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <Link href={`/group/${groupId}`}>
                        <button style={styles.backBtn}>
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 style={styles.title}>{isEditing ? "Edit Expense" : "Add Expense"}</h1>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.card}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Amount ({currencySymbol})</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                style={{ ...styles.input, ...styles.amountInput }}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div style={{ ...styles.inputGroup, marginTop: "16px" }}>
                            <label style={styles.label}>Description</label>
                            <input
                                type="text"
                                placeholder="What was this expense for?"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.card}>
                        <p style={styles.sectionTitle}>Paid by</p>
                        <div style={styles.payerSelect}>
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    style={{
                                        ...styles.payerOption,
                                        ...(formData.payerId === member.id ? styles.payerOptionSelected : {}),
                                    }}
                                    onClick={() => setFormData((prev) => ({ ...prev, payerId: member.id }))}
                                >
                                    {member.profilePicture ? (
                                        <img
                                            src={member.profilePicture}
                                            alt={member.firstName}
                                            style={{ ...styles.avatar, backgroundColor: "transparent" }}
                                        />
                                    ) : (
                                        <div style={styles.avatar}>
                                            {member.firstName?.[0] || "U"}
                                        </div>
                                    )}
                                    <span style={styles.memberName}>
                                        {member.firstName} {member.lastName}
                                        {member.id === user?.id && " (You)"}
                                    </span>
                                    <div style={{
                                        ...styles.checkIcon,
                                        ...(formData.payerId === member.id ? styles.checkIconSelected : {}),
                                    }}>
                                        {formData.payerId === member.id && (
                                            <Check size={12} color="var(--color-background)" strokeWidth={3} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <p style={{ ...styles.sectionTitle, marginBottom: 0 }}>Split between</p>
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedMembers.length === members.length) {
                                        setSelectedMembers([]);
                                    } else {
                                        setSelectedMembers(members.map((member) => member.id));
                                    }
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#0095F6",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                {selectedMembers.length === members.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        <div style={styles.splitToggle}>
                            <button
                                type="button"
                                style={{
                                    ...styles.toggleBtn,
                                    ...(formData.splitType === "equal" ? styles.toggleBtnActive : {}),
                                }}
                                onClick={() => setFormData((prev) => ({ ...prev, splitType: "equal" }))}
                            >
                                <Divide size={16} />
                                Equally
                            </button>
                            <button
                                type="button"
                                style={{
                                    ...styles.toggleBtn,
                                    ...(formData.splitType === "custom" ? styles.toggleBtnActive : {}),
                                }}
                                onClick={switchToCustomSplit}
                            >
                                <Calculator size={16} />
                                Unequally
                            </button>
                        </div>

                        <div style={styles.payerSelect}>
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    style={{
                                        ...styles.payerOption,
                                        ...(selectedMembers.includes(member.id) ? styles.payerOptionSelected : {}),
                                    }}
                                    onClick={() => toggleMember(member.id)}
                                >
                                    {member.profilePicture ? (
                                        <img
                                            src={member.profilePicture}
                                            alt={member.firstName}
                                            style={{ ...styles.avatar, backgroundColor: "transparent" }}
                                        />
                                    ) : (
                                        <div style={styles.avatar}>
                                            {member.firstName?.[0] || "U"}
                                        </div>
                                    )}
                                    <span style={styles.memberName}>
                                        {member.firstName} {member.lastName}
                                    </span>

                                    {formData.splitType === "equal" ? (
                                        <div style={{
                                            ...styles.checkIcon,
                                            ...(selectedMembers.includes(member.id) ? styles.checkIconSelected : {}),
                                        }}>
                                            {selectedMembers.includes(member.id) && (
                                                <Check size={12} color="var(--color-background)" strokeWidth={3} />
                                            )}
                                        </div>
                                    ) : selectedMembers.includes(member.id) ? (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={customAmounts[member.id] || ""}
                                                onChange={(e) => handleCustomAmountChange(member.id, e.target.value)}
                                                style={styles.customAmountInput}
                                                step="0.01"
                                                min="0"
                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                            />
                                        </div>
                                    ) : (
                                        <div style={styles.checkIcon} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {formData.splitType === "equal" && selectedMembers.length > 0 && formData.amount && (
                            <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--color-muted)", textAlign: "center" }}>
                                {currencySymbol}
                                {(parseFloat(formData.amount) / selectedMembers.length).toFixed(2)} per person
                            </p>
                        )}

                        {formData.splitType === "custom" && (
                            <div style={{ marginTop: "12px", textAlign: "center" }}>
                                <p style={{ fontSize: "14px", color: "var(--color-muted)" }}>
                                    Total: {formatCurrency(selectedCustomTotal, currencyCode)} / {formatCurrency(parseFloat(formData.amount || "0"), currencyCode)}
                                </p>
                                {Math.abs(selectedCustomTotal - parseFloat(formData.amount || "0")) > 0.01 && (
                                    <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                        Amounts must match total
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{ ...styles.submitBtn, opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? (
                            <>
                                <div style={{
                                    width: "18px",
                                    height: "18px",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "white",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }} />
                                {isEditing ? "Saving..." : "Adding..."}
                            </>
                        ) : (
                            <>
                                <DollarSign size={18} />
                                {isEditing ? "Save Changes" : "Add Expense"}
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
