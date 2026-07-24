import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Download,
  Eye,
  X,
  TrendingUp,
  ShieldAlert,
  Target,
  Users,
  Swords,
  DollarSign,
  Rocket,
  CheckCircle2,
  Sparkles,
  PieChart,
  BarChart3,
  Layers,
  Award
} from "lucide-react";
import { MarketAnalysisReport } from "../types";
import { downloadMarketAnalysisPDF } from "../utils/pdfGenerator";

interface MarketAnalysisCardProps {
  report: MarketAnalysisReport;
  onOpenModal: (report: MarketAnalysisReport) => void;
}

export const MarketAnalysisCard: React.FC<MarketAnalysisCardProps> = ({
  report,
  onOpenModal
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadDirect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    await downloadMarketAnalysisPDF(report, `pdf-render-${report.id}`);
    setIsDownloading(false);
  };

  const scoreColor =
    report.viabilityScore >= 75
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : report.viabilityScore >= 50
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-rose-400 bg-rose-500/10 border-rose-500/30";

  return (
    <div className="my-3 rounded-2xl border border-cyan-500/30 bg-slate-900/90 dark:bg-slate-950/90 p-4 shadow-xl text-slate-100 overflow-hidden relative group">
      {/* Background Accent glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 text-[#00e5ff] rounded-lg border border-cyan-500/30">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#00e5ff]">
              Full Market Analysis Report
            </span>
            <h4 className="text-xs font-bold text-slate-100 truncate max-w-[220px]">
              {report.ideaTitle}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${scoreColor}`}>
            Score {report.viabilityScore}/100
          </span>
        </div>
      </div>

      {/* Summary Tagline */}
      <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed italic">
        "{report.tagline}"
      </p>

      {/* Quick TAM/SAM/SOM Metrics */}
      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">TAM</span>
          <span className="text-xs font-bold text-cyan-400">{report.tamEstimate}</span>
        </div>
        <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">SAM</span>
          <span className="text-xs font-bold text-indigo-400">{report.samEstimate}</span>
        </div>
        <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
          <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">SOM</span>
          <span className="text-xs font-bold text-emerald-400">{report.somEstimate}</span>
        </div>
      </div>

      {/* Action Buttons on Chat Screen */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onOpenModal(report)}
          className="flex-1 py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00e5ff] font-bold text-xs rounded-xl border border-cyan-500/40 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Report / Dekhein</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadDirect}
          disabled={isDownloading}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 active:scale-95 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden Offscreen Render Container for Direct Canvas PDF Export */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
        <MarketAnalysisPDFContent report={report} id={`pdf-render-${report.id}`} />
      </div>
    </div>
  );
};

interface MarketAnalysisModalProps {
  report: MarketAnalysisReport | null;
  onClose: () => void;
}

export const MarketAnalysisModal: React.FC<MarketAnalysisModalProps> = ({
  report,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "target" | "swot" | "competitors" | "financials" | "gtm">("summary");
  const [isExporting, setIsExporting] = useState(false);

  if (!report) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    await downloadMarketAnalysisPDF(report, `modal-pdf-content-${report.id}`);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-[#00e5ff] rounded-xl border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Institutional Market Analysis
                </span>
                <span className="text-xs text-slate-400">{report.date}</span>
              </div>
              <h2 className="text-base md:text-lg font-black text-slate-100 tracking-tight">
                {report.ideaTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF / PDF Download karein</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: "summary", label: "Executive Summary", icon: PieChart },
            { id: "target", label: "Target Audience", icon: Users },
            { id: "swot", label: "SWOT Matrix", icon: Layers },
            { id: "competitors", label: "Competitors & Moat", icon: Swords },
            { id: "financials", label: "Unit Economics", icon: DollarSign },
            { id: "gtm", label: "GTM Roadmap", icon: Rocket }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#00e5ff] text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Executive Summary View */}
          {activeTab === "summary" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score & Market Size Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    Viability Score
                  </span>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-3xl font-black text-[#00e5ff]">
                      {report.viabilityScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">High Growth Potential</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    TAM (Total Market)
                  </span>
                  <span className="text-2xl font-black text-cyan-400 my-1">
                    {report.tamEstimate}
                  </span>
                  <span className="text-[10px] text-slate-400">Global Addressable Opportunity</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    SAM (Serviceable Market)
                  </span>
                  <span className="text-2xl font-black text-indigo-400 my-1">
                    {report.samEstimate}
                  </span>
                  <span className="text-[10px] text-slate-400">Serviceable Target Segment</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    SOM (Obtainable Share)
                  </span>
                  <span className="text-2xl font-black text-emerald-400 my-1">
                    {report.somEstimate}
                  </span>
                  <span className="text-[10px] text-slate-400">Realistic 3-Year Capture</span>
                </div>
              </div>

              {/* Tagline & Executive Summary */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-[#00e5ff] tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Executive Overview
                </h3>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Key Strategic Recommendations */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" /> Key Strategic Recommendations
                </h3>
                <ul className="space-y-2">
                  {report.keyRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Target Audience View */}
          {activeTab === "target" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Target Customer Persona
                </span>
                <h3 className="text-base font-bold text-white">{report.targetAudience.persona}</h3>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-400">Willingness to Pay: </strong>
                  {report.targetAudience.willingnessToPay}
                </div>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-rose-400 tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4" /> Core User Pain Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {report.targetAudience.painPoints.map((pp, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200">
                      <span className="text-rose-400 font-bold font-mono text-xs block mb-1">0{idx + 1}.</span>
                      {pp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SWOT Matrix View */}
          {activeTab === "swot" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              <div className="p-5 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Strengths (Internal)
                </h3>
                <ul className="space-y-2">
                  {report.swot.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-amber-950/20 rounded-2xl border border-amber-500/30 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Weaknesses (Internal)
                </h3>
                <ul className="space-y-2">
                  {report.swot.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-cyan-950/20 rounded-2xl border border-cyan-500/30 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Opportunities (External)
                </h3>
                <ul className="space-y-2">
                  {report.swot.opportunities.map((o, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-rose-950/20 rounded-2xl border border-rose-500/30 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-rose-400 tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Threats (External)
                </h3>
                <ul className="space-y-2">
                  {report.swot.threats.map((t, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Competitors View */}
          {activeTab === "competitors" && (
            <div className="space-y-4 animate-fadeIn">
              {report.competitors.map((comp, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Swords className="w-4 h-4 text-indigo-400" /> {comp.name}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="block text-[10px] font-mono text-emerald-400 font-bold mb-1">STRENGTH</span>
                      <p className="text-slate-300">{comp.strengths}</p>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="block text-[10px] font-mono text-rose-400 font-bold mb-1">WEAKNESS</span>
                      <p className="text-slate-300">{comp.weakness}</p>
                    </div>
                    <div className="p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/30">
                      <span className="block text-[10px] font-mono text-cyan-400 font-bold mb-1">OUR UNFAIR EDGE</span>
                      <p className="text-cyan-200 font-medium">{comp.ourEdge}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Financials / Unit Economics View */}
          {activeTab === "financials" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Estimated CAC</span>
                  <div className="text-2xl font-black text-rose-400 my-1">{report.unitEconomics.estimatedCac}</div>
                  <span className="text-[10px] text-slate-400">Customer Acquisition Cost</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Estimated LTV</span>
                  <div className="text-2xl font-black text-emerald-400 my-1">{report.unitEconomics.estimatedLtv}</div>
                  <span className="text-[10px] text-slate-400">12-Month Lifetime Value</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Payback Period</span>
                  <div className="text-2xl font-black text-cyan-400 my-1">{report.unitEconomics.paybackPeriod}</div>
                  <span className="text-[10px] text-slate-400">CAC Recoup Timeline</span>
                </div>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Monetization Architecture
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {report.unitEconomics.pricingModel}
                </p>
              </div>
            </div>
          )}

          {/* GTM Roadmap View */}
          {activeTab === "gtm" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
                  Primary Customer Acquisition Channels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.goToMarket.primaryChannels.map((chan, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium">
                      🚀 {chan}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-cyan-950/20 rounded-2xl border border-cyan-500/30 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Viral Growth Loop / Hook
                </span>
                <p className="text-xs text-cyan-200 leading-relaxed font-medium">
                  {report.goToMarket.viralHook}
                </p>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                  Milestone Execution Roadmap
                </h3>
                <div className="space-y-3">
                  {report.goToMarket.milestones.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shrink-0">
                        {m.phase}
                      </span>
                      <p className="text-xs text-slate-200 ml-3 flex-1">{m.goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Printable Element Container for PDF Export */}
        <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
          <MarketAnalysisPDFContent report={report} id={`modal-pdf-content-${report.id}`} />
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Clean, structured A4-formatted PDF export layout component
 */
export const MarketAnalysisPDFContent: React.FC<{ report: MarketAnalysisReport; id: string }> = ({
  report,
  id
}) => {
  return (
    <div id={id} className="w-[800px] p-8 bg-slate-950 text-slate-100 font-sans space-y-6">
      {/* Document Top Header */}
      <div className="pb-6 border-b-2 border-cyan-500 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[10px] font-mono font-bold tracking-widest uppercase border border-cyan-500/40">
              CORE AI VENTURE REPORT
            </span>
            <span className="text-xs text-slate-400 font-mono">{report.date}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{report.ideaTitle}</h1>
          <p className="text-xs text-cyan-400 italic mt-1">{report.tagline}</p>
        </div>

        <div className="text-right space-y-1">
          <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 inline-block">
            <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Viability Score</span>
            <span className="text-xl font-black text-cyan-400">{report.viabilityScore} / 100</span>
          </div>
          <span className="block text-[9px] font-mono text-slate-500 uppercase">Category: {report.category}</span>
        </div>
      </div>

      {/* Market Estimates TAM/SAM/SOM */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">TAM (Global)</span>
          <span className="text-base font-black text-cyan-400">{report.tamEstimate}</span>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">SAM (Serviceable)</span>
          <span className="text-base font-black text-indigo-400">{report.samEstimate}</span>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">SOM (Obtainable)</span>
          <span className="text-base font-black text-emerald-400">{report.somEstimate}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">1. Executive Overview</h3>
        <p className="text-xs text-slate-200 leading-relaxed">{report.executiveSummary}</p>
      </div>

      {/* Target Audience & Unit Economics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">2. Target Audience & Persona</h3>
          <p className="text-xs font-bold text-white">{report.targetAudience.persona}</p>
          <p className="text-[11px] text-slate-300"><strong>Willingness to Pay:</strong> {report.targetAudience.willingnessToPay}</p>
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Pain Points:</span>
            {report.targetAudience.painPoints.map((pp, i) => (
              <p key={i} className="text-[11px] text-slate-300">• {pp}</p>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">3. Unit Economics & Pricing</h3>
          <p className="text-[11px] text-slate-300"><strong>Pricing Model:</strong> {report.unitEconomics.pricingModel}</p>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="block text-[9px] font-mono text-slate-400">CAC</span>
              <span className="text-xs font-bold text-rose-400">{report.unitEconomics.estimatedCac}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="block text-[9px] font-mono text-slate-400">LTV</span>
              <span className="text-xs font-bold text-emerald-400">{report.unitEconomics.estimatedLtv}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="block text-[9px] font-mono text-slate-400">Payback</span>
              <span className="text-xs font-bold text-cyan-400">{report.unitEconomics.paybackPeriod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Matrix */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase text-indigo-400 tracking-wider">4. SWOT Analysis Matrix</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-emerald-950/20 rounded border border-emerald-500/20">
            <span className="text-emerald-400 font-bold font-mono text-[10px] block mb-1">STRENGTHS</span>
            {report.swot.strengths.map((s, i) => (
              <p key={i} className="text-slate-300 text-[11px]">• {s}</p>
            ))}
          </div>
          <div className="p-2.5 bg-amber-950/20 rounded border border-amber-500/20">
            <span className="text-amber-400 font-bold font-mono text-[10px] block mb-1">WEAKNESSES</span>
            {report.swot.weaknesses.map((w, i) => (
              <p key={i} className="text-slate-300 text-[11px]">• {w}</p>
            ))}
          </div>
          <div className="p-2.5 bg-cyan-950/20 rounded border border-cyan-500/20">
            <span className="text-cyan-400 font-bold font-mono text-[10px] block mb-1">OPPORTUNITIES</span>
            {report.swot.opportunities.map((o, i) => (
              <p key={i} className="text-slate-300 text-[11px]">• {o}</p>
            ))}
          </div>
          <div className="p-2.5 bg-rose-950/20 rounded border border-rose-500/20">
            <span className="text-rose-400 font-bold font-mono text-[10px] block mb-1">THREATS</span>
            {report.swot.threats.map((t, i) => (
              <p key={i} className="text-slate-300 text-[11px]">• {t}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Analysis Table */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">5. Competitor Landscape & Defensibility</h3>
        <div className="space-y-2">
          {report.competitors.map((c, i) => (
            <div key={i} className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
              <strong className="text-white block mb-1">{c.name}</strong>
              <p className="text-[11px] text-slate-300"><strong>Weakness:</strong> {c.weakness}</p>
              <p className="text-[11px] text-cyan-300"><strong>Our Edge:</strong> {c.ourEdge}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Recommendations & GTM */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">6. Key Recommendations & Action Plan</h3>
        {report.keyRecommendations.map((rec, i) => (
          <p key={i} className="text-xs text-slate-200">✔ {rec}</p>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Generated by CORE AI Engine</span>
        <span>Confidential & Proprietary</span>
      </div>
    </div>
  );
};
