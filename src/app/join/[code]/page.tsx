"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Check, X, Loader2 } from "lucide-react";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types";
import Button from "@/components/ui/Button";

export default function JoinGroupPage() {
    const router = useRouter();
    const params = useParams();
    const inviteCode = params.code as string;
    const { user, loading } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [status, setStatus] = useState<"loading" | "found" | "not_found" | "already_member" | "joining" | "joined">("loading");

    useEffect(() => {
        const findGroup = async () => {
            try {
                const q = query(
                    collection(db, "groups"),
                    where("inviteCode", "==", inviteCode)
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setStatus("not_found");
                    return;
                }

                const groupDoc = snapshot.docs[0];
                const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
                setGroup(groupData);

                if (user && groupData.members.includes(user.id)) {
                    setStatus("already_member");
                } else {
                    setStatus("found");
                }
            } catch (error) {
                console.error("Error finding group:", error);
                setStatus("not_found");
            }
        };

        if (!loading) {
            if (!user) {
                router.push(`/login?redirect=/join/${inviteCode}`);
            } else {
                findGroup();
            }
        }
    }, [user, loading, inviteCode, router]);

    const handleJoin = async () => {
        if (!user || !group) return;

        setStatus("joining");

        try {
            await updateDoc(doc(db, "groups", group.id), {
                members: arrayUnion(user.id),
            });
            setStatus("joined");
            setTimeout(() => {
                router.push(`/group/${group.id}`);
            }, 1500);
        } catch (error) {
            console.error("Error joining group:", error);
            setStatus("found");
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm text-center">
                {status === "not_found" && (
                    <>
                        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X className="w-8 h-8 text-danger" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Invalid Invite Link</h1>
                        <p className="text-muted mb-6">
                            This invite link is invalid or has expired.
                        </p>
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </>
                )}

                {status === "already_member" && group && (
                    <>
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-success" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Already a Member</h1>
                        <p className="text-muted mb-6">
                            You&apos;re already part of <strong>{group.name}</strong>
                        </p>
                        <Link href={`/group/${group.id}`}>
                            <Button>Go to Group</Button>
                        </Link>
                    </>
                )}

                {status === "found" && group && (
                    <>
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl font-bold text-primary">
                                {group.name[0]}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Join {group.name}</h1>
                        <p className="text-muted mb-6">
                            You&apos;ve been invited to join this group
                        </p>
                        <div className="flex gap-3">
                            <Link href="/dashboard" className="flex-1">
                                <Button variant="secondary" fullWidth>
                                    Cancel
                                </Button>
                            </Link>
                            <Button onClick={handleJoin} className="flex-1">
                                Join Group
                            </Button>
                        </div>
                    </>
                )}

                {status === "joining" && (
                    <>
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2">Joining Group...</h1>
                    </>
                )}

                {status === "joined" && (
                    <>
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-success" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
                        <p className="text-muted">Redirecting to group...</p>
                    </>
                )}
            </div>
        </main>
    );
}
