"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const { resolvedTheme, theme, setTheme } = useTheme();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        } else {
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            await resetPassword(email);
            setMessage("Check your inbox for password reset instructions.");
        } catch (err: any) {
            setError(err.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            padding: "16px",
            display: "flex",
            flexDirection: "column" as const,
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
        },
        backBtn: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "var(--color-foreground)",
            fontSize: "14px",
            cursor: "pointer",
        },
        container: {
            maxWidth: "400px",
            width: "100%",
            margin: "0 auto",
            flex: 1,
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "center",
        },
        title: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
        },
        subtitle: {
            color: "var(--color-muted)",
            fontSize: "14px",
            marginBottom: "32px",
        },
        form: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "16px",
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "6px",
        },
        label: {
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-muted)",
        },
        inputWrapper: {
            position: "relative" as const,
        },
        input: {
            width: "100%",
            padding: "14px 16px 14px 44px",
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "15px",
            outline: "none",
        },
        inputIcon: {
            position: "absolute" as const,
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-muted)",
        },
        submitBtn: {
            width: "100%",
            padding: "14px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: isLoading ? 0.7 : 1,
            marginTop: "8px",
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
        <main style={styles.page}>
            <div style={styles.header}>
                <Link href="/login">
                    <button style={styles.backBtn}>
                        <ArrowLeft size={20} />
                        Back to Login
                    </button>
                </Link>
            </div>

            <div style={styles.container}>
                <div>
                    <h1 style={styles.title}>Reset Password</h1>
                    <p style={styles.subtitle}>Enter your email to receive reset instructions</p>
                </div>

                {message && <div style={styles.message}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
            </div>
        </main>
    );
}
