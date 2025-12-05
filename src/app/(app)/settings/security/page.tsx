"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import MobileNav from "@/components/layout/MobileNav";

export default function SecurityPage() {
    const { user, firebaseUser, updateUserPassword, sendVerificationEmail } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [verifying, setVerifying] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            await updateUserPassword(newPassword);
            setMessage("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            if (err.code === "auth/requires-recent-login") {
                setError("For security, please log out and log back in to change your password.");
            } else {
                setError(err.message || "Failed to update password");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async () => {
        setVerifying(true);
        try {
            await sendVerificationEmail();
            setMessage("Verification email sent! Check your inbox.");
        } catch (err: any) {
            setError(err.message || "Failed to send verification email");
        } finally {
            setVerifying(false);
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "80px",
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
            marginBottom: "32px",
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
        section: {
            marginBottom: "24px",
        },
        sectionTitle: {
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-muted)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            marginBottom: "12px",
        },
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "20px",
        },
        inputGroup: {
            marginBottom: "16px",
        },
        label: {
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--color-muted)",
        },
        input: {
            width: "100%",
            padding: "12px",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            color: "var(--color-foreground)",
            fontSize: "15px",
            outline: "none",
        },
        submitBtn: {
            width: "100%",
            padding: "12px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: isLoading ? 0.7 : 1,
        },
        status: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px",
            borderRadius: "10px",
            fontSize: "14px",
            marginBottom: "16px",
        },
        verified: {
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e",
        },
        unverified: {
            backgroundColor: "rgba(234, 179, 8, 0.1)",
            color: "#eab308",
        },
        message: {
            padding: "12px",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "12px",
            color: "#22c55e",
            fontSize: "14px",
            textAlign: "center" as const,
            marginBottom: "16px",
        },
        error: {
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            color: "#ef4444",
            fontSize: "14px",
            textAlign: "center" as const,
            marginBottom: "16px",
        }
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <Link href="/settings">
                        <button style={styles.backBtn}>
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 style={styles.title}>Security</h1>
                </div>

                {message && <div style={styles.message}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}

                {/* Account Verification */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Account Verification</p>
                    <div style={styles.card}>
                        {firebaseUser?.emailVerified ? (
                            <div style={{ ...styles.status, ...styles.verified }}>
                                <CheckCircle size={20} />
                                <span>Email Verified</span>
                            </div>
                        ) : (
                            <div>
                                <div style={{ ...styles.status, ...styles.unverified }}>
                                    <AlertTriangle size={20} />
                                    <span>Email not verified</span>
                                </div>
                                <button
                                    onClick={handleVerification}
                                    disabled={verifying}
                                    style={{
                                        ...styles.submitBtn,
                                        backgroundColor: "var(--color-secondary)",
                                        color: "var(--color-foreground)",
                                        marginTop: "8px"
                                    }}
                                >
                                    {verifying ? "Sending..." : "Send Verification Email"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Change Password</p>
                    <div style={styles.card}>
                        {firebaseUser?.providerData.some(p => p.providerId === "google.com") ? (
                            <div style={{ textAlign: "center", padding: "12px" }}>
                                <div style={{
                                    width: "48px", height: "48px",
                                    backgroundColor: "var(--color-secondary)",
                                    borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 12px"
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Signed in with Google</h3>
                                <p style={{ fontSize: "14px", color: "var(--color-muted)" }}>
                                    Your account is managed by Google. Please change your password in your Google Account settings.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordChange}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                                    {isLoading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
