"use client";

import Link from "next/link";
import { ArrowLeft, Heart, Github, Globe, Shield, Sparkles } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";

export default function AboutPage() {
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
        logoSection: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            marginBottom: "32px",
        },
        logo: {
            width: "80px",
            height: "80px",
            marginBottom: "16px",
            borderRadius: "20px",
        },
        appName: {
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "4px",
        },
        version: {
            color: "var(--color-muted)",
            fontSize: "14px",
        },
        section: {
            marginBottom: "24px",
        },
        sectionTitle: {
            fontSize: "16px",
            fontWeight: 600,
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        text: {
            color: "var(--color-muted)",
            fontSize: "14px",
            lineHeight: 1.7,
        },
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "20px",
            marginBottom: "16px",
        },
        featureList: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "12px",
        },
        featureItem: {
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
        },
        featureIcon: {
            width: "32px",
            height: "32px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        },
        footer: {
            textAlign: "center" as const,
            padding: "24px",
            color: "var(--color-muted)",
            fontSize: "13px",
        },
    };

    const features = [
        {
            icon: Sparkles,
            title: "Smart Splitting",
            description: "Split expenses equally or customize amounts for each member.",
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Your data is encrypted and securely stored in the cloud.",
        },
        {
            icon: Globe,
            title: "Works Offline",
            description: "Use the app even without internet. Data syncs when you're back online.",
        },
    ];

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
                    <h1 style={styles.title}>About</h1>
                </div>

                <div style={styles.logoSection}>
                    <img src="/logoIcon.png" alt="ZeroSplit" style={styles.logo} />
                    <p style={styles.appName}>ZeroSplit</p>
                    <p style={styles.version}>Version 1.0.0</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <Heart size={18} color="#0095F6" />
                        About ZeroSplit
                    </h2>
                    <p style={styles.text}>
                        ZeroSplit makes splitting expenses with friends and family simple and fair.
                        Whether you're on a trip, sharing rent, or just grabbing dinner – we've got you covered.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <Sparkles size={18} color="#0095F6" />
                        Features
                    </h2>
                    <div style={styles.card}>
                        <div style={styles.featureList}>
                            {features.map((feature, index) => (
                                <div key={index} style={styles.featureItem}>
                                    <div style={styles.featureIcon}>
                                        <feature.icon size={16} color="#0095F6" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, marginBottom: "4px" }}>{feature.title}</p>
                                        <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <p>Made with ❤️ for fair expense splitting</p>
                    <p style={{ marginTop: "8px" }}>© 2024 ZeroSplit. All rights reserved.</p>
                </div>
            </main>
        </div>
    );
}
