"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User, ShieldCheck, ChevronRight, CreditCard, Camera } from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OnboardingPage() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Personal Info
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");

    // Step 2: Payment Info
    const [upiId, setUpiId] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [ifsc, setIfsc] = useState("");

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setUsername(user.username || "");
            setUpiId(user.paymentDetails?.upiId || "");
            setBankAccount(user.paymentDetails?.bankAccountNumber || "");
            setIfsc(user.paymentDetails?.ifscCode || "");
        }
    }, [user]);

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !username.trim()) {
            alert("First Name and Username are required");
            return;
        }

        setLoading(true);
        try {
            await updateProfile({ firstName, lastName, username });
            setStep(2);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        setLoading(true);
        try {
            await updateProfile({
                paymentDetails: {
                    upiId,
                    bankAccountNumber: bankAccount,
                    ifscCode: ifsc
                }
            });
            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating payment details:", error);
            alert("Failed to update payment details");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.push("/dashboard");
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
        },
        container: {
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "var(--color-card)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)",
            border: "1px solid var(--color-border)",
        },
        header: {
            marginBottom: "32px",
            textAlign: "center" as const,
        },
        title: {
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "8px",
            background: "linear-gradient(135deg, #0095F6 0%, #00D4AA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
        },
        subtitle: {
            color: "var(--color-muted)",
            fontSize: "15px",
            lineHeight: "1.5",
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
            color: "var(--color-foreground)",
            marginLeft: "4px",
        },
        input: {
            width: "100%",
            padding: "14px 16px",
            fontSize: "15px",
            backgroundColor: "var(--color-background)", // Contrast against card
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            outline: "none",
            transition: "all 0.2s",
        },
        button: {
            width: "100%",
            padding: "16px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "opacity 0.2s",
        },
        skipBtn: {
            backgroundColor: "transparent",
            color: "var(--color-muted)",
            fontWeight: 600,
            marginTop: "8px",
        },
        progress: {
            display: "flex",
            gap: "8px",
            marginBottom: "32px",
            justifyContent: "center",
        },
        progressStep: {
            width: "40px",
            height: "4px",
            borderRadius: "2px",
            backgroundColor: "var(--color-border)",
        },
        stepActive: {
            backgroundColor: "#0095F6",
        },
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.progress}>
                    <div style={{ ...styles.progressStep, ...styles.stepActive }} />
                    <div style={{ ...styles.progressStep, ...(step === 2 ? styles.stepActive : {}) }} />
                </div>

                <div style={styles.header}>
                    <h1 style={styles.title}>
                        {step === 1 ? "Let's get you set up" : "Add Payment Details"}
                    </h1>
                    <p style={styles.subtitle}>
                        {step === 1 ? "Create your profile to start splitting bills." : "Add details to receive money directly."}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleStep1Submit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>First Name</label>
                            <input
                                style={styles.input}
                                placeholder="e.g. Raghav"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Last Name</label>
                            <input
                                style={styles.input}
                                placeholder="e.g. Gupta"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Username</label>
                            <input
                                style={styles.input}
                                placeholder="@username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? "Saving..." : "Next Step"} <ChevronRight size={20} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleStep2Submit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>UPI ID <span style={{ fontWeight: 400, color: "var(--color-muted)" }}>(Recommended)</span></label>
                            <input
                                style={styles.input}
                                placeholder="username@upi"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                            <span style={{ fontSize: "12px", color: "var(--color-muted)", fontWeight: 500 }}>OR</span>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Bank Account Number</label>
                            <input
                                style={styles.input}
                                placeholder="XXXXXXXXXXXXXXXX"
                                value={bankAccount}
                                onChange={e => setBankAccount(e.target.value)}
                                type="password"
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>IFSC Code</label>
                            <input
                                style={styles.input}
                                placeholder="SBIN000XXXX"
                                value={ifsc}
                                onChange={e => setIfsc(e.target.value.toUpperCase())}
                            />
                        </div>

                        <div>
                            <button type="submit" style={styles.button} disabled={loading}>
                                {loading ? "Finishing..." : "Complete Setup"} <ShieldCheck size={20} />
                            </button>
                            <button type="button" onClick={handleSkip} style={{ ...styles.button, ...styles.skipBtn }}>
                                Skip for now
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
