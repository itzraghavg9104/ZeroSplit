"use client";

import Link from "next/link";
import { ArrowLeft, Heart, Sparkles, Calculator, Smartphone, Layers, Users, TrendingUp, Shuffle, CheckCircle2 } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";

export default function AboutPage() {
    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "100px",
        },
        main: {
            padding: "16px",
            maxWidth: "600px",
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
            marginBottom: "40px",
            textAlign: "center" as const,
        },
        logo: {
            width: "80px",
            height: "80px",
            marginBottom: "16px",
            borderRadius: "20px",
        },
        appName: {
            fontSize: "26px",
            fontWeight: 800,
            marginBottom: "8px",
            letterSpacing: "-0.5px",
        },
        tagline: {
            color: "var(--color-muted)",
            fontSize: "16px",
            maxWidth: "300px",
            lineHeight: 1.5,
        },
        section: {
            marginBottom: "40px",
        },
        sectionTitle: {
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
        },
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "20px",
            border: "1px solid var(--color-border)",
            padding: "24px",
            marginBottom: "16px",
        },
        featureGrid: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "20px",
        },
        featureItem: {
            display: "flex",
            gap: "16px",
        },
        featureIcon: {
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#0095F6",
        },
        stepList: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "24px",
            position: "relative" as const,
        },
        stepItem: {
            display: "flex",
            gap: "16px",
            position: "relative" as const,
            zIndex: 1,
        },
        stepNumber: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "var(--color-foreground)",
            color: "var(--color-background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "14px",
            flexShrink: 0,
        },
        stepLine: {
            position: "absolute" as const,
            left: "15px",
            top: "32px",
            bottom: "-24px",
            width: "2px",
            backgroundColor: "var(--color-border)",
            zIndex: 0,
        },
        algoBox: {
            backgroundColor: "var(--color-secondary)",
            borderRadius: "16px",
            padding: "20px",
            fontFamily: "monospace",
            fontSize: "13px",
            lineHeight: 1.6,
        },
        footer: {
            textAlign: "center" as const,
            padding: "40px 20px",
            color: "var(--color-muted)",
            fontSize: "13px",
            borderTop: "1px solid var(--color-border)",
            marginTop: "40px",
        },
    };

    const features = [
        {
            icon: Shuffle,
            title: "Smart Settlements",
            description: "Our algorithm minimizes transactions. If A owes B, and B owes C, we tell A to pay C directly, skipping B entirely.",
        },
        {
            icon: Smartphone,
            title: "UPI Integration",
            description: "Settle debts instantly. Add your UPI ID or Bank Details to your profile and get paid with a single tap.",
        },
        {
            icon: Users,
            title: "Group Management",
            description: "Create groups for trips, roommates, or events. Invite friends via link or username search.",
        },
        {
            icon: Layers,
            title: "Activity Log",
            description: "Track every action. See who added an expense, who paid whom, and when someone joined.",
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
                    <p style={styles.tagline}>The easiest way to share expenses with friends and family.</p>
                </div>

                {/* How it Works */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <TrendingUp size={20} color="#0095F6" />
                        How It Works
                    </h2>
                    <div style={styles.card}>
                        <div style={styles.stepList}>
                            {[
                                { title: "Create a Group", desc: "Start a group for 'Trip to Goa' or 'Flat 101' and invite members." },
                                { title: "Add Expenses", desc: "Pay for dinner? Add it. Split equally or by specific amounts." },
                                { title: "See Who Owes Who", desc: "We constantly calculate net balances. No math required." },
                                { title: "Settle Up", desc: "Pay back friends via UPI/Bank and record the payment to zero the balance." }
                            ].map((step, i, arr) => (
                                <div key={i} style={styles.stepItem}>
                                    {i < arr.length - 1 && <div style={styles.stepLine} />}
                                    <div style={styles.stepNumber}>{i + 1}</div>
                                    <div style={{ paddingBottom: i < arr.length - 1 ? "0" : "0" }}>
                                        <h3 style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>{step.title}</h3>
                                        <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.5 }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* The Algorithm */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <Calculator size={20} color="#0095F6" />
                        The Algorithm
                    </h2>
                    <div style={styles.card}>
                        <p style={{ fontSize: "14px", color: "var(--color-muted)", marginBottom: "16px", lineHeight: 1.6 }}>
                            We use a "Graph Simplification" algorithm to ensure the fewest number of payments are made.
                        </p>

                        <div style={styles.algoBox}>
                            <p style={{ marginBottom: "8px", fontWeight: 600, color: "var(--color-foreground)" }}>Example Scenario:</p>
                            <p>• Alice owes Bob ₹500</p>
                            <p>• Bob owes Charlie ₹500</p>
                            <p>• Charlie owes Alice ₹100</p>

                            <div style={{ height: "1px", backgroundColor: "var(--color-border)", margin: "12px 0" }} />

                            <p style={{ marginBottom: "8px", fontWeight: 600, color: "#0095F6" }}>ZeroSplit Calculation:</p>
                            <p>Instead of 3 separate transactions, we simplify it:</p>
                            <p style={{ marginTop: "8px", color: "var(--color-foreground)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <CheckCircle2 size={14} color="#22c55e" />
                                <span>Alice pays Charlie ₹400</span>
                            </p>
                            <p style={{ marginTop: "4px", fontSize: "12px", color: "var(--color-muted)" }}>
                                (Bob pays nothing and receives nothing. Everyone is settled!)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Features */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <Sparkles size={20} color="#0095F6" />
                        Key Features
                    </h2>
                    <div style={styles.featureGrid}>
                        {features.map((feature, index) => (
                            <div key={index} style={styles.card}>
                                <div style={styles.featureItem}>
                                    <div style={styles.featureIcon}>
                                        <feature.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: "6px" }}>{feature.title}</h3>
                                        <p style={{ fontSize: "14px", color: "var(--color-muted)", lineHeight: 1.5 }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.footer}>
                    <Heart size={20} color="#ef4444" fill="#ef4444" style={{ marginBottom: "12px", display: "inline-block" }} />
                    <p style={{ fontWeight: 500, marginBottom: "4px" }}>Built for fair friendships</p>
                    <p>© 2025 ZeroSplit. All rights reserved.</p>
                </div>
            </main>
        </div>
    );
}
