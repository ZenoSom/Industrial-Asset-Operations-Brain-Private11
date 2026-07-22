import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, IngestedDocument } from "../types";
import { 
  Send, FileText, ChevronDown, ChevronUp, AlertCircle, ShieldCheck, Zap, Info, Clock,
  Printer, User, Phone, Building, X, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CopilotChatProps {
  documents: IngestedDocument[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  onNavigateToDoc?: (titleOrFileName: string) => void;
}

export default function CopilotChat({
  documents,
  messages,
  onSendMessage,
  isGenerating,
  onNavigateToDoc
}: CopilotChatProps) {
  const [userInput, setUserInput] = useState("");
  const [expandedCitationIdx, setExpandedCitationIdx] = useState<string | null>(null);
  
  // Print Report States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [department, setDepartment] = useState("Jamnagar Refinery - Bay 2 / Shift Alpha");
  const [reportNotes, setReportNotes] = useState("Tactical operational query log and plant compliance verification.");
  const [showPreview, setShowPreview] = useState(false);
  const [reportId] = useState(() => `RPT-${Math.floor(100000 + Math.random() * 900000)}`);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested cross-document query templates that showcase true reasoning capabilities
  const queryTemplates = [
    {
      label: "Thermal Limit Breach on P-101",
      prompt: "What caused the emergency shutdown of P-101 in May 2026, and did it exceed its design operating specifications?"
    },
    {
      label: "Safety & Work Permit Compliance",
      prompt: "What regulatory standards govern welding near the P-101 bay, and what isolation safety checks were signed off?"
    },
    {
      label: "Lube Oil Audit & Technical Lead",
      prompt: "What is the primary lube oil grade specified for P-101, and which technician logged its use during the maintenance log?"
    }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGenerating) return;
    onSendMessage(userInput.trim());
    setUserInput("");
  };

  const selectTemplate = (prompt: string) => {
    if (isGenerating) return;
    onSendMessage(prompt);
  };

  const toggleCitation = (msgId: string, citIdx: number) => {
    const key = `${msgId}-${citIdx}`;
    if (expandedCitationIdx === key) {
      setExpandedCitationIdx(null);
    } else {
      setExpandedCitationIdx(key);
    }
  };

  const handleExecutePrint = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPrintModalOpen(false);
    setShowPreview(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleTogglePreview = () => {
    setIsPrintModalOpen(false);
    setShowPreview(true);
  };

  return (
    <div id="copilot-chat-container" className="flex flex-col space-y-4">
      
      {/* Main Copilot Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px] lg:h-full lg:max-h-[calc(100vh-220px)] items-stretch flex-1 min-h-0">
        
        {/* LEFT COLUMN: ACTIVE COGNITIVE GRAPH / KNOWLEDGE POOL STATS */}
        <div id="copilot-left-sidebar" className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-1 border-b border-slate-800 pb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider">
                Cognitive Brain Index
              </h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                The operations copilot leverages a real-time semantic retrieval index mapped over active plant files.
              </p>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">INDEXED KNOWLEDGE BASE</span>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {documents.map((d) => (
                    <div key={d.id} className="flex items-center space-x-2 text-[10px] text-slate-300">
                      <FileText className="h-3 w-3 text-amber-500/75 shrink-0" />
                      <span className="truncate font-mono font-medium">{d.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Print Report Trigger Button in Left Sidebar */}
          <div className="space-y-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="w-full py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 hover:border-amber-500 rounded-lg font-mono text-[11px] font-bold transition-all uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>Print Official Report</span>
            </button>
          </div>

          {/* Cognitive status */}
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-mono uppercase">RETRIEVAL CHANNELS</span>
              <span className="text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono text-slate-300">Gemini-3.5-Flash</span>
            </div>
            <p className="text-[9px] text-slate-500">
              Real cross-document embeddings active for multi-part synthesis queries.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CHAT PANEL */}
        <div id="copilot-main-panel" className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          
          {/* Terminal Header */}
          <div className="border-b border-slate-800 bg-slate-950 px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-sans font-bold text-sm text-slate-200">
                TACTICAL OPERATIONS COPILOT CHAT
              </h3>
            </div>

            {/* Print Official Report Button in Top Bar */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="py-1 px-2.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 hover:border-amber-500 rounded font-mono text-[10.5px] font-bold transition-all uppercase flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Report</span>
              </button>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                PORT: 3000
              </span>
            </div>
          </div>

          {/* Messages Space */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin select-text">
            {messages.length === 0 ? (
              // Chat Welcomes / Template Suggestion
              <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto space-y-5 select-none">
                <div className="p-4 bg-slate-850 rounded-full text-amber-500">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-slate-100 text-lg">
                    Unified Refinery Brain Intelligence
                  </h4>
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    Ask real operational questions. The Copilot will scan across specifications, logs, and work permits, returning structured answers backed by exact source citations.
                  </p>
                </div>

                {/* Suggestions */}
                <div className="w-full space-y-2.5 pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    DEMO CROSS-DOCUMENT REASONING PATHS
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {queryTemplates.map((qt, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectTemplate(qt.prompt)}
                        className="text-left p-3 bg-slate-950 hover:bg-slate-950/70 border border-slate-800 rounded-lg text-xs hover:border-amber-500/50 group transition-all"
                      >
                        <span className="text-[10px] font-mono text-amber-500 font-semibold block mb-1">
                          SCENARIO: {qt.label}
                        </span>
                        <p className="font-sans text-slate-300 group-hover:text-slate-100 line-clamp-1">
                          "{qt.prompt}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    {/* Speaker Label */}
                    <span className="font-mono text-[9px] text-slate-500 mb-1">
                      {msg.role === "user" ? "COGNIZANT_TECHNICIAN" : "OPERATIONS_BRAIN"} @ {msg.timestamp}
                    </span>

                    {/* Bubble Container */}
                    <div
                      className={`rounded-xl px-4 py-3 text-xs leading-relaxed select-text ${
                        msg.role === "user"
                          ? "bg-slate-800 border border-slate-700 text-slate-100"
                          : "bg-slate-950 border border-slate-850 text-slate-200"
                      }`}
                    >
                      {/* Render Confidence Score Badge for Assistant Responses */}
                      {msg.role === "assistant" && msg.confidence && (
                        <div className="flex items-center space-x-1.5 mb-2.5 pb-1.5 border-b border-slate-850">
                          {msg.confidence === "High" ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span className={`font-mono text-[9px] font-bold ${
                            msg.confidence === "High" ? "text-emerald-400" : "text-amber-500"
                          }`}>
                            {msg.confidenceScore}% COGNITIVE CONFIDENCE INDICATOR ({msg.confidence} MATCH)
                          </span>
                        </div>
                      )}

                      {/* Markdown Renderer simulation */}
                      <div className="font-sans whitespace-pre-wrap leading-relaxed select-text">
                        {msg.text}
                      </div>

                      {/* Citations Box inside assistant response bubble */}
                      {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-900 space-y-2 select-none">
                          <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider block">
                            EVIDENTIARY SOURCE CITATIONS ({msg.citations.length})
                          </span>
                          
                          <div className="grid grid-cols-1 gap-1.5">
                            {msg.citations.map((cit, idx) => {
                              const isExpanded = expandedCitationIdx === `${msg.id}-${idx}`;
                              return (
                                <div
                                  key={idx}
                                  className="bg-slate-900 border border-slate-800 rounded overflow-hidden transition-all"
                                >
                                  {/* Citation Heading Row */}
                                  <button
                                    onClick={() => toggleCitation(msg.id, idx)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                                  >
                                    <span className="flex items-center space-x-1.5 truncate max-w-[90%]">
                                      <FileText className="h-3 w-3 text-amber-500/85 shrink-0" />
                                      <span className="text-[10px] font-semibold text-amber-500">[Doc-{idx + 1}]</span>
                                      <span className="truncate text-slate-300">{cit.sourceDocument}</span>
                                    </span>
                                    {isExpanded ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                                  </button>

                                  {/* Expanded Snippet Details */}
                                  {isExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-slate-850 bg-slate-950/80 text-[10px] space-y-2">
                                      <div className="flex justify-between items-center text-[9px] text-slate-500">
                                        <span>LOCATION: <span className="text-slate-400 font-mono">{cit.pageOrSection}</span></span>
                                      </div>
                                      <div className="border-l border-amber-500 pl-2 py-1 bg-amber-500/5 text-slate-300 italic whitespace-pre-wrap font-mono">
                                        "{cit.snippet}"
                                      </div>
                                      <div className="text-slate-400 leading-normal">
                                        <span className="font-semibold text-slate-500 text-[9px] block">RELEVANCE MAP:</span>
                                        {cit.relevance}
                                      </div>
                                      {onNavigateToDoc && (
                                        <button
                                          onClick={() => onNavigateToDoc(cit.sourceDocument)}
                                          className="mt-2 w-full py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-500 rounded border border-amber-500/20 hover:border-amber-500 text-[9px] font-mono font-bold transition-all uppercase flex items-center justify-center space-x-1 cursor-pointer"
                                        >
                                          <FileText className="h-3 w-3 shrink-0" />
                                          <span>Inspect Ingested Source Document</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Status */}
                {isGenerating && (
                  <div className="flex flex-col max-w-[80%] mr-auto items-start">
                    <span className="font-mono text-[9px] text-slate-500 mb-1">
                      OPERATIONS_BRAIN @ THINKING
                    </span>
                    <div className="rounded-xl px-4 py-3 text-xs bg-slate-950 border border-slate-850 text-slate-400 flex items-center space-x-2">
                      <span className="flex space-x-1">
                        <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      <span className="font-mono text-[10px] ml-2 text-slate-500 uppercase">
                        Scanning repository & generating cited response...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Form Bar */}
          <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-950 p-3 flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isGenerating}
              placeholder="Query specifications, temperature anomalies, safety isolating permits..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isGenerating}
              className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
                userInput.trim() && !isGenerating
                  ? "bg-amber-500 border-amber-600 text-slate-950 hover:bg-amber-400 cursor-pointer"
                  : "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      </div>

      {/* OPERATOR DETAILS FORM MODAL FOR PRINTING REPORT */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="h-5 w-5 text-amber-500" />
                <h3 className="font-sans font-bold text-base uppercase tracking-wide text-slate-100">
                  Generate Official Operations Report
                </h3>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)} 
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Provide your operational name and contact/badge number to stamp the generated report. This creates a formatted audit document including your Copilot queries and exact document citations.
            </p>

            <form onSubmit={handleExecutePrint} className="space-y-4 text-xs font-sans">
              {/* Operator Name */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Operator / Engineer Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Somnath Singh (Lead Engineer)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Contact / Badge Number */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Contact Number / Employee Badge ID <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +1 555-0192 or Badge #OP-8842"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Department / Unit */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Plant Department / Shift Unit
                </label>
                <div className="relative">
                  <Building className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Jamnagar Refinery - Bay 2 / Shift Alpha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Shift Notes / Observations */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Shift Notes / Inspection Remarks
                </label>
                <textarea
                  rows={2}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Add any specific audit notes or shift handover instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans text-xs resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>Preview Document</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Report Now</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE REPORT CONTAINER (Triggered on Print or Preview Mode) */}
      <div 
        id="official-copilot-print-report" 
        className={showPreview ? "block my-4 p-6 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl font-sans text-slate-900" : "hidden print:block"}
      >
        {/* Report Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0" />
              <h1 className="text-xl font-bold font-display uppercase tracking-tight text-slate-900">
                UNIFIED ASSET & OPERATIONS BRAIN
              </h1>
            </div>
            <p className="text-xs font-mono uppercase text-slate-600 font-bold">
              OFFICIAL TACTICAL PLANT AUDIT & INTELLIGENCE REPORT
            </p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-600 space-y-0.5">
            <div className="font-bold text-slate-900 text-xs">REPORT ID: #{reportId}</div>
            <div>STAMPED DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-amber-700 font-bold uppercase">CLASSIFICATION: CONFIDENTIAL REFINERY LOG</div>
          </div>
        </div>

        {/* OPERATOR METADATA CARD */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase font-bold block">OPERATOR / ENGINEER NAME</span>
            <span className="font-bold text-slate-900 text-sm">{operatorName || "Somnath Singh (Lead Operator)"}</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase font-bold block">CONTACT / BADGE NO.</span>
            <span className="font-bold text-slate-900 text-sm">{contactNumber || "#OP-8842 (+1 555-0192)"}</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase font-bold block">DEPARTMENT / SHIFT</span>
            <span className="font-medium text-slate-800">{department || "Refinery Unit 1 / Shift Alpha"}</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-slate-500 uppercase font-bold block">TOTAL AUDIT QUERIES</span>
            <span className="font-bold text-amber-700">{messages.filter(m => m.role === 'user').length} Questions Recorded</span>
          </div>
          {reportNotes && (
            <div className="col-span-2 md:col-span-4 border-t border-slate-200 pt-2.5 mt-1">
              <span className="font-mono text-[10px] text-slate-500 uppercase font-bold block">SHIFT HANDOVER / INSPECTION NOTES</span>
              <p className="text-slate-700 italic text-xs">{reportNotes}</p>
            </div>
          )}
        </div>

        {/* INDEXED DOCUMENTS SUMMARY */}
        <div className="mb-6">
          <h3 className="font-mono text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
            ACTIVE INGESTED PLANT REPOSITORY ({documents.length} FILES)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {documents.map((doc, idx) => (
              <div key={doc.id} className="p-2 border border-slate-200 rounded bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-slate-800 truncate">{idx + 1}. {doc.fileName}</span>
                <span className="text-[9px] text-slate-500 uppercase bg-slate-200 px-1.5 py-0.5 rounded">{doc.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COPILOT TRANSCRIPT */}
        <div className="mb-6 space-y-4">
          <h3 className="font-mono text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
            TACTICAL OPERATIONS COPILOT CHAT TRANSCRIPT & CITATION LOG
          </h3>

          {messages.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-slate-300 rounded">
              No active chat queries recorded during this session.
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id} className="border border-slate-300 rounded-lg p-3 text-xs space-y-2 bg-slate-50/50">
                <div className="flex justify-between items-center font-mono text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-900 uppercase">
                    {msg.role === "user" ? `QUERY #${idx + 1} - OPERATOR (${operatorName || "TECHNICIAN"})` : "OPERATIONS COPILOT INTEL ANSWER"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {msg.text}
                </div>

                {msg.confidenceScore && (
                  <div className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                    Cognitive Confidence Indicator: {msg.confidenceScore}% ({msg.confidence} Match)
                  </div>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-600 uppercase block">
                      Evidence & Source Citations ({msg.citations.length}):
                    </span>
                    {msg.citations.map((c, cIdx) => (
                      <div key={cIdx} className="bg-white border border-slate-200 rounded p-2 text-[11px] font-mono space-y-1">
                        <div className="font-bold text-amber-800">
                          Source: {c.sourceDocument} ({c.pageOrSection})
                        </div>
                        <div className="text-slate-700 italic border-l-2 border-amber-500 pl-2">
                          "{c.snippet}"
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          Relevance: {c.relevance}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* SIGN-OFF & STAMP BLOCK */}
        <div className="border-t-2 border-slate-900 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs font-sans">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block mb-1">PREPARED BY OPERATOR</span>
              <div className="font-bold text-slate-900 text-sm">{operatorName || "Somnath Singh"}</div>
              <div className="text-slate-600 font-mono text-[11px]">{contactNumber || "#OP-8842"}</div>
            </div>
            <div className="border-b border-slate-400 w-48 h-8" />
            <span className="text-[10px] text-slate-500 font-mono">Operator Signature & Date</span>
          </div>

          <div className="space-y-6 text-right">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block mb-1">PLANT SAFETY AUDITOR VERIFICATION</span>
              <div className="font-bold text-slate-900 text-sm">Refinery Shift Superintendent</div>
              <div className="text-slate-600 font-mono text-[11px]">Control Room Alpha</div>
            </div>
            <div className="border-b border-slate-400 w-48 h-8 ml-auto" />
            <span className="text-[10px] text-slate-500 font-mono">Auditor Sign-off & Official Stamp</span>
          </div>
        </div>

        {/* Close Preview Action if viewing on screen */}
        {showPreview && (
          <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between items-center print:hidden">
            <span className="text-xs text-slate-500 font-mono">On-screen Print Preview Mode Active</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 font-medium text-xs cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 flex items-center space-x-1 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Trigger Printer / Export PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
