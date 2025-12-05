"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, firebaseUser, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (loading) return;

        // Public paths that don't require onboarding OR verification
        const publicPaths = ["/", "/login", "/signup", "/onboarding", "/verify-email", "/forgot-password"];
        if (publicPaths.includes(pathname)) {
            setIsChecking(false);
            return;
        }

        if (!user) {
            router.push("/login");
            return;
        }

        // 1. Check Email Verification First
        if (firebaseUser && !firebaseUser.emailVerified) {
            router.replace("/verify-email");
            return;
        }

        // 2. Check Profile Completion
        const isProfileComplete = user.firstName && user.username;

        if (!isProfileComplete) {
            router.replace("/onboarding");
        } else {
            setIsChecking(false);
        }
    }, [user, firebaseUser, loading, pathname, router]);

    if (loading || isChecking) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--color-background)"
            }}>
                <div style={{
                    width: "32px",
                    height: "32px",
                    border: "3px solid var(--color-border)",
                    borderTopColor: "#0095F6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
            </div>
        );
    }

    return <>{children}</>;
}
