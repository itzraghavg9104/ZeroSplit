"use client";

import { useState } from "react";
import { ArrowLeft, Sun, Moon, Bell, Globe, Shield, HelpCircle, ChevronRight, Smartphone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import MobileNav from "@/components/layout/MobileNav";

export default function SettingsPage() {
    const { user } = useAuth();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);

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

                {/* Notifications */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Notifications</p>
                    <div style={styles.card}>
                        <div style={{ ...styles.row, ...styles.rowLast }}>
                            <div style={styles.rowLeft}>
                                <div style={styles.rowIcon}>
                                    <Bell size={20} color="#0095F6" />
                                </div>
                                <div>
                                    <p style={styles.rowLabel}>Push Notifications</p>
                                </div>
                            </div>
                            <button
                                style={{
                                    ...styles.toggle,
                                    backgroundColor: notifications ? "#0095F6" : "var(--color-border)",
                                }}
                                onClick={() => setNotifications(!notifications)}
                            >
                                <div
                                    style={{
                                        ...styles.toggleKnob,
                                        left: notifications ? "24px" : "2px",
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Preferences</p>
                    <div style={styles.card}>
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
                    </div>
                </div>

                {/* Support */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Support</p>
                    <div style={styles.card}>
                        <div style={styles.row}>
                            <div style={styles.rowLeft}>
                                <div style={styles.rowIcon}>
                                    <HelpCircle size={20} color="#0095F6" />
                                </div>
                                <div>
                                    <p style={styles.rowLabel}>Help Center</p>
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--color-muted)" />
                        </div>
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
                    </div>
                </div>

                <p style={styles.version}>ZeroSplit v1.0.0</p>
            </main>
        </div>
    );
}
