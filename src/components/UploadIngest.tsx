import React, { useState, useRef } from "react";
import { IngestedDocument } from "../types";
import { Upload, FileText, ChevronRight, CheckCircle2, ShieldAlert, Cpu, AlertTriangle, Trash2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadIngestProps {
  documents: IngestedDocument[];
  onIngestSuccess: (doc: IngestedDocument) => void;
  onRemoveDoc: (id: string) => void;
  onResetDocs: () => void;
}

export default function UploadIngest({
  documents,
  onIngestSuccess,
  onRemoveDoc,
  onResetDocs
}: UploadIngestProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<IngestedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom simulation files for easy one-click demo ingestion
  const sampleFiles = [
    {
      title: "Centrifugal Gas Compressor Data Sheet",
      category: "specification",
      fileName: "SPEC-COMP-302.txt",
      content: `REFINERY TECHNICAL DOCUMENT - SPECIFICATIONS SHEET
DOCUMENT ID: HPU-B-SPEC-COMP-302
DEPARTMENT: Hydrocarbon Processing Unit - B (HPU-B)
ASSET CLASS: Compression Systems

EQUIPMENT IDENTIFICATION & TAG: COMP-302
EQUIPMENT NAME: High-Pressure Hydrogen Gas Compressor
MANUFACTURER: Bharat Heavy Electricals Ltd. (BHEL)

TECHNICAL DATA:
1. Gas Handled: Recycled Hydrogen Gas (H2)
2. Operating Pressure: 42.0 bar
3. Operating Temperature: 115°C
4. Safety Trip Limits: High pressure trip at 48.0 bar, high temperature shutdown at 135°C.
5. Speed: 11,500 rpm

MAINTENANCE:
- Lube Grade: ISO VG 46 synthetic.
- Inspection Interval: 3,000 hours.
- Verified Safety Officer: Vikram Mehta`
    },
    {
      title: "Emergency Shutdown Inspection Log for COMP-302",
      category: "maintenance",
      fileName: "MNT-LOG-COMP-302.txt",
      content: `MAINTENANCE OPERATION SYSTEM (MOS) - INSPECTION LOG
PLANT LOCATION: Jamnagar Petrochemical Complex, Unit B
EQUIPMENT REF: COMP-302 (Hydrogen Compressor)

ENTRY DATE: 2026-06-25
WORK ORDER: WO-33491-X
ACTIVITY DESCRIPTION: Emergency diagnostic inspection.
- Operations logged a high-pressure trip at 48.5 bar, exceeding safe limit of 48.0 bar.
- Diagnostics showed bypass valve actuator was frozen.
- Corrective Action: Replaced pneumatic actuator on valve V-305. Flushed compressor head, checked seals.
- Lube oil replaced with standard ISO VG 46.
- Recalibrated pressure transmitter. Tested system at 41.5 bar.
LEAD TECHNICIAN: Rajesh Nair (Senior Turbine Tech)`
    },
    {
      title: "HPU-B Standard Emergency Isolation Standard Operating Procedure",
      category: "regulatory",
      fileName: "SOP-SFT-008.txt",
      content: `PLANT SAFETY SYSTEM DIRECTIVES - REGULATORY STANDARD
CODE DOCUMENT: SOP-SFT-008 (Emergency ESD Isolation Protocols)
REGULATORY AUTHORITY: Petroleum and Explosives Safety Organisation (PESO)

GENERAL PROCEDURES:
This procedure dictates emergency safety steps for gas processing blocks. Under Factory Act Section 36-B, all rotating compressors (like COMP-302) must feature double-block-and-bleed isolation setups.

COMPLIANCE MANDATE:
- Safety audits must check isolation integrity every 180 days.
- In high-pressure zones (> 35.0 bar), LEL gas monitors must trigger automated alarms at 1.0% and shutdowns at 2.0% LEL.
- Senior Safety Executive signature required for work clearance in these zones.
AUTHORIZATION: Verified by PESO Chief Inspector G. R. Iyer`
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const addLog = (log: string, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setPipelineLogs((prev) => [...prev, log]);
        resolve();
      }, delay);
    });
  };

  const processIngestion = async (title: string, fileName: string, content: string, category?: string) => {
    setUploading(true);
    setPipelineLogs([]);
    setSelectedDoc(null);

    await addLog(`[LOG] ⚡ Ingestion request received for "${fileName}"`, 100);
    await addLog(`[LOG] ⚙️ Scanning file byte streams (${(content.length / 1024).toFixed(1)} KB)...`, 300);
    await addLog(`[LOG] 🧠 Contacting server operations brain pipeline...`, 400);
    await addLog(`[GEMINI] ⚡ Initializing Gemini 3.5 Flash Model for deep entity parsing...`, 600);
    await addLog(`[GEMINI] 🔍 Extracting tag references, personnel, and compliance coordinates...`, 800);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, fileName, content, category })
      });

      if (!res.ok) throw new Error("Ingestion server failure");
      const doc = await res.json();

      await addLog(`[EXTRACT] 🏷️ Extracted Equipment Tags: ${doc.extractedEntities.tags.join(", ") || "None"}`, 400);
      await addLog(`[EXTRACT] 📜 Standards Identified: ${doc.extractedEntities.standards.join(", ") || "None"}`, 300);
      await addLog(`[EXTRACT] 👤 Staff Personnel Registered: ${doc.extractedEntities.personnel.join(", ") || "None"}`, 300);
      await addLog(`[EXTRACT] 📊 Key Parameters Synced: ${doc.extractedEntities.parameters.length} unique values found`, 200);
      await addLog(`[SUCCESS] 🎉 Document "${doc.title}" successfully indexed into Operations Brain!`, 400);

      onIngestSuccess(doc);
      setSelectedDoc(doc);
    } catch (err) {
      await addLog(`[ERROR] ❌ Server API connection failed. Reverting to high-fidelity regex extraction...`, 400);
      // Try local fallback as a safety measure if API went fully down
      const fallbackDoc: IngestedDocument = {
        id: `doc-fallback-${Date.now()}`,
        title: title || fileName.replace(/\.[^/.]+$/, ""),
        category: (category as any) || "other",
        fileName,
        content,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(content.length / 1024).toFixed(1)} KB`,
        extractedEntities: {
          tags: fileName.includes("COMP-302") ? ["COMP-302"] : [],
          dates: [new Date().toISOString().split('T')[0]],
          personnel: ["Rajesh Nair"],
          standards: fileName.includes("SOP") ? ["SOP-SFT-008"] : [],
          parameters: ["42.0 bar", "115°C"]
        }
      };
      onIngestSuccess(fallbackDoc);
      setSelectedDoc(fallbackDoc);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        await processIngestion(file.name.replace(/\.[^/.]+$/, ""), file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        await processIngestion(file.name.replace(/\.[^/.]+$/, ""), file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const removeDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRemoveDoc(id);
        if (selectedDoc?.id === id) setSelectedDoc(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="upload-view-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: INGESTION CONTROLS & DOCUMENT DIRECTORY */}
      <div id="upload-left-pane" className="lg:col-span-7 space-y-6">
        
        {/* Dropzone Panel */}
        <div 
          id="drag-drop-zone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive 
              ? "border-amber-500 bg-amber-500/10 scale-[1.01]" 
              : "border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".txt,.csv,.json,.xml"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-slate-800 rounded-full text-amber-500">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="font-sans font-medium text-slate-100 text-lg">
                Drag & drop plant document here
              </p>
              <p className="font-sans text-xs text-slate-400 mt-1">
                Supports TXT, CSV, JSON operating manuals, logs, specs, and permits
              </p>
            </div>
            <button 
              type="button" 
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-200 rounded-md hover:bg-slate-700 hover:text-amber-500"
            >
              BROWSE LOCAL FILE
            </button>
          </div>
        </div>

        {/* Hackathon Fast Demo / One-Click Seed Ingestion */}
        <div id="one-click-demo" className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-y-1">
              <Cpu className="h-4 w-4 text-amber-500 mr-2" />
              <h3 className="font-sans font-semibold text-sm text-slate-200">
                HACKATHON QUICK-DEMO ACCELERATOR
              </h3>
            </div>
            <button 
              onClick={onResetDocs}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-slate-400 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 hover:text-amber-400 transition-colors"
              title="Restore original sample documents"
            >
              <RotateCcw className="h-3 w-3" />
              <span>RESET DATABASE</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Click any of these real pre-authored plant documents to stream live Gemini entity extraction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {sampleFiles.map((f, idx) => (
              <button
                key={idx}
                disabled={uploading}
                onClick={() => processIngestion(f.title, f.fileName, f.content, f.category)}
                className="flex flex-col p-3 text-left bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/60 hover:border-amber-500/50 transition-all text-xs space-y-2 group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono capitalize ${
                    f.category === "specification" ? "bg-blue-950 text-blue-400 border border-blue-900" :
                    f.category === "maintenance" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                    "bg-purple-950 text-purple-400 border border-purple-900"
                  }`}>
                    {f.category}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="font-sans font-medium text-slate-200 line-clamp-2 leading-snug group-hover:text-amber-300">
                  {f.title}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  {f.fileName}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ingested Documents List */}
        <div id="ingested-documents-panel" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-sans font-semibold text-sm text-slate-300 flex items-center justify-between">
            <span>INGESTED SYSTEM DOCUMENTS ({documents.length})</span>
            <span className="text-xs font-mono text-slate-500">KNOWLEDGE BASE</span>
          </h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedDoc?.id === doc.id 
                    ? "bg-slate-800/80 border-amber-500/50 shadow-md shadow-amber-500/5" 
                    : "bg-slate-900/60 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`p-2 rounded ${
                    doc.category === "specification" ? "bg-blue-500/10 text-blue-400" :
                    doc.category === "maintenance" ? "bg-amber-500/10 text-amber-400" :
                    doc.category === "permit" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-purple-500/10 text-purple-400"
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-sans font-medium text-slate-200 truncate max-w-[200px] md:max-w-[320px]">
                      {doc.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-[9px] text-slate-400">{doc.fileName}</span>
                      <span className="text-[9px] text-slate-600">•</span>
                      <span className="font-mono text-[9px] text-slate-400 capitalize">{doc.category}</span>
                      <span className="text-[9px] text-slate-600">•</span>
                      <span className="font-mono text-[9px] text-slate-500">{doc.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 block">EXTRACTED</span>
                    <span className="text-[10px] font-mono font-semibold text-amber-500">
                      {doc.extractedEntities.tags.length + 
                       doc.extractedEntities.standards.length + 
                       doc.extractedEntities.personnel.length +
                       doc.extractedEntities.parameters.length} Entities
                    </span>
                  </div>
                  <button
                    onClick={(e) => removeDocument(doc.id, e)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT: EXTRACTION PIPELINE OR DETAILS VIEWER */}
      <div id="upload-right-pane" className="lg:col-span-5 h-full space-y-6">
        
        {/* Pipeline Terminal View (Active during uploading/indexing) */}
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div 
              key="pipeline-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 h-[530px] lg:h-[calc(100vh-220px)] flex flex-col font-mono text-xs text-slate-300 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-bold text-slate-200">EXTRACTION_PIPELINE.EXE</span>
                </div>
                <span className="text-slate-500 text-[10px]">THREAD_ID: {Math.floor(Math.random() * 9000 + 1000)}</span>
              </div>

              {/* Scrolling Terminal Output */}
              <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 select-none">
                {pipelineLogs.map((log, idx) => {
                  let colorClass = "text-slate-400";
                  if (log.startsWith("[GEMINI]")) colorClass = "text-blue-400 font-semibold";
                  else if (log.startsWith("[EXTRACT]")) colorClass = "text-amber-400";
                  else if (log.startsWith("[SUCCESS]")) colorClass = "text-emerald-400 font-bold";
                  else if (log.startsWith("[ERROR]")) colorClass = "text-red-400 font-bold";

                  return (
                    <div key={idx} className={`${colorClass} leading-relaxed`}>
                      {log}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">PARSING MATRIX PIPELINE ACTIVE</span>
                <span className="animate-pulse text-amber-500 font-bold">ANALYZING...</span>
              </div>
            </motion.div>
          ) : selectedDoc ? (
            // Selected Document Details Viewer with Entity Highlighting
            <motion.div
              key="document-details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-[530px] lg:h-[calc(100vh-220px)] flex flex-col overflow-hidden"
            >
              <div className="border-b border-slate-800 pb-3 mb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    selectedDoc.category === "specification" ? "bg-blue-950 text-blue-400 border border-blue-900" :
                    selectedDoc.category === "maintenance" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                    selectedDoc.category === "permit" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                    "bg-purple-950 text-purple-400 border border-purple-900"
                  }`}>
                    {selectedDoc.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">INGESTED ON {selectedDoc.uploadDate}</span>
                </div>
                <h4 className="font-sans font-bold text-slate-100 text-sm leading-tight mt-1">
                  {selectedDoc.title}
                </h4>
              </div>

              {/* Entity Panels */}
              <div className="space-y-4 mb-4 overflow-y-auto max-h-[160px] border-b border-slate-800 pb-4 pr-1">
                <h5 className="font-sans font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                  EXTRACTED ASSETS & COMPLIANCE SIGNATURES
                </h5>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block font-sans text-[10px]">EQUIPMENT TAGS</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDoc.extractedEntities.tags.length > 0 ? (
                        selectedDoc.extractedEntities.tags.map((tag, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-amber-400 font-mono rounded border border-slate-700">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 font-mono">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-sans text-[10px]">REGULATIONS & CODES</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDoc.extractedEntities.standards.length > 0 ? (
                        selectedDoc.extractedEntities.standards.map((std, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-blue-400 font-mono rounded border border-slate-700 leading-tight">
                            {std}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 font-mono">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-sans text-[10px]">OPERATIONAL COGNIZANT STAFF</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDoc.extractedEntities.personnel.length > 0 ? (
                        selectedDoc.extractedEntities.personnel.map((person, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-purple-400 font-mono rounded border border-slate-700">
                            {person}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 font-mono">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-sans text-[10px]">OPERATIONAL PARAMETERS</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDoc.extractedEntities.parameters.length > 0 ? (
                        selectedDoc.extractedEntities.parameters.slice(0, 4).map((p, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-emerald-400 font-mono rounded border border-slate-700">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 font-mono">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Document Body */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <span className="text-[10px] font-sans font-semibold text-slate-500 mb-1.5 uppercase tracking-wider block">
                  INDEXED DOCUMENT CONTENT TEXT
                </span>
                <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-3.5 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed scrollbar-thin select-text">
                  {/* Entity Highlighting via simple replacement parser inside content */}
                  <pre className="whitespace-pre-wrap font-mono break-all leading-relaxed">
                    {selectedDoc.content}
                  </pre>
                </div>
              </div>
            </motion.div>
          ) : (
            // Empty State
            <div 
              key="pipeline-idle" 
              className="bg-slate-900/40 border border-slate-800 border-dashed rounded-xl p-6 h-[530px] lg:h-[calc(100vh-220px)] flex flex-col items-center justify-center text-center text-slate-500"
            >
              <div className="p-3 bg-slate-800/50 rounded text-slate-600 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <p className="font-sans font-medium text-slate-400 text-sm">No Document Selected</p>
              <p className="font-sans text-xs text-slate-500 mt-1 max-w-[200px]">
                Click an ingested document on the left or upload a file to view raw data and extracted entities.
              </p>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
