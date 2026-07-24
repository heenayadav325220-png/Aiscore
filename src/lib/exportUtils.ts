import { ChatSession, IdeaEvaluation } from "../types";

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
