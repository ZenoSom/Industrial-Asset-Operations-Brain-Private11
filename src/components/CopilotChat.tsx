import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, IngestedDocument } from "../types";
import { Send, FileText, ChevronDown, ChevronUp, AlertCircle, ShieldCheck, Zap, Info, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CopilotChatProps {
  documents: IngestedDocument[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
}

export default function CopilotChat({
  documents,
  messages,
  onSendMessage,
  isGenerating
}: CopilotChatProps) {
  const [userInput, setUserInput] = useState("");
  const [expandedCitationIdx, setExpandedCitationIdx] = useState<string | null>(null);
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

  return (
    <div id="copilot-chat-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px] lg:h-full lg:max-h-[calc(100vh-220px)] items-stretch flex-1 min-h-0">
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
                {documents.map((d, idx) => (
                  <div key={d.id} className="flex items-center space-x-2 text-[10px] text-slate-300">
                    <FileText className="h-3 w-3 text-amber-500/75 shrink-0" />
                    <span className="truncate font-mono font-medium">{d.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
        <div className="border-b border-slate-800 bg-slate-950 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-sans font-bold text-sm text-slate-200">
              TACTICAL OPERATIONS COPILOT CHAT
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            SECURE REFINERY PORT: 3000
          </span>
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
  );
}
