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
    error: string | null;
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", fbUser.uid));
                    if (userDoc.exists()) {
                        setUser({ id: fbUser.uid, ...userDoc.data() } as User);
                    } else {
                        // User document doesn't exist, create minimal user data from Firebase auth
                        setUser({
                            id: fbUser.uid,
                            email: fbUser.email || "",
                            firstName: fbUser.displayName?.split(" ")[0] || "",
                            lastName: fbUser.displayName?.split(" ").slice(1).join(" ") || "",
                            username: fbUser.email?.split("@")[0] || "",
                            currency: "INR",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    }
                    setError(null);
                } catch (err) {
                    console.error("Error fetching user doc:", err);
                    // If offline, create user from Firebase auth data
                    setUser({
                        id: fbUser.uid,
                        email: fbUser.email || "",
                        firstName: fbUser.displayName?.split(" ")[0] || "User",
                        lastName: fbUser.displayName?.split(" ").slice(1).join(" ") || "",
                        username: fbUser.email?.split("@")[0] || "",
                        currency: "INR",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    // Don't block the user due to offline error
                    if ((err as Error).message?.includes("offline")) {
                        setError("You appear to be offline. Some features may be limited.");
                    }
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const message = (err as Error).message;
            if (message.includes("offline")) {
                throw new Error("Unable to sign in. Please check your internet connection.");
            }
            throw err;
        }
    };

    const signUp = async (
        email: string,
        password: string,
        userData: Partial<User>
    ) => {
        try {
            setError(null);
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
        } catch (err) {
            const message = (err as Error).message;
            if (message.includes("offline")) {
                throw new Error("Unable to sign up. Please check your internet connection.");
            }
            throw err;
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            try {
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
            } catch (firestoreErr) {
                // Firestore might be offline, but auth succeeded
                console.error("Firestore error:", firestoreErr);
                setUser({
                    id: result.user.uid,
                    email: result.user.email || "",
                    firstName: result.user.displayName?.split(" ")[0] || "",
                    lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
                    username: result.user.email?.split("@")[0] || "",
                    profilePicture: result.user.photoURL || undefined,
                    currency: "INR",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        } catch (err) {
            const message = (err as Error).message;
            if (message.includes("offline")) {
                throw new Error("Unable to sign in with Google. Please check your internet connection.");
            }
            throw err;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setError(null);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!firebaseUser) return;
        try {
            await updateDoc(doc(db, "users", firebaseUser.uid), {
                ...data,
                updatedAt: new Date(),
            });
            setUser((prev) => (prev ? { ...prev, ...data } : null));
        } catch (err) {
            console.error("Error updating profile:", err);
            // Update local state anyway for offline support
            setUser((prev) => (prev ? { ...prev, ...data } : null));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                loading,
                error,
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
