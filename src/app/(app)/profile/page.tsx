"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, CreditCard, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

const currencies = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, updateProfile, signOut } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        upiId: "",
        bankAccountNumber: "",
        currency: "INR",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                username: user.username || "",
                upiId: user.paymentDetails?.upiId || "",
                bankAccountNumber: user.paymentDetails?.bankAccountNumber || "",
                currency: user.currency || "INR",
            });
        }
    }, [user, loading, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccess(false);

        try {
            await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                currency: formData.currency,
                paymentDetails: {
                    upiId: formData.upiId,
                    bankAccountNumber: formData.bankAccountNumber,
                },
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (loading || !user) {
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

                <h1 className="text-2xl font-bold mb-8">Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <Avatar
                                src={user.profilePicture}
                                firstName={user.firstName}
                                lastName={user.lastName}
                                size="xl"
                            />
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="mt-2 text-muted text-sm">{user.email}</p>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Input
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Details
                        </h2>
                        <Input
                            label="UPI ID"
                            name="upiId"
                            placeholder="yourname@upi"
                            value={formData.upiId}
                            onChange={handleChange}
                        />
                        <Input
                            label="Bank Account Number"
                            name="bankAccountNumber"
                            placeholder="XXXX XXXX XXXX"
                            value={formData.bankAccountNumber}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">
                            Currency
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {currencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.symbol} {c.code} - {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {success && (
                        <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm text-center">
                            Profile updated successfully!
                        </div>
                    )}

                    <Button type="submit" fullWidth isLoading={isSaving}>
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border">
                    <Button
                        variant="danger"
                        fullWidth
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </Button>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
