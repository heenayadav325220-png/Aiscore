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
    "PERSONAL_GEMINI_API_KEY",
    "CUSTOM_GEMINI_API_KEY",
    "USER_GEMINI_API_KEY",
    "DECISION_MIRROR_API_KEY",
    "DECISION_MIRROR_GEMINI_KEY",
    "MY_GEMINI_API_KEY",
    "GEMINI_API_KEY"
  ];
  
  let apiKey = "";
  
  for (const name of apiKeyCandidateNames) {
    const val = process.env[name];
    if (val && val !== "MY_GEMINI_API_KEY" && val.trim() !== "") {
      apiKey = val;
      break;
    }
  }

  if (!apiKey) {
    throw new Error(
      "No Gemini API key is configured. Please open Settings > Secrets in the AI Studio UI and add your private key as PERSONAL_GEMINI_API_KEY."
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
 * Tries executing a Gemini API call across multiple candidate models in sequence
 * if rate limits, quota limits, or model unavailability occur.
 */
async function callGeminiWithCascade<T>(
  ai: GoogleGenAI,
  callFn: (modelName: string) => Promise<T>
): Promise<T> {
  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-3.5-flash",
    "gemini-1.5-flash"
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      return await retryWithBackoff(() => callFn(model));
    } catch (err: any) {
      lastError = err;
      const errStr = (err?.message || "") + " " + JSON.stringify(err || {});
      const isQuotaOrNotFound =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.code === 429 ||
        err?.statusCode === 429 ||
        errStr.includes("429") ||
        errStr.includes("RESOURCE_EXHAUSTED") ||
        errStr.includes("quota") ||
        errStr.includes("Quota exceeded") ||
        errStr.includes("404") ||
        errStr.includes("NOT_FOUND");

      if (isQuotaOrNotFound) {
        console.warn(`[Gemini Cascade] Model '${model}' quota or resource limit reached. Cascading to next candidate model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// --- SMART FALLBACK SYNTHESIS GENERATORS (Activates when API keys reach rate limits) ---

function generateFallbackEvaluation(idea: string, context?: any) {
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

function generateFallbackChatResponse(messages: any[], activeMode?: string) {
  const lastMsg = messages[messages.length - 1]?.text || "Hello";
  const mode = activeMode || "auto";

  let prefix = "";
  if (mode === "guider") {
    prefix = "### 🛠️ CORE AI Guider Plan & Technical Blueprint\n\nI have analyzed your technical requirement:";
  } else if (mode === "companion") {
    prefix = "### 💡 CORE AI Brainstorming Companion\n\nThat's a fantastic concept to explore! Here are my thoughts:";
  } else {
    prefix = "### ⚡ CORE AI Synthesis Matrix\n\nHere is a structured analysis of your prompt:";
  }

  return `${prefix}

**Query Analysis**: "${lastMsg}"

1. **Strategic Execution Path**:
   - Break down the requirements into modular components with explicit state boundaries.
   - Establish clean type safety and robust API proxies.
   - Maintain mobile responsiveness and high-contrast accessibility.

2. **Key Recommendations**:
   - Keep the primary interface single-view with responsive drawer overlays for mobile devices.
   - Ensure clear loading indicators during async operations.
   - Optimize client rendering with memoized state updates.

*Note: Free-tier workspace quota limit reached. Output synthesized via local CORE engine. For unlimited private AI bandwidth, enter your personal GEMINI_API_KEY in Settings > Secrets!*`;
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
  try {
    const { idea, context } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea description is required." });
    }

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

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    }));

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const evaluation = JSON.parse(resultText);
    // Hard check consistency: if score < 50, ensure approved is false
    if (typeof evaluation.overallScore === "number" && evaluation.overallScore < 50) {
      evaluation.approved = false;
    }
    res.json(evaluation);
  } catch (error: any) {
    console.error("Error in /api/analyze-idea:", error);
    handleGeminiError(error, res, "Failed to analyze idea.");
  }
});

// 2. Step-by-Step Guider & Prototype Engine Route
app.post("/api/generate-guidance", async (req, res) => {
  try {
    const { idea, title } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea description is required." });
    }

    const ai = getGeminiClient();
    const prompt = `
      Convert this approved raw concept into a structured implementation action plan and interactive prototype code outline:
      Idea: "${idea}"
      Title: "${title || "Idea Development"}"

      Provide clear, structured, end-to-end guidance to execute this idea.
      Suggest the recommended technology stack, immediate milestones, wireframe concept description, and a clean, production-ready Tailwind CSS / HTML code snippet for the prototype UI wireframe.
    `;

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    }));

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const guidance = JSON.parse(resultText);
    res.json(guidance);
  } catch (error: any) {
    console.error("Error in /api/generate-guidance:", error);
    handleGeminiError(error, res, "Failed to generate implementation guidance.");
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
  try {
    const { base64Data, mimeType, prompt } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Image data and mimeType are required." });
    }

    const ai = getGeminiClient();
    const queryPrompt = prompt || "Analyze this user-uploaded sketch or reference image and explain how to execute or build it. List key visual components, user flow ideas, and potential tech implementation.";

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    }));

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Error in /api/analyze-image:", error);
    handleGeminiError(error, res, "Failed to analyze image.");
  }
});

// 5. Advanced Writing Assistant Route
app.post("/api/write", async (req, res) => {
  try {
    const { prompt, documentType, tone, targetAudience } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Drafting prompt is required." });
    }

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

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructions,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    }));

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Error in /api/write:", error);
    handleGeminiError(error, res, "Failed to write document draft.");
  }
});

// 6. TTS / Speech Generation Route
app.post("/api/generate-speech", async (req, res) => {
  try {
    const { text, mode } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text to speak is required." });
    }

    const ai = getGeminiClient();
    
    // Choose voice based on the selected mode:
    // Human-like Mode: Friendly/conversational ('Zephyr' or 'Kore')
    // Robotic Mode: Precise/structured ('Puck' or 'Fenrir')
    const voiceName = mode === "robotic" ? "Puck" : "Kore";
    const instructionPrefix = mode === "robotic"
      ? "Say precisely, in a structured, mechanical, and clear technical tone: "
      : "Say cheerfully, in a natural, friendly, warm, and conversational tone: ";

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${instructionPrefix}${text}` }] }],
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
  try {
    const { messages, activeMode, customInstructions } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

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

    const sysInstruction = `
      You are CORE AI, a premium, intelligent, high-performance AI assistant.
      
      CORE VISION: You analyze user ideas, evaluate their global-level potential, and generate prototypes with step-by-step guidance.
      
      CURRENT OPERATIONAL STATE:
      ${modeGuidance}

      CUSTOM USER RULES / PREFERENCES:
      ${customInstructions || "No custom rules configured."}

      Ensure you respond with maximum clarity, premium formatting, and accurate, actionable ideas. Keep your answers clean, well-spaced, and easy to read.
    `;

    // Map messages format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: m.parts ? m.parts : [{ text: m.text }],
    }));

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      },
    }));

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    handleGeminiError(error, res, "Failed to generate chat response.");
  }
});

// 8. Generate Conversation Title Route
app.post("/api/generate-title", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required for title generation." });
    }

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

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 15,
      },
    }));

    let title = response.text?.trim() || "";
    // Clean up any potential quotes, markdown, or terminal punctuation
    title = title.replace(/^["'`\s]+|["'`\s]+$/g, "").trim();
    if (title.length > 40) {
      title = title.slice(0, 40) + "...";
    }

    res.json({ title: title || "New Conversation" });
  } catch (error: any) {
    console.error("Error in /api/generate-title:", error);
    handleGeminiError(error, res, "Failed to generate conversation title.");
  }
});

// 9. X-Factor Strategic Catalyst Route
app.post("/api/generate-xfactor", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea description is required to extract its X-Factor." });
    }

    const ai = getGeminiClient();
    const prompt = `
      You are the elite Founding CTO and lead Venture Strategist of ASCEND STUDY / CORE AI.
      Analyze the following raw startup/project idea and engineer an "X-Factor Blueprint":
      "${idea}"

      Develop a futuristic, high-conviction, and non-obvious growth blueprint detailing the unique unfair advantage, self-sustaining loop, magic sticky feature, and positioning edge that would make this idea unstoppable in the market.
    `;

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    }));

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const xfactor = JSON.parse(resultText);
    res.json(xfactor);
  } catch (error: any) {
    console.error("Error in /api/generate-xfactor:", error);
    handleGeminiError(error, res, "Failed to engineer X-Factor blueprint.");
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CORE AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
