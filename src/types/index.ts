// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
    paymentDetails?: PaymentDetails;
    currency: string;
    lastReadActivityTime?: Date | { toDate: () => Date };
    activityClearedAt?: Date | { toDate: () => Date };
    createdAt: Date;
    updatedAt: Date;
}

export interface Invite {
    id: string;
    groupId: string;
    groupName: string;
    invitedBy: string;
    invitedByName: string;
    toUserId?: string; // If known, e.g. from search
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date | { toDate: () => Date };
}

export interface PaymentDetails {
    upiId?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
}

// Group types
export interface Group {
    id: string;
    name: string;
    description?: string;
    image?: string;
    members: string[]; // user IDs
    createdBy: string;
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
    memberDetails?: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        joinedAt: any;
    }[];
}

// Expense types
export interface Expense {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    payerId: string;
    splits: ExpenseSplit[];
    splitType: "equal" | "custom";
    createdBy: string;
    createdAt: Date | { toDate: () => Date }; // Firestore Timestamp compatible
    updatedAt: Date | { toDate: () => Date };
    type?: 'expense' | 'settlement';
}

export interface ExpenseSplit {
    memberId: string;
    amount: number;
}

// Balance types
export interface MemberBalance {
    memberId: string;
    memberName: string;
    balance: number; // positive = owed to you, negative = you owe
}

export interface SettleTransaction {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
}

// Form types
export interface ExpenseFormData {
    description: string;
    amount: number;
    payerId: string;
    splitType: "equal" | "custom";
    selectedMembers: string[];
    customSplits?: { memberId: string; amount: number }[];
}

export interface GroupFormData {
    name: string;
    description: string;
    image?: File;
}

// Auth context types
export interface AuthContextType {
    user: User | null;
    firebaseUser: firebase.User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

// Firebase user type placeholder
declare namespace firebase {
    interface User {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
    }
}
