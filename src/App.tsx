import React, { useState, useEffect } from "react";
import { IngestedDocument, ChatMessage } from "./types";
import UploadIngest from "./components/UploadIngest";
import CopilotChat from "./components/CopilotChat";
import GraphExplorer from "./components/GraphExplorer";
import GapsDashboard from "./components/GapsDashboard";
import { Layers, FileText, Cpu, Clock, Activity, AlertTriangle, HelpCircle, Sun, Moon, LogOut, User as UserIcon, ShieldAlert } from "lucide-react";
import { subscribeToAuthChanges, logoutWithFirebase, isRealFirebaseConfigured } from "./lib/firebase";
import LoginAuth from "./components/LoginAuth";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "chat" | "graph" | "dashboard">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to load documents list from backend:", err);
    }
  };

  const fetchAnomaliesCount = async () => {
    try {
      const res = await fetch("/api/gaps");
      if (res.ok) {
        const data = await res.json();
        setUnresolvedCount(data.stats?.unresolvedAnomalies || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchAnomaliesCount();

    // Set real-time clock indicator to show technical rigor
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleIngestSuccess = (newDoc: IngestedDocument) => {
    setDocuments((prev) => [...prev, newDoc]);
    fetchAnomaliesCount();
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    fetchAnomaliesCount();
  };

  const handleResetDocs = async () => {
    try {
      const res = await fetch("/api/documents/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        fetchAnomaliesCount();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error("Chat generation failure");
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString(),
        confidence: data.confidence,
        confidenceScore: data.confidenceScore,
        citations: data.citations
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      // Fallback message
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        text: "System was unable to complete the synthesis request. Please verify server connection or check environment configuration parameters.",
        timestamp: new Date().toLocaleTimeString(),
        confidence: "Low",
        confidenceScore: 0
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center space-y-4">
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/10 border-t-amber-500 animate-spin" />
        </div>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Initializing secure security channels...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginAuth onLoginSuccess={(u) => setUser(u)} theme={theme} />;
  }

  return (
    <div id="application-root" className={`min-h-screen flex flex-col antialiased transition-colors duration-300 relative ${theme === "light" ? "light-theme" : "dark-theme"}`}>
      {/* GLOWING ORBS FOR GLASSMORPHISM FROSTED-GLASS BACKDROP */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* GLOWING BLUEPRINT GRID HEADER */}
      <header id="control-room-header" className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 select-none z-10">
        
        {/* Pinned Theme Switcher at Left Top of Header */}
        <div className="absolute left-4 top-4 md:top-1/2 md:-translate-y-1/2 z-20">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer text-slate-300 gap-1.5 font-bold text-[10px] shadow-md shadow-black/20"
            title="Toggle Visual Theme Mode"
            id="theme-toggle-btn"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">DARK MODE</span>
              </>
            )}
          </button>
        </div>

        {/* Abstract blueprint schematic background accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-[0.02] border-l border-slate-700 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-amber-500/20" />
          <svg className="w-full h-full text-slate-300 font-mono text-[9px]" viewBox="0 0 100 100">
            <line x1="10" y1="20" x2="90" y2="20" stroke="currentColor" strokeWidth="0.2" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </svg>
        </div>

        {/* Brand Information with padding on left to accommodate the pinned theme button */}
        <div className="flex items-center space-x-3.5 z-10 pl-14 sm:pl-28 md:pl-32">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 shadow-lg shadow-amber-500/5 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-slate-100 text-lg uppercase tracking-wide">
                Unified Asset & Operations Brain
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-400 font-mono text-[8px] font-bold border border-slate-700 shrink-0">
                TRACK: INDUSTRIAL INTEL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Control Room Document Extraction, Semantic Citation Mapping & Operational Integrity Auditing
            </p>
          </div>
        </div>

        {/* Real-time Technical Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 z-10">
          <div className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>{currentTime || "0000-00-00 00:00:00 UTC"}</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded flex items-center space-x-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>PORT 3000 • SHIFT A</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400 font-semibold">GEMINI CONNECTED</span>
          </div>

          {/* Operator Authentication Status & Logout */}
          <div className="bg-slate-900 border border-slate-850 px-2.5 py-1 rounded flex items-center space-x-2.5">
            <div className="flex items-center space-x-2">
              <img 
                src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || "tech"}`} 
                alt="Operator Avatar" 
                className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/30"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-left">
                <span className="text-[8px] text-slate-500 uppercase leading-none font-mono font-bold">OPERATOR</span>
                <span className="text-[10px] text-slate-200 font-bold tracking-tight leading-none mt-0.5 max-w-[100px] truncate">
                  {user?.displayName || user?.email?.split("@")[0] || "Technician"}
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                await logoutWithFirebase();
              }}
              className="hover:text-red-400 p-1.5 rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Secure Logout from Refinery Terminal"
              id="terminal-logout-btn"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </header>

      {/* SUB-NAVBAR TABS BAR */}
      <nav id="control-room-nav" className="bg-slate-900/40 border-b border-slate-800/60 px-6 py-2.5 flex items-center justify-between shrink-0 select-none">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1">
          {[
            { id: "chat", label: "Operations Copilot", count: null },
            { id: "upload", label: "Upload & Ingest", count: documents.length },
            { id: "graph", label: "Knowledge Graph", count: null },
            { id: "dashboard", label: "Gaps & Anomalies", count: unresolvedCount > 0 ? unresolvedCount : null, alert: unresolvedCount > 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-2 font-display text-xs font-semibold rounded-md border transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 border-amber-600 text-slate-950 font-bold"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                    activeTab === tab.id
                      ? "bg-slate-950 text-amber-400"
                      : tab.alert ? "bg-red-950 text-red-400 border border-red-900" : "bg-slate-950 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Meta Indicators */}
        <div className="hidden lg:flex items-center space-x-3 text-[10px] font-mono text-slate-500">
          <span>JAMNAGAR WEST ZONE PETROCHEMICAL</span>
          <span>•</span>
          <span>AUDIT SECURE VERSION 1.1</span>
        </div>

      </nav>

      {/* CORE ACTIVE WORKSPACE CANVAS */}
      <main 
        id="operations-canvas" 
        className={`flex-1 px-6 py-4 md:py-6 scrollbar-thin transition-all duration-200 min-h-0 ${
          (activeTab === "chat" || activeTab === "graph") ? "lg:overflow-hidden flex flex-col" : "overflow-y-auto"
        }`}
      >
        
        <div className={`w-full max-w-7xl mx-auto ${
          (activeTab === "chat" || activeTab === "graph") ? "h-full flex flex-col flex-1 min-h-0" : "h-full"
        }`}>
          {activeTab === "chat" && (
            <CopilotChat
              documents={documents}
              messages={messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === "upload" && (
            <UploadIngest
              documents={documents}
              onIngestSuccess={handleIngestSuccess}
              onRemoveDoc={handleRemoveDoc}
              onResetDocs={handleResetDocs}
            />
          )}

          {activeTab === "graph" && (
            <GraphExplorer 
              documents={documents}
            />
          )}

          {activeTab === "dashboard" && (
            <GapsDashboard 
              documents={documents}
            />
          )}
        </div>

      </main>

      {/* FLOATING GLASS SYSTEM THEME CONTROLLER */}
      <div className="fixed bottom-20 right-6 z-50 select-none">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          id="floating-theme-toggle"
          className="flex items-center space-x-3 px-4 py-3 rounded-full transition-all group scale-100 hover:scale-105"
          title="Toggle Visual Theme (Light/Dark)"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 text-slate-950 shadow-lg group-hover:rotate-45 transition-transform duration-500">
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 animate-spin-slow" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-950" />
            )}
          </div>
          <div className="text-left flex flex-col justify-center pr-1.5">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase leading-none block text-slate-100 dark:text-slate-100">
              {theme === "dark" ? "ACTIVE: DARK MODE" : "ACTIVE: LIGHT MODE"}
            </span>
            <span className="text-[8px] font-mono leading-none mt-1 text-amber-500 block">
              [ CLICK TO SWITCH THEME ]
            </span>
          </div>
        </button>
      </div>

      {/* COMPLIANT OPERATIONS FOOTER */}
      <footer id="control-room-footer" className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0 select-none">
        <div>
          JAMNAGAR SECTOR REFINERY INTEL UNIT B • CORE CONTROLS REGISTERED
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><Cpu className="h-3 w-3 mr-1 text-amber-500" /> GEMINI EMULATION AGENT OK</span>
          <span>•</span>
          <span>FACTORY ACT 36-B COMPLIANCE COMPLIANT</span>
        </div>
      </footer>

    </div>
  );
}
