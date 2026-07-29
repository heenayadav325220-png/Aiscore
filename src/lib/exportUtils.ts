import { ChatSession, IdeaEvaluation } from "../types";
import { jsPDF } from "jspdf";

/**
 * Triggers a client-side file download.
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Exports a Chat Session to a beautifully formatted JSON string.
 */
export function exportChatToJson(session: ChatSession) {
  const data = {
    exportType: "chat_session",
    exportVersion: "1.0",
    generatedAt: new Date().toISOString(),
    session: {
      id: session.id,
      title: session.title,
      activeMode: session.activeMode,
      timestamp: session.timestamp,
      messages: session.messages.map(m => ({
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
        hasImage: !!m.imageAttached,
        reactions: m.reactions || []
      }))
    }
  };
  
  const content = JSON.stringify(data, null, 2);
  const safeTitle = session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 30);
  downloadFile(content, `core_chat_${safeTitle || "session"}.json`, "application/json");
}

/**
 * Exports an Idea Evaluation to a beautifully formatted JSON string.
 */
export function exportEvaluationToJson(evaluation: IdeaEvaluation) {
  const data = {
    exportType: "idea_evaluation",
    exportVersion: "1.0",
    generatedAt: new Date().toISOString(),
    evaluation: {
      id: evaluation.id,
      title: evaluation.title,
      idea: evaluation.idea,
      overallScore: evaluation.overallScore,
      feasibilityScore: evaluation.feasibilityScore,
      marketPotentialScore: evaluation.marketPotentialScore,
      innovationScore: evaluation.innovationScore,
      approved: evaluation.approved,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      marketSizeAnalysis: evaluation.marketSizeAnalysis,
      recommendations: evaluation.recommendations,
      timestamp: evaluation.timestamp
    }
  };

  const content = JSON.stringify(data, null, 2);
  const safeTitle = evaluation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 30);
  downloadFile(content, `scorecard_${safeTitle || "evaluation"}.json`, "application/json");
}

/**
 * Exports a Chat Session into a high-fidelity standalone HTML/Print page.
 * Users can open this file and print/save to PDF directly with gorgeous formatting.
 */
export function exportChatToHtml(session: ChatSession) {
  const safeTitle = session.title.replace(/["'&<>]/g, "");
  
  const messagesHtml = session.messages.map(msg => {
    const isUser = msg.role === "user";
    const avatar = isUser ? "User" : "Core";
    const bgClass = isUser ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-800 border-slate-100 shadow-sm";
    const alignmentClass = isUser ? "justify-end ml-12" : "justify-start mr-12";
    const bubbleRadius = isUser ? "rounded-tr-none" : "rounded-tl-none";
    
    // Simple markdown helper for code block formatting inside exports
    let escapedText = msg.text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
      
    // Format simple bold text
    escapedText = escapedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Format simple inline code
    escapedText = escapedText.replace(/`(.*?)`/g, "<code class='bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-rose-500'>$1</code>");
    // Format code blocks
    escapedText = escapedText.replace(/```([\s\S]*?)```/g, "<pre class='bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto my-3 text-slate-700 whitespace-pre-wrap'>$1</pre>");

    const imgPreview = msg.imageAttached 
      ? `<div class="mb-3 max-w-xs rounded-lg overflow-hidden border border-slate-200">
           <img src="data:${msg.imageAttached.mimeType};base64,${msg.imageAttached.base64}" alt="User Attachment" class="w-full h-auto max-h-48 object-cover" />
         </div>`
      : "";

    const reactionsHtml = msg.reactions && msg.reactions.length > 0
      ? `<div class="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
           ${msg.reactions.map(r => `<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-semibold text-slate-700">${r}</span>`).join('')}
         </div>`
      : "";

    return `
      <div class="flex gap-4 items-start ${alignmentClass} mb-6">
        <div class="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs ${isUser ? 'bg-slate-900 text-white border-slate-800' : 'bg-cyan-500 text-white border-cyan-400'}">
          ${avatar}
        </div>
        <div class="flex-1 max-w-3xl">
          <div class="p-5 rounded-2xl border text-sm leading-relaxed ${bgClass} ${bubbleRadius}">
            ${imgPreview}
            <div class="whitespace-pre-wrap">${escapedText}</div>
            ${reactionsHtml}
          </div>
          <div class="text-[10px] text-slate-400 font-mono mt-1 px-1">${msg.timestamp}</div>
        </div>
      </div>
    `;
  }).join("\n");

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CORE AI Chat Export - ${safeTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background-color: #ffffff !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 min-h-screen text-slate-900">
  <!-- Top Bar for actions -->
  <div class="no-print bg-white border-b border-slate-200 py-3 px-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-2">
      <span class="font-extrabold text-sm tracking-tight text-slate-900">CORE AI CHAT EXPORT</span>
      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">v1.2.0</span>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="px-4 py-2 bg-[#00e5ff] text-slate-900 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Save as PDF / Print
      </button>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-6 py-8 md:py-12">
    <!-- Header of Report -->
    <div class="border-b border-slate-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-mono tracking-widest text-cyan-600 uppercase font-bold">ASCEND STUDY AI Engine</span>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">${safeTitle}</h1>
        <p class="text-xs text-slate-500 mt-1">Operational Mode: <span class="font-mono text-cyan-600 uppercase font-semibold">${session.activeMode}</span></p>
      </div>
      <div class="text-left md:text-right">
        <span class="text-[9px] font-mono text-slate-400 block uppercase">GENERATED TIMESTAMP</span>
        <span class="text-xs font-semibold text-slate-700 block mt-0.5">${new Date().toLocaleString()}</span>
        <span class="text-[10px] text-slate-400 block font-mono mt-1">Total messages: ${session.messages.length}</span>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="space-y-6">
      ${messagesHtml}
    </div>

    <!-- Footer -->
    <div class="border-t border-slate-200 mt-16 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
      <span>© 2026 ASCEND STUDY • CORE AI ENGINE</span>
      <span>SECRET SECURE TRANSCRIPT</span>
    </div>
  </div>
</body>
</html>`;

  const safeFileName = session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 30);
  downloadFile(htmlContent, `chat_${safeFileName || "session"}.html`, "text/html");
}

/**
 * Exports an Idea Evaluation Scorecard into a magnificent standalone HTML/Print page.
 * Users can open this file and print/save to PDF with beautiful dashboard grid layout.
 */
export function exportEvaluationToHtml(evaluation: IdeaEvaluation) {
  const safeTitle = evaluation.title.replace(/["'&<>]/g, "");
  const safeSummary = evaluation.summary.replace(/["'&<>]/g, "");
  
  const strengthsList = evaluation.strengths.map(s => `
    <li class="text-xs text-slate-600 flex items-start gap-2 leading-relaxed mb-2.5">
      <span class="text-emerald-500 font-bold font-mono">•</span>
      <span>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>
    </li>
  `).join("");

  const weaknessesList = evaluation.weaknesses.map(w => `
    <li class="text-xs text-slate-600 flex items-start gap-2 leading-relaxed mb-2.5">
      <span class="text-rose-500 font-bold font-mono">•</span>
      <span>${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>
    </li>
  `).join("");

  const recsHtml = evaluation.recommendations.map((rec, i) => `
    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
      <span class="text-[9px] font-mono text-slate-400 font-bold tracking-wider mb-2">0${i + 1}. RECOMMENDATION</span>
      <p class="text-xs text-slate-700 leading-relaxed">${rec.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
    </div>
  `).join("");

  const overallScoreColor = evaluation.overallScore >= 80 ? "text-emerald-500" : evaluation.overallScore >= 60 ? "text-amber-500" : "text-rose-500";
  const borderVerdictClass = evaluation.approved ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-rose-500";

  const getMetricColor = (score: number) => score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-rose-500";
  const getMetricBg = (score: number) => score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500";

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CORE Scorecard - ${safeTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background-color: #ffffff !important;
      }
      .bento-card {
        border: 1px solid #e2e8f0 !important;
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 min-h-screen text-slate-900">
  <!-- Top Bar for actions -->
  <div class="no-print bg-white border-b border-slate-200 py-3 px-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-2">
      <span class="font-extrabold text-sm tracking-tight text-slate-900 font-display">CORE AI SCORECARD EXPORT</span>
      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">v1.2.0</span>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="px-4 py-2 bg-[#00e5ff] text-slate-900 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Save as PDF / Print
      </button>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-6">
    <!-- Header of Report -->
    <div class="border-b border-slate-200 pb-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-mono tracking-widest text-cyan-600 uppercase font-bold">ASCEND STUDY Startup Intelligence</span>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-display mt-1">Prototype Viability Assessment</h1>
        <p class="text-xs text-slate-500 mt-1">System Audit & Verification Report</p>
      </div>
      <div class="text-left md:text-right">
        <span class="text-[9px] font-mono text-slate-400 block uppercase">GENERATED ON</span>
        <span class="text-xs font-semibold text-slate-700 block mt-0.5">${evaluation.timestamp || new Date().toLocaleDateString()}</span>
        <span class="text-[10px] text-slate-400 block font-mono mt-1">ID: ${evaluation.id}</span>
      </div>
    </div>

    <!-- Main Verdict Card -->
    <div class="bento-card rounded-2xl p-6 bg-white border border-slate-100 shadow-sm ${borderVerdictClass}">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
          <span class="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Global Verdict</span>
          <h2 class="text-xl font-bold font-display text-slate-900">${safeTitle}</h2>
          <p class="text-xs text-slate-500 max-w-xl leading-relaxed">${safeSummary}</p>
        </div>
        <div class="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0">
          <div>
            ${evaluation.approved 
              ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold text-xs uppercase tracking-wider">APPROVED</span>`
              : `<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-bold text-xs uppercase tracking-wider">REJECTED</span>`
            }
          </div>
          <div class="text-right">
            <span class="text-[10px] font-mono text-slate-400 block uppercase font-bold">OVERALL SCORE</span>
            <span class="text-3xl font-extrabold font-display ${overallScoreColor}">${evaluation.overallScore}/100</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw Idea Pitch Card -->
    <div class="bento-card rounded-2xl p-5 bg-slate-950 text-slate-300 border border-slate-900 shadow-sm">
      <span class="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-bold">RAW PROJECT CONCEPT</span>
      <p class="text-xs leading-relaxed mt-2 italic">"${evaluation.idea.replace(/&/g, "&amp;").replace(/</g, "&lt;")}"</p>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Feasibility -->
      <div class="bento-card rounded-xl p-5 bg-white border border-slate-100">
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">FEASIBILITY</span>
        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-2xl font-bold font-display ${getMetricColor(evaluation.feasibilityScore)}">${evaluation.feasibilityScore}</span>
          <span class="text-xs text-slate-400">/100</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="h-full rounded-full ${getMetricBg(evaluation.feasibilityScore)}" style="width: ${evaluation.feasibilityScore}%"></div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 font-mono">Technical implementation viability & complexity</p>
      </div>

      <!-- Market Potential -->
      <div class="bento-card rounded-xl p-5 bg-white border border-slate-100">
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">MARKET POTENTIAL</span>
        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-2xl font-bold font-display ${getMetricColor(evaluation.marketPotentialScore)}">${evaluation.marketPotentialScore}</span>
          <span class="text-xs text-slate-400">/100</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="h-full rounded-full ${getMetricBg(evaluation.marketPotentialScore)}" style="width: ${evaluation.marketPotentialScore}%"></div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 font-mono">Monetization scale, reach & growth vector</p>
      </div>

      <!-- Innovation -->
      <div class="bento-card rounded-xl p-5 bg-white border border-slate-100">
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">UNIQUENESS</span>
        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-2xl font-bold font-display ${getMetricColor(evaluation.innovationScore)}">${evaluation.innovationScore}</span>
          <span class="text-xs text-slate-400">/100</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="h-full rounded-full ${getMetricBg(evaluation.innovationScore)}" style="width: ${evaluation.innovationScore}%"></div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 font-mono">Disruption, novelty & defensible moat</p>
      </div>
    </div>

    <!-- Strengths & Weaknesses Split -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bento-card rounded-xl p-5 bg-white border border-slate-100 border-l-4 border-l-emerald-500">
        <h3 class="text-xs font-bold uppercase tracking-wider font-display text-slate-800 mb-3">KEY ADVANTAGES</h3>
        <ul class="space-y-1">
          ${strengthsList}
        </ul>
      </div>

      <div class="bento-card rounded-xl p-5 bg-white border border-slate-100 border-l-4 border-l-rose-500">
        <h3 class="text-xs font-bold uppercase tracking-wider font-display text-slate-800 mb-3">EXECUTION HURDLES</h3>
        <ul class="space-y-1">
          ${weaknessesList}
        </ul>
      </div>
    </div>

    <!-- Market Analysis -->
    <div class="bento-card rounded-xl p-5 bg-white border border-slate-100 shadow-sm">
      <h3 class="text-xs font-bold uppercase tracking-wider font-display text-slate-800 mb-2">MARKET SIZE & COMPETITIVE LANDSCAPE</h3>
      <p class="text-xs text-slate-600 leading-relaxed">${evaluation.marketSizeAnalysis.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
    </div>

    <!-- Recommendations -->
    <div class="bento-card rounded-xl p-5 bg-white border border-slate-100 shadow-sm">
      <h3 class="text-xs font-bold uppercase tracking-wider font-display text-slate-800 mb-3">ACTIONABLE NEXT STEPS</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${recsHtml}
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-slate-200 mt-16 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
      <span>© 2026 ASCEND STUDY • CORE AI ENGINE</span>
      <span>CONFIDENTIAL INTELLIGENCE DOSSIER</span>
    </div>
  </div>
</body>
</html>`;

  const safeFileName = evaluation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 30);
  downloadFile(htmlContent, `scorecard_${safeFileName || "evaluation"}.html`, "text/html");
}

/**
 * Exports a Chat Session directly to a high-precision, professionally styled PDF document using jsPDF.
 */
export function exportChatToPdf(session: ChatSession) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // ~182 mm

  let currentY = margin;

  // Helper to trigger page break if space is insufficient
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = margin;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // Dark Header Banner
      doc.setFillColor(11, 15, 25); // #0b0f19
      doc.rect(margin, currentY, contentWidth, 26, "F");

      // Cyan accent left border strip
      doc.setFillColor(0, 229, 255); // #00e5ff
      doc.rect(margin, currentY, 3, 26, "F");

      // Title Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("ASCEND STUDY • CORE AI", margin + 7, currentY + 9);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(0, 229, 255);
      doc.text("EXECUTIVE CHAT THREAD & BRAINSTORMING DOSSIER", margin + 7, currentY + 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin + 7, currentY + 22);

      currentY += 30;

      // Metadata Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, currentY, contentWidth, 18, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      const safeTitle = session.title.length > 55 ? session.title.slice(0, 55) + "..." : session.title;
      doc.text(`Topic: ${safeTitle}`, margin + 5, currentY + 6.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Mode: ${session.activeMode.toUpperCase()}   |   Messages: ${session.messages.length}   |   Owner: Rohit (ASCEND STUDY Class 11th)`,
        margin + 5,
        currentY + 13
      );

      currentY += 24;
    } else {
      // Compact page header for subsequent pages
      doc.setFillColor(11, 15, 25);
      doc.rect(margin, currentY, contentWidth, 9, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(0, 229, 255);
      doc.text("ASCEND STUDY • CORE AI CHAT THREAD (CONTINUED)", margin + 5, currentY + 6);

      currentY += 13;
    }
  };

  drawHeaderBanner(true);

  // Render each chat message cleanly
  session.messages.forEach((msg, idx) => {
    const isUser = msg.role === "user";
    const senderName = isUser ? "YOU (USER)" : "CORE AI SYNTHESIZER";
    const timeStr = msg.timestamp || "";

    const headerHeight = 7.5;
    const innerMargin = margin + 3;
    const bodyWidth = contentWidth - 6;

    checkPageBreak(headerHeight + 10);

    // Message Header Bar
    if (isUser) {
      doc.setFillColor(30, 41, 59); // slate-800
      doc.setDrawColor(51, 65, 85);
    } else {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.setDrawColor(6, 182, 212); // cyan-500
    }

    doc.rect(margin, currentY, contentWidth, headerHeight, "FD");

    // Dot indicator
    if (isUser) {
      doc.setFillColor(148, 163, 184);
    } else {
      doc.setFillColor(0, 229, 255);
    }
    doc.circle(margin + 4, currentY + 3.8, 1.4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(senderName, margin + 8, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const timeWidth = doc.getTextWidth(timeStr);
    doc.text(timeStr, margin + contentWidth - timeWidth - 4, currentY + 5);

    currentY += headerHeight;

    // Split text into paragraphs/lines and code blocks
    const lines = msg.text.split("\n");
    let inCodeBlock = false;
    let codeLines: string[] = [];

    const renderCodeBlock = () => {
      if (codeLines.length === 0) return;
      const fullCode = codeLines.join("\n");
      const wrappedCode = doc.splitTextToSize(fullCode, bodyWidth - 6);
      const codeHeight = wrappedCode.length * 3.6 + 6;

      checkPageBreak(codeHeight + 3);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.rect(innerMargin, currentY + 2, bodyWidth, codeHeight, "FD");

      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      let cy = currentY + 6;
      wrappedCode.forEach((cline: string) => {
        doc.text(cline, innerMargin + 4, cy);
        cy += 3.6;
      });

      currentY += codeHeight + 3;
      codeLines = [];
    };

    lines.forEach((line) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          renderCodeBlock();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      const cleanText = line.replace(/\*\*/g, "").replace(/`/g, "");
      if (!cleanText.trim()) {
        currentY += 2;
        return;
      }

      const wrappedLines = doc.splitTextToSize(cleanText, bodyWidth);
      const blockHeight = wrappedLines.length * 4;

      checkPageBreak(blockHeight + 2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      wrappedLines.forEach((wline: string) => {
        doc.text(wline, innerMargin, currentY + 3.8);
        currentY += 4;
      });
    });

    if (inCodeBlock) {
      renderCodeBlock();
    }

    if (msg.imageAttached) {
      checkPageBreak(6);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(6, 182, 212);
      doc.text(`[Attached Image: ${msg.imageAttached.mimeType}]`, innerMargin, currentY + 3.5);
      currentY += 5;
    }

    if (msg.reactions && msg.reactions.length > 0) {
      checkPageBreak(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Reactions: ${msg.reactions.join(" ")}`, innerMargin, currentY + 3.5);
      currentY += 5;
    }

    currentY += 6; // Spacing between messages
  });

  // Footer for all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, pageHeight - 11, contentWidth, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("ASCEND STUDY • CORE AI — STYLIZED CHAT EXPORT DOSSIER", margin + 4, pageHeight - 6.5);

    const pageStr = `Page ${p} of ${totalPages}`;
    const pWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, margin + contentWidth - pWidth - 4, pageHeight - 6.5);
  }

  const safeFileName = session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 30);
  doc.save(`core_chat_${safeFileName || "session"}.pdf`);
}

/**
 * Exports an Idea Evaluation Scorecard directly to a high-precision, professionally styled PDF document.
 */
export function exportEvaluationToPdf(evaluation: IdeaEvaluation) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // Header Banner
  doc.setFillColor(11, 15, 25);
  doc.rect(margin, currentY, contentWidth, 26, "F");

  doc.setFillColor(0, 229, 255);
  doc.rect(margin, currentY, 3, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ASCEND STUDY • CORE AI SCORECARD", margin + 7, currentY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 229, 255);
  doc.text("PROTOTYPE VIABILITY & CONCEPT ASSESSMENT REPORT", margin + 7, currentY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${evaluation.timestamp || new Date().toLocaleDateString()}`, margin + 7, currentY + 22);

  currentY += 32;

  // Verdict Card Box
  const verdictBg = evaluation.approved ? [240, 253, 244] : [254, 242, 242];
  const verdictBorder = evaluation.approved ? [187, 247, 208] : [254, 202, 202];
  doc.setFillColor(verdictBg[0], verdictBg[1], verdictBg[2]);
  doc.setDrawColor(verdictBorder[0], verdictBorder[1], verdictBorder[2]);
  doc.rect(margin, currentY, contentWidth, 24, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const safeTitle = evaluation.title.length > 50 ? evaluation.title.slice(0, 50) + "..." : evaluation.title;
  doc.text(safeTitle, margin + 5, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const safeSummaryLines = doc.splitTextToSize(evaluation.summary, contentWidth - 40);
  doc.text(safeSummaryLines.slice(0, 2), margin + 5, currentY + 14);

  // Overall Score Badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  if (evaluation.overallScore >= 80) doc.setTextColor(16, 185, 129);
  else if (evaluation.overallScore >= 60) doc.setTextColor(245, 158, 11);
  else doc.setTextColor(244, 63, 94);

  doc.text(`${evaluation.overallScore}/100`, margin + contentWidth - 32, currentY + 12);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("OVERALL SCORE", margin + contentWidth - 32, currentY + 17);

  currentY += 30;

  // Raw Concept Pitch
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 16, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 229, 255);
  doc.text("PROJECT CONCEPT", margin + 5, currentY + 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const ideaLines = doc.splitTextToSize(`"${evaluation.idea}"`, contentWidth - 10);
  doc.text(ideaLines.slice(0, 2), margin + 5, currentY + 11);

  currentY += 22;

  // Score Metrics Grid (Feasibility, Market Potential, Uniqueness)
  const colWidth = (contentWidth - 8) / 3;

  const renderMetric = (x: number, title: string, score: number, sub: string) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(x, currentY, colWidth, 20, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(title, x + 4, currentY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    if (score >= 80) doc.setTextColor(16, 185, 129);
    else if (score >= 60) doc.setTextColor(245, 158, 11);
    else doc.setTextColor(244, 63, 94);

    doc.text(`${score}`, x + 4, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("/100", x + 18, currentY + 14);
  };

  renderMetric(margin, "FEASIBILITY", evaluation.feasibilityScore, "Tech Viability");
  renderMetric(margin + colWidth + 4, "MARKET POTENTIAL", evaluation.marketPotentialScore, "Monetization");
  renderMetric(margin + (colWidth + 4) * 2, "UNIQUENESS", evaluation.innovationScore, "Novelty");

  currentY += 26;

  // Strengths & Weaknesses
  const halfWidth = (contentWidth - 6) / 2;

  // Key Advantages
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.rect(margin, currentY, halfWidth, 34, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text("KEY ADVANTAGES", margin + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let sy = currentY + 12;
  evaluation.strengths.slice(0, 4).forEach((s) => {
    const slines = doc.splitTextToSize(`• ${s}`, halfWidth - 8);
    doc.text(slines[0], margin + 4, sy);
    sy += 5;
  });

  // Execution Hurdles
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin + halfWidth + 6, currentY, halfWidth, 34, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text("EXECUTION HURDLES", margin + halfWidth + 10, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let wy = currentY + 12;
  evaluation.weaknesses.slice(0, 4).forEach((w) => {
    const wlines = doc.splitTextToSize(`• ${w}`, halfWidth - 8);
    doc.text(wlines[0], margin + halfWidth + 10, wy);
    wy += 5;
  });

  currentY += 40;

  // Recommendations
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, 28, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("ACTIONABLE RECOMMENDATIONS", margin + 5, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  let ry = currentY + 12;
  evaluation.recommendations.slice(0, 3).forEach((rec, idx) => {
    const rlines = doc.splitTextToSize(`${idx + 1}. ${rec}`, contentWidth - 10);
    doc.text(rlines[0], margin + 5, ry);
    ry += 5.2;
  });

  // Footer
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, pageHeight - 11, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("ASCEND STUDY • CORE AI — CONFIDENTIAL SCORECARD REPORT", margin + 4, pageHeight - 6.5);
  doc.text("Page 1 of 1", margin + contentWidth - 20, pageHeight - 6.5);

  const safeFileName = evaluation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 30);
  doc.save(`scorecard_${safeFileName || "evaluation"}.pdf`);
}

