"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Users, Search } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

export default function GroupsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchGroups = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, "groups"),
                    where("members", "array-contains", user.id)
                );
                const snapshot = await getDocs(q);
                const groupsData = snapshot.docs.map(
                    (doc) => ({ id: doc.id, ...doc.data() } as Group)
                );
                setGroups(groupsData);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchGroups();
    }, [user]);

    const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            <main className="p-4 md:p-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">My Groups</h1>
                    <Link href="/create-group">
                        <Button size="sm">
                            <Plus className="w-4 h-4" />
                            New
                        </Button>
                    </Link>
                </div>

                <div className="mb-6">
                    <Input
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-20 bg-card rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                        <Users className="w-12 h-12 text-muted mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">
                            {searchQuery ? "No groups found" : "No groups yet"}
                        </h3>
                        <p className="text-muted text-sm mb-4">
                            {searchQuery
                                ? "Try a different search term"
                                : "Create a group to start splitting expenses"}
                        </p>
                        {!searchQuery && (
                            <Link href="/create-group">
                                <Button>Create Your First Group</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredGroups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/group/${group.id}`}
                                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {group.image ? (
                                        <img
                                            src={group.image}
                                            alt={group.name}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        <Users className="w-6 h-6 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{group.name}</h3>
                                    <p className="text-sm text-muted">
                                        {group.members.length} member{group.members.length !== 1 && "s"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
