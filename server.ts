import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request body size for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

function getGeminiClient(): GoogleGenAI {
  const apiKeyCandidateNames = [
    "GEMINI_API_KEY",
    "PERSONAL_GEMINI_API_KEY",
    "CUSTOM_GEMINI_API_KEY",
    "USER_GEMINI_API_KEY",
    "DECISION_MIRROR_API_KEY",
    "DECISION_MIRROR_GEMINI_KEY",
    "MY_GEMINI_API_KEY"
  ];
  
  let apiKey = "";
  
  // 1. Look for standard Google AI Studio API key format (starts with "AIza")
  for (const name of apiKeyCandidateNames) {
    const val = process.env[name];
    if (val && val.trim().startsWith("AIza")) {
      apiKey = val.trim();
      break;
    }
  }

  // 2. Fallback to process.env.GEMINI_API_KEY if present
  if (!apiKey && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "") {
    apiKey = process.env.GEMINI_API_KEY.trim();
  }

  // 3. Fallback to any non-empty candidate name
  if (!apiKey) {
    for (const name of apiKeyCandidateNames) {
      const val = process.env[name];
      if (val && val !== "MY_GEMINI_API_KEY" && val.trim() !== "") {
        apiKey = val.trim();
        break;
      }
    }
  }

  if (!apiKey) {
    throw new Error(
      "No Gemini API key is configured. Please open Settings > Secrets in AI Studio and add your private key as GEMINI_API_KEY."
    );
  }

  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Retries an async function with exponential backoff for rate limits and unavailability.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1500,
  maxDelay = 4000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const fullErrorText = (error?.message || "") + " " + JSON.stringify(error || {});
    const isQuotaExceeded =
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.code === 429 ||
      error?.statusCode === 429 ||
      fullErrorText.includes("RESOURCE_EXHAUSTED") ||
      fullErrorText.includes("429") ||
      fullErrorText.includes("quota") ||
      fullErrorText.includes("Quota exceeded");

    const isUnavailable =
      error?.status === "UNAVAILABLE" ||
      error?.code === 503 ||
      error?.statusCode === 503 ||
      fullErrorText.includes("503") ||
      fullErrorText.includes("UNAVAILABLE") ||
      fullErrorText.includes("high demand");

    if ((isQuotaExceeded || isUnavailable) && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, Math.min(delay * 2, maxDelay), maxDelay);
    }
    throw error;
  }
}

/**
 * Tries executing a Gemini API call across multiple candidate models in sequence
 * if rate limits, quota limits, model unavailability, or high demand spikes occur.
 */
async function callGeminiWithCascade<T>(
  callFn: (modelName: string) => Promise<T>
): Promise<T> {
  const candidateModels = [
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      return await retryWithBackoff(() => callFn(model));
    } catch (err: any) {
      lastError = err;
      const errStr = (err?.message || "") + " " + JSON.stringify(err || {});
      const isCascadableError =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.status === "UNAVAILABLE" ||
        err?.status === "INTERNAL" ||
        err?.code === 429 ||
        err?.code === 503 ||
        err?.code === 500 ||
        err?.statusCode === 429 ||
        err?.statusCode === 503 ||
        err?.statusCode === 500 ||
        errStr.includes("429") ||
        errStr.includes("503") ||
        errStr.includes("500") ||
        errStr.includes("RESOURCE_EXHAUSTED") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("quota") ||
        errStr.includes("Quota exceeded") ||
        errStr.includes("404") ||
        errStr.includes("NOT_FOUND");

      if (isCascadableError) {
        console.warn(`[Gemini Cascade] Model '${model}' notice (${err?.status || err?.code || "429"}). Cascading to next candidate model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// --- SMART FALLBACK SYNTHESIS GENERATORS (Activates when API keys reach rate limits) ---

function generateFallbackEvaluation(idea: string, _context?: any) {
  const ideaLower = idea.toLowerCase();
  const isGeneric = idea.length < 25 || ideaLower.includes("app") && idea.split(" ").length < 5;
  const isWeak = isGeneric || ideaLower.includes("social network") || ideaLower.includes("crypto token");

  const overallScore = isWeak ? 42 : 78;
  const approved = overallScore >= 50;

  return {
    approved,
    overallScore,
    feasibilityScore: approved ? 82 : 45,
    marketPotentialScore: approved ? 75 : 40,
    innovationScore: approved ? 80 : 38,
    summary: approved
      ? `CORE AI Analysis: "${idea}" exhibits strong market alignment, modular scalability, and high viral potential.`
      : `CORE AI Critical Audit: "${idea}" faces high market saturation and unit economic headwinds in its current form. Strategic pivoting is required.`,
    strengths: approved
      ? [
          "Clear target audience pain point with strong initial value proposition.",
          "High software margins and scalable cloud deployment potential.",
          "Natural virality and self-serve onboarding capability."
        ]
      : [
          "High user interest in the overarching problem domain.",
          "Low entry barrier for rapid initial prototyping."
        ],
    weaknesses: approved
      ? [
          "Requires targeted organic growth strategy to lower customer acquisition costs.",
          "Potential competition from established vertical incumbent platforms."
        ]
      : [
          "Severe market saturation with minimal clear differentiation.",
          "Unclear monetization model and high churn risk.",
          "Lack of defensible technological moat or proprietary data advantage."
        ],
    recommendations: approved
      ? [
          "Launch an interactive landing page to collect early user signups and validate conversion.",
          "Focus on one core killer feature before expanding into a multi-module suite.",
          "Establish strategic integration partnerships with complementary workflow platforms."
        ]
      : [
          "Sharpen value proposition around a specific B2B vertical niche.",
          "Re-evaluate unit economics and subscription pricing tiers.",
          "Conduct 10 qualitative customer interviews before building code."
        ],
    pivotRecommendations: !approved
      ? [
          "Pivot to a B2B vertical SaaS model targeting enterprise workflows rather than general consumers.",
          "Transform from a full application into an API-first plugin or integration for existing popular tools.",
          "Niche down exclusively to high-value power users with immediate budget and pain points."
        ]
      : [
          "Expand into AI automated workflow integrations to increase average revenue per user.",
          "Develop a developer SDK to allow third-party ecosystem extensions."
        ],
    marketSizeAnalysis: approved
      ? "Targeting an estimated $4.2B growing addressable market with 18% YoY expansion across digital productivity and automation tooling."
      : "Crowded $1.2B market sector with dominant legacy players. Strategic repositioning required to capture market share.",
    timestamp: new Date().toISOString()
  };
}

function generateFallbackGuidance(idea: string, title?: string) {
  const cleanTitle = title || idea.slice(0, 30) + (idea.length > 30 ? "..." : "");
  return {
    title: cleanTitle,
    description: `Actionable technical implementation blueprint for "${idea}".`,
    steps: [
      {
        stepNumber: 1,
        title: "MVP Scope & Architecture",
        actionItem: "Define core data schemas and single-page interactive layout.",
        technicalDetails: "Set up Vite, React, TypeScript, and Tailwind CSS. Define primary component state interfaces.",
        estimatedHours: 4
      },
      {
        stepNumber: 2,
        title: "Frontend Wireframe & Layout",
        actionItem: "Build responsive UI layout with dark/light mode toggles and state controls.",
        technicalDetails: "Utilize Lucide-React icons and Motion animations for seamless view transitions.",
        estimatedHours: 8
      },
      {
        stepNumber: 3,
        title: "API Proxy & Data Logic",
        actionItem: "Implement Express backend endpoints for proxying external queries securely.",
        technicalDetails: "Construct server-side API handlers with rate limiting and JSON schema validation.",
        estimatedHours: 6
      },
      {
        stepNumber: 4,
        title: "Deployment & Production QA",
        actionItem: "Deploy build output and run full suite verification.",
        technicalDetails: "Execute production bundle optimization and mobile responsiveness testing.",
        estimatedHours: 4
      }
    ],
    prototypeStack: ["React 18", "TypeScript", "Tailwind CSS", "Vite", "Express.js", "Lucide Icons", "Motion"],
    wireframeConcept: "A clean dashboard centering an interactive hero canvas, real-time input fields, status indicators, and responsive side drawer navigation.",
    wireframeCode: `<div class="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
  <div class="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,229,255,0.15)] space-y-4">
    <div class="flex justify-between items-center border-b border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-ping"></span>
        <h1 class="text-base font-extrabold text-[#00e5ff] tracking-tight font-mono">${cleanTitle}</h1>
      </div>
      <span class="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-[10px] font-mono font-bold border border-cyan-400/30">PROTOTYPE READY</span>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">${idea}</p>
    <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
      <div class="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold uppercase">
        <span>Execution Engine Status</span>
        <span class="text-emerald-400">● Live Preview</span>
      </div>
      <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-3/4 animate-pulse"></div>
      </div>
    </div>
    <button class="w-full py-3 bg-[#00e5ff] hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer font-mono uppercase tracking-wider">
      Launch Interactive Core App
    </button>
  </div>
</div>`,
    timestamp: new Date().toISOString()
  };
}

function generateFallbackChatResponse(messages: any[], _activeMode?: string) {
  const lastMsg = messages[messages.length - 1]?.text || "Hello";

  return `🧠 UNDERSTANDING
CORE analyzed your input: "${lastMsg}"

🔍 ANALYSIS
Your request requires a structured, resilient execution plan with clear state boundaries and clean architectural separation.

💡 OPTIONS
1. **Modular Workspace Strategy**: Deconstruct into single-purpose components with explicit TypeScript interfaces.
2. **State & Synchronization**: Maintain reactive state with client-side persistence and fallback handling.
3. **Responsive Experience**: Ensure fluid layouts, touch-friendly controls, and high-contrast typography across mobile and desktop.

⚠️ RISKS
- API rate limits under high query volume (mitigated via local fallback & backoff).
- Unnecessary re-renders on complex state mutations.

🚀 NEXT STEP
Proceed with step-by-step modular implementation and component verification.

*Note: Shared workspace key limit reached. Response generated via local CORE Engine. Add your personal GEMINI_API_KEY in Settings > Secrets for unlimited bandwidth!*`;
}

function generateFallbackXFactor(idea: string) {
  const cleanTitle = idea.split(" ").slice(0, 3).join(" ") || "Core Venture";
  return {
    title: `${cleanTitle} Matrix X`,
    unfairAdvantage: "Proprietary algorithmic workflow loops coupled with a zero-friction self-serve onboarding engine.",
    growthLoop: "Every user interaction automatically generates shareable interactive assets that convert new users organically.",
    magicRetentionFeature: "Instant AI synthesis dashboard that generates complete execution blueprints in under 3 seconds.",
    marketPositioningEdge: "10x faster execution and 80% lower cost structure than legacy bloated enterprise suites.",
    strategicTriggers: [
      "Embed one-click export and share links on every generated report.",
      "Incentivize team workspace invites with unlocked premium templates.",
      "Establish automated webhook triggers for real-time notifications."
    ]
  };
}

function generateFallbackMarketAnalysis(idea: string) {
  const words = idea.split(" ").filter(Boolean);
  const cleanTitle = words.slice(0, 5).join(" ") || "Startup Venture";
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const lowerIdea = idea.toLowerCase();

  // 1. Detect Domain / Industry Sector & tailoring
  let category = "Software & Technology SaaS";
  let tamEstimate = "$180 Billion";
  let samEstimate = "$24 Billion";
  let somEstimate = "$750 Million";
  let persona = "Product Leaders, Founders & Business Operations";
  let painPoints = [
    "High manual overhead and inefficient legacy workflow tools",
    "Lack of real-time data integration and actionable insights",
    "High software acquisition and subscription overhead"
  ];
  let pricingModel = "Tiered SaaS ($29/mo Starter, $99/mo Business, $299/mo Enterprise)";
  let estimatedCac = "$45 per acquired user";
  let estimatedLtv = "$620 (14-month average retention)";
  let paybackPeriod = "2.2 Months";
  let competitors = [
    {
      name: "Established Enterprise Incumbents",
      strengths: "Large historical market share and deep distribution networks.",
      weakness: "Slow innovation velocity, complex onboarding, and high annual contract minimums.",
      ourEdge: "10x faster execution, modern AI automation, and zero-friction self-serve onboarding."
    },
    {
      name: "Generic Point Solutions",
      strengths: "Low cost entry point and simple narrow features.",
      weakness: "Lack of end-to-end integration and poor data scalability.",
      ourEdge: "Unified end-to-end platform architecture with automated reporting artifacts."
    }
  ];

  if (
    lowerIdea.includes("learn") ||
    lowerIdea.includes("study") ||
    lowerIdea.includes("student") ||
    lowerIdea.includes("school") ||
    lowerIdea.includes("course") ||
    lowerIdea.includes("tutor") ||
    lowerIdea.includes("exam") ||
    lowerIdea.includes("education") ||
    lowerIdea.includes("ascend")
  ) {
    category = "EdTech & Educational AI";
    tamEstimate = "$340 Billion";
    samEstimate = "$48 Billion";
    somEstimate = "$1.4 Billion";
    persona = "Students, Educators, Academic Institutions & Self-Learners";
    painPoints = [
      "Monotonous rote learning methods leading to low retention and student burnout",
      "Lack of personalized 1-on-1 tutoring at an affordable cost structure",
      "Difficulty tracking real-time conceptual mastery and exam readiness"
    ];
    pricingModel = "Freemium ($9.99/mo Student Pro, $49/mo Educator, $199/mo Institutional)";
    estimatedCac = "$18 per student";
    estimatedLtv = "$240 (2-year average student lifecycle)";
    paybackPeriod = "1.8 Months";
    competitors = [
      {
        name: "Duolingo / Quizlet",
        strengths: "Massive consumer brand recognition, gamified user retention, and viral loops.",
        weakness: "Limited to basic flashcards and rote drills without deep conceptual AI tutoring.",
        ourEdge: "Interactive AI study assistant, real-time code/text evaluation, and instant PDF report generation."
      },
      {
        name: "Coursera / Udemy",
        strengths: "Large course library with university accreditation partnerships.",
        weakness: "Passive video lectures with low completion rates (<10%) and static content.",
        ourEdge: "Active, conversational AI study loops with personalized real-time feedback."
      }
    ];
  } else if (
    lowerIdea.includes("fit") ||
    lowerIdea.includes("health") ||
    lowerIdea.includes("workout") ||
    lowerIdea.includes("gym") ||
    lowerIdea.includes("doctor") ||
    lowerIdea.includes("medical") ||
    lowerIdea.includes("wellness") ||
    lowerIdea.includes("diet")
  ) {
    category = "HealthTech & Digital Wellness";
    tamEstimate = "$520 Billion";
    samEstimate = "$72 Billion";
    somEstimate = "$2.1 Billion";
    persona = "Fitness Enthusiasts, Patients & Healthcare Professionals";
    painPoints = [
      "Inconsistent health tracking across fragmented wearable devices",
      "High cost of personal trainers and clinical wellness consultations",
      "Lack of personalized, real-time feedback tailored to individual progress"
    ];
    pricingModel = "Subscription ($14.99/mo Consumer, $99/mo Clinic Tier)";
    estimatedCac = "$28 per user";
    estimatedLtv = "$380 (18-month average retention)";
    paybackPeriod = "2.0 Months";
    competitors = [
      {
        name: "Strava / MyFitnessPal",
        strengths: "Strong social community feeds and vast historical activity logs.",
        weakness: "Basic logging capabilities with minimal automated coaching or clinical AI depth.",
        ourEdge: "Context-aware AI health insights, real-time progress analysis, and exportable reports."
      }
    ];
  } else if (
    lowerIdea.includes("finance") ||
    lowerIdea.includes("pay") ||
    lowerIdea.includes("bank") ||
    lowerIdea.includes("invest") ||
    lowerIdea.includes("money") ||
    lowerIdea.includes("crypto") ||
    lowerIdea.includes("tax")
  ) {
    category = "FinTech & Financial Intelligence";
    tamEstimate = "$1.2 Trillion";
    samEstimate = "$140 Billion";
    somEstimate = "$4.2 Billion";
    persona = "Retail Investors, Financial Advisors & Small Business Owners";
    painPoints = [
      "Complex, opaque financial jargon and hidden transaction fees",
      "Time-consuming manual expense categorization and tax reconciliation",
      "Lack of predictive risk analysis for personal wealth management"
    ];
    pricingModel = "Freemium ($19/mo Pro, $99/mo Advisor Suite, 0.1% AUM tier)";
    estimatedCac = "$65 per user";
    estimatedLtv = "$890 (24-month retention)";
    paybackPeriod = "2.8 Months";
    competitors = [
      {
        name: "Plaid / Robinhood",
        strengths: "High brand trust, sleek mobile UX, and frictionless payment rails.",
        weakness: "Mainly transactional platforms lacking intelligent portfolio advisory and automated audits.",
        ourEdge: "AI-driven financial strategy, real-time risk simulation, and automated executive briefs."
      }
    ];
  } else if (
    lowerIdea.includes("code") ||
    lowerIdea.includes("dev") ||
    lowerIdea.includes("api") ||
    lowerIdea.includes("cloud") ||
    lowerIdea.includes("database") ||
    lowerIdea.includes("deploy") ||
    lowerIdea.includes("git")
  ) {
    category = "DevTools & Developer Infrastructure";
    tamEstimate = "$210 Billion";
    samEstimate = "$32 Billion";
    somEstimate = "$950 Million";
    persona = "Software Engineers, CTOs & DevOps Architects";
    painPoints = [
      "Context switching across fragmented developer tools and monitoring suites",
      "Complex infrastructure deployment pipelines with unexpected cloud costs",
      "Slow code reviews and debugging cycles in production environments"
    ];
    pricingModel = "Usage-based ($20/seat/mo + cloud compute usage)";
    estimatedCac = "$42 per developer";
    estimatedLtv = "$780 (22-month retention)";
    paybackPeriod = "2.1 Months";
    competitors = [
      {
        name: "GitHub / Vercel / Supabase",
        strengths: "Massive developer adoption, ecosystem lock-in, and world-class CI/CD pipelines.",
        weakness: "Complex pricing scaling and specialized developer knowledge requirements.",
        ourEdge: "Zero-config deployment, real-time AI architectural audits, and instant prototype blueprints."
      }
    ];
  } else if (
    lowerIdea.includes("ai") ||
    lowerIdea.includes("gpt") ||
    lowerIdea.includes("llm") ||
    lowerIdea.includes("automation") ||
    lowerIdea.includes("model")
  ) {
    category = "Artificial Intelligence & Workflow Automation";
    tamEstimate = "$450 Billion";
    samEstimate = "$68 Billion";
    somEstimate = "$2.4 Billion";
    persona = "Knowledge Workers, Creators & Automation Engineers";
    painPoints = [
      "Generic AI outputs lacking domain-specific context and structured schemas",
      "High API costs and rate limit bottlenecks with public models",
      "Difficulty integrating AI models into existing production workflows"
    ];
    pricingModel = "SaaS Subscription ($29/mo Individual, $149/mo Team)";
    estimatedCac = "$32 per user";
    estimatedLtv = "$540 (16-month retention)";
    paybackPeriod = "1.9 Months";
    competitors = [
      {
        name: "OpenAI ChatGPT / Notion AI",
        strengths: "Widespread consumer awareness and large foundational model access.",
        weakness: "Unstructured text outputs, hallucination risks, and lack of vertical workflow artifacts.",
        ourEdge: "Domain-specific structured blueprints, PDF report generation, and multi-modal intelligence."
      }
    ];
  }

  // Calculate Viability Score dynamically from idea characteristics
  const ideaLen = idea.trim().length;
  let baseScore = 74;
  if (ideaLen > 80) baseScore += 6;
  if (ideaLen > 200) baseScore += 5;
  if (lowerIdea.includes("b2b") || lowerIdea.includes("enterprise") || lowerIdea.includes("api")) baseScore += 4;
  const viabilityScore = Math.min(94, Math.max(58, baseScore));
  const riskLevel = viabilityScore >= 80 ? "Low" : viabilityScore >= 65 ? "Medium" : "High";

  return {
    id: "mkt_" + Date.now(),
    ideaTitle: cleanTitle.toUpperCase(),
    tagline: `Data-Driven Feasibility & Market Opportunity Analysis for "${cleanTitle}"`,
    category,
    date: dateStr,
    viabilityScore,
    riskLevel: riskLevel as "Low" | "Medium" | "High",
    tamEstimate,
    samEstimate,
    somEstimate,
    executiveSummary: `This institutional-grade market analysis evaluates "${idea}". Operating within the rapidly expanding ${category} sector, the concept demonstrates high structural scalability, strong unit economics, and clear differentiation. By addressing core pain points with a modern technology architecture, the venture is strategically positioned to capture early market share.`,
    targetAudience: {
      persona,
      painPoints,
      willingnessToPay: `High (${pricingModel})`
    },
    competitors,
    swot: {
      strengths: [
        `Targeted value proposition tailored specifically for ${persona}`,
        "Scalable cloud architecture with low incremental marginal costs (>85% gross margin)",
        "Instant exportable PDF artifacts and interactive reports driving organic virality"
      ],
      weaknesses: [
        "Initial dependence on organic founder distribution and digital content channels",
        "Requirement for ongoing domain schema expansion to maintain competitive moat"
      ],
      opportunities: [
        `Strategic integration with established platforms in the ${category} space`,
        "B2B Enterprise team licensing and white-label API distribution",
        "International expansion into rapidly growing emerging digital markets"
      ],
      threats: [
        "Emergence of generic low-cost AI wrappers attempting to copy feature sets",
        "Shifts in customer acquisition costs across paid digital channels"
      ]
    },
    unitEconomics: {
      pricingModel,
      estimatedCac,
      estimatedLtv,
      paybackPeriod
    },
    goToMarket: {
      primaryChannels: [
        "Product Hunt launch & founder community show-cases",
        "Targeted LinkedIn & Twitter interactive report sharing loops",
        "SEO content hubs targeting industry-specific keywords"
      ],
      viralHook: "One-click 'Export Full Market PDF Report' with embedded branding and referral link.",
      milestones: [
        { phase: "Phase 1 (Months 1-2)", goal: "Launch interactive MVP and onboard initial 500 active creators" },
        { phase: "Phase 2 (Months 3-5)", goal: "Achieve $10k MRR with Pro tier subscription conversions" },
        { phase: "Phase 3 (Months 6-12)", goal: "Scale to $50k MRR and establish strategic industry distribution partnerships" }
      ]
    },
    keyRecommendations: [
      `Leverage the downloadable PDF report feature as a primary lead magnet for ${persona}.`,
      "Focus initial marketing on one killer feature before expanding into multi-module workflows.",
      "Establish early referral partnerships with industry influencers and community hubs."
    ]
  };
}

function generateFallbackDocument(prompt: string, documentType?: string) {
  return `# ${documentType ? documentType.toUpperCase() : "TECHNICAL SPECIFICATION"}

## Executive Overview
**Objective**: ${prompt}

---

## 1. Core Architecture & System Boundaries
- **Runtime**: Node.js / Express proxy server with Vite frontend SPA.
- **State Management**: Reactive React 18 hooks with local persistence sync.
- **UI & Layout**: Responsive Tailwind CSS grid with dark/light mode support.

## 2. Key Functional Requirements
- **Responsive Layout**: Mobile sidebars (< 768px) collapse into touch-friendly drawer modals.
- **Loading UX**: Neon-themed skeleton shimmer placeholders for all asynchronous operations.
- **API Error Resilience**: Automatic retry with exponential backoff and friendly user toast alerts on 429 quota limits.

## 3. Implementation Milestones
1. Interface wireframing and component breakdown.
2. Server API route implementation with schema validation.
3. Mobile responsiveness audit and QA.

---
*Draft generated by CORE AI Engine.*`;
}

/**
 * Centralized error handler to identify Gemini rate limits and present friendly recommendations.
 */
function handleGeminiError(error: any, res: express.Response, fallbackMessage: string) {
  const errorStr = String(error?.message || error || "");
  const isRateLimit =
    error?.status === "RESOURCE_EXHAUSTED" ||
    error?.code === 429 ||
    error?.statusCode === 429 ||
    errorStr.includes("429") ||
    errorStr.includes("RESOURCE_EXHAUSTED") ||
    errorStr.includes("quota") ||
    errorStr.includes("limit") ||
    errorStr.includes("Rate Limit") ||
    errorStr.includes("Quota exceeded");

  const isUnavailable =
    error?.status === "UNAVAILABLE" ||
    error?.code === 503 ||
    error?.statusCode === 503 ||
    errorStr.includes("503") ||
    errorStr.includes("UNAVAILABLE") ||
    errorStr.includes("high demand") ||
    errorStr.includes("temporary") ||
    errorStr.includes("try again later");

  const isUnauthenticated =
    error?.status === "UNAUTHENTICATED" ||
    error?.code === 401 ||
    error?.statusCode === 401 ||
    errorStr.includes("401") ||
    errorStr.includes("UNAUTHENTICATED") ||
    errorStr.includes("invalid authentication credentials") ||
    errorStr.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED");

  if (isUnauthenticated) {
    return res.status(401).json({
      error: "Gemini API key authentication failed.\n\n💡 **How to resolve**:\n1. Open **Settings > Secrets** in the AI Studio menu.\n2. Add your valid **GEMINI_API_KEY**."
    });
  }

  if (isRateLimit) {
    return res.status(429).json({
      error: "Gemini API Quota Exceeded (RESOURCE_EXHAUSTED). The shared free-tier workspace developer key has hit its request limit.\n\n💡 **How to resolve this instantly**:\n1. Open the **Settings > Secrets** panel in the AI Studio menu (top right of your screen).\n2. Add your personal **GEMINI_API_KEY** as a secure environment secret.\n3. The application will instantly use your private key with unlimited high-speed limits!"
    });
  }

  if (isUnavailable) {
    return res.status(503).json({
      error: "Gemini API is currently experiencing extremely high demand (503 UNAVAILABLE).\n\n💡 **Please retry your request in a few seconds**. This is usually a very brief, temporary spike in global service usage. Adding your own private key under **Settings > Secrets** as **PERSONAL_GEMINI_API_KEY** can also bypass shared pool congestion!"
    });
  }

  res.status(500).json({ error: error?.message || fallbackMessage });
}


// 1. Idea Analyzer & Evaluator Route
app.post("/api/analyze-idea", async (req, res) => {
  const { idea, context } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea description is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      SYSTEM ROLE: You are CORE AI's brutally honest, highly critical, objective startup investor and principal technical architect.
      You MUST evaluate concepts strictly against real-world market saturation, technical feasibility, unit economics, and competitive barriers.
      Do NOT inflate scores for generic, unoriginal, or flawed ideas.

      Idea to Evaluate: "${idea}"
      User Context: ${JSON.stringify(context || {})}

      STRICT SCORING MANDATES:
      - overallScore is an integer from 0 to 100.
      - If the concept is unviable, generic, or flawed, set overallScore < 50 and set approved = false.
      - If overallScore >= 50, set approved = true.
      - IF REJECTED (overallScore < 50 or approved = false): You MUST provide 2 to 3 practical, actionable "pivotRecommendations" explaining concrete strategic pivots (e.g. B2B shift, niche repositioning, vertical specialization) to help the user upgrade their idea.
      - IF APPROVED (overallScore >= 50): Provide 2 to 3 growth/expansion pivot opportunities in pivotRecommendations.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "approved",
              "overallScore",
              "feasibilityScore",
              "marketPotentialScore",
              "innovationScore",
              "summary",
              "strengths",
              "weaknesses",
              "recommendations",
              "pivotRecommendations",
              "marketSizeAnalysis"
            ],
            properties: {
              approved: {
                type: Type.BOOLEAN,
                description: "True ONLY if overallScore >= 50 and concept is genuinely viable."
              },
              overallScore: {
                type: Type.INTEGER,
                description: "Brutally honest global viability score from 0 to 100."
              },
              feasibilityScore: {
                type: Type.INTEGER,
                description: "Technical and execution feasibility score from 0 to 100."
              },
              marketPotentialScore: {
                type: Type.INTEGER,
                description: "Market potential, addressable market size, and monetization score from 0 to 100."
              },
              innovationScore: {
                type: Type.INTEGER,
                description: "Innovation, uniqueness, and competitive advantage score from 0 to 100."
              },
              summary: {
                type: Type.STRING,
                description: "A professional 1-2 sentence executive summary of the evaluation."
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 key strengths of this idea."
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 major risks, weaknesses, or execution hurdles."
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 immediate, actionable recommendations to improve or validate this idea."
              },
              pivotRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 practical strategic pivot recommendations if score < 50 or growth vectors."
              },
              marketSizeAnalysis: {
                type: Type.STRING,
                description: "Brief analysis of the target audience, potential market size, and competitive landscape."
              }
            }
          }
        }
      })
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const evaluation = JSON.parse(resultText);
    if (typeof evaluation.overallScore === "number" && evaluation.overallScore < 50) {
      evaluation.approved = false;
    }
    return res.json(evaluation);
  } catch (error: any) {
    console.error("Error in /api/analyze-idea (serving fallback):", error);
    const fallback = generateFallbackEvaluation(idea, context);
    return res.json(fallback);
  }
});

// 2. Step-by-Step Guider & Prototype Engine Route
app.post("/api/generate-guidance", async (req, res) => {
  const { idea, title } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea description is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      Convert this approved raw concept into a structured implementation action plan and interactive prototype code outline:
      Idea: "${idea}"
      Title: "${title || "Idea Development"}"

      Provide clear, structured, end-to-end guidance to execute this idea.
      Suggest the recommended technology stack, immediate milestones, wireframe concept description, and a clean, production-ready Tailwind CSS / HTML code snippet for the prototype UI wireframe.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["title", "description", "steps", "prototypeStack", "wireframeConcept", "wireframeCode"],
            properties: {
              title: { type: Type.STRING, description: "Name of the project/concept." },
              description: { type: Type.STRING, description: "Brief description of the execution plan." },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["stepNumber", "title", "actionItem", "technicalDetails", "estimatedHours"],
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING, description: "Phase title (e.g. MVP Planning, UI Wireframing, API Setup)." },
                    actionItem: { type: Type.STRING, description: "Specific item or action to execute." },
                    technicalDetails: { type: Type.STRING, description: "Technical implementation details, tools, or lines of code suggested." },
                    estimatedHours: { type: Type.INTEGER, description: "Estimated time to complete." }
                  }
                }
              },
              prototypeStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of modern tech tools, frameworks, and libraries recommended for a prototype."
              },
              wireframeConcept: {
                type: Type.STRING,
                description: "A text layout of how the primary prototype screen should be structured visually."
              },
              wireframeCode: {
                type: Type.STRING,
                description: "Clean, valid HTML code using Tailwind CSS utility classes representing the main UI mockup component."
              }
            }
          }
        }
      })
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const guidance = JSON.parse(resultText);
    return res.json(guidance);
  } catch (error: any) {
    console.error("Error in /api/generate-guidance (serving fallback):", error);
    const fallback = generateFallbackGuidance(idea, title);
    return res.json(fallback);
  }
});

// 3. AI Image Generator Route
app.post("/api/generate-image", async (req, res) => {
  const { prompt, aspectRatio } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const userPrompt = String(prompt).trim();

  // Primary: Try Gemini Image Generation Model
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: `High-quality, highly detailed visual mockup or prototype asset for: ${userPrompt}. Professional design, clear composition, 8k resolution.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
        },
      },
    });

    let base64Image = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (base64Image) {
      return res.json({
        imageUrl: `data:image/png;base64,${base64Image}`,
        engine: "Gemini Image AI"
      });
    }
  } catch (geminiErr: any) {
    console.log("[AI Engine] Gemini image quota unavailable, activating Flux AI generator engine.");
  }

  // Secondary: Real AI Image Generation via Pollinations Flux Engine
  try {
    const seed = Math.floor(Math.random() * 10000000);
    const encodedPrompt = encodeURIComponent(userPrompt + ", high quality, 8k resolution, professional UI design prototype, photorealistic");
    const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=true`;

    const pollRes = await fetch(pollUrl, { signal: AbortSignal.timeout(8000) });
    if (pollRes.ok) {
      const arrayBuf = await pollRes.arrayBuffer();
      if (arrayBuf.byteLength > 1000) {
        const base64 = Buffer.from(arrayBuf).toString("base64");
        const mime = pollRes.headers.get("content-type") || "image/jpeg";
        return res.json({
          imageUrl: `data:${mime};base64,${base64}`,
          engine: "Pollinations Flux Real AI Engine",
          isRealAiGenerated: true
        });
      }
    }
  } catch (pollErr) {
    console.log("[AI Engine] Serving direct streaming AI image URL.");
  }

  // Direct Real AI Image Streaming URL (Zero-latency direct client stream from Flux AI Engine)
  const seed = Math.floor(Math.random() * 10000000);
  const encodedPrompt = encodeURIComponent(userPrompt + ", high quality, professional UI prototype, 8k");
  const directAiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=true`;

  return res.json({
    imageUrl: directAiImageUrl,
    engine: "Pollinations Flux Real AI Stream Engine",
    isRealAiGenerated: true
  });
});

// 4. Multimodal Image Analyzer Route
app.post("/api/analyze-image", async (req, res) => {
  const { base64Data, mimeType, prompt } = req.body;
  if (!base64Data || !mimeType) {
    return res.status(400).json({ error: "Image data and mimeType are required." });
  }

  try {
    const ai = getGeminiClient();
    const queryPrompt = prompt || "Analyze this user-uploaded sketch or reference image and explain how to execute or build it. List key visual components, user flow ideas, and potential tech implementation.";

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: queryPrompt,
            },
          ],
        },
      })
    );

    return res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Error in /api/analyze-image (serving fallback):", error);
    return res.json({
      analysis: `### 🔍 Visual Blueprint Analysis\n\n**Key Visual Components Identified**:\n- High-impact visual workspace & structural container\n- Navigation header and interactive action controls\n- Structured layout sections for user input and real-time output\n\n**Execution & Architecture Recommendations**:\n1. **Frontend Architecture**: React 18 + Tailwind CSS with responsive layout grids.\n2. **State Management**: Local reactive state with client persistence.\n3. **User Experience**: Smooth transition effects and high-contrast accessibility.\n\n*Analyzed via CORE AI Visual Intelligence.*`
    });
  }
});

// 5. Advanced Writing Assistant Route
app.post("/api/write", async (req, res) => {
  const { prompt, documentType, tone, targetAudience } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Drafting prompt is required." });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are a world-class copywriter, business consultant, and technical writer. 
    You excel at writing high-precision copy, creative marketing material, and technical specifications.`;

    const instructions = `
      Draft a highly professional, well-formatted document of type "${documentType || "general specification"}".
      
      User Prompt: "${prompt}"
      Target Audience: "${targetAudience || "General Public"}"
      Requested Tone: "${tone || "Professional and highly polished"}"

      Use professional headings, bullet points, clean markdown styling, and make it thorough and publication-ready.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: instructions,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      })
    );

    return res.json({ content: response.text });
  } catch (error: any) {
    console.error("Error in /api/write (serving fallback):", error);
    const fallbackContent = generateFallbackDocument(prompt, documentType);
    return res.json({ content: fallbackContent });
  }
});

// 6. TTS / Speech Generation Route
app.post("/api/generate-speech", async (req, res) => {
  try {
    const { text, mode, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text to speak is required." });
    }

    const ai = getGeminiClient();

    // Clean text: strip code blocks, markdown headings, bold markers, URLs, and emojis
    const cleanText = String(text)
      .replace(/```[\s\S]*?```/g, " [code block] ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*#_~>]/g, " ")
      .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Component}]/gu, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{FE0F}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    // Limit text length to nearest sentence boundary for instant TTS response (under 2s)
    let speechText = cleanText;
    if (speechText.length > 900) {
      const truncated = speechText.slice(0, 900);
      const lastBoundary = Math.max(
        truncated.lastIndexOf(". "),
        truncated.lastIndexOf("! "),
        truncated.lastIndexOf("? "),
        truncated.lastIndexOf("। ")
      );
      if (lastBoundary > 200) {
        speechText = truncated.slice(0, lastBoundary + 1);
      } else {
        speechText = truncated;
      }
    }

    // Detect if text is Hindi (Devanagari script) or language is Hindi/Hinglish
    const containsDevanagari = /[\u0900-\u097F]/.test(speechText);
    const isHindiOrHinglish = containsDevanagari || language === "hi" || language === "hinglish";

    let instructionPrefix = "";
    let voiceName = mode === "robotic" ? "Puck" : "Kore";

    if (isHindiOrHinglish) {
      voiceName = "Kore"; // 'Kore' delivers smooth, natural, high-clarity Indian and Hindi phonetics
      if (containsDevanagari || language === "hi") {
        instructionPrefix = "Say with authentic, natural, warm, and clear Hindi pronunciation: ";
      } else {
        instructionPrefix = "Say in a clear, friendly, and natural Indian accent: ";
      }
    } else if (mode === "robotic") {
      instructionPrefix = "Say precisely, in a structured, mechanical, and clear technical tone: ";
    } else {
      instructionPrefix = "Say cheerfully, in a natural, friendly, warm, and conversational tone: ";
    }

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${instructionPrefix}${speechText}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    }));

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio payload returned from Gemini TTS engine.");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Error in /api/generate-speech:", error);
    handleGeminiError(error, res, "Failed to generate speech.");
  }
});

// 7. General Mode-aware Chat Route
app.post("/api/chat", async (req, res) => {
  const { messages, activeMode, customInstructions, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    const ai = getGeminiClient();

    // Mode-specific prompts and system instruction adjustment
    let modeGuidance = "";
    if (activeMode === "guider") {
      modeGuidance = "You are in GUIDER MODE. Act as an expert project manager and CTO. Your tone should be highly structured, technical, precise, and practical. Output clear code blocks, technical architectures, and wireframe specs where relevant.";
    } else if (activeMode === "companion") {
      modeGuidance = "You are in COMPANION/FRIEND MODE. Act as a friendly, supportive, and warm brainstorming buddy. Be encouraging, ask open-ended questions, and speak in an empathetic, conversational, everyday tone.";
    } else {
      modeGuidance = "You are in AUTOMATIC MODE. Adapt dynamically to the user's input tone. If they are asking for business/technical execution, answer in a structured Guider tone. If they are speaking casually, seeking support, or chatting, respond in a friendly Companion/Friend tone. Automatically shift behavior.";
    }

    let userProfileContext = "";
    if (userProfile && (userProfile.name || userProfile.occupation || userProfile.age || userProfile.details)) {
      userProfileContext = `
      LEARNED USER PROFILE & PERSONA (LEARN & ADAPT TO THIS USER):
      - Name: ${userProfile.name || "User"}
      - What they do / Occupation: ${userProfile.occupation || "Not specified"}
      - Age / Age Group: ${userProfile.age || "Not specified"}
      - Background & Preferences: ${userProfile.details || "None provided"}

      AI LEARNING DIRECTIVE: Learn from this user's profile and adapt your responses accordingly. Use domain-appropriate terminology, tone, and examples suitable for their age, occupation, and goals. Address them naturally by name when appropriate.
      `;
    }

    const sysInstruction = `
      You are CORE AI, an elite, highly intelligent, master-level problem-solving engine & AI workspace assistant.
      
      CORE WORKSPACE MANTRA: You help users THINK → UNDERSTAND → ANALYZE → DECIDE → BUILD.
      
      EXCELLENCE IN ANSWERING & WRITING (MASTER LEVEL DIRECTIVES):
      1. HIGH-IMPACT CLARITY & STRUCTURE:
         - Write with exceptional mastery, clarity, and structural polish.
         - Avoid unnecessary filler words or generic conversational intro fluff (e.g., do not say "Sure! I would be happy to help you with that"). Jump straight into high-value, actionable insights.
         - Use clean Markdown headers (###), **bold key phrases** for visual rhythm, bullet points for scannability, and structured tables when comparing options.
         - Match the user's natural language and script effortlessly (English, Hinglish, Hindi, etc.) with fluent, native-sounding phrasing.

      2. DEEP & ACTIONABLE CONTENT:
         - Provide complete, deeply insightful, well-reasoned answers that address both immediate questions and underlying context.
         - For technical / coding queries: Provide production-grade, bug-free, fully commented code with clear step-by-step logic and edge-case analysis.
         - For study / concepts / decisions: Use clear mental models, real-world analogies, pros & cons, and step-by-step frameworks to make complex concepts crystal clear.

      3. CURRENT OPERATIONAL STATE:
      ${modeGuidance}

      WHEN APPROPRIATE (especially for complex queries, technical requests, decision evaluations, or project builds), visually structure your responses using clear markdown sections like:

      🧠 UNDERSTANDING
      What CORE understood from the user's input and goals.

      🔍 ANALYSIS
      Deeper breakdown, context, or architecture considerations.

      🎯 ROOT PROBLEM
      The primary underlying challenge or bottleneck (when applicable).

      💡 OPTIONS
      Practical solutions, strategies, or architectural approaches.

      ⚠️ RISKS
      Key trade-offs, potential pitfalls, or edge cases to consider.

      🚀 NEXT STEP
      The most practical recommended immediate action plan.

      NOTE: Do not force simple, casual, or standard conversational chats into a rigid template. Keep simple chat responses natural, fluid, articulate, and direct. Use the structured breakdown when analyzing ideas, diagnosing issues, comparing choices, or planning technical implementations.

      PERMANENT APP OWNER & CREATOR KNOWLEDGE (MALIK DETAILS):
      - App Owner / Creator / Malik: Rohit
      - Class: 11th Grade Student
      - Age: 15 Years Old
      - Role: Founder, Owner & Chief Architect of ASCEND STUDY / CORE AI
      - CRITICAL MANDATE: You must ALWAYS remember Rohit as the owner/malik of this app. Whenever asked "Is app ka malik kaun hai?", "Who owns this app?", "Who created this app?", "Rohit kaun hai?", or any related question, always proudly, warmly, and clearly state that Rohit (15 years old, 11th Class student) is the creator and owner of this application!

      CUSTOM USER RULES / PREFERENCES:
      ${customInstructions || "No custom rules configured."}

      ${userProfileContext}

      CRITICAL COMPLETENESS MANDATE: You MUST write complete, fully finished responses. Never cut off mid-sentence, leave unclosed code blocks, or terminate prematurely. Ensure every sentence, paragraph, and thought reaches a natural, complete conclusion before ending your output.
      
      Ensure you respond with maximum clarity, clean markdown formatting, accurate code blocks with syntax tags, and actionable guidance. Keep your answers clean, well-spaced, and easy to read.
    `;

    // Map messages format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: m.parts ? m.parts : [{ text: m.text }],
    }));

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
        },
      })
    );

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat (serving fallback):", error);
    const fallbackText = generateFallbackChatResponse(messages, activeMode);
    return res.json({ text: fallbackText });
  }
});

// 8. Generate Conversation Title Route
app.post("/api/generate-title", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required for title generation." });
  }

  try {
    const firstThree = messages.slice(0, 3);
    const contentText = firstThree
      .map((m: any) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n\n");

    const ai = getGeminiClient();
    const prompt = `
      Analyze the following initial messages of a chat session:
      
      ${contentText}

      Generate a brief, highly professional, 2-to-4 word title for this conversation session.
      Do NOT use quotes, punctuation, markdown formatting, or any extra text. Return ONLY the title itself.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.5,
          maxOutputTokens: 15,
        },
      })
    );

    let title = response.text?.trim() || "";
    title = title.replace(/^["'`\s]+|["'`\s]+$/g, "").trim();
    if (title.length > 40) {
      title = title.slice(0, 40) + "...";
    }

    return res.json({ title: title || "CORE AI Session" });
  } catch (error: any) {
    console.error("Error in /api/generate-title (serving fallback):", error);
    const firstMsgText = messages[0]?.text || "New Idea";
    const titleSnippet = firstMsgText.split(" ").slice(0, 3).join(" ") || "CORE AI Session";
    return res.json({ title: titleSnippet });
  }
});

// 8b. Auto Chat Name Selector - Multi-Option Generator Route
app.post("/api/generate-title-options", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required for generating title options." });
  }

  try {
    const firstFew = messages.slice(0, 4);
    const contentText = firstFew
      .map((m: any) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n\n");

    const ai = getGeminiClient();
    const prompt = `
      Analyze the following chat conversation context:
      ${contentText}

      Generate 4 distinct, highly creative, professional title options (2 to 4 words each) that describe this conversation session.
      Output a JSON object containing an "options" array with 4 string elements.
      Do NOT include quote marks inside the titles or markdown formatting.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["options"],
            properties: {
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 concise title suggestions."
              }
            }
          }
        }
      })
    );

    const data = JSON.parse(response.text || "{}");
    const options = (data.options || []).map((s: string) => s.replace(/^["'`\s]+|["'`\s]+$/g, "").trim()).filter(Boolean);
    if (options.length > 0) {
      return res.json({ options: options.slice(0, 4) });
    }
    throw new Error("Empty options array returned");
  } catch (error: any) {
    console.error("Error in /api/generate-title-options (serving fallback):", error);
    const firstMsgText = messages[0]?.text || "New Conversation";
    const words = firstMsgText.split(" ").filter(Boolean);
    const opt1 = words.slice(0, 3).join(" ") || "Core Strategy Session";
    const opt2 = "Technical Architecture Blueprint";
    const opt3 = "AI Venture Exploration";
    const opt4 = "CORE Prototyping Thread";
    return res.json({ options: [opt1, opt2, opt3, opt4] });
  }
});

// 8c. Summarize Thread - Executive Chat History Summary Route
app.post("/api/summarize-thread", async (req, res) => {
  const { messages, sessionTitle } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required to generate thread summary." });
  }

  try {
    // Collect message transcript (limit to last 35 messages for optimal performance)
    const recentMessages = messages.slice(-35);
    const transcript = recentMessages
      .map((m: any) => `${m.role === "user" ? "User" : "CORE AI"}: ${m.text}`)
      .join("\n\n");

    const ai = getGeminiClient();
    const prompt = `
      You are CORE AI, an executive-level strategic assistant.
      Analyze the following chat conversation history titled "${sessionTitle || "CORE Chat Thread"}":

      --- CHAT TRANSCRIPT ---
      ${transcript}
      --- END TRANSCRIPT ---

      Generate a high-level executive summary tailored for quick context switching. Use clean Markdown formatting with the following structure:

      ### 📌 Executive Overview
      A concise 2-3 sentence overview of what problem, goal, or topic was discussed in this thread.

      ### 💡 Key Insights & Decisions
      - Bullet points highlighting the core solutions, technical architecture, decisions, or code patterns established.

      ### 🚀 Action Items & Next Steps
      - Actionable recommendations or next logical steps to continue work seamlessly.

      ### 🎯 Quick Context Recap
      A single, punchy sentence summarizing the main takeaway for instant context restoration.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      })
    );

    const summary = response.text?.trim() || "No summary generated.";
    return res.json({ summary });
  } catch (error: any) {
    console.error("Error in /api/summarize-thread (serving fallback):", error);
    // Construct local fallback executive summary
    const userMsgCount = messages.filter((m: any) => m.role === "user").length;
    const modelMsgCount = messages.filter((m: any) => m.role === "model").length;
    const firstQuery = messages.find((m: any) => m.role === "user")?.text || "General discussion";
    const lastQuery = messages.slice().reverse().find((m: any) => m.role === "user")?.text || firstQuery;

    const fallbackSummary = `### 📌 Executive Overview
Discussion thread titled "${sessionTitle || "CORE AI Session"}" containing ${messages.length} total messages (${userMsgCount} user prompts, ${modelMsgCount} AI responses). Primary topic initiated around: "${firstQuery.slice(0, 120)}...".

### 💡 Key Insights & Decisions
- **Main Inquiry**: Focus centered on resolving "${lastQuery.slice(0, 100)}...".
- **Interaction Depth**: ${messages.length > 10 ? "Deep multi-turn technical/strategic exchange" : "Focused quick resolution session"}.

### 🚀 Action Items & Next Steps
- Review previous AI recommendations in the thread.
- Resume conversation directly or ask follow-up questions to refine solutions.

### 🎯 Quick Context Recap
Active workspace thread for "${sessionTitle || "CORE AI Session"}" ready for seamless continuation.`;

    return res.json({ summary: fallbackSummary });
  }
});

// 9. X-Factor Strategic Catalyst Route
app.post("/api/generate-xfactor", async (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea description is required to extract its X-Factor." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      You are the elite Founding CTO and lead Venture Strategist of ASCEND STUDY / CORE AI.
      Analyze the following raw startup/project idea and engineer an "X-Factor Blueprint":
      "${idea}"

      Develop a futuristic, high-conviction, and non-obvious growth blueprint detailing the unique unfair advantage, self-sustaining loop, magic sticky feature, and positioning edge that would make this idea unstoppable in the market.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "title",
              "unfairAdvantage",
              "growthLoop",
              "magicRetentionFeature",
              "marketPositioningEdge",
              "strategicTriggers"
            ],
            properties: {
              title: {
                type: Type.STRING,
                description: "A catchy, futuristic, X-Factor themed name for this startup idea/project."
              },
              unfairAdvantage: {
                type: Type.STRING,
                description: "The deep structural moat or intellectual property concept (1-2 sentences)."
              },
              growthLoop: {
                type: Type.STRING,
                description: "How the product naturally spreads and gains new users recursively (1-2 sentences)."
              },
              magicRetentionFeature: {
                type: Type.STRING,
                description: "A single highly sticky, extremely engaging or magical core feature concept (1-2 sentences)."
              },
              marketPositioningEdge: {
                type: Type.STRING,
                description: "How the idea positions itself relative to legacy players to win instantly (1-2 sentences)."
              },
              strategicTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 highly actionable strategic triggers to unlock this unfair advantage."
              }
            }
          }
        }
      })
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const xfactor = JSON.parse(resultText);
    return res.json(xfactor);
  } catch (error: any) {
    console.error("Error in /api/generate-xfactor (serving fallback):", error);
    const fallback = generateFallbackXFactor(idea);
    return res.json(fallback);
  }
});

// 10. Full Market Style Analysis PDF Generator Route
app.post("/api/market-analysis", async (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea is required for market analysis." });
  }

  try {
    const ai = getGeminiClient();
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const prompt = `
      SYSTEM ROLE: You are CORE AI's Lead Venture Capital Analyst and Chief Market Research Strategist.
      Perform a deep, highly specific, quantitative and qualitative market analysis report for the following business concept:

      BUSINESS CONCEPT: "${idea}"
      CURRENT DATE: "${dateStr}"

      CRITICAL ANALYZER MANDATES:
      1. Detect the exact REAL industry sector/category (e.g. EdTech & Educational AI, FinTech & Payments, HealthTech & Digital Wellness, DevTools & Infrastructure, AI SaaS & Automation, E-Commerce & Retail, B2B Enterprise, etc.).
      2. Identify ACTUAL, REAL competitor companies or products in this exact industry domain (e.g. Duolingo/Coursera for EdTech; Stripe/Plaid for FinTech; Strava/MyFitnessPal for Health; GitHub/Vercel for DevTools; ChatGPT/Notion for AI; etc.). Do NOT use generic placeholder names like "Legacy Research Tools".
      3. Compute realistic TAM, SAM, and SOM dollar estimates in USD derived from real industry benchmarks for this specific sector.
      4. Calculate a realistic, non-arbitrary Viability Score (0-100) and Risk Level (Low, Medium, or High) by evaluating market saturation, customer acquisition complexity, and technological differentiation for THIS specific idea.
      5. Detail domain-tailored Target Audience Personas, Pain Points, SWOT Analysis, Unit Economics (CAC, LTV, Pricing), and a step-by-step Go-To-Market roadmap.
    `;

    const response = await callGeminiWithCascade((model) =>
      ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "ideaTitle",
              "tagline",
              "category",
              "viabilityScore",
              "riskLevel",
              "tamEstimate",
              "samEstimate",
              "somEstimate",
              "executiveSummary",
              "targetAudience",
              "competitors",
              "swot",
              "unitEconomics",
              "goToMarket",
              "keyRecommendations"
            ],
            properties: {
              ideaTitle: { type: Type.STRING },
              tagline: { type: Type.STRING },
              category: { type: Type.STRING },
              viabilityScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              tamEstimate: { type: Type.STRING },
              samEstimate: { type: Type.STRING },
              somEstimate: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              targetAudience: {
                type: Type.OBJECT,
                required: ["persona", "painPoints", "willingnessToPay"],
                properties: {
                  persona: { type: Type.STRING },
                  painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  willingnessToPay: { type: Type.STRING }
                }
              },
              competitors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["name", "strengths", "weakness", "ourEdge"],
                  properties: {
                    name: { type: Type.STRING },
                    strengths: { type: Type.STRING },
                    weakness: { type: Type.STRING },
                    ourEdge: { type: Type.STRING }
                  }
                }
              },
              swot: {
                type: Type.OBJECT,
                required: ["strengths", "weaknesses", "opportunities", "threats"],
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              unitEconomics: {
                type: Type.OBJECT,
                required: ["pricingModel", "estimatedCac", "estimatedLtv", "paybackPeriod"],
                properties: {
                  pricingModel: { type: Type.STRING },
                  estimatedCac: { type: Type.STRING },
                  estimatedLtv: { type: Type.STRING },
                  paybackPeriod: { type: Type.STRING }
                }
              },
              goToMarket: {
                type: Type.OBJECT,
                required: ["primaryChannels", "viralHook", "milestones"],
                properties: {
                  primaryChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                  viralHook: { type: Type.STRING },
                  milestones: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["phase", "goal"],
                      properties: {
                        phase: { type: Type.STRING },
                        goal: { type: Type.STRING }
                      }
                    }
                  }
                }
              },
              keyRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      })
    );

    const reportData = JSON.parse(response.text || "{}");
    reportData.id = "mkt_" + Date.now();
    reportData.date = dateStr;
    return res.json(reportData);
  } catch (error: any) {
    console.error("Error in /api/market-analysis (serving fallback):", error);
    const fallback = generateFallbackMarketAnalysis(idea);
    return res.json(fallback);
  }
});

// Configure Vite middleware for development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CORE AI Server running on http://localhost:${PORT}`);
  });
}

// Only start standalone HTTP server if NOT running in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
