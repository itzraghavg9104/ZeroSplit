"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/create-group", icon: PlusCircle, label: "Create" },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-bottom md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-4 py-2 min-w-[64px] transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
