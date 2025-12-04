"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        userData: Partial<User>
    ) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                const userDoc = await getDoc(doc(db, "users", fbUser.uid));
                if (userDoc.exists()) {
                    setUser({ id: fbUser.uid, ...userDoc.data() } as User);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (
        email: string,
        password: string,
        userData: Partial<User>
    ) => {
        const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const newUser: Omit<User, "id"> = {
            email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            username: userData.username || email.split("@")[0],
            currency: "INR",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await setDoc(doc(db, "users", credential.user.uid), newUser);
        setUser({ id: credential.user.uid, ...newUser });
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const userDoc = await getDoc(doc(db, "users", result.user.uid));

        if (!userDoc.exists()) {
            const newUser: Omit<User, "id"> = {
                email: result.user.email || "",
                firstName: result.user.displayName?.split(" ")[0] || "",
                lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
                username: result.user.email?.split("@")[0] || "",
                profilePicture: result.user.photoURL || undefined,
                currency: "INR",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await setDoc(doc(db, "users", result.user.uid), newUser);
            setUser({ id: result.user.uid, ...newUser });
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!firebaseUser) return;
        await updateDoc(doc(db, "users", firebaseUser.uid), {
            ...data,
            updatedAt: new Date(),
        });
        setUser((prev) => (prev ? { ...prev, ...data } : null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                loading,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
