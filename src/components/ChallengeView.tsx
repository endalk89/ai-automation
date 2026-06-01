import { useState, useEffect } from "react";
import { CHALLENGES } from "../data/lessons";
import { Challenge, WorkflowStep } from "../types";
import {
  Award,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
  Play,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
  ListFilter,
  Eye,
  Settings,
  Mail,
  Zap,
  Sparkles,
} from "lucide-react";

export default function ChallengeView() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedTestIdx, setSelectedTestIdx] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    isSolved: boolean;
    summary: string;
    testExecutionPath: string[];
    helpfulAdvice: string;
    score: number;
  } | null>(null);

  // Sync steps to selected challenge
  useEffect(() => {
    // Reset steps to a default starting structure: Trigger block
    setSteps([
      {
        id: "trigger",
        name: "Trigger Event Received",
        type: "TRIGGER",
        config: {},
      },
    ]);
    setSelectedTestIdx(0);
    setEvaluationResult(null);
  }, [selectedChallenge]);

  // Node helper actions
  const addStep = (type: WorkflowStep["type"]) => {
    const id = `${type.toLowerCase()}_${Math.random().toString(36).substr(2, 4)}`;
    let defaultName = "";
    let defaultConfig = {};

    switch (type) {
      case "ACTION_AI_PROMPT":
        defaultName = "AI Prompt Analyzer";
        defaultConfig = {
          promptTemplate: "Analyze \"{{trigger.message}}\" and output details.",
          responseSchema: "json"
        };
        break;
      case "ACTION_FILTER":
        defaultName = "Condition Routing Filter";
        defaultConfig = {
          filterField: "trigger.message",
          filterOperator: "contains",
          filterValue: "urgent"
        };
        break;
      case "ACTION_EMAIL":
        defaultName = "Outbound Client Email Draft";
        defaultConfig = {
          emailTo: "client@agency.com",
          emailSubject: "Automation updates",
          emailBody: "Hello {{trigger.customerName}}, we updated your ticket."
        };
        break;
      case "ACTION_WEBHOOK":
        defaultName = "Outbound Webhook Dispatch";
        defaultConfig = {
          webhookUrl: "https://external.service.com/hooks"
        };
        break;
    }

    setSteps([...steps, { id, name: defaultName, type, config: defaultConfig }]);
  };

  const removeStep = (id: string) => {
    if (id === "trigger") return; // cannot remove base trigger
    setSteps(steps.filter((s) => s.id !== id));
  };

  const moveUp = (idx: number) => {
    if (idx <= 1) return; // cannot move past trigger (idx 0)
    const newSteps = [...steps];
    const temp = newSteps[idx];
    newSteps[idx] = newSteps[idx - 1];
    newSteps[idx - 1] = temp;
    setSteps(newSteps);
  };

  const moveDown = (idx: number) => {
    if (idx === 0 || idx >= steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[idx];
    newSteps[idx] = newSteps[idx + 1];
    newSteps[idx + 1] = temp;
    setSteps(newSteps);
  };

  const updateStepField = (id: string, field: string, value: any) => {
    setSteps(
      steps.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            config: {
              ...s.config,
              [field]: value,
            },
          };
        }
        return s;
      })
    );
  };

  const handleStepNameChange = (id: string, name: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const triggerEvaluation = async () => {
    setIsEvaluating(true);
    setEvaluationResult(null);

    const testPayload = selectedChallenge.testInputs[selectedTestIdx].data;

    try {
      const response = await fetch("/api/feedback-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          userWorkflow: {
            id: selectedChallenge.id,
            name: selectedChallenge.title,
            steps,
          },
          triggerDataInput: testPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Challenge evaluation failed.");
      }

      const report = await response.json();
      setEvaluationResult(report);
    } catch (err) {
      console.error(err);
      setEvaluationResult({
        isSolved: false,
        summary: "Execution trace timed out or returned variable configuration errors.",
        testExecutionPath: ["Engine started evaluation", "Variable analysis phase crashed due to mismatch"],
        helpfulAdvice: "Ensure all of your actions refer to correct properties and that you've included required node blocks.",
        score: 15,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar - Challenges Index */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Academy Challenges
          </h3>
          <div className="space-y-2">
            {CHALLENGES.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className={`w-full text-left px-4 py-3 rounded-2xl border text-xs transition-all group ${
                  selectedChallenge.id === challenge.id
                    ? "bg-indigo-600 text-white font-bold border-transparent shadow-lg shadow-indigo-950/40"
                    : "text-slate-400 border-transparent hover:text-slate-250 hover:bg-slate-800"
                }`}
              >
                <div className="font-semibold tracking-tight">{challenge.title}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      challenge.difficulty === "Beginner"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/10"
                        : challenge.difficulty === "Intermediate"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/10"
                        : "bg-red-500/10 text-red-300 border border-red-500/10"
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Directives Tab */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 text-xs text-slate-300 shadow-sm">
          <h4 className="text-slate-100 font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            Instructions
          </h4>
          <div className="space-y-2 font-sans leading-relaxed text-[11px] text-slate-400 prose prose-invert overflow-y-auto max-h-[300px]">
            {selectedChallenge.instructions.split("\n\n").map((para, idx) => {
              if (para.startsWith("###")) {
                return (
                  <h4 key={idx} className="font-bold text-slate-200 mt-3 border-b border-slate-850 pb-1">
                    {para.replace("###", "").trim()}
                  </h4>
                );
              }
              if (para.startsWith("- ") || para.startsWith("* ")) {
                return (
                  <ul key={idx} className="list-disc pl-4 space-y-1">
                    {para.split("\n").map((li, liIdx) => (
                      <li key={liIdx}>{li.replace(/^[-*]\s*/, "")}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx}>{para}</p>;
            })}
          </div>
        </div>
      </div>

      {/* Main Blocks editor & compiler */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        {/* Challenge Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">MISSION LAB</span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{selectedChallenge.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-450 font-medium">Required Components:</span>
              <div className="flex gap-1.5">
                {selectedChallenge.requiredSteps.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    {s.split("_").pop()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">{selectedChallenge.description}</p>
        </div>

        {/* Builder Panel Workspace */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-lg">
          {/* Header toolbar */}
          <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-400" />
                Workflow Logic Editor
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Create steps sequentially and build dynamic substitution paths.
              </p>
            </div>

            {/* Quick action adders */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                id="btn-add-ai"
                onClick={() => addStep("ACTION_AI_PROMPT")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-violet-400" />
                AI Node
              </button>
              <button
                id="btn-add-filter"
                onClick={() => addStep("ACTION_FILTER")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                Filter
              </button>
              <button
                id="btn-add-email"
                onClick={() => addStep("ACTION_EMAIL")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                Email
              </button>
              <button
                id="btn-add-webhook"
                onClick={() => addStep("ACTION_WEBHOOK")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                Webhook
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12">
            {/* Steps Workspace Column */}
            <div className="xl:col-span-7 p-6 space-y-5 border-r border-slate-800 bg-slate-900/30">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative bg-slate-950 rounded-2xl border border-slate-800/80 p-5 space-y-4">
                  {/* Pipeline structural connect card dots */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-[24px] bottom-[-24px] w-[2px] h-[24px] bg-gradient-to-b from-slate-800 to-slate-900/10 z-0" />
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-905 border border-slate-750 text-slate-300 flex items-center justify-center font-mono text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => handleStepNameChange(step.id, e.target.value)}
                          className="text-xs font-semibold text-white bg-transparent outline-none focus:border-b border-slate-850 w-full"
                        />
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Namespace: <span className="text-indigo-400">{"steps." + step.id}</span> | Type: {step.type}
                        </span>
                      </div>
                    </div>

                    {/* Ordering control handlers */}
                    {step.id !== "trigger" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx <= 1}
                          className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-300 disabled:opacity-30 rounded-lg transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx >= steps.length - 1}
                          className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-300 disabled:opacity-30 rounded-lg transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="h-3 w-px bg-slate-800" />
                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition"
                          title="Delete Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step Custom Field Mappings */}
                  <div className="text-xs pt-3 border-t border-slate-900 space-y-3">
                    {step.type === "TRIGGER" && (
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed text-slate-400 text-[11px] first-letter:uppercase font-mono">
                        💡 Starting entry point. Contains dynamic payload object. Access elements using <code className="text-indigo-400 font-bold">{"{{trigger.[property]}}"}</code>.
                      </div>
                    )}

                    {step.type === "ACTION_AI_PROMPT" && (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1">System Prompt Instruction</label>
                          <textarea
                            rows={4}
                            value={step.config.promptTemplate || ""}
                            onChange={(e) => updateStepField(step.id, "promptTemplate", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:border-indigo-500 outline-none"
                            placeholder="Instruct Gemini what features to resolve..."
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1">Output Schema Output</label>
                          <select
                            value={step.config.responseSchema || "json"}
                            onChange={(e) => updateStepField(step.id, "responseSchema", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                          >
                            <option value="json">Structured JSON Dictionary</option>
                            <option value="text">Raw Text String</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {step.type === "ACTION_FILTER" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1">Evaluation Field</label>
                          <input
                            type="text"
                            value={step.config.filterField || ""}
                            onChange={(e) => updateStepField(step.id, "filterField", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none"
                            placeholder="E.g. trigger.sentiment"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1">Operator</label>
                          <select
                            value={step.config.filterOperator || "equals"}
                            onChange={(e) => updateStepField(step.id, "filterOperator", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                          >
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">Greater than</option>
                            <option value="less_than">Less than</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1">Static Target Value</label>
                          <input
                            type="text"
                            value={step.config.filterValue || ""}
                            onChange={(e) => updateStepField(step.id, "filterValue", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none"
                            placeholder="E.g. negative"
                          />
                        </div>
                      </div>
                    )}

                    {step.type === "ACTION_EMAIL" && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1">Send Outbound To</label>
                            <input
                              type="text"
                              value={step.config.emailTo || ""}
                              onChange={(e) => updateStepField(step.id, "emailTo", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1">Subject Title Line</label>
                            <input
                              type="text"
                              value={step.config.emailSubject || ""}
                              onChange={(e) => updateStepField(step.id, "emailSubject", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-slate-505 block text-[10px] uppercase font-mono mb-1">Draft Email Message Body</label>
                          <textarea
                            rows={3}
                            value={step.config.emailBody || ""}
                            onChange={(e) => updateStepField(step.id, "emailBody", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-sans text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {step.type === "ACTION_WEBHOOK" && (
                      <div>
                        <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1">Target Webhook POST URL</label>
                        <input
                          type="text"
                          value={step.config.webhookUrl || ""}
                          onChange={(e) => updateStepField(step.id, "webhookUrl", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Test Case Selection & Grading console Right Column */}
            <div className="xl:col-span-5 p-6 bg-slate-950 font-sans text-xs flex flex-col justify-between gap-5">
              <div className="space-y-5">
                {/* Test case Selector */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    🧪 Select Test Case Payload
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedChallenge.testInputs.map((input, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTestIdx(idx);
                          setEvaluationResult(null);
                        }}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs leading-normal transition-colors ${
                          selectedTestIdx === idx
                            ? "bg-indigo-600 text-white border-transparent font-bold shadow-md shadow-indigo-950/20"
                            : "bg-slate-900/40 text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        {input.label}
                      </button>
                    ))}
                  </div>

                  {/* Chosen payload dictionary view */}
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[10px] text-slate-400">
                    <pre className="max-h-[120px] overflow-auto">
                      {JSON.stringify(selectedChallenge.testInputs[selectedTestIdx].data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Compile trigger evaluation dispatch */}
                <button
                  id="btn-evaluate"
                  disabled={isEvaluating}
                  onClick={triggerEvaluation}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-400 hover:to-indigo-550 disabled:opacity-50 text-white p-3 rounded-2xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/15 transition-all shadow-lg shadow-indigo-950/25"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Workflow Logic...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Evaluate Logic Solution</span>
                    </>
                  )}
                </button>

                {/* Evaluation Reports Panel */}
                {evaluationResult && (
                  <div className="space-y-4 pt-3.5 border-t border-slate-900 animate-fade-in text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest block">
                        🎖️ Grading Summary Score
                      </span>
                      <span className="text-xs font-mono font-extrabold text-indigo-400">
                        {evaluationResult.score} / 100
                      </span>
                    </div>

                    {/* Badge Success/Fail */}
                    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      evaluationResult.isSolved
                        ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-300"
                        : "bg-red-500/10 border-red-500/10 text-red-300"
                    }`}>
                      {evaluationResult.isSolved ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-tight">
                          {evaluationResult.isSolved ? "Challenge Solved!" : "Compilation Gaps Detected"}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {evaluationResult.summary}
                        </p>
                      </div>
                    </div>

                    {/* Tracing steps execution paths */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider block">
                        ⚙️ Tracer Evaluation Logs
                      </span>
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl max-h-[140px] overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-450">
                        {evaluationResult.testExecutionPath.map((log, idx) => (
                          <div key={idx} className="leading-relaxed flex items-start gap-1">
                            <span className="text-slate-600">•</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Advice */}
                    {evaluationResult.helpfulAdvice && (
                      <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 text-slate-400 leading-relaxed text-[11px]">
                        💡 **Architect Tip**: {evaluationResult.helpfulAdvice}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-900 pt-3.5 text-[10px] text-slate-550 font-mono leading-normal">
                Challenge Validation: Evaluates block structures, variables references, filters validation outcomes, and prompt outputs context via the Gemini core validator.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
