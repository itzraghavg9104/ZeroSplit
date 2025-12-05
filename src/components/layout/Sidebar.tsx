"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/groups", icon: Users, label: "My Groups" },
    { href: "/create-group", icon: PlusCircle, label: "Create Group" },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
            <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <span className="text-xl font-bold">ZeroSplit</span>
                </Link>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-white"
                                            : "text-muted hover:bg-background hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-border space-y-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:bg-background hover:text-foreground transition-all duration-200"
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:bg-danger/10 hover:text-danger transition-all duration-200 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
