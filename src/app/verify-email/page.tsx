"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, CheckCircle, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import DotGrid from "@/components/ui/DotGrid";
import Link from "next/link";

export default function VerifyEmailPage() {
    const { firebaseUser, sendVerificationEmail, user } = useAuth();
    const router = useRouter();
    const { resolvedTheme, setTheme, theme } = useTheme();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [verifying, setVerifying] = useState(false);

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        } else {
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    useEffect(() => {
        // If user is verified, redirect to dashboard
        if (firebaseUser?.emailVerified) {
            router.replace("/dashboard");
        }
    }, [firebaseUser, router]);

    const handleResendEmail = async () => {
        setSending(true);
        setMessage("");
        try {
            await sendVerificationEmail();
            setMessage("Verification email sent! Please check your inbox.");
        } catch (error: any) {
            if (error.code === 'auth/too-many-requests') {
                setMessage("Too many requests. Please wait a moment before trying again.");
            } else {
                setMessage("Failed to send email. " + error.message);
            }
        } finally {
            setSending(false);
        }
    };

    const handleVerifiedCheck = async () => {
        setVerifying(true);
        try {
            // Reload user to get updated emailVerified status
            await firebaseUser?.reload();
            if (firebaseUser?.emailVerified) {
                router.replace("/dashboard");
            } else {
                setMessage("Email not verified yet. Please check your inbox and click the link.");
            }
        } catch (error: any) {
            setMessage("Error checking status. " + error.message);
        } finally {
            setVerifying(false);
        }
    };

    if (!firebaseUser) {
        // If not logged in, redirect to login
        if (typeof window !== 'undefined') router.replace("/login");
        return null;
    }

    const dotBaseColor = resolvedTheme === "dark" ? "#262626" : "#e5e5e5";
    const dotActiveColor = "#0095F6";
    const logoFilter = resolvedTheme === "dark" ? "invert(1)" : "none";

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            padding: "16px",
            position: "relative" as const,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column" as const,
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            position: "relative" as const,
            zIndex: 10,
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
        themeBtn: {
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "var(--color-foreground)",
            cursor: "pointer",
            borderRadius: "10px",
        },
        containerWrapper: {
            maxWidth: "440px",
            margin: "auto",
            width: "100%",
            position: "relative" as const,
            zIndex: 10,
        },
        cardContent: {
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            textAlign: "center" as const,
        },
        logoImg: {
            height: "40px",
            width: "auto",
            marginBottom: "24px",
            filter: logoFilter,
        },
        iconCircle: {
            width: "80px",
            height: "80px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            color: "#0095F6",
        },
        title: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "12px",
        },
        text: {
            color: "var(--color-muted)",
            fontSize: "15px",
            lineHeight: "1.5",
            marginBottom: "8px",
        },
        email: {
            color: "var(--color-foreground)",
            fontWeight: 600,
            marginBottom: "32px",
        },
        button: {
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        },
        primaryBtn: {
            backgroundColor: "#0095F6",
            color: "white",
        },
        secondaryBtn: {
            backgroundColor: "transparent",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
        },
        message: {
            marginTop: "16px",
            fontSize: "14px",
            color: message.includes("Failed") || message.includes("Too many") || message.includes("not verified") ? "#ef4444" : "#10b981",
        }
    };

    return (
        <main style={styles.page}>
            <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "auto" }}>
                <DotGrid
                    baseColor={dotBaseColor}
                    activeColor={dotActiveColor}
                    gap={32}
                    dotSize={4}
                    proximity={150}
                    shockRadius={200}
                />
            </div>

            <div style={styles.header}>
                <Link href="/login">
                    <button style={styles.backBtn}>
                        <ArrowLeft size={20} />
                        Back to Login
                    </button>
                </Link>
                <button onClick={toggleTheme} style={styles.themeBtn}>
                    {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div style={styles.containerWrapper}>
                <div className="animated-border-card">
                    <div className="animated-border-card-content" style={styles.cardContent}>
                        <img src="/logoFull.png" alt="ZeroSplit" style={styles.logoImg} />

                        <div style={styles.iconCircle}>
                            <Mail size={40} />
                        </div>

                        <h1 style={styles.title}>Verify your email</h1>
                        <p style={styles.text}>
                            We've sent a verification email to:
                        </p>
                        <p style={styles.email}>{firebaseUser.email}</p>
                        <p style={{ ...styles.text, fontSize: '14px', marginBottom: '32px' }}>
                            Please click the link in the email to verify your account.
                            If you don't see it, check your spam folder.
                        </p>

                        <button
                            onClick={handleVerifiedCheck}
                            style={{ ...styles.button, ...styles.primaryBtn }}
                            disabled={verifying}
                        >
                            {verifying ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            {verifying ? "Checking..." : "I've Verified My Email"}
                        </button>

                        <button
                            onClick={handleResendEmail}
                            style={{ ...styles.button, ...styles.secondaryBtn }}
                            disabled={sending}
                        >
                            {sending ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            {sending ? "Sending..." : "Resend Email"}
                        </button>

                        {message && <p style={styles.message}>{message}</p>}
                    </div>
                </div>
            </div>
        </main>
    );
}
