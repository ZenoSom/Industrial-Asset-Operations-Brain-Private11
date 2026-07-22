import React, { useState } from "react";
import { loginWithFirebase } from "../lib/firebase";
import { ShieldCheck, AlertTriangle, Key, User, Terminal, Sparkles, Lock, Building2, Factory, Activity, Flame, Cpu, Radio, Zap, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginAuthProps {
  onLoginSuccess: (user: any) => void;
  theme?: "dark" | "light";
}

export default function LoginAuth({ onLoginSuccess }: LoginAuthProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // loginWithFirebase accepts emp123 / 1234 offline or real auth
      const user = await loginWithFirebase(employeeId, password);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authorization checkpoint failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmployeeId("emp123");
    setPassword("1234");
    setError(null);
  };

  return (
    <div id="login-auth-view" className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-slate-50 text-slate-800 select-none">
      
      {/* LIGHT ARCHITECTURAL BLUEPRINT GRID & ACCENT GLOWS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-400/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-sky-400/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* MAIN CONTAINER: 2-COLUMN LIGHT SPLIT LAYOUT */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN: DYNAMIC LIGHT-THEMED INDUSTRIAL & BUILDING REFINERY CANVAS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[480px] relative overflow-hidden shadow-xl shadow-slate-200/50"
        >
          {/* Top Status Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 z-10">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600">
                <Factory className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm tracking-wide">
                  INDUSTRIAL KNOWLEDGE INTELLIGENCE
                </h3>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                  INTELLIGENT ASSET & OPERATIONS BRAIN • UNIT ALPHA
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">LIVE 99.9%</span>
            </div>
          </div>

          {/* DYNAMIC INDUSTRIAL ANIMATION CANVAS */}
          <div className="relative w-full h-[270px] my-2 flex items-end justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-sky-50/80 via-slate-50 to-amber-50/30">
            
            {/* Horizon Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />

            {/* Rising Animated Steam/Smoke Clouds */}
            {[1, 2, 3, 4, 5].map((item) => (
              <motion.div
                key={item}
                initial={{ y: 220, opacity: 0, scale: 0.4, x: item * 55 }}
                animate={{ 
                  y: [210, 30, -20], 
                  opacity: [0, 0.35, 0], 
                  scale: [0.5, 1.6, 2.4],
                  x: [item * 55, item * 55 + (item % 2 === 0 ? 35 : -35)]
                }}
                transition={{ 
                  duration: 6 + item * 1.5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: item * 1.1
                }}
                className="absolute w-9 h-9 rounded-full bg-slate-300/40 blur-md pointer-events-none"
              />
            ))}

            {/* Industrial Plant Vector SVG Illustration */}
            <svg viewBox="0 0 800 300" className="w-full h-full object-cover relative z-10">
              <defs>
                {/* Flowing Pipeline Gradient */}
                <linearGradient id="lightPipeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="lightTowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
              </defs>

              {/* Background Silhouette Complex Buildings */}
              <rect x="40" y="110" width="80" height="190" fill="#cbd5e1" opacity="0.6" rx="3" />
              <rect x="130" y="80" width="100" height="220" fill="#94a3b8" opacity="0.4" rx="4" />
              <rect x="240" y="140" width="120" height="160" fill="#cbd5e1" opacity="0.5" rx="3" />
              <rect x="380" y="100" width="90" height="200" fill="#94a3b8" opacity="0.4" rx="3" />
              <rect x="490" y="70" width="110" height="230" fill="#cbd5e1" opacity="0.6" rx="4" />
              <rect x="620" y="130" width="130" height="170" fill="#94a3b8" opacity="0.4" rx="3" />

              {/* Distillation Columns / Fractionating Towers (Crisp Steel Light Gray) */}
              {/* Tower 1 (Left Column) */}
              <rect x="150" y="55" width="34" height="230" fill="url(#lightTowerGrad)" stroke="#64748b" strokeWidth="1.5" rx="17" />
              {[75, 105, 135, 165, 195, 225, 255].map((yVal, i) => (
                <line key={i} x1="150" y1={yVal} x2="184" y2={yVal} stroke="#94a3b8" strokeWidth="1.5" />
              ))}

              {/* Tower 2 (Center High Column) */}
              <rect x="510" y="35" width="44" height="250" fill="url(#lightTowerGrad)" stroke="#475569" strokeWidth="2" rx="22" />
              {[55, 85, 115, 145, 175, 205, 235, 265].map((yVal, i) => (
                <line key={i} x1="510" y1={yVal} x2="554" y2={yVal} stroke="#64748b" strokeWidth="1.5" />
              ))}

              {/* Large Spherical Storage Tanks */}
              <circle cx="290" cy="215" r="48" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
              <line x1="290" y1="167" x2="290" y2="263" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="242" y1="215" x2="338" y2="215" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="670" cy="225" r="38" fill="#f8fafc" stroke="#475569" strokeWidth="2" />

              {/* Flare Stack Tower with Animated Flame */}
              <line x1="750" y1="45" x2="750" y2="285" stroke="#475569" strokeWidth="4.5" />
              <line x1="738" y1="95" x2="762" y2="95" stroke="#64748b" strokeWidth="2" />
              <line x1="738" y1="175" x2="762" y2="175" stroke="#64748b" strokeWidth="2" />

              {/* Flare Stack Animated Flame */}
              <g transform="translate(750, 40)">
                <circle cx="0" cy="0" r="16" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                <path d="M -9 0 Q 0 -25 9 0 Q 0 9 -9 0 Z" fill="#d97706">
                  <animate attributeName="d" values="M -9 0 Q 0 -25 9 0 Q 0 9 -9 0 Z; M -12 0 Q 0 -34 12 0 Q 0 12 -12 0 Z; M -9 0 Q 0 -25 9 0 Q 0 9 -9 0 Z" dur="0.7s" repeatCount="indefinite" />
                </path>
                <path d="M -5 0 Q 0 -14 5 0 Q 0 5 -5 0 Z" fill="#ef4444" />
              </g>

              {/* Interconnecting Plant Pipelines */}
              <path d="M 184 140 H 290 V 215" stroke="#64748b" strokeWidth="3.5" fill="none" />
              <path d="M 290 215 H 510 V 110" stroke="#64748b" strokeWidth="3.5" fill="none" />
              <path d="M 554 150 H 750" stroke="#64748b" strokeWidth="3.5" fill="none" />

              {/* Animated Pipeline Energy Pulse */}
              <path d="M 184 140 H 290 V 215 H 510 V 110 H 750" stroke="url(#lightPipeGlow)" strokeWidth="3.5" strokeDasharray="25 175" fill="none">
                <animate attributeName="stroke-dashoffset" values="200; 0" dur="2.5s" repeatCount="indefinite" />
              </path>

              {/* Tower Safety Flashing Beacon Lights */}
              <circle cx="167" cy="50" r="3.5" fill="#ef4444" className="animate-pulse" />
              <circle cx="532" cy="30" r="4" fill="#ef4444" className="animate-pulse" />
            </svg>

            {/* DYNAMIC ANIMATED TELEMETRY CARDS FLOATING OVER CANVAS */}
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-3 left-3 bg-white/95 border border-slate-200/90 rounded-xl p-2.5 flex items-center space-x-2.5 text-xs font-mono shadow-md backdrop-blur-md"
            >
              <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
                <Cpu className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">OPERATIONS BRAIN</span>
                <span className="text-slate-900 font-bold">GEMINI-3.5 SYNAPSE</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute bottom-3 right-3 bg-white/95 border border-slate-200/90 rounded-xl p-2.5 flex items-center space-x-2.5 text-xs font-mono shadow-md backdrop-blur-md"
            >
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">PLANT SENSOR SCAN</span>
                <span className="text-emerald-600 font-bold">ALL SYSTEMS OK</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-3 right-3 bg-amber-50/90 border border-amber-200 rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5 text-[10px] font-mono text-amber-800 font-bold shadow-sm"
            >
              <RotateCw className="h-3 w-3 animate-spin text-amber-600" />
              <span>RPM: 1,480</span>
            </motion.div>
          </div>

          {/* Bottom Specifications Bar */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 block uppercase text-[9px] font-bold">MONITORED ASSETS</span>
              <span className="text-amber-600 font-bold">P-101 / V-102</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 block uppercase text-[9px] font-bold">COMPLIANCE CODE</span>
              <span className="text-emerald-600 font-bold">OISD-118 READY</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-500 block uppercase text-[9px] font-bold">DATA PROTOCOL</span>
              <span className="text-blue-600 font-bold">AES-256 ENCRYPTED</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: LIGHT-THEMED AUTHORIZATION SIGN-IN FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 p-6 md:p-8 space-y-6 relative"
        >
          {/* Top Security Access Tag */}
          <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-slate-900 text-white shadow-md text-[10px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase">
              SECURE TECHNICIAN LOGIN
            </span>
          </div>

          {/* Branding Title */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 mb-1">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="font-display font-bold text-slate-900 text-xl uppercase tracking-wide">
              REFINERY SECURITY HUB
            </h2>
            <p className="text-xs text-slate-500 font-sans max-w-[280px] mx-auto leading-relaxed">
              Sign in with your technician credentials to access the Unified Asset & Operations Brain
            </p>
          </div>

          {/* Info or Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-red-700"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span className="whitespace-pre-wrap font-sans">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-wider block">
                Operator Employee ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. emp123"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-600 uppercase font-bold tracking-wider block">
                Authorization Key / Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-display font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center transition-all cursor-pointer border border-slate-800 uppercase tracking-wider"
            >
              {loading ? (
                <div className="flex items-center space-x-2 font-mono">
                  <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[10px]">VERIFYING SECURITY TOKENS...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> SECURE CLIENT AUTHORIZATION</span>
              )}
            </button>
          </form>

          {/* Quick Demo Access Box */}
          <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 text-xs leading-relaxed space-y-2 text-slate-700">
            <div className="flex items-center space-x-2 text-amber-800">
              <Terminal className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="font-mono font-bold uppercase tracking-wider text-[10px]">
                QUICK-ACCESS DEMO BYPASS
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">
              To test the platform immediately, click the prefill button below to load offline test credentials:
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2.5 px-3 bg-white hover:bg-amber-100/50 border border-amber-300 rounded-xl font-mono text-[11px] text-slate-900 font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm"
            >
              <span className="text-amber-800">PREFILL: emp123 / 1234</span>
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

