"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu, X, Home, Users, Plus, User, Sun, Moon, LogOut,
    Settings, Bell
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const bottomNavItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/create-group", label: "Create", icon: Plus, isCenter: true },
    { href: "/activity", label: "Activity", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
];

const sideNavItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/create-group", label: "Create Group", icon: Plus },
    { href: "/activity", label: "Activity", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const pathname = usePathname();
    const { resolvedTheme, setTheme, theme } = useTheme();
    const { user, signOut } = useAuth();

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Show nav on landing page too, per user request
    const showBottomNav = !isDesktop && (
        pathname === "/dashboard" ||
        pathname === "/groups" ||
        pathname === "/create-group" ||
        pathname === "/activity" ||
        pathname === "/profile" ||
        pathname === "/settings" ||
        pathname === "/" // Landing page
    );

    const isLandingPage = pathname === "/";

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        } else {
            setTheme(theme === "dark" ? "light" : "dark");
        }
    };

    // Logo filter: Invert for dark mode (assuming base logo is black)
    const logoFilter = resolvedTheme === "dark" ? "invert(1)" : "none";

    // Get user avatar - prefer Google photo, then Cloudinary, then initials
    const getUserAvatar = () => {
        if (user?.profilePicture) {
            return user.profilePicture;
        }
        return null;
    };

    const userAvatar = getUserAvatar();

    return (
        <>
            {/* Top Header */}
            <header
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    backgroundColor: "var(--color-background)",
                    borderBottom: "1px solid var(--color-border)",
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                }}
            >
                <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                    <img
                        src="/logoFull.png"
                        alt="ZeroSplit"
                        style={{
                            height: "32px",
                            width: "auto",
                            filter: logoFilter,
                        }}
                    />
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {/* Settings - Mobile Only */}
                    {!isDesktop && (
                        <Link href="/settings">
                            <button
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "none",
                                    border: "none",
                                    color: "var(--color-foreground)",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                }}
                                aria-label="Settings"
                            >
                                <Settings size={20} />
                            </button>
                        </Link>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "none",
                            border: "none",
                            color: "var(--color-foreground)",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                        aria-label="Toggle theme"
                    >
                        {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Hamburger Menu - Desktop Only */}
                    {isDesktop && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "none",
                                border: "none",
                                color: "var(--color-foreground)",
                                borderRadius: "10px",
                                cursor: "pointer",
                            }}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </header>

            {/* Overlay */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 90,
                    }}
                />
            )}

            {/* Side Menu - Desktop */}
            {isDesktop && (
                <aside
                    style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "300px",
                        maxWidth: "85vw",
                        backgroundColor: "var(--color-background)",
                        borderLeft: "1px solid var(--color-border)",
                        zIndex: 95,
                        transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
                        transition: "transform 0.3s ease-out",
                        display: "flex",
                        flexDirection: "column",
                        paddingTop: "72px",
                    }}
                >
                    {user && (
                        <div
                            style={{
                                padding: "20px",
                                borderBottom: "1px solid var(--color-border)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={user.firstName || "User"}
                                        style={{
                                            width: "56px",
                                            height: "56px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "56px",
                                            height: "56px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #0095F6, #00D4AA)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "600",
                                            fontSize: "20px",
                                        }}
                                    >
                                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: "600", fontSize: "16px" }}>
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p style={{
                                        fontSize: "13px",
                                        color: "var(--color-muted)",
                                    }}>
                                        @{user.username || user.email?.split("@")[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
                        {sideNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        padding: "14px 20px",
                                        color: isActive ? "#0095F6" : "var(--color-foreground)",
                                        fontWeight: isActive ? "600" : "400",
                                        fontSize: "15px",
                                        backgroundColor: isActive ? "rgba(0, 149, 246, 0.1)" : "transparent",
                                    }}
                                >
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {user && (
                        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border)" }}>
                            <button
                                onClick={async () => {
                                    await signOut();
                                    // Use window.location for hard redirect to clear state/cache if needed, or router
                                    window.location.href = "/";
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    padding: "14px",
                                    background: "none",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "12px",
                                    color: "#ef4444",
                                    fontSize: "15px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                }}
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </aside>
            )}

            {/* Bottom Navigation - Instagram Style */}
            {showBottomNav && (
                <nav
                    style={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60px",
                        backgroundColor: isLandingPage ? "rgba(0,0,0,0.01)" : "var(--color-background)", // Almost fully transparent for events, or just transparent
                        borderTop: isLandingPage ? "none" : "1px solid var(--color-border)",
                        backdropFilter: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        paddingBottom: "env(safe-area-inset-bottom)",
                        zIndex: 100,
                        transition: "background-color 0.3s",
                    }}
                >
                    {bottomNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href === "/dashboard" && pathname === "/");

                        // If user is not logged in, redirect non-public routes to login?
                        // Or just let them click and middleware/page auth will handle it.
                        // Ideally, we keep it simple. Landing page links to dashboard/login.

                        // Special case for Profile Icon
                        if (item.label === "Profile") {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px",
                                        minWidth: "60px",
                                        color: isActive ? "#0095F6" : "var(--color-muted)",
                                    }}
                                >
                                    {userAvatar ? (
                                        <div style={{
                                            width: "26px",
                                            height: "26px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: isActive ? "2px solid #0095F6" : "1px solid var(--color-border)",
                                            padding: "1px"
                                        }}>
                                            <img src={userAvatar} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                                        </div>
                                    ) : (
                                        <item.icon
                                            size={26}
                                            strokeWidth={isActive ? 2.5 : 1.5}
                                        />
                                    )}
                                    <span style={{
                                        fontSize: "10px",
                                        fontWeight: isActive ? "600" : "400",
                                        color: isLandingPage && !isActive ? "rgba(255,255,255,0.8)" : undefined // Tweak for landing page visibility if dark bg?
                                        // Actually landing page is light/dark theme aware. Text color should be fine from 'var(--color-muted)' 
                                        // UNLESS landing page has a specific background image/color that requires contrast.
                                        // The user said "ensure that below toolbar is also transparent on landing page".
                                    }}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        }

                        // Center Plus Button
                        if (item.isCenter) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px",
                                        minWidth: "60px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            backgroundColor: "transparent",
                                            border: "2px solid var(--color-muted)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Plus size={20} color="var(--color-foreground)" strokeWidth={2} />
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    minWidth: "60px",
                                    color: isActive ? "#0095F6" : "var(--color-muted)",
                                }}
                            >
                                <item.icon
                                    size={26}
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                                <span style={{
                                    fontSize: "10px",
                                    fontWeight: isActive ? "600" : "400",
                                }}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            )}

            {/* Header Spacer */}
            <div style={{ height: "56px" }} />
        </>
    );
}
