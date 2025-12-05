"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import MobileNav from "@/components/layout/MobileNav";

export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How do I split expenses unequally?",
            answer: "When adding an expense, toggle the split type from 'Equally' to 'Unequally', then select 'Custom' to manually enter amounts for each person."
        },
        {
            question: "Is my payment information secure?",
            answer: "Yes, we only store your payment details (UPI ID/Bank Info) to display them to your friends when they need to pay you. We do not process payments directly."
        },
        {
            question: "How do I delete a group?",
            answer: "Currently, only the group creator can delete a group. Go to the group settings to find the delete option."
        },
        {
            question: "Can I use ZeroSplit offline?",
            answer: "ZeroSplit is designed to work best online. However, some data may be cached for viewing offline."
        }
    ];

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
        section: {
            marginBottom: "32px",
        },
        sectionTitle: {
            fontSize: "16px",
            fontWeight: 600,
            marginBottom: "16px",
        },
        faqItem: {
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            marginBottom: "8px",
            overflow: "hidden",
        },
        faqHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "15px",
        },
        faqContent: {
            padding: "0 16px 16px 16px",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "var(--color-muted)",
            borderTop: "1px solid var(--color-border)",
            marginTop: "-8px",
            paddingTop: "16px",
        },
        contactCard: {
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "24px",
            textAlign: "center" as const,
        },
        contactIcon: {
            width: "48px",
            height: "48px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#0095F6",
        },
        contactTitle: {
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "8px",
        },
        contactText: {
            fontSize: "14px",
            color: "var(--color-muted)",
            marginBottom: "20px",
        },
        contactBtn: {
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#0095F6",
            color: "white",
            padding: "12px 24px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "15px",
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
                    <h1 style={styles.title}>Help & Support</h1>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
                    <div>
                        {faqs.map((faq, index) => (
                            <div key={index} style={styles.faqItem}>
                                <div style={styles.faqHeader} onClick={() => toggleFaq(index)}>
                                    <span>{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={18} color="var(--color-muted)" /> : <ChevronDown size={18} color="var(--color-muted)" />}
                                </div>
                                {openFaq === index && (
                                    <div style={styles.faqContent}>
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Still need help?</h2>
                    <div style={styles.contactCard}>
                        <div style={styles.contactIcon}>
                            <MessageSquare size={24} />
                        </div>
                        <h3 style={styles.contactTitle}>Contact Support</h3>
                        <p style={styles.contactText}>
                            Have a persistent issue or a feature suggestion? <br />
                            We'd love to hear from you.
                        </p>
                        <a href="mailto:support@zerosplit.com?subject=ZeroSplit%20Support%20Request" style={styles.contactBtn}>
                            <Mail size={18} />
                            Email Us
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
