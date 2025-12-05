import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ActivityType = "expense_added" | "expense_updated" | "member_joined" | "settlement" | "group_created" | "member_added" | "joined_group" | "left_group";

export const logActivity = async (
    userId: string,
    type: ActivityType,
    message: string,
    groupId?: string,
    groupName?: string
) => {
    try {
        await addDoc(collection(db, "activities"), {
            userId,
            type,
            message,
            groupId: groupId || null,
            groupName: groupName || null,
            createdAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};
