import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  Auth as FirebaseAuth
} from "firebase/auth";

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAGN_IZkcbheaU8_wOpNyRzR_m3FzBICUg",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "industrial-asset.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "industrial-asset",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "industrial-asset.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "25240478221",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:25240478221:web:33eea410d1e4a8f5aa6b44"
};

let isRealFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain
);

let firebaseApp;
let firebaseAuth: any;

if (isRealFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    console.log("Firebase initialized successfully in real production mode.");
  } catch (error) {
    console.error("Failed to initialize real Firebase, switching to operational demo mode:", error);
    isRealFirebaseConfigured = false;
  }
}

// SIMULATED MOCK AUTH LAYER FOR INSTANT PLAYGROUND PREVIEW
const mockListeners = new Set<(user: any) => void>();
let currentMockUser: any = null;

// Initial state
const savedUser = localStorage.getItem("demo_authenticated_user");
if (savedUser) {
  try {
    currentMockUser = JSON.parse(savedUser);
  } catch (e) {
    currentMockUser = null;
  }
}

const mockAuth = {
  currentUser: currentMockUser,
  onAuthStateChanged: (callback: (user: any) => void) => {
    mockListeners.add(callback);
    // Fire immediately with current state
    callback(currentMockUser);
    return () => {
      mockListeners.delete(callback);
    };
  }
};

const triggerMockAuthStateChange = (user: any) => {
  currentMockUser = user;
  if (user) {
    localStorage.setItem("demo_authenticated_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("demo_authenticated_user");
  }
  mockAuth.currentUser = user;
  mockListeners.forEach(cb => cb(user));
};

export const loginWithFirebase = async (email: string, password: string): Promise<any> => {
  if (isRealFirebaseConfigured && firebaseAuth) {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  } else {
    // Simulated auth logic with localStorage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
        const match = users.find((u: any) => u.email === email && u.password === password);
        
        if (match) {
          const user = { 
            uid: match.uid, 
            email: match.email, 
            displayName: match.displayName || email.split("@")[0],
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${match.uid}`
          };
          triggerMockAuthStateChange(user);
          resolve(user);
        } else {
          // Default demo account
          if (email === "operator@jamnagar.in" && password === "jamnagar3000") {
            const user = {
              uid: "jamnagar-demo-operator",
              email: "operator@jamnagar.in",
              displayName: "Lead Operator",
              photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=lead-op"
            };
            triggerMockAuthStateChange(user);
            resolve(user);
          } else {
            reject(new Error("Invalid credentials. Try operator@jamnagar.in / jamnagar3000 or register a new technician account."));
          }
        }
      }, 800);
    });
  }
};

export const registerWithFirebase = async (email: string, password: string, name: string): Promise<any> => {
  if (isRealFirebaseConfigured && firebaseAuth) {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    // Profile updates or display name can be handled or mocked
    return userCredential.user;
  } else {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
        if (users.some((u: any) => u.email === email)) {
          reject(new Error("This email is already registered as a plant technician."));
          return;
        }

        const newUid = `tech-uid-${Date.now()}`;
        const newUser = { uid: newUid, email, password, displayName: name };
        users.push(newUser);
        localStorage.setItem("demo_users", JSON.stringify(users));

        const user = {
          uid: newUid,
          email: email,
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUid}`
        };
        triggerMockAuthStateChange(user);
        resolve(user);
      }, 1000);
    });
  }
};

export const loginWithGoogle = async (): Promise<any> => {
  if (isRealFirebaseConfigured && firebaseAuth) {
    const provider = new GoogleAuthProvider();
    // Configure standard parameters for standard prompt popup
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(firebaseAuth, provider);
    return userCredential.user;
  } else {
    // High-fidelity Simulated Google Auth Login for instant sandbox preview
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockGoogleUser = {
          uid: `google-uid-${Date.now()}`,
          email: "singhsomnath2006@gmail.com",
          displayName: "Somnath Singh",
          photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=somnath"
        };
        triggerMockAuthStateChange(mockGoogleUser);
        resolve(mockGoogleUser);
      }, 1000);
    });
  }
};

export const logoutWithFirebase = async (): Promise<void> => {
  if (isRealFirebaseConfigured && firebaseAuth) {
    await fbSignOut(firebaseAuth);
  } else {
    triggerMockAuthStateChange(null);
  }
};

export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  if (isRealFirebaseConfigured && firebaseAuth) {
    return onAuthStateChanged(firebaseAuth, callback);
  } else {
    return mockAuth.onAuthStateChanged(callback);
  }
};

export { isRealFirebaseConfigured };
