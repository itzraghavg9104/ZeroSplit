"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, CreditCard } from "lucide-react";
import { User, Group, PaymentDetails } from "@/types";
import { Settlement } from "@/utils/settlements";
import { formatCurrency } from "@/lib/utils";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logActivity } from "@/utils/activity";

interface SettleModalProps {
    isOpen: boolean;
    onClose: () => void;
    settlement: Settlement | null;
    payee: User | null; // The person I am paying
    user: User; // Me
    groupId: string;
    groupName?: string;
}

export default function SettleModal({ isOpen, onClose, settlement, payee, user, groupId, groupName }: SettleModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank" | null>(null);
    const [isSettling, setIsSettling] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen || !settlement || !payee) return null;

    const confirmSettlement = async () => {
        setIsSettling(true);
        try {
            const settlementData = {
                groupId,
                description: "Settlement",
                amount: settlement.amount,
                payerId: user.id,
                splits: [{
                    memberId: settlement.to,
                    amount: settlement.amount
                }],
                splitType: "equal",
                createdBy: user.id,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                type: "settlement",
                isSettlement: true
            };

            await addDoc(collection(db, "expenses"), settlementData);

            await logActivity(
                user.id,
                "settlement",
                `paid ${payee.firstName} ${formatCurrency(settlement.amount, user.currency)}`,
                groupId,
                groupName
            );

            onClose();
        } catch (error) {
            console.error("Error settling:", error);
            alert("Failed to settle. Please try again.");
        } finally {
            setIsSettling(false);
        }
    };

    // Styles (Consistent)
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
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            padding: "16px",
            marginBottom: "12px",
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
        paymentLabel: {
            color: "var(--color-muted)",
        },
    };

    return (
        <div style={styles.modal} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Zero The Split</h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <p style={{ color: "var(--color-muted)", marginBottom: "4px" }}>You are paying</p>
                    <h3 style={{ fontSize: "28px", fontWeight: 700 }}>
                        {formatCurrency(settlement.amount, user.currency)}
                    </h3>
                    <p style={{ fontSize: "14px", marginTop: "4px" }}>
                        to <strong>{payee.firstName} {payee.lastName}</strong>
                    </p>
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
                            {payee.paymentDetails?.upiId ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "16px", fontWeight: 500, flex: 1 }}>
                                        {payee.paymentDetails.upiId}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(payee.paymentDetails?.upiId || "");
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

                        {payee.paymentDetails?.upiId && (
                            <a
                                href={`upi://pay?pa=${payee.paymentDetails.upiId}&pn=${payee.firstName}&am=${settlement.amount}&cu=INR&tn=Settlement`}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={styles.card}>
                            <div style={{ marginBottom: "12px" }}>
                                <p style={styles.paymentLabel}>Account Number</p>
                                <p style={{ fontSize: "16px", fontWeight: 500 }}>
                                    {payee.paymentDetails?.bankAccountNumber || "Not provided"}
                                </p>
                            </div>
                            <div>
                                <p style={styles.paymentLabel}>IFSC Code</p>
                                <p style={{ fontSize: "16px", fontWeight: 500 }}>
                                    {payee.paymentDetails?.ifscCode || "Not provided"}
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
    );
}
