import { useState, useEffect } from "react";
import { LESSONS } from "../data/lessons";
import { Lesson, WorkflowStep, SimulationLog } from "../types";
import {
  Play,
  ArrowRight,
  BookOpen,
  Settings,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Hash,
} from "lucide-react";

export default function LearnView() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(LESSONS[0]);
  const [activeSteps, setActiveSteps] = useState<WorkflowStep[]>([]);
  const [testPayload, setTestPayload] = useState<string>("");
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simError, setSimError] = useState<string | null>(null);

  // Sync state with selected lesson
  useEffect(() => {
    if (selectedLesson.interactiveStep) {
      setActiveSteps(JSON.parse(JSON.stringify(selectedLesson.interactiveStep.defaultSteps)));
      setTestPayload(JSON.stringify(selectedLesson.interactiveStep.sampleInput, null, 2));
    } else {
      setActiveSteps([]);
      setTestPayload("");
    }
    setSimulationLogs([]);
    setSimError(null);
  }, [selectedLesson]);

  // Update step values
  const handleStepConfigChange = (stepId: string, originalField: string, value: string) => {
    setActiveSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            config: {
              ...step.config,
              [originalField]: value,
            },
          };
        }
        return step;
      })
    );
  };

  // Run simulation of the list of steps sequentially
  const runSimulation = async () => {
    setIsSimulating(true);
    setSimError(null);
    setSimulationLogs([]);
    const logsAccumulator: SimulationLog[] = [];

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(testPayload);
      } catch (err) {
        throw new Error("Invalid Input JSON format. Please verify your brackets and commas.");
      }

      // Initial context includes the trigger data
      const accumulatedContext: Record<string, any> = {
        trigger: parsedPayload,
      };

      for (let i = 0; i < activeSteps.length; i++) {
        const step = activeSteps[i];

        // If it's the trigger itself, we simulate its resolution
        if (step.type === "TRIGGER") {
          const stepLog: SimulationLog = {
            stepId: step.id,
            stepName: step.name,
            status: "success",
            executionMs: 15,
            logs: [
              `[Trigger Engine] Received incoming webhook signal`,
              `[Payload Store] Stored dynamic content in 'trigger' namespace`,
              ...Object.keys(parsedPayload).map((key) => `-> resolved 'trigger.${key}'`),
            ],
            output: parsedPayload,
          };
          logsAccumulator.push(stepLog);
          accumulatedContext.trigger = parsedPayload;
          setSimulationLogs([...logsAccumulator]);
          continue;
        }

        // Call our server backend simulation route
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
        // Also map to previous outputs or namespaced step for easier reference
        accumulatedContext.steps = accumulatedContext.steps || {};
        accumulatedContext.steps[step.id] = { output: runResult.output };

        setSimulationLogs([...logsAccumulator]);

        // Break early if pipeline fails or halts
        if (runResult.status === "failed") {
          break;
        }
      }
    } catch (error: any) {
      setSimError(error.message || "Something went wrong.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Lessons Directory */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Curriculum Path
          </h3>
          <div className="space-y-4">
            {/* Group lessons by section */}
            {Array.from(new Set(LESSONS.map((l) => l.section))).map((section) => {
              const sectionLessons = LESSONS.filter((l) => l.section === section);
              return (
                <div key={section} className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-slate-500 px-2 uppercase tracking-tight">
                    {section}
                  </div>
                  {sectionLessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        selectedLesson.id === lesson.id
                          ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
                      }`}
                    >
                      <span>{lesson.title}</span>
                      {selectedLesson.id === lesson.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Variable Cheat Sheet Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-xs font-sans text-slate-400 shadow-sm">
          <h4 className="text-slate-200 font-bold mb-2 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-indigo-400" />
            Token Injection syntax
          </h4>
          <p className="mb-2 leading-relaxed text-[11px]">
            Incorporate runtime variables inside dynamic blocks to process custom trigger data:
          </p>
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-teal-400">{"{{trigger.sender}}"}</span>
              <span className="text-slate-500">Sender details</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-teal-400">{"{{trigger.message}}"}</span>
              <span className="text-slate-500">Unstructured copy</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex justify-between text-[9px]">
              <span className="text-indigo-400">{"{{steps.[id].output}}"}</span>
              <span className="text-slate-500">AI node output</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        {/* Lesson Read Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              {selectedLesson.section}
            </span>
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-slate-400 text-xs font-sans">Syllabus Class</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">
            {selectedLesson.title}
          </h2>
          
          {/* Render markdown style */}
          <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-4 leading-relaxed font-sans">
            {selectedLesson.contentMarkdown.split("\n\n").map((para, i) => {
              if (para.startsWith("###")) {
                return (
                  <h3 key={i} className="text-base font-semibold text-white tracking-tight mt-6 mb-2 border-b border-slate-800 pb-2">
                    {para.replace("###", "").trim()}
                  </h3>
                );
              }
              if (para.startsWith("- **") || para.startsWith("- ")) {
                return (
                  <ul key={i} className="list-disc pl-5 space-y-1.5 text-slate-300 my-2">
                    {para.split("\n").map((li, j) => (
                      <li key={j} className="text-slate-300">
                        {li.replace(/^-\s*(\*\*)?/, "").replace(/(\*\*)?$/, "").trim()}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (para.startsWith("####")) {
                return (
                  <h4 key={i} className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mt-4">
                    {para.replace("####", "").trim()}
                  </h4>
                );
              }
              // Code block representation
              if (para.startsWith("```")) {
                const code = para.replace(/```[a-z]*/g, "").trim();
                return (
                  <pre key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 my-3 overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                );
              }
              return (
                <p key={i} className="text-slate-300 font-normal leading-relaxed">
                  {para}
                </p>
              );
            })}
          </div>
        </div>

        {/* Interactive Workspace Panel */}
        {selectedLesson.interactiveStep && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-lg">
            <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Interactive Simulation Studio
                </h3>
                <p className="text-xs text-zinc-400 mt-1 first-letter:uppercase">
                  {selectedLesson.interactiveStep.goal}
                </p>
              </div>

              <button
                id="btn-run-lesson-sim"
                disabled={isSimulating}
                onClick={runSimulation}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-500/10 border border-emerald-500/20 transition-all cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Workflows</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2">
              {/* Workspace Configuration Left Side */}
              <div className="p-5 border-r border-slate-800 space-y-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  🎨 Step Pipeline Blocks
                </span>

                {activeSteps.map((step, idx) => (
                  <div key={step.id} className="relative bg-slate-950 rounded-2xl border border-slate-800/80 p-5 shadow-sm">
                    {/* Index Connectors */}
                    {idx < activeSteps.length - 1 && (
                      <div className="absolute left-[24px] bottom-[-24px] w-[2px] h-[24px] bg-gradient-to-b from-slate-800 to-slate-800/20 z-0" />
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-750 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{step.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500 tracking-wider">
                            ID: <span className="text-indigo-400">{step.id}</span> | TYPE: {step.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Configure block variables */}
                    <div className="space-y-3 pt-2 border-t border-slate-900 text-xs text-slate-400">
                      {step.type === "TRIGGER" && (
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Webhook URL</label>
                          <input
                            type="text"
                            disabled
                            value={step.config.webhookUrl || ""}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-400 font-mono text-[11px]"
                          />
                        </div>
                      )}

                      {step.type === "ACTION_EMAIL" && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">To Address</label>
                            <input
                              type="text"
                              value={step.config.emailTo || ""}
                              onChange={(e) => handleStepConfigChange(step.id, "emailTo", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Email Body Template</label>
                            <textarea
                              rows={3}
                              value={step.config.emailBody || ""}
                              onChange={(e) => handleStepConfigChange(step.id, "emailBody", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-sans text-xs"
                            />
                            <p className="text-[10px] text-slate-500 mt-1 italic">
                              Resolve trigger variables inside double curly braces.
                            </p>
                          </div>
                        </div>
                      )}

                      {step.type === "ACTION_AI_PROMPT" && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Cognitive Prompt Template</label>
                            <textarea
                              rows={4}
                              value={step.config.promptTemplate || ""}
                              onChange={(e) => handleStepConfigChange(step.id, "promptTemplate", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-sans text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {step.type === "ACTION_FILTER" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Field</label>
                            <input
                              type="text"
                              value={step.config.filterField || ""}
                              onChange={(e) => handleStepConfigChange(step.id, "filterField", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Op</label>
                            <select
                              value={step.config.filterOperator || "equals"}
                              onChange={(e) => handleStepConfigChange(step.id, "filterOperator", e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs"
                            >
                              <option value="equals">Equals</option>
                              <option value="contains">Contains</option>
                              <option value="greater_than">Greater than</option>
                              <option value="less_than">Less than</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Value</label>
                            <input
                              type="text"
                              value={step.config.filterValue || ""}
                              onChange={(e) => handleStepConfigChange(step.id, "filterValue", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Execution Simulator Output Right Side */}
              <div className="p-5 bg-slate-950 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      ⚡ Test payload data input
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">JSON format</span>
                  </div>

                  <textarea
                    rows={4}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-slate-300 font-mono text-xs outline-none focus:border-slate-750"
                  />

                  {simError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{simError}</span>
                    </div>
                  )}

                  {/* Tracing Logs Display */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      📜 Execution Logs (Real-time Tracer)
                    </span>

                    {simulationLogs.length === 0 ? (
                      <div className="border border-dashed border-slate-800 p-8 text-center rounded-2xl text-xs text-slate-500 bg-slate-900/40">
                        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        No logs recorded yet. Configure above and click "Test Workflows" to trace variables translation.
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                        {simulationLogs.map((log, lIdx) => (
                          <div key={log.stepId} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                {log.status === "success" ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                )}
                                <span>{log.stepName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span className={log.status === "success" ? "text-emerald-400" : "text-red-400"}>
                                  {log.status.toUpperCase()}
                                </span>
                                <span className="h-3 w-px bg-slate-800" />
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  {log.executionMs}ms
                                </span>
                              </div>
                            </div>

                            {/* Bullet logs */}
                            <ul className="space-y-1 font-mono text-[10px] text-slate-450 border-l border-slate-800 pl-2 ml-1">
                              {log.logs.map((str, sIdx) => (
                                <li key={sIdx} className="leading-normal">
                                  {str}
                                </li>
                              ))}
                            </ul>

                            {/* Collapsible output preview */}
                            <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 font-mono text-[10px]">
                              <span className="text-slate-500 block mb-1 uppercase text-[8px] tracking-wide">Output Context Buffer</span>
                              <pre className="text-teal-400 overflow-x-auto max-w-full">
                                {JSON.stringify(log.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 text-[11px] text-slate-500 leading-normal font-sans">
                  👩‍💻 <strong>How to solve</strong>: Make sure steps outline references to earlier block outputs by their exact namespace key (for example: "trigger.message" to pull the trigger input, or "steps.ai-prompt-1.output.response" dynamically inside downstream actions).
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
