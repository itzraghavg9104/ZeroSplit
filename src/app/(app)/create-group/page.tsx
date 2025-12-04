"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { generateInviteCode } from "@/lib/utils";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

export default function CreateGroupPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError("");
        setIsLoading(true);

        try {
            const inviteCode = generateInviteCode();
            const groupRef = await addDoc(collection(db, "groups"), {
                name: formData.name,
                description: formData.description,
                members: [user.id],
                createdBy: user.id,
                inviteCode,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            router.push(`/group/${groupRef.id}`);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create group";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
            <Sidebar />

            <main className="p-4 md:p-8 max-w-lg mx-auto">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <h1 className="text-2xl font-bold mb-2">Create a Group</h1>
                <p className="text-muted mb-8">
                    Start tracking shared expenses with friends
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                            {error}
                        </div>
                    )}

                    {/* Group Image Placeholder */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            className="w-24 h-24 bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted hover:border-primary hover:text-primary transition-colors"
                        >
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-xs">Add Photo</span>
                        </button>
                    </div>

                    <Input
                        label="Group Name"
                        name="name"
                        placeholder="e.g., Trip to Goa"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            name="description"
                            placeholder="What's this group for?"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Create Group
                    </Button>
                </form>
            </main>

            <BottomNav />
        </div>
    );
}
