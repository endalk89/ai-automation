import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization helper for Gemini SDK to handle optional/empty keys gracefully
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", keyAvailable: !!process.env.GEMINI_API_KEY });
});

// API Route: Simulate Automation Step Execution
app.post("/api/simulate-step", async (req, res) => {
  try {
    const { step, triggerData, previousOutputs } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are a professional workflow execution engine simulator (like Zapier or Make but with native smart LLM capabilities).
Given a workflow step definition, trigger input details, and accumulated context from previous workflow steps:
1. Simulate what the output would look like.
2. For an 'AI_PROMPT' or 'AI_CLASSIFY' action step, evaluate the prompt/instruction against the input data and generate the actual LLM output.
3. For data steps, perform the basic filter/mapper transforms.
4. Provide structured logs explaining what occurred, a realistic simulated execution duration, status ('success' or 'failed'), and the final output object.

Always output a valid JSON object matching the requested schema. Do not output anything outside JSON.`;

    const promptText = `
=== WORKFLOW CONTEXT ===
Trigger Input Data: ${JSON.stringify(triggerData || {})}
Previous Node Outputs: ${JSON.stringify(previousOutputs || {})}

=== STEP DEFINITION ===
Step Name: "${step.name || "Unnamed Step"}"
Step Type: "${step.type}" (Choices: TRIGGER, ACTION_EMAIL, ACTION_AI_PROMPT, ACTION_AI_CLASSIFY, ACTION_FILTER, ACTION_WEBHOOK, ACTION_CODE)
Step Configuration: ${JSON.stringify(step.config || {})}

Simulate running this step. Be highly scientific and educational. If the input contains a templated variable (e.g., {{trigger.email}} or {{trigger.message}} or {{steps.previous.output}}), resolve them correctly before running!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["status", "output", "logs", "executionMs"],
          properties: {
            status: {
              type: Type.STRING,
              description: "Must be 'success' or 'failed'",
            },
            output: {
              type: Type.OBJECT,
              description: "The JSON output dictionary representing parsed response or execution outcome.",
            },
            logs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Educative, detailed logs of what the engine did during this step (e.g. resolved variable, applied system instructions, called LLM).",
            },
            executionMs: {
              type: Type.INTEGER,
              description: "Simulated execution duration in milliseconds.",
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Simulation error:", error);
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
});

// API Route: Analyze Workflow Logic for issues
app.post("/api/analyze-workflow", async (req, res) => {
  try {
    const { workflow } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are a senior Solutions Architect specializing in AI and No-code Automations.
Analyze the user's multi-step automation workflow. Check for:
1. Logical design gaps (e.g., missing variables, references to steps that don't exist, filters that are too strict, triggers that lack crucial details).
2. Prompt engineering issues in LLM steps (Vague instructions, lack of examples/guardrails, exposing prompt injection vulnerabilities).
3. Efficiency improvements (redundant steps, opportunity to bundle steps).
4. Safety & security risks (leaking PII, missing filters before taking high-impact destructive actions like email sending).

Provide clear, highly structured, encouraging feed-forward tips and grades. Return a valid JSON response.`;

    const promptText = `
=== WORKFLOW CONFIGURATION ===
Name: ${workflow.name || "Untitled Workspace"}
Description: ${workflow.description || ""}
Steps: ${JSON.stringify(workflow.steps || [])}

Analyze this workflow design thoroughly. Highlight both pros/achievements and actionable improvements.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["overallGrade", "pros", "issues", "recommendations"],
          properties: {
            overallGrade: { type: Type.STRING, description: "A letter grade A+, A, B, C, D based on alignment" },
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Things the user configured perfectly (e.g. good structure, sensible naming).",
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["severity", "stepName", "description"],
                properties: {
                  severity: { type: Type.STRING, description: "High, Medium, Low" },
                  stepName: { type: Type.STRING, description: "Name of the step" },
                  description: { type: Type.STRING, description: "Detailed issue text" },
                },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "explanation", "impact"],
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  impact: { type: Type.STRING, description: "Scale of improvement (e.g. 'Saves 200ms API latency', 'Prevents spam email dispatch')" },
                },
              },
            },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Workflow analysis error:", error);
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
});

// API Route: Generate Optimized Prompt Template for Automation Block
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { usecase, expectedSchemaDescription } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are a master of LLM Prompt Engineering for automated pipelines.
Generate a structured, high-performing system prompt template that the user can copy-paste into an automation visual block.
The feedback should include:
1. Highly robust System Instruction (with context, strict input formats, output rules, few-shot examples if general, and handling edge cases).
2. Recommended model configuration (temperature, topP).
3. Schema of expected output variables.
4. Tips for success.

Return a valid JSON response.`;

    const promptText = `
=== USER BRIEF ===
Automation Goal: ${usecase}
Desired Output Schema / Variables to extract: ${expectedSchemaDescription || "Any relevant information"}

Produce a perfect prompt template. Make sure it uses templated parameters like {{trigger.message}} or appropriate double braces to indicate dynamic values.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["optimizedPrompt", "suggestedTemperature", "fewShotExample", "proTips"],
          properties: {
            optimizedPrompt: { type: Type.STRING, description: "The full system instruction/prompt with dynamic variables." },
            suggestedTemperature: { type: Type.NUMBER, description: "Float value between 0 and 1" },
            fewShotExample: { type: Type.STRING, description: "A quick illustration showing an example input and resulting output." },
            proTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tips related to this type of task." },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Prompt generation error:", error);
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
});

// API Route: Check user workflow against automated learning Challenge
app.post("/api/feedback-challenge", async (req, res) => {
  try {
    const { challengeId, userWorkflow, triggerDataInput } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are a gamified AI Automation Challenge Evaluation Engine.
Your objective is to run a simulation check on the user's submitted workflow against the current learning challenge criteria to determine if it meets the success condition.

Challenges catalog:
- "sentiment_reply":
  Goal: Classify input incoming ticket sentiment.
  If positive -> append to feedback logs ("Logs" step Output) and say "No response needed".
  If negative -> generate a professional polite draft, addressing the customer's frustration points.
  If neutral -> forward to manual agent queue.
- "lead_enricher":
  Goal: Extract name, company name, and prospective deal size from email body, filter out any with deal size < $1000, and generate a customized high-priority outreach.
- "auto_categorizer":
  Goal: Given a list of items inside a support email:
  Categorize the issue into: "Billing", "Technical Help", or "Security".
  If Billing, draft automated standard payment link. If Security, escalate immediately with a standard critical alert.

Provide structured feedback, detail what worked, what missed, and whether they successfully solved the puzzle (isSolved = true/false). Ensure you explain what was tested and the validation outputs.`;

    const promptText = `
=== CHALLENGE ID ===
${challengeId}

=== USER WORKFLOW CONFIGURATION ===
${JSON.stringify(userWorkflow)}

=== TEST RUN INPUT ===
${JSON.stringify(triggerDataInput || {})}

Verify carefully. Run step-by-step logic matching that describes the challenge goals. Let's see if their workflow filters, prompts, or branches work properly for this input. Return a valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["isSolved", "summary", "testExecutionPath", "helpfulAdvice", "score"],
          properties: {
            isSolved: { type: Type.BOOLEAN, description: "True if user workflow logic perfectly satisfies a robust solution path." },
            summary: { type: Type.STRING, description: "High level summary of the evaluation." },
            testExecutionPath: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Logs of how the simulated test payload moved through their workflow (e.g. 'Trigger received', 'Branch filtered node executed').",
            },
            helpfulAdvice: { type: Type.STRING, description: "Friendly hint or deep explanation of missing parts if failed." },
            score: { type: Type.INTEGER, description: "Score out of 100 representing solution completeness." },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Challenge feedback error:", error);
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
});

// Express + Vite Integration Setup
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
    console.log(`[AI Automation Academy Engine] Running on port ${PORT}`);
  });
}

startServer();
