import { useState } from "react";
import { Sparkles, Copy, Check, Terminal, Loader2, Play, Hash } from "lucide-react";

interface PromptResult {
  optimizedPrompt: string;
  suggestedTemperature: number;
  fewShotExample: string;
  proTips: string[];
}

export default function PromptView() {
  const [goal, setGoal] = useState<string>("Extract key complaint items and draft a polite apology email");
  const [schemaDesc, setSchemaDesc] = useState<string>("customerName, issueSummary, severityLevel (low/medium/high), responseDraft");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Test Arena state
  const [testInput, setTestInput] = useState<string>(
    "Hi, I am Bob. Your system kept crashing while uploading my 12MB photos. This is the third time today. Extremely annoying experience."
  );
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<any>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setTestOutput(null);

    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usecase: goal,
          expectedSchemaDescription: schemaDesc,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to optimize template.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTestArena = async () => {
    if (!result) return;
    setIsTesting(true);
    setTestOutput(null);
    setTestLogs([]);

    try {
      const artificialStep = {
        name: "Optimized Prompt Node",
        type: "ACTION_AI_PROMPT",
        config: {
          promptTemplate: result.optimizedPrompt,
          responseSchema: "json"
        }
      };

      const res = await fetch("/api/simulate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: artificialStep,
          triggerData: { message: testInput },
          previousOutputs: {}
        })
      });

      if (!res.ok) {
        throw new Error("Test failed");
      }

      const data = await res.json();
      setTestOutput(data.output);
      setTestLogs(data.logs || []);
    } catch (err: any) {
      console.error(err);
      setTestOutput({ error: err.message || "Failed to parse text input." });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Parameters Controls */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Automation Prompt Optimizer</h3>
          </div>

          <p className="text-xs text-slate-450 leading-relaxed font-sans">
            Describe what you want the Large Language Model to achieve inside your event stream, define what variables you want returned, and let Gemini craft an optimized structured prompt block.
          </p>

          <div className="space-y-4 pt-1 text-xs">
            <div>
              <label className="text-slate-500 block font-mono text-[10px] uppercase tracking-wider mb-1.5">
                🎯 Automation Objective
              </label>
              <textarea
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="E.g., Summarize incoming feedback and tag sentiment"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs outline-none focus:border-indigo-500/40"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-mono text-[10px] uppercase tracking-wider mb-1.5">
                📦 Data Variables to extract OR output fields
              </label>
              <input
                type="text"
                value={schemaDesc}
                onChange={(e) => setSchemaDesc(e.target.value)}
                placeholder="E.g., companyName, estimatedSeatCount, primaryPainPoint"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs outline-none focus:border-indigo-500/40 font-mono text-[11px]"
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block italic leading-normal">
                Listing precise elements helps solidify JSON templates.
              </span>
            </div>

            <button
              id="btn-optimize-prompt"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-400 hover:to-indigo-550 disabled:opacity-50 text-white p-3 rounded-2xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/10 transition-all shadow-lg shadow-indigo-950/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Generate AI System Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lesson Summary on Prompts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 space-y-3.5 leading-relaxed shadow-sm">
          <h4 className="text-slate-200 font-bold">Why standard chatbot prompts fail inside pipelines:</h4>
          <ul className="list-disc pl-4 space-y-2 text-[11px] text-slate-450">
            <li>Chatbots typically chatter with conversational context; pipeline scripts expect direct schemas.</li>
            <li>If the LLM responds with markdown tags when your endpoint expects pure JSON variables, downstream workflows crash.</li>
            <li>Adding template dynamic pointers like <code className="text-indigo-400 font-bold">{"{{trigger.message}}"}</code> enables live payload resolution on every run.</li>
          </ul>
        </div>
      </div>

      {/* Output Studio & Test Arena */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        {/* Results Showcase */}
        {!result ? (
          <div className="flex-1 min-h-[400px] border border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center text-slate-500 empty-studio bg-slate-900/10">
            <Terminal className="w-10 h-10 text-slate-700 mb-3" />
            <span className="text-xs font-bold text-slate-400">System Prompt Output Studio</span>
            <span className="text-[11px] text-slate-500 max-w-sm mt-1 leading-relaxed">
              Configure your objectives on the left panel, and click solve to generate structured, few-shot prompt instructions.
            </span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-lg">
            <div>
              {/* Card Header with copy */}
              <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    ⚙️ Generated System Instruction
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Recommended temperature: {result.suggestedTemperature} • Copied to visual clipboard
                  </p>
                </div>

                <button
                  id="btn-copy-optimized"
                  onClick={copyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-slate-350 hover:bg-slate-800 transition-colors text-xs font-semibold border border-slate-850"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prompt template body */}
              <div className="p-6 space-y-5">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 font-mono text-[11px] leading-relaxed text-emerald-400 whitespace-pre-wrap max-h-[220px] overflow-y-auto shadow-inner">
                  {result.optimizedPrompt}
                </div>

                {/* Few Shot Example */}
                {result.fewShotExample && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-bold">
                      💡 Few-shot Sample Template
                    </span>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-[10px] tracking-wide text-slate-400 whitespace-pre-wrap font-mono">
                      {result.fewShotExample}
                    </div>
                  </div>
                )}

                {/* Pro Tips */}
                {result.proTips && result.proTips.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-bold">
                      🛡️ Optimization Pro-Tips
                    </span>
                    <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-400">
                      {result.proTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Micro Sandbox Test Arena */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/30 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400" />
                    Interactive Prompt Test Arena
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Runs the system prompt above on Gemini, substituting <code className="text-emerald-450">{"{{trigger.message}}"}</code> with your text body below
                  </p>
                </div>

                <button
                  id="btn-run-arena-test"
                  disabled={isTesting}
                  onClick={runTestArena}
                  className="flex items-center justify-center gap-1.5 bg-slate-950 text-slate-200 hover:text-white hover:bg-slate-800 text-xs px-4 py-2 rounded-xl font-bold border border-slate-800 transition"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current text-emerald-400" />
                      <span>Test Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    Custom test copy input (trigger.message)
                  </span>
                  <textarea
                    rows={4}
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-350 font-sans outline-none focus:border-slate-700/80"
                  />
                </div>

                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    Parsed JSON variables output
                  </span>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-[100px] overflow-auto font-mono text-[10px] text-teal-400">
                    {testOutput ? (
                      <pre>{JSON.stringify(testOutput, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-600 block italic pt-6 text-center">
                        {isTesting ? "Instructing Gemini..." : "Ready. Wait for test click."}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {testLogs.length > 0 && (
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-[9px] text-slate-500 max-h-[80px] overflow-y-auto space-y-1">
                  <span className="text-[8px] font-semibold text-slate-600 uppercase tracking-wide">Tracer status logs</span>
                  {testLogs.map((log, i) => (
                    <div key={i}>• {log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
