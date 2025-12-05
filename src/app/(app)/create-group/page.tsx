"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Users, ImagePlus } from "lucide-react";
import Link from "next/link";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import MobileNav from "@/components/layout/MobileNav";
import { uploadToCloudinary } from "@/utils/upload";
import { useRef } from "react";

function generateInviteCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export default function CreateGroupPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [isUploading, setIsUploading] = useState(false);
    const [groupImage, setGroupImage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError("");
        try {
            const imageUrl = await uploadToCloudinary(file);
            setGroupImage(imageUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        if (!formData.name.trim()) {
            setError("Group name is required");
            return;
        }

        if (formData.name.trim().length < 2) {
            setError("Group name must be at least 2 characters");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const inviteCode = generateInviteCode();

            const groupData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                members: [user.id],
                memberDetails: [{
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    joinedAt: Timestamp.now(),
                }],
                createdBy: user.id,
                inviteCode: inviteCode,
                currency: user.currency || "INR",
                image: groupImage || null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, "groups"), groupData);
            router.push(`/group/${docRef.id}`);
        } catch (err) {
            console.error("Error creating group:", err);
            setError("Failed to create group. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            paddingBottom: "100px",
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
            marginBottom: "24px",
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
        card: {
            backgroundColor: "var(--color-card)",
            borderRadius: "20px",
            border: "1px solid var(--color-border)",
            padding: "24px",
            marginBottom: "20px",
        },
        imageUpload: {
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "24px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--color-border)",
        },
        uploadBtn: {
            width: "80px",
            height: "80px",
            backgroundColor: "rgba(0, 149, 246, 0.1)",
            border: "2px dashed var(--color-border)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            cursor: "pointer",
            color: "var(--color-muted)",
            flexShrink: 0,
        },
        uploadText: {
            flex: 1,
        },
        uploadTitle: {
            fontWeight: 600,
            marginBottom: "4px",
        },
        uploadDesc: {
            fontSize: "13px",
            color: "var(--color-muted)",
        },
        form: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "20px",
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "8px",
        },
        label: {
            fontSize: "14px",
            fontWeight: 600,
        },
        required: {
            color: "#ef4444",
        },
        input: {
            width: "100%",
            padding: "14px 16px",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "16px",
            outline: "none",
        },
        textarea: {
            width: "100%",
            padding: "14px 16px",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            fontSize: "16px",
            outline: "none",
            minHeight: "100px",
            resize: "none" as const,
            fontFamily: "inherit",
        },
        charCount: {
            fontSize: "12px",
            color: "var(--color-muted)",
            textAlign: "right" as const,
        },
        error: {
            padding: "14px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            color: "#ef4444",
            fontSize: "14px",
            textAlign: "center" as const,
        },
        submitBtn: {
            width: "100%",
            padding: "16px",
            backgroundColor: "#0095F6",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: isLoading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        },
        hint: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "16px",
            backgroundColor: "rgba(0, 149, 246, 0.05)",
            borderRadius: "12px",
            fontSize: "13px",
            color: "var(--color-muted)",
        },
    };

    return (
        <div style={styles.page}>
            <MobileNav />

            <main style={styles.main}>
                <div style={styles.header}>
                    <Link href="/groups">
                        <button style={styles.backBtn}>
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 style={styles.title}>Create Group</h1>
                </div>

                <div style={styles.card}>
                    <div style={styles.imageUpload}>
                        <button
                            style={styles.uploadBtn}
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <div style={{ width: "24px", height: "24px", border: "2px solid var(--color-muted)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            ) : groupImage ? (
                                <img src={groupImage} alt="Group" style={{ width: "100%", height: "100%", borderRadius: "18px", objectFit: "cover" }} />
                            ) : (
                                <ImagePlus size={24} />
                            )}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div style={styles.uploadText}>
                            <p style={styles.uploadTitle}>Group Photo</p>
                            <p style={styles.uploadDesc}>Add a photo to make your group recognizable</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {error && <div style={styles.error}>{error}</div>}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Group Name <span style={styles.required}>*</span>
                            </label>
                            <input
                                name="name"
                                placeholder="e.g. Trip to Goa, Apartment Rent"
                                value={formData.name}
                                onChange={handleChange}
                                style={styles.input}
                                maxLength={50}
                                required
                            />
                            <p style={styles.charCount}>{formData.name.length}/50</p>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                name="description"
                                placeholder="What's this group for? (optional)"
                                value={formData.description}
                                onChange={handleChange}
                                style={styles.textarea}
                                maxLength={200}
                            />
                            <p style={styles.charCount}>{formData.description.length}/200</p>
                        </div>

                        <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                            {isLoading ? (
                                <>
                                    <div style={{
                                        width: "18px",
                                        height: "18px",
                                        border: "2px solid rgba(255,255,255,0.3)",
                                        borderTopColor: "white",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite",
                                    }} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Users size={18} />
                                    Create Group
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div style={styles.hint}>
                    <Users size={16} />
                    You can invite members after creating the group using a link or username
                </div>
            </main>
        </div>
    );
}
