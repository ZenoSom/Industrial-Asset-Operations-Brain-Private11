import React, { useState, useEffect } from "react";
import { OperationalGap, PlantStats } from "../types";
import { ShieldAlert, CheckCircle2, AlertTriangle, Hammer, RefreshCw, FileQuestion, Activity, ClipboardList, Info } from "lucide-react";
import { motion } from "motion/react";

interface GapsDashboardProps {
  documents: any[]; // trigger re-render when active documents change
}

export default function GapsDashboard({ documents }: GapsDashboardProps) {
  const [gaps, setGaps] = useState<OperationalGap[]>([]);
  const [stats, setStats] = useState<PlantStats>({
    totalDocuments: 3,
    linkedAssets: 2,
    activePermits: 1,
    unresolvedAnomalies: 0,
    complianceScore: 100
  });
  const [loading, setLoading] = useState(false);

  const fetchGapsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gaps");
      if (res.ok) {
        const data = await res.json();
        setGaps(data.gaps);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load gaps dashboard: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapsData();
  }, [documents]);

  // SVG Gauge calculations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.complianceScore / 100) * circumference;

  let scoreColor = "#10B981"; // green
  if (stats.complianceScore < 75) scoreColor = "#F59E0B"; // amber
  if (stats.complianceScore < 60) scoreColor = "#EF4444"; // red

  return (
    <div id="gaps-dashboard-view" className="space-y-6">
      
      {/* SCORECARD ROW & COMPLIANCE GAUGE */}
      <div id="dashboard-metrics-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Compliance Dial Widget */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
          <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider self-start">
            Safety & Audit Compliance Rating
          </h4>

          <div className="relative flex items-center justify-center">
            {/* SVG Speed Dial Circular Gauge */}
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                fill="transparent"
                stroke="#1E293B"
                strokeWidth={strokeWidth}
              />
              {/* Dynamic compliance stroke */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                fill="transparent"
                stroke={scoreColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Absolute Centered Score Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-sans font-extrabold text-3xl text-slate-100">
                {stats.complianceScore}%
              </span>
              <span className="font-mono text-[9px] text-slate-500 tracking-wider">
                RATING INDEX
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              stats.complianceScore >= 80 ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900" :
              stats.complianceScore >= 60 ? "bg-amber-950/80 text-amber-400 border border-amber-900" :
              "bg-red-950/80 text-red-400 border border-red-900"
            }`}>
              {stats.complianceScore >= 80 ? "OPERATIONAL GO-AHEAD" : 
               stats.complianceScore >= 60 ? "ELEVATED AUDIT CAUTION" : 
               "SAFETY SHUTDOWN WARN"}
            </span>
            <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] mx-auto pt-1">
              {stats.complianceScore === 100 
                ? "Perfect alignment. All asset logs map successfully to spec sheets and safety standards."
                : `Programmatic analysis detected ${gaps.length} pending integrity or threshold gaps.`}
            </p>
          </div>
        </div>

        {/* Technical Statistics Panel */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">
              Control Room System Indicators
            </h4>
            <span className="font-mono text-[9px] text-slate-500">REALTIME MATRIX AUDITING</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            
            {/* Stat Item 1 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-850/60 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Ingested Files</span>
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <span className="font-sans font-bold text-xl text-slate-200">{stats.totalDocuments}</span>
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-850/60 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Linked Assets</span>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="font-sans font-bold text-xl text-slate-200">{stats.linkedAssets}</span>
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-850/60 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">High-Risk Permits</span>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-sans font-bold text-xl text-slate-200">{stats.activePermits}</span>
              </div>
            </div>

            {/* Stat Item 4 */}
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-850/60 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Logged Anomalies</span>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span className="font-sans font-bold text-xl text-red-400">{stats.unresolvedAnomalies}</span>
              </div>
            </div>

          </div>

          {/* Quick System Health Alert */}
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-start space-x-3 text-[11px] text-slate-400">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-slate-200">Continuous Integrity Checker Running</p>
              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                The operations brain compares technical metrics (limits, thresholds, temperatures) and permit compliance codes across unrelated files. Gaps below list omissions or safety violations discovered.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* DETECTED GAP WORKLIST */}
      <div id="detected-gaps-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileQuestion className="h-4.5 w-4.5 text-amber-500" />
            <h3 className="font-sans font-bold text-sm text-slate-200">
              LOGICAL OPERATIONAL GAPS & INTEGRITY OVERLAPS ({gaps.length})
            </h3>
          </div>
          {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />}
        </div>

        {gaps.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs select-none">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            No logical gaps discovered. Plant database meets full compliance metrics.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {gaps.map((gap) => {
              let sevColorClass = "";
              if (gap.severity === "critical") sevColorClass = "bg-red-950 text-red-400 border-red-900";
              else if (gap.severity === "high") sevColorClass = "bg-amber-950 text-amber-400 border-amber-900";
              else sevColorClass = "bg-yellow-950 text-yellow-500 border-yellow-900";

              return (
                <div
                  key={gap.id}
                  className="bg-slate-950 border border-slate-850/60 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-slate-700/80"
                >
                  {/* Left part: Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold capitalize border ${sevColorClass}`}>
                        {gap.severity} RISK
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {gap.type}
                      </span>
                      <span className="text-slate-600 font-mono text-[9px]">•</span>
                      <span className="font-mono text-[10px] text-amber-500 font-semibold">
                        TAG: {gap.equipmentTag}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans font-bold text-slate-200 text-sm leading-snug">
                        {gap.title}
                      </h4>
                      <p className="font-sans text-xs text-slate-400 leading-relaxed">
                        {gap.description}
                      </p>
                    </div>

                    {/* Action Recommendation Box */}
                    <div className="bg-slate-900 border border-slate-850/80 rounded-lg p-3 flex items-start space-x-2 text-[11px] text-slate-300">
                      <Hammer className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[9px] font-mono text-slate-500 uppercase block mb-0.5">RECOMMENDED AUDIT MITIGATION</span>
                        {gap.recommendation}
                      </div>
                    </div>
                  </div>

                  {/* Right part: Trigger Info Box */}
                  <div className="md:w-[180px] bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2 shrink-0 self-stretch">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">TRIGGERING SOURCE</span>
                      <span className="text-[10px] font-mono text-slate-300 break-all">{gap.sourceRef}</span>
                    </div>
                    <div className="border-t border-slate-850 pt-1 text-[9px] font-mono text-slate-500 text-right">
                      ID: {gap.id.substring(0, 15)}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
