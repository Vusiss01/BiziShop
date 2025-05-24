import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getDatabase } from "firebase/database";

// User roles
export type UserRole = "cashier" | "manager" | "owner";

// Role-based access control
export const roleAccess = {
  cashier: [
    "/orders",
    "/menu",
    "/messages",
    "/settings",
    "/add-items",
    "/payment-method",
    "/order-confirmation",
    "/notifications",
    "/restaurants",
  ],
  manager: [
    "/dashboard",
    "/orders",
    "/menu",
    "/inventory",
    "/messages",
    "/settings",
    "/add-items",
    "/payment-method",
    "/order-confirmation",
    "/notifications",
    "/restaurants",
  ],
  owner: [
    "/dashboard",
    "/orders",
    "/menu",
    "/analytics",
    "/inventory",
    "/messages",
    "/settings",
    "/add-items",
    "/payment-method",
    "/order-confirmation",
    "/notifications",
    "/restaurants",
  ],
};

// Helper function to check if a user has access to a specific route
export const hasAccess = (role: UserRole, path: string): boolean => {
  // Always allow access to authentication screen and root path
  if (path === "/auth" || path === "/") return true;

  // Check if the role has access to the path
  return roleAccess[role]?.includes(path) || false;
};

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

// Export Firebase services
export { firestore, database };

// Firebase authentication wrapper
export const firebaseAuth = {
  signUp: async (data: {
    email: string;
    password: string;
    metadata?: any;
  }): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      // Store user role in localStorage for now (in a real app, you'd store this in Firestore)
      if (data.metadata?.role) {
        localStorage.setItem("userRole", data.metadata.role);
      }

      return userCredential;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  signInWithEmailAndPassword: async (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Try to get the user's role from Firestore
      try {
        const userDocRef = doc(firestore, "users", userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data()?.role) {
          const role = userDocSnap.data()?.role;
          // Store the role in localStorage for faster access
          localStorage.setItem("userRole", role);
        }
      } catch (firestoreError) {
        console.error("Error fetching role from Firestore:", firestoreError);
        // If Firestore fails, use a default role
        localStorage.setItem("userRole", "cashier");
      }

      return userCredential;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Clear role from localStorage
      localStorage.removeItem("userRole");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },
};

// Helper function to get the current user's role
export const getUserRole = async (): Promise<UserRole> => {
  try {
    const user = firebaseAuth.getCurrentUser();

    if (!user) {
      const localRole = localStorage.getItem("userRole");
      if (localRole) {
        return localRole as UserRole;
      }
      throw new Error("No user found");
    }

    // Try to get the role from Firestore first
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data()?.role) {
        const role = userDocSnap.data()?.role;
        // Cache the role in localStorage for faster access
        localStorage.setItem("userRole", role);
        return role as UserRole;
      }
    } catch (firestoreError) {
      console.error("Error fetching role from Firestore:", firestoreError);
    }

    // Fallback to localStorage if Firestore fails or doesn't have the role
    const localRole = localStorage.getItem("userRole");
    if (localRole) {
      return localRole as UserRole;
    }

    // Default to cashier if no role is found
    return "cashier";
  } catch (error) {
    console.error("Error getting user role:", error);
    return (localStorage.getItem("userRole") as UserRole) || "cashier";
  }
};
