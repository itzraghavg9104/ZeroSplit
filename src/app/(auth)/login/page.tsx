"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();
    const { resolvedTheme, setTheme, theme } = useTheme();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        } else {
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await signIn(formData.email, formData.password);
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Login failed";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setIsLoading(true);

        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Google Sign-In failed";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logoFilter = resolvedTheme === "dark" ? "invert(1)" : "none";

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            padding: "16px",
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
        container: {
            maxWidth: "400px",
            margin: "0 auto",
        },
        logo: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            marginBottom: "32px",
        },
        logoImg: {
            height: "48px",
            width: "auto",
            marginBottom: "24px",
            filter: logoFilter,
        },
        title: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
        },
        subtitle: {
            color: "var(--color-muted)",
            fontSize: "14px",
        },
        form: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "16px",
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
        eyeBtn: {
            position: "absolute" as const,
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: "pointer",
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
        divider: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "24px 0",
        },
        dividerLine: {
            flex: 1,
            height: "1px",
            backgroundColor: "var(--color-border)",
        },
        googleBtn: {
            width: "100%",
            padding: "14px",
            backgroundColor: "var(--color-card)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
        },
        footer: {
            textAlign: "center" as const,
            marginTop: "24px",
            fontSize: "14px",
            color: "var(--color-muted)",
        },
    };

    return (
        <main style={styles.page}>
            <div style={styles.header}>
                <Link href="/">
                    <button style={styles.backBtn}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                </Link>
                <button onClick={toggleTheme} style={styles.themeBtn}>
                    {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div style={styles.container}>
                <div style={styles.logo}>
                    <img src="/logoFull.png" alt="ZeroSplit" style={styles.logoImg} />
                    <h1 style={styles.title}>Welcome back</h1>
                    <p style={styles.subtitle}>Sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div style={{ textAlign: "right", marginTop: "4px" }}>
                            <Link href="/forgot-password" style={{ fontSize: "12px", color: "#0095F6", fontWeight: 500 }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={{ color: "var(--color-muted)", fontSize: "13px" }}>or</span>
                    <div style={styles.dividerLine} />
                </div>

                <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} style={styles.googleBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p style={styles.footer}>
                    Don't have an account?{" "}
                    <Link href="/signup" style={{ color: "#0095F6", fontWeight: 500 }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}
