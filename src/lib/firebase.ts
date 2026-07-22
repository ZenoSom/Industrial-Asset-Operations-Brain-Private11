// CLIENT-SIDE SECURE DEMO AUTHENTICATION INTERRUPT (FIREBASE REMOVED)
// This file simulates login locally to resolve external network & credentials issues.

const mockListeners = new Set<(user: any) => void>();
let currentMockUser: any = null;

// Initial state persistence
const savedUser = localStorage.getItem("demo_authenticated_user");
if (savedUser) {
  try {
    currentMockUser = JSON.parse(savedUser);
  } catch (e) {
    currentMockUser = null;
  }
}

// Default auto-login to bypass login barrier for demo build
if (!currentMockUser) {
  currentMockUser = {
    uid: "emp-123-operator",
    email: "emp123@jamnagar.in",
    displayName: "Lead Operator (emp123)",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=emp123"
  };
  localStorage.setItem("demo_authenticated_user", JSON.stringify(currentMockUser));
}

const triggerMockAuthStateChange = (user: any) => {
  currentMockUser = user;
  if (user) {
    localStorage.setItem("demo_authenticated_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("demo_authenticated_user");
  }
  mockListeners.forEach(cb => cb(user));
};

export const loginWithFirebase = async (emailOrEmpId: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Elegant slight mechanical delay for security-feel
    setTimeout(() => {
      const sanitizedId = emailOrEmpId.trim().toLowerCase();
      if ((sanitizedId === "emp123" || sanitizedId === "emp123@jamnagar.in") && password === "1234") {
        const user = {
          uid: "emp-123-operator",
          email: "emp123@jamnagar.in",
          displayName: "Lead Operator (emp123)",
          photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=emp123"
        };
        triggerMockAuthStateChange(user);
        resolve(user);
      } else {
        reject(new Error("⚠️ Invalid credentials. Please use Employee ID: emp123 and Password: 1234"));
      }
    }, 600);
  });
};

export const registerWithFirebase = async (email: string, password: string, name: string): Promise<any> => {
  // Stub for backwards compatibility if needed, but login is the main path now
  return new Promise((resolve, reject) => {
    reject(new Error("Registration is disabled. Please sign in with Employee ID: emp123 and Password: 1234"));
  });
};

export const loginWithGoogle = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    reject(new Error("Google Sign-In is disabled. Please sign in with Employee ID: emp123 and Password: 1234"));
  });
};

export const logoutWithFirebase = async (): Promise<void> => {
  triggerMockAuthStateChange(null);
};

export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  mockListeners.add(callback);
  // Initial fire
  callback(currentMockUser);
  return () => {
    mockListeners.delete(callback);
  };
};

export const isRealFirebaseConfigured = false;
