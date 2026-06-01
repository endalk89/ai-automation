import { useState } from "react";
import { WorkflowStep, SimulationLog } from "../types";
import {
  Zap,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Code,
  Sparkles,
} from "lucide-react";

interface AuditResult {
  overallGrade: string;
  pros: string[];
  issues: Array<{
    severity: string;
    stepName: string;
    description: string;
  }>;
  recommendations: Array<{
    title: string;
    explanation: string;
    impact: string;
  }>;
}

export default function SandboxView() {
  const [workflowName, setWorkflowName] = useState<string>("My Intelligent Outreach Dispatcher");
  const [workflowDesc, setWorkflowDesc] = useState<string>("Enriches sales pipeline cold leads and auto-composes email drafts.");
  
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "trigger",
      name: "Webhook Trigger",
      type: "TRIGGER",
      config: {},
    },
    {
      id: "ai_enricher",
      name: "AI Enrichment Prompt",
      type: "ACTION_AI_PROMPT",
      config: {
         promptTemplate: "Analyze the lead inquiry \"{{trigger.inquiry}}\". Generate custom corporate pitch targeting their business name \"{{trigger.companyName}}\". Provide output in a friendly tone.",
         responseSchema: "json",
      },
    },
    {
      id: "vip_branch",
      name: "Check Deal Budget Filter",
      type: "ACTION_FILTER",
      config: {
        filterField: "trigger.budget",
        filterOperator: "greater_than",
        filterValue: "3500",
      },
    },
    {
      id: "draft_reply",
      name: "Compose High-Priority Pitch",
      type: "ACTION_EMAIL",
      config: {
        emailTo: "manager@agency.io",
        emailSubject: "🚨 HIGH SECURITY LEAD DEAL: {{trigger.companyName}}",
        emailBody: "Hi outreach! We got a high priority buyer: {{trigger.companyName}} with budget ${{trigger.budget}}.\n\nAI pitch: {{steps.ai_enricher.output.response}}",
      },
    },
  ]);

  // Test Simulation Payload block
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        companyName: "Hyperdrive Logistics",
        inquiry: "Looking to deploy 4 new transport hubs.",
        budget: "8500",
      },
      null,
      2
    )
  );

  // Simulation execution results
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simError, setSimError] = useState<string | null>(null);

  // Solutions architecture audit results
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Methods
  const addStep = (type: WorkflowStep["type"]) => {
    const id = `${type.toLowerCase()}_${Math.random().toString(36).substr(2, 4)}`;
    let defaultStepName = "";
    let defaultConfig = {};

    switch (type) {
      case "ACTION_AI_PROMPT":
        defaultStepName = "AI Block";
        defaultConfig = {
          promptTemplate: "Summarize this data: {{trigger.property}}",
          responseSchema: "json",
        };
        break;
      case "ACTION_FILTER":
        defaultStepName = "Logic Filter";
        defaultConfig = {
          filterField: "trigger.property",
          filterOperator: "equals",
          filterValue: "true",
        };
        break;
      case "ACTION_EMAIL":
        defaultStepName = "Email Block";
        defaultConfig = {
          emailTo: "team@company.com",
          emailSubject: "Notification alerting topic",
          emailBody: "Message details resolved.",
        };
        break;
      case "ACTION_WEBHOOK":
        defaultStepName = "Webhook Outbound Block";
        defaultConfig = {
          webhookUrl: "https://external-hook.com/api",
        };
        break;
    }

    setSteps([...steps, { id, name: defaultStepName, type, config: defaultConfig }]);
  };

  const removeStep = (id: string) => {
    if (id === "trigger") return;
    setSteps(steps.filter((s) => s.id !== id));
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

  const moveUp = (idx: number) => {
    if (idx <= 1) return;
    const items = [...steps];
    const item = items[idx];
    items[idx] = items[idx - 1];
    items[idx - 1] = item;
    setSteps(items);
  };

  const moveDown = (idx: number) => {
    if (idx === 0 || idx >= steps.length - 1) return;
    const items = [...steps];
    const item = items[idx];
    items[idx] = items[idx + 1];
    items[idx + 1] = item;
    setSteps(items);
  };

  // Triggers backend simulation trace sequence
  const executeSimulation = async () => {
    setIsSimulating(true);
    setSimError(null);
    setSimulationLogs([]);
    const logsAccumulator: SimulationLog[] = [];

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(testPayload);
      } catch (err) {
        throw new Error("Invalid Input JSON structure. Adjust commas, keys, or braces.");
      }

      const accumulatedContext: Record<string, any> = {
        trigger: parsedPayload,
      };

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        if (step.type === "TRIGGER") {
          const stepLog: SimulationLog = {
            stepId: step.id,
            stepName: step.name,
            status: "success",
            executionMs: 12,
            logs: [
              `[Sandbox Trigger] Hook payload received`,
              ...Object.keys(parsedPayload).map((key) => `-> added trigger.${key} properties`),
            ],
            output: parsedPayload,
          };
          logsAccumulator.push(stepLog);
          accumulatedContext.trigger = parsedPayload;
          setSimulationLogs([...logsAccumulator]);
          continue;
        }

        // Post to step simulation route
        const response = await fetch("/api/simulate-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step,
            triggerData: parsedPayload,
            previousOutputs: accumulatedContext,
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json();
          throw new Error(errorPayload.error || "Simulation failed.");
        }

        const runResult = await response.json();

        const stepLog: SimulationLog = {
          stepId: step.id,
          stepName: step.name,
          status: runResult.status || "success",
          executionMs: runResult.executionMs || 100,
          logs: runResult.logs || [],
          output: runResult.output || {},
        };

        logsAccumulator.push(stepLog);
        accumulatedContext[step.id] = runResult.output;
        accumulatedContext.steps = accumulatedContext.steps || {};
        accumulatedContext.steps[step.id] = { output: runResult.output };

        setSimulationLogs([...logsAccumulator]);

        if (runResult.status === "failed") {
          break; // Filter blocked or error occurred
        }
      }
    } catch (error: any) {
      setSimError(error.message || "Something went wrong.");
    } finally {
      setIsSimulating(false);
    }
  };

  // Triggers Solutions Architect logic check audit
  const runWorkflowAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);

    const workflowSchema = {
      name: workflowName,
      description: workflowDesc,
      steps,
    };

    try {
      const response = await fetch("/api/analyze-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: workflowSchema }),
      });

      if (!response.ok) {
        throw new Error("Audit failed logic.");
      }

      const report = await response.json();
      setAuditResult(report);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Parameters & Workspaces Columns */}
      <div className="xl:col-span-7 space-y-6">
        {/* Workspace details editing */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold tracking-wider">Workspace Pipeline Name</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold focus:border-indigo-500/40 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold tracking-wider">High-Level Objective</label>
              <input
                type="text"
                value={workflowDesc}
                onChange={(e) => setWorkflowDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300 focus:border-indigo-500/40 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Node aggregator list */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-lg">
          <div className="border-b border-slate-850 bg-slate-900/40 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" />
                Workflow Visual Canvas Designer
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Build unlimited pipelines. Link prompts, routes and notifications dynamically.
              </p>
            </div>

            {/* Step Adders */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              <button
                id="btn-add-ai-node-sandbox"
                onClick={() => addStep("ACTION_AI_PROMPT")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-850 text-slate-250 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                AI Node
              </button>
              <button
                id="btn-add-filter-node-sandbox"
                onClick={() => addStep("ACTION_FILTER")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-850 text-slate-250 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                Filter
              </button>
              <button
                id="btn-add-email-node-sandbox"
                onClick={() => addStep("ACTION_EMAIL")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-850 text-slate-250 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Email
              </button>
              <button
                id="btn-add-webhook-node-sandbox"
                onClick={() => addStep("ACTION_WEBHOOK")}
                className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-850 text-slate-250 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                Webhook
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5 bg-slate-900/30">
            {steps.map((step, idx) => (
              <div key={step.id} className="relative bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
                {idx < steps.length - 1 && (
                  <div className="absolute left-[24px] bottom-[-24px] w-[2px] h-[24px] bg-gradient-to-b from-slate-800 to-slate-900/10 z-0" />
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 font-bold">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-755 text-slate-300 flex items-center justify-center font-mono text-[10px] uppercase font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleStepNameChange(step.id, e.target.value)}
                        className="text-xs font-semibold text-white bg-transparent outline-none focus:border-b border-slate-800 w-full"
                      />
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Namespace: <span className="text-indigo-400">{"steps." + step.id}</span> | Type: {step.type}
                      </span>
                    </div>
                  </div>

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

                {/* Configurations mapping */}
                <div className="pt-3 border-t border-slate-900 text-xs text-slate-400">
                  {step.type === "TRIGGER" && (
                    <div className="text-[11px] font-mono text-slate-450 leading-relaxed font-semibold">
                      💡 Webhook endpoint resolved locally. Simulates live payloads. Access elements using <code className="text-indigo-400">{"{{trigger.[property]}}"}</code>.
                    </div>
                  )}

                  {step.type === "ACTION_AI_PROMPT" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1.5 font-bold">Prompt Context Instructions</label>
                        <textarea
                          rows={3}
                          value={step.config.promptTemplate || ""}
                          onChange={(e) => updateStepField(step.id, "promptTemplate", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-505"
                        />
                      </div>
                    </div>
                  )}

                  {step.type === "ACTION_FILTER" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1.5 font-bold">Variable target</label>
                        <input
                          type="text"
                          value={step.config.filterField || ""}
                          onChange={(e) => updateStepField(step.id, "filterField", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none"
                          placeholder="E.g. trigger.budget"
                        />
                      </div>
                      <div>
                        <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Operator</label>
                        <select
                          value={step.config.filterOperator || "equals"}
                          onChange={(e) => updateStepField(step.id, "filterOperator", e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-200 outline-none"
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="greater_than">Greater than</option>
                          <option value="less_than">Less than</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Target matching value</label>
                        <input
                          type="text"
                          value={step.config.filterValue || ""}
                          onChange={(e) => updateStepField(step.id, "filterValue", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none"
                          placeholder="E.g. 5000"
                        />
                      </div>
                    </div>
                  )}

                  {step.type === "ACTION_EMAIL" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold font-semibold">To Email</label>
                          <input
                            type="text"
                            value={step.config.emailTo || ""}
                            onChange={(e) => updateStepField(step.id, "emailTo", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold font-semibold">Subject Title</label>
                          <input
                            type="text"
                            value={step.config.emailSubject || ""}
                            onChange={(e) => updateStepField(step.id, "emailSubject", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold font-semibold">Email body</label>
                        <textarea
                          rows={3}
                          value={step.config.emailBody || ""}
                          onChange={(e) => updateStepField(step.id, "emailBody", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {step.type === "ACTION_WEBHOOK" && (
                    <div>
                      <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold font-semibold">External dispatcher URL</label>
                      <input
                        type="text"
                        value={step.config.webhookUrl || ""}
                        onChange={(e) => updateStepField(step.id, "webhookUrl", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="https://api.external.com/v1/hooks"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Console & Real-time Tracer Reports */}
      <div className="xl:col-span-5 space-y-6">
        {/* Run / simulation execution console */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              Dynamic Execution Simulation
            </h4>
            <span className="text-[10px] text-slate-550 font-mono uppercase tracking-wider block font-bold">Payload sandboxing</span>
          </div>

          <p className="text-slate-450 text-[11px] leading-relaxed">
            Provide values representing an incoming Webhook event, and simulate your visual blocks resolving dynamic components in sequence.
          </p>

          <textarea
            rows={4}
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-400 text-xs outline-none focus:border-indigo-500/40"
          />

          <div className="grid grid-cols-2 gap-3.5">
            <button
              id="btn-simulate-sandbox"
              disabled={isSimulating}
              onClick={executeSimulation}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/20 border border-indigo-500/10 transition"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate execution</span>
                </>
              )}
            </button>

            <button
              id="btn-audit-sandbox"
              disabled={isAuditing}
              onClick={runWorkflowAudit}
              className="bg-slate-950 text-slate-250 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800 transition shadow-inner"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Architecture review</span>
                </>
              )}
            </button>
          </div>

          {simError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono leading-normal">
              ⚠️ simulation syntax error: {simError}
            </div>
          )}

          {/* Logs panel display */}
          {simulationLogs.length > 0 && (
            <div className="space-y-4 pt-3.5 border-t border-slate-800 animate-fade-in pr-1 max-h-[280px] overflow-y-auto">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                📜 Sequential Execution logs
              </span>
              {simulationLogs.map((log) => (
                <div key={log.stepId} className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200">{log.stepName}</span>
                    <span className={`text-[9px] font-mono font-bold ${log.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <ul className="space-y-1 border-l border-slate-850 pl-2.5 ml-1 text-[9px] font-mono text-slate-400">
                    {log.logs.map((str, j) => (
                      <li key={j}>• {str}</li>
                    ))}
                  </ul>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono text-teal-400 overflow-x-auto max-h-[80px]">
                    {JSON.stringify(log.output, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logic audit reports showcase */}
        {auditResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm text-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                Solutions Architect logical critique
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-450 text-[10px]">Logical Grade:</span>
                <span className="text-xs font-mono font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/25 px-2.5 py-0.5 rounded-full">
                  {auditResult.overallGrade}
                </span>
              </div>
            </div>

            {/* Pros list */}
            {auditResult.pros && auditResult.pros.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block font-bold">
                  👍 Aesthetic merits & logic triumphs
                </span>
                <ul className="space-y-1 text-slate-405 text-[11px] list-disc pl-4 leading-normal">
                  {auditResult.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical Errors */}
            {auditResult.issues && auditResult.issues.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block font-bold">
                  ⚠️ logical structural defects
                </span>
                <div className="space-y-2">
                  {auditResult.issues.map((issue, idx) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-start gap-2.5">
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${issue.severity === "High" ? "text-red-500" : "text-amber-500"}`} />
                      <div>
                        <span className="font-semibold text-slate-300 block text-[11px]">{issue.stepName}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended fixes */}
            {auditResult.recommendations && auditResult.recommendations.length > 0 && (
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block font-bold">
                  🧭 Technical optimizations recommended
                </span>
                <div className="space-y-3">
                  {auditResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500 pl-3 space-y-1">
                      <span className="font-semibold text-slate-200 text-[11px] block">{rec.title}</span>
                      <p className="text-[10px] text-slate-405 leading-relaxed">{rec.explanation}</p>
                      <span className="text-[9px] font-mono text-indigo-400 block tracking-wide italic leading-normal">Impact: {rec.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
