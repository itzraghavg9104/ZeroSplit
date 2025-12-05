"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Sun, Moon, Bell, Globe, Shield, HelpCircle, ChevronRight, Smartphone, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import MobileNav from "@/components/layout/MobileNav";

export default function SettingsPage() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { user, updateProfile } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [updatingCurrency, setUpdatingCurrency] = useState(false);

    const currencies = [
        { code: "INR", symbol: "₹", name: "Indian Rupee" },
        { code: "USD", symbol: "$", name: "US Dollar" },
        { code: "EUR", symbol: "€", name: "Euro" },
        { code: "GBP", symbol: "£", name: "British Pound" },
        { code: "JPY", symbol: "¥", name: "Japanese Yen" }
    ];

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("App is already installed or not available for installation.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    const handleCurrencyChange = async (currencyCode: string) => {
        setUpdatingCurrency(true);
        try {
            await updateProfile({ currency: currencyCode });
            setShowCurrencyModal(false);
        } catch (error) {
            console.error("Error updating currency:", error);
        } finally {
            setUpdatingCurrency(false);
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
            overflow: "hidden",
        },
        row: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid var(--color-border)",
        },
        rowLast: {
            borderBottom: "none",
        },
        rowLeft: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        rowIcon: {
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        rowLabel: {
            fontSize: "15px",
            fontWeight: 500,
        },
        rowValue: {
            fontSize: "14px",
            color: "var(--color-muted)",
        },
        toggle: {
            width: "50px",
            height: "28px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            position: "relative" as const,
            transition: "background-color 0.2s",
        },
        toggleKnob: {
            position: "absolute" as const,
            top: "2px",
            width: "24px",
            height: "24px",
            backgroundColor: "white",
            borderRadius: "50%",
            transition: "left 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        },
        themeSelector: {
            display: "flex",
            gap: "8px",
        },
        themeBtn: {
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            backgroundColor: "transparent",
            color: "var(--color-foreground)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
        },
        themeBtnActive: {
            backgroundColor: "#0095F6",
            borderColor: "#0095F6",
            color: "white",
        },
        version: {
            textAlign: "center" as const,
            marginTop: "32px",
            color: "var(--color-muted)",
            fontSize: "13px",
        },
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <Link href="/profile">
                        <button style={styles.backBtn}>
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 style={styles.title}>Settings</h1>
                </div>

                {/* Appearance */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Appearance</p>
                    <div style={styles.card}>
                        <div style={{ ...styles.row, ...styles.rowLast }}>
                            <div style={styles.rowLeft}>
                                <div style={styles.rowIcon}>
                                    {resolvedTheme === "dark" ? (
                                        <Moon size={20} color="#0095F6" />
                                    ) : (
                                        <Sun size={20} color="#0095F6" />
                                    )}
                                </div>
                                <div>
                                    <p style={styles.rowLabel}>Theme</p>
                                </div>
                            </div>
                            <div style={styles.themeSelector}>
                                <button
                                    style={{
                                        ...styles.themeBtn,
                                        ...(theme === "light" ? styles.themeBtnActive : {}),
                                    }}
                                    onClick={() => setTheme("light")}
                                >
                                    Light
                                </button>
                                <button
                                    style={{
                                        ...styles.themeBtn,
                                        ...(theme === "dark" ? styles.themeBtnActive : {}),
                                    }}
                                    onClick={() => setTheme("dark")}
                                >
                                    Dark
                                </button>
                                <button
                                    style={{
                                        ...styles.themeBtn,
                                        ...(theme === "system" ? styles.themeBtnActive : {}),
                                    }}
                                    onClick={() => setTheme("system")}
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Preferences</p>
                    <div style={styles.card}>
                        <button
                            onClick={() => setShowCurrencyModal(true)}
                            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "inherit", padding: 0 }}
                        >
                            <div style={styles.row}>
                                <div style={styles.rowLeft}>
                                    <div style={styles.rowIcon}>
                                        <Globe size={20} color="#0095F6" />
                                    </div>
                                    <div>
                                        <p style={styles.rowLabel}>Currency</p>
                                        <p style={styles.rowValue}>{user?.currency || "INR"}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </div>
                        </button>
                        <button
                            onClick={handleInstallClick}
                            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "inherit", padding: 0 }}
                        >
                            <div style={{ ...styles.row, ...styles.rowLast }}>
                                <div style={styles.rowLeft}>
                                    <div style={styles.rowIcon}>
                                        <Smartphone size={20} color="#0095F6" />
                                    </div>
                                    <div>
                                        <p style={styles.rowLabel}>Install App</p>
                                        <p style={styles.rowValue}>Add to home screen</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Currency Modal */}
                {showCurrencyModal && (
                    <div style={{
                        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
                    }} onClick={() => setShowCurrencyModal(false)}>
                        <div style={{
                            backgroundColor: "var(--color-card)", width: "300px", borderRadius: "16px",
                            padding: "20px", maxHeight: "80vh", overflowY: "auto"
                        }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginBottom: "16px", fontWeight: 600 }}>Select Currency</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {currencies.map(c => (
                                    <button
                                        key={c.code}
                                        onClick={() => handleCurrencyChange(c.code)}
                                        disabled={updatingCurrency}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--color-border)",
                                            backgroundColor: user?.currency === c.code ? "#0095F6" : "transparent",
                                            color: user?.currency === c.code ? "white" : "var(--color-foreground)",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <span>{c.name} ({c.symbol})</span>
                                        <span style={{ fontWeight: 600 }}>{c.code}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowCurrencyModal(false)}
                                style={{
                                    marginTop: "16px", width: "100%", padding: "10px",
                                    borderRadius: "8px", border: "none", background: "var(--color-secondary)",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Security */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Security</p>
                    <div style={styles.card}>
                        <Link href="/settings/security" style={{ textDecoration: "none", color: "inherit" }}>
                            <div style={{ ...styles.row, ...styles.rowLast }}>
                                <div style={styles.rowLeft}>
                                    <div style={styles.rowIcon}>
                                        <Shield size={20} color="#0095F6" />
                                    </div>
                                    <div>
                                        <p style={styles.rowLabel}>Security Settings</p>
                                        <p style={styles.rowValue}>Password, Verification</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Support */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Support</p>
                    <div style={styles.card}>
                        <Link href="/settings/support" style={{ textDecoration: "none", color: "inherit" }}>
                            <div style={styles.row}>
                                <div style={styles.rowLeft}>
                                    <div style={styles.rowIcon}>
                                        <HelpCircle size={20} color="#0095F6" />
                                    </div>
                                    <div>
                                        <p style={styles.rowLabel}>Help & Support</p>
                                        <p style={styles.rowValue}>FAQs, Contact Us</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </div>
                        </Link>
                        <Link href="/settings/privacy" style={{ textDecoration: "none", color: "inherit" }}>
                            <div style={{ ...styles.row, ...styles.rowLast }}>
                                <div style={styles.rowLeft}>
                                    <div style={styles.rowIcon}>
                                        <Shield size={20} color="#0095F6" />
                                    </div>
                                    <div>
                                        <p style={styles.rowLabel}>Privacy Policy</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--color-muted)" />
                            </div>
                        </Link>
                    </div>
                </div>

                <p style={styles.version}>ZeroSplit v1.0.0</p>
            </main>
        </div>
    );
}
