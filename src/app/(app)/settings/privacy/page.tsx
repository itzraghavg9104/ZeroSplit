"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";

export default function PrivacyPage() {
    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "80px",
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
        content: {
            fontSize: "15px",
            lineHeight: "1.6",
            color: "var(--color-muted)",
        },
        sectionTitle: {
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--color-foreground)",
            marginTop: "24px",
            marginBottom: "8px",
        },
        p: {
            marginBottom: "16px",
        },
        list: {
            marginLeft: "20px",
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
                    <h1 style={styles.title}>Privacy Policy</h1>
                </div>

                <div style={styles.content}>
                    <p style={styles.p}>Last updated: December 05, 2025</p>

                    <p style={styles.p}>
                        At ZeroSplit, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.
                    </p>

                    <h3 style={styles.sectionTitle}>1. Information We Collect</h3>
                    <p style={styles.p}>We collect the following types of information:</p>
                    <ul style={styles.list}>
                        <li>Personal Information: Name, email address, and profile picture (if provided).</li>
                        <li>Group Data: Group names, expenses, and transaction history.</li>
                        <li>Payment Details: UPI IDs and bank account details you choose to save.</li>
                    </ul>

                    <h3 style={styles.sectionTitle}>2. How We Use Your Information</h3>
                    <p style={styles.p}>We use your information to:</p>
                    <ul style={styles.list}>
                        <li>Facilitate expense splitting and settlements.</li>
                        <li>Manage your account and authentication.</li>
                        <li>Improve the app's functionality and user experience.</li>
                    </ul>

                    <h3 style={styles.sectionTitle}>3. Data Security</h3>
                    <p style={styles.p}>
                        We implement security measures to protect your data. Your payment details (like UPI IDs) are stored securely and only shown to group members you are settling expenses with.
                    </p>

                    <h3 style={styles.sectionTitle}>4. Contact Us</h3>
                    <p style={styles.p}>
                        If you have any questions about this Privacy Policy, please contact us via the Support section in the app.
                    </p>
                </div>
            </main>
        </div>
    );
}
