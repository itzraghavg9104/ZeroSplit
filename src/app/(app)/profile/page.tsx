"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Camera, Mail, User as UserIcon, CreditCard, LogOut,
    AtSign, Info, ChevronRight, Wallet, Building2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import MobileNav from "@/components/layout/MobileNav";
import { uploadToCloudinary } from "@/utils/upload";
import { useRef } from "react";

export default function ProfilePage() {
    const router = useRouter();
    const { user, updateProfile, signOut } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"info" | "payment">("info");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
    });
    const [paymentData, setPaymentData] = useState({
        upiId: "",
        bankAccountNumber: "",
        ifscCode: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            await updateProfile({ profilePicture: imageUrl });
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                username: user.username || "",
            });
            setPaymentData({
                upiId: user.paymentDetails?.upiId || "",
                bankAccountNumber: user.paymentDetails?.bankAccountNumber || "",
                ifscCode: user.paymentDetails?.ifscCode || "",
            });
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "info") {
                await updateProfile(formData);
            } else {
                await updateProfile({
                    paymentDetails: paymentData,
                });
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
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
            justifyContent: "space-between",
            marginBottom: "24px",
        },
        title: {
            fontSize: "20px",
            fontWeight: 600,
        },
        editBtn: {
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#0095F6",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
        },
        profileSection: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            marginBottom: "24px",
        },
        avatar: {
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0095F6, #00D4AA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "36px",
            fontWeight: 600,
            marginBottom: "16px",
            position: "relative" as const,
        },
        cameraBtn: {
            position: "absolute" as const,
            bottom: 0,
            right: 0,
            width: "32px",
            height: "32px",
            backgroundColor: "var(--color-background)",
            border: "2px solid var(--color-border)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden", // for input
        },
        fileInput: {
            display: "none",
        },
        userName: {
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "4px",
        },
        userHandle: {
            fontSize: "14px",
            color: "var(--color-muted)",
        },
        tabs: {
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
        },
        tab: {
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-card)",
            color: "var(--color-foreground)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        },
        tabActive: {
            backgroundColor: "#0095F6",
            border: "1px solid #0095F6",
            color: "white",
        },
        section: {
            marginBottom: "20px",
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
            gap: "12px",
            padding: "16px",
            borderBottom: "1px solid var(--color-border)",
        },
        rowLast: {
            borderBottom: "none",
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
        rowContent: {
            flex: 1,
        },
        rowLabel: {
            fontSize: "12px",
            color: "var(--color-muted)",
            marginBottom: "2px",
        },
        rowValue: {
            fontSize: "15px",
            fontWeight: 500,
        },
        input: {
            width: "100%",
            padding: "8px 0",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
            fontSize: "15px",
            outline: "none",
        },
        actionBtn: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "16px",
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
            marginTop: "12px",
        },
        signOutBtn: {
            color: "#ef4444",
        },
        saveBtn: {
            width: "100%",
            padding: "16px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "20px",
        },
        link: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            color: "inherit",
            textDecoration: "none",
        },
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Profile</h1>
                    {!isEditing ? (
                        <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                            Edit
                        </button>
                    ) : (
                        <button style={styles.editBtn} onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    )}
                </div>

                <div style={styles.profileSection}>
                    <div style={styles.avatar}>
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"
                        )}
                        <button style={styles.cameraBtn} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? (
                                <div style={{ width: "12px", height: "12px", border: "2px solid var(--color-foreground)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            ) : (
                                <Camera size={14} color="var(--color-foreground)" />
                            )}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={styles.fileInput}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p style={styles.userName}>
                        {user.firstName} {user.lastName}
                    </p>
                    <p style={styles.userHandle}>@{user.username || user.email?.split("@")[0]}</p>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(activeTab === "info" ? styles.tabActive : {}) }}
                        onClick={() => { setActiveTab("info"); setIsEditing(false); }}
                    >
                        <UserIcon size={16} />
                        Info
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === "payment" ? styles.tabActive : {}) }}
                        onClick={() => { setActiveTab("payment"); setIsEditing(false); }}
                    >
                        <Wallet size={16} />
                        Payment
                    </button>
                </div>

                {activeTab === "info" ? (
                    <>
                        <div style={styles.section}>
                            <p style={styles.sectionTitle}>Personal Info</p>
                            <div style={styles.card}>
                                <div style={styles.row}>
                                    <div style={styles.rowIcon}>
                                        <UserIcon size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>First Name</p>
                                        {isEditing ? (
                                            <input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                style={styles.input}
                                            />
                                        ) : (
                                            <p style={styles.rowValue}>{user.firstName || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowIcon}>
                                        <UserIcon size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>Last Name</p>
                                        {isEditing ? (
                                            <input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                style={styles.input}
                                            />
                                        ) : (
                                            <p style={styles.rowValue}>{user.lastName || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowIcon}>
                                        <AtSign size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>Username</p>
                                        {isEditing ? (
                                            <input
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                style={styles.input}
                                            />
                                        ) : (
                                            <p style={styles.rowValue}>@{user.username || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ ...styles.row, ...styles.rowLast }}>
                                    <div style={styles.rowIcon}>
                                        <Mail size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>Email</p>
                                        <p style={styles.rowValue}>{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <p style={styles.sectionTitle}>Preferences</p>
                            <div style={styles.card}>
                                <div style={{ ...styles.row, ...styles.rowLast }}>
                                    <div style={styles.rowIcon}>
                                        <CreditCard size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>Default Currency</p>
                                        <p style={styles.rowValue}>{user.currency || "INR"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.card}>
                                <Link href="/about" style={styles.link}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={styles.rowIcon}>
                                            <Info size={20} color="#0095F6" />
                                        </div>
                                        <span style={{ fontSize: "15px", fontWeight: 500 }}>About ZeroSplit</span>
                                    </div>
                                    <ChevronRight size={20} color="var(--color-muted)" />
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={styles.section}>
                            <p style={styles.sectionTitle}>UPI</p>
                            <div style={styles.card}>
                                <div style={{ ...styles.row, ...styles.rowLast }}>
                                    <div style={styles.rowIcon}>
                                        <Wallet size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>UPI ID</p>
                                        {isEditing ? (
                                            <input
                                                name="upiId"
                                                value={paymentData.upiId}
                                                onChange={handlePaymentChange}
                                                placeholder="yourname@upi"
                                                style={styles.input}
                                            />
                                        ) : (
                                            <p style={styles.rowValue}>
                                                {user.paymentDetails?.upiId || "Not set"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <p style={styles.sectionTitle}>Bank Account</p>
                            <div style={styles.card}>
                                <div style={styles.row}>
                                    <div style={styles.rowIcon}>
                                        <CreditCard size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>Account Number</p>
                                        {isEditing ? (
                                            <input
                                                name="bankAccountNumber"
                                                value={paymentData.bankAccountNumber}
                                                onChange={handlePaymentChange}
                                                placeholder="Enter account number"
                                                style={styles.input}
                                            />
                                        ) : (
                                            <p style={styles.rowValue}>
                                                {user.paymentDetails?.bankAccountNumber
                                                    ? `****${user.paymentDetails.bankAccountNumber.slice(-4)}`
                                                    : "Not set"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ ...styles.row, ...styles.rowLast }}>
                                    <div style={styles.rowIcon}>
                                        <Building2 size={20} color="#0095F6" />
                                    </div>
                                    <div style={styles.rowContent}>
                                        <p style={styles.rowLabel}>IFSC Code</p>
                                        {isEditing ? (
                                            <input
                                                name="ifscCode"
                                                value={paymentData.ifscCode}
                                                onChange={handlePaymentChange}
                                                placeholder="e.g. SBIN0001234"
                                                style={styles.input}
                                            />
                                        ) : (
                                            <p style={styles.rowValue}>
                                                {user.paymentDetails?.ifscCode || "Not set"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: "13px", color: "var(--color-muted)", textAlign: "center", marginTop: "16px" }}>
                            Payment details are shown to others when settling up
                        </p>
                    </>
                )}

                {isEditing ? (
                    <button
                        style={{ ...styles.saveBtn, opacity: isLoading ? 0.7 : 1 }}
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                ) : (
                    <button style={{ ...styles.actionBtn, ...styles.signOutBtn }} onClick={handleSignOut}>
                        <LogOut size={20} />
                        Sign Out
                    </button>
                )}
            </main>
        </div>
    );
}
