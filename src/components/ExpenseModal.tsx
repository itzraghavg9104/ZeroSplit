"use client";

import { useState, useEffect } from "react";
import { X, Users, Check } from "lucide-react";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { User, Expense, ExpenseSplit } from "@/types";
import { splitEqually, validateCustomSplit } from "@/lib/algorithms";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    members: User[];
    onExpenseAdded: (expense: Expense) => void;
}

export default function ExpenseModal({
    isOpen,
    onClose,
    groupId,
    members,
    onExpenseAdded,
}: ExpenseModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        payerId: user?.id || "",
    });
    const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSelectedMembers(members.map((m) => m.id));
            setFormData({
                description: "",
                amount: "",
                payerId: user?.id || "",
            });
            setSplitType("equal");
            setCustomSplits({});
            setError("");
        }
    }, [isOpen, members, user]);

    const toggleMember = (memberId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleCustomSplitChange = (memberId: string, value: string) => {
        setCustomSplits((prev) => ({ ...prev, [memberId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || selectedMembers.length === 0) return;

        setError("");
        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        let splits: ExpenseSplit[];

        if (splitType === "equal") {
            splits = splitEqually(amount, selectedMembers);
        } else {
            splits = selectedMembers.map((memberId) => ({
                memberId,
                amount: parseFloat(customSplits[memberId] || "0"),
            }));

            const validation = validateCustomSplit(amount, splits);
            if (!validation.valid) {
                setError(validation.message || "Invalid split");
                return;
            }
        }

        setIsLoading(true);

        try {
            const expenseData = {
                groupId,
                description: formData.description,
                amount,
                payerId: formData.payerId,
                splits,
                splitType,
                createdBy: user.id,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, "expenses"), expenseData);
            onExpenseAdded({ id: docRef.id, ...expenseData } as Expense);
            onClose();
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to add expense";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-background rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto animate-slideUp">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Add Expense</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Description"
                        placeholder="What was this expense for?"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        required
                    />

                    <Input
                        label="Amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        required
                    />

                    {/* Payer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Paid by
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {members.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, payerId: member.id }))
                                    }
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${formData.payerId === member.id
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <Avatar
                                        src={member.profilePicture}
                                        firstName={member.firstName}
                                        lastName={member.lastName}
                                        size="sm"
                                    />
                                    <span className="text-sm font-medium">
                                        {member.id === user?.id ? "You" : member.firstName}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Split Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Split type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setSplitType("equal")}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${splitType === "equal"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-primary/50"
                                    }`}
                            >
                                Equal
                            </button>
                            <button
                                type="button"
                                onClick={() => setSplitType("custom")}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${splitType === "custom"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-primary/50"
                                    }`}
                            >
                                Custom
                            </button>
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            <Users className="w-4 h-4 inline mr-1" />
                            Split among
                        </label>
                        <div className="space-y-2">
                            {members.map((member) => {
                                const isSelected = selectedMembers.includes(member.id);
                                const perPerson =
                                    splitType === "equal" && selectedMembers.length > 0
                                        ? parseFloat(formData.amount || "0") / selectedMembers.length
                                        : 0;

                                return (
                                    <div
                                        key={member.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? "border-primary/50 bg-primary/5" : "border-border"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleMember(member.id)}
                                                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected
                                                        ? "bg-primary text-white"
                                                        : "border border-border"
                                                    }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </button>
                                            <Avatar
                                                src={member.profilePicture}
                                                firstName={member.firstName}
                                                lastName={member.lastName}
                                                size="sm"
                                            />
                                            <span className="font-medium">
                                                {member.id === user?.id ? "You" : member.firstName}
                                            </span>
                                        </div>
                                        {isSelected &&
                                            (splitType === "equal" ? (
                                                <span className="text-sm text-muted">
                                                    ₹{perPerson.toFixed(2)}
                                                </span>
                                            ) : (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={customSplits[member.id] || ""}
                                                    onChange={(e) =>
                                                        handleCustomSplitChange(member.id, e.target.value)
                                                    }
                                                    className="w-24 px-2 py-1 bg-card border border-border rounded text-sm text-right"
                                                />
                                            ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Add Expense
                    </Button>
                </form>
            </div>
        </div>
    );
}
