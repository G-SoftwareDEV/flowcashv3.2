// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5kUk0MAQ60WrDO8Q_guO_2fsWB6-Kj0I",
  authDomain: "gen-lang-client-0424236976.firebaseapp.com",
  projectId: "gen-lang-client-0424236976",
  storageBucket: "gen-lang-client-0424236976.firebasestorage.app",
  messagingSenderId: "736458113045",
  appId: "1:736458113045:web:b347d9145e84c91efe0e1c",
  measurementId: "G-GPJ0LV1XKT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Simple cache for user profiles
const profileCache: { [key: string]: any } = {};

// Google Login Function
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await Promise.race([

      signInWithPopup(auth, googleProvider),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Login timeout")), 30000)
      ) as any
    ]);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Logout Function
export const logoutUser = async (): Promise<void> => {
  try {
    // Clear cache on logout
    Object.keys(profileCache).forEach(key => delete profileCache[key]);
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Auth State Observer
export const authStateListener = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Save Transaction to Firestore
export const saveTransaction = async (userId: string, transaction: any) => {
  try {
    const transactionRef = doc(db, "users", userId, "transactions", transaction.id);
    await setDoc(transactionRef, {
      ...transaction,
      date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
};

// Get All Transactions for User
export const getUserTransactions = async (userId: string) => {
  try {
    const transactionsRef = collection(db, "users", userId, "transactions");
    const querySnapshot = await getDocs(transactionsRef);
    const transactions = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      date: new Date(doc.data().date)
    }));
    return transactions;
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    // If permission denied, return empty array (first time user or rules not set)
    if (error.code === 'permission-denied') {
      return [];
    }
    throw error;
  }
};

// Delete Transaction from Firestore
export const deleteTransactionFromFirestore = async (userId: string, transactionId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

// Save User Profile
export const saveUserProfile = async (userId: string, profileData: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profileData, { merge: true });
    // Update cache with the new profile data
    profileCache[userId] = profileData;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

// Get User Profile (with caching)
export const getUserProfile = async (userId: string) => {
  // Check cache first
  if (profileCache[userId] !== undefined) {
    console.log("Returning cached profile for user:", userId);
    return profileCache[userId];
  }

  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    const profileData = docSnap.exists() ? docSnap.data() : null;
    
    // Cache the result
    profileCache[userId] = profileData;
    return profileData;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    // If permission denied or document doesn't exist, return null (first time user)
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      profileCache[userId] = null;
      return null;
    }
    // For other errors, still throw
    throw error;
  }
};
