import React, { useState } from "react";
import { loginWithFirebase, registerWithFirebase, loginWithGoogle, isRealFirebaseConfigured } from "../lib/firebase";
import { ShieldCheck, UserCheck, AlertTriangle, Key, Mail, User, Info, Terminal, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginAuthProps {
  onLoginSuccess: (user: any) => void;
  theme: "dark" | "light";
}

export default function LoginAuth({ onLoginSuccess, theme }: LoginAuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          throw new Error("Please enter your full technician name.");
        }
        const user = await registerWithFirebase(email, password, displayName);
        onLoginSuccess(user);
      } else {
        const user = await loginWithFirebase(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setError(
          "⚠️ Email/Password provider is not enabled in Firebase.\n\n" +
          "To enable it:\n" +
          "1. Go to your Firebase Console (console.firebase.google.com) -> Authentication.\n" +
          "2. Click the 'Sign-in method' tab.\n" +
          "3. Click 'Add new provider', choose 'Email/Password', toggle 'Enable', and save."
        );
      } else if (err.code === "auth/invalid-credential" || err.message?.includes("invalid-credential") || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        if (email === "operator@jamnagar.in") {
          setError(
            "⚠️ Demo Credentials Not Yet Registered in your Live Firebase Project.\n\n" +
            "Since you are in Live Firebase mode, the default 'operator@jamnagar.in' account does not exist in your user database yet.\n\n" +
            "To resolve this instantly:\n" +
            "1. Click 'Register Operator' at the bottom of the form.\n" +
            "2. Input 'Lead Operator' as the Name.\n" +
            "3. Click 'Register New Operator' to initialize this profile in your database, then you can sign in anytime!"
          );
        } else {
          setError(
            "⚠️ Incorrect password, or user account not found.\n\n" +
            "If you haven't created a technician account on this live Firebase database yet, please click 'Register Operator' at the bottom to register first."
          );
        }
      } else {
        setError(err.message || "Authentication checkpoint failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setError("Google Sign-In is not enabled in your Firebase project. Go to Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', select 'Google', and enable it.");
      } else if (err.code === "auth/unauthorized-domain" || err.message?.includes("unauthorized-domain")) {
        setError(
          "⚠️ SECURITY BLOCK: Domain Unauthorized in Firebase.\n\n" +
          "To allow Google Login to proceed, please follow these steps:\n" +
          "1. Click the 'Open in a new tab' button at the top-right of your screen (or open this app in a full browser tab directly).\n" +
          "2. Go to your Firebase Console (console.firebase.google.com) -> Authentication -> 'Settings' tab.\n" +
          "3. Look for 'Authorized domains', click 'Add domain', and paste this exactly:\n" +
          "   ais-dev-trjvjgyc3gzapatniowcyj-670541659352.asia-southeast1.run.app\n" +
          "4. (Optional) Also add the shared domain if needed:\n" +
          "   ais-pre-trjvjgyc3gzapatniowcyj-670541659352.asia-southeast1.run.app\n\n" +
          "Note: Third-party login popups may be blocked or restricted when accessed inside the AI Studio chat preview iframe."
        );
      } else {
        setError(
          `${err.message || "Google Authentication checkpoint failed."}\n\n` +
          "💡 Pro-Tip: Popups and cookies are often restricted inside of iframes. Click the 'Open in a new tab' button at the top-right of the preview to login securely in a standalone tab!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("operator@jamnagar.in");
    setPassword("jamnagar3000");
    setIsRegister(false);
    setError(null);
  };

  return (
    <div id="login-auth-view" className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0F17]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Glassmorphism Authorization Console */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 relative z-10"
      >
        {/* Connection status banner */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${isRealFirebaseConfigured ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"}`} />
          <span className="font-bold tracking-wider uppercase">
            {isRealFirebaseConfigured ? "Firebase Cloud Mode" : "Emulated Security Mode"}
          </span>
        </div>

        {/* Branding Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="font-display font-bold text-slate-100 text-xl uppercase tracking-wide">
            REFINERY SECURITY HUB
          </h2>
          <p className="text-xs text-slate-400 font-sans max-w-[280px] mx-auto">
            Authorized technician terminal sign-in for the Jamnagar Operations & Asset Brain
          </p>
        </div>

        {/* Info or Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-950/65 border border-red-900 rounded-lg p-3 flex items-start space-x-2.5 text-xs text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence initial={false}>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
                  Technician Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required={isRegister}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
              Operator Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@jamnagar.in"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
              Authorization Key / Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs py-3 px-4 rounded-lg shadow-lg shadow-amber-500/10 flex items-center justify-center transition-all cursor-pointer border border-amber-600 uppercase tracking-wider"
          >
            {loading ? (
              <div className="flex items-center space-x-2 font-mono">
                <span className="h-1.5 w-1.5 bg-slate-950 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 bg-slate-950 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 bg-slate-950 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[10px]">VERIFYING SECURITY TOKENS...</span>
              </div>
            ) : (
              <span>{isRegister ? "REGISTER NEW OPERATOR" : "SECURE CLIENT AUTHORIZATION"}</span>
            )}
          </button>
        </form>

        {/* OR Divider and Google Sign-in */}
        <div className="space-y-4">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800/60"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              or security gateway
            </span>
            <div className="flex-grow border-t border-slate-800/60"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white font-mono font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center space-x-2.5 transition-all cursor-pointer border border-slate-800 hover:border-slate-700 uppercase tracking-wider"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign In with Google</span>
          </button>

          <div className="text-[10px] text-center font-sans text-slate-500 leading-normal border border-slate-800/40 rounded-lg p-2 bg-slate-950/40">
            💡 <strong>Iframe Notice:</strong> Popups/cookies might be restricted in the preview pane. If login fails, please click 
            <a 
              href="https://ais-dev-trjvjgyc3gzapatniowcyj-670541659352.asia-southeast1.run.app" 
              target="_blank" 
              rel="noreferrer" 
              className="text-amber-500 hover:underline mx-1 font-semibold"
            >
              Open in a New Tab
            </a> 
            to sign in securely!
          </div>
        </div>

        {/* Toggle options */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
          <span>
            {isRegister ? "Existing operator?" : "New to the refinery?"}
          </span>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-amber-500 hover:text-amber-400 font-bold underline transition-colors cursor-pointer"
          >
            {isRegister ? "Sign In Instead" : "Register Operator"}
          </button>
        </div>

        {/* Demo prefills box */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850 text-[11px] leading-relaxed space-y-2 text-slate-400">
          <div className="flex items-center space-x-2 text-amber-500">
            <Terminal className="h-3.5 w-3.5" />
            <span className="font-mono font-bold uppercase tracking-wider text-[10px]">
              QUICK-ACCESS DEMO BYPASS
            </span>
          </div>
          <p className="text-[10px]">
            {isRealFirebaseConfigured 
              ? "Since you are in Live Firebase mode, please register this demo account first using the 'Register Operator' tab to initialize it in your project's Auth list:" 
              : "To test immediately without custom sign-up, use the pre-configured lead operator credentials:"}
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[9px] text-amber-400 hover:text-amber-300 flex items-center justify-between transition-all cursor-pointer uppercase"
          >
            <span>PREFILL: operator@jamnagar.in</span>
            <Sparkles className="h-3 w-3 shrink-0" />
          </button>
          {isRealFirebaseConfigured && (
            <p className="text-[9px] text-slate-500 italic mt-1 leading-normal">
              💡 <strong>Quick Fix:</strong> Switch to "Register Operator" below, click PREFILL, add a Name, and register!
            </p>
          )}
        </div>

        {/* Configuration notice if real mode is off */}
        {!isRealFirebaseConfigured && (
          <div className="flex items-start space-x-2 text-[9px] font-mono text-slate-500 leading-normal">
            <Info className="h-3 w-3 shrink-0 mt-0.5 text-slate-600" />
            <span>
              Real-time Firebase is waiting for configuration keys inside the <span className="text-slate-400 font-bold">.env.example</span> or developer panel secrets to start cloud synchronization.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
