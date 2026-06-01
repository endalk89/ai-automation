import { useState, useEffect } from "react";
import Header from "./components/Header";
import LearnView from "./components/LearnView";
import ChallengeView from "./components/ChallengeView";
import SandboxView from "./components/SandboxView";
import PromptView from "./components/PromptView";
import GlossaryView from "./components/GlossaryView";
import ShowcaseView from "./components/ShowcaseView";
import { AlertTriangle, KeyRound, ArrowRight, Cpu, Eye, BookOpen } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"learn" | "sandbox" | "challenges" | "prompt" | "glossary" | "showcase">("learn");
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // default optimistic
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState<boolean>(true);

  // Check backend health diagnostic output
  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const statusResult = await response.json();
          setHasApiKey(!!statusResult.keyAvailable);
        } else {
          setHasApiKey(false);
        }
      } catch (err) {
        setHasApiKey(false);
      } finally {
        setIsDiagnosticLoading(false);
      }
    };
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Visual Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} hasApiKey={hasApiKey} />

      {/* Global Alerts for Missing Configuration */}
      {!isDiagnosticLoading && !hasApiKey && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-y border-amber-500/15 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="font-sans leading-relaxed">
                <span className="font-bold">Active Simulation Key Missing:</span> Your backend doesn't detect a configured <code className="text-amber-200 font-mono">GEMINI_API_KEY</code>. You can write mock answers, but dynamic execution simulator and prompt grading require key secrets.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/20 text-amber-300 font-medium px-2.5 py-1 rounded-md shrink-0">
              <span>Go to Settings &gt; Secrets in UI</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Welcome Dashboard Banner - Bento Hero Style */}
        <div className="bg-indigo-600 rounded-[2rem] p-8 md:p-10 mb-8 relative overflow-hidden shadow-xl shadow-indigo-950/20">
          {/* Subtle gradient overlay to match styling */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 opacity-90 pointer-events-none" />
          {/* Decorative blur elements resembling the reference */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-violet-500 rounded-full blur-3xl opacity-30 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 uppercase tracking-widest bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
                🔬 Cognitive Pipeline Simulator
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
                Mastering LLM <br className="hidden md:inline" />Workflow Architectures
              </h2>
              <p className="text-indigo-100 text-sm max-w-2xl leading-relaxed opacity-90 font-sans">
                Most automation courses list static formulas. In this Academy, you build actual multi-step LLM-augmented pipelines, run live simulation traces, and get immediate Solution Architecture audits in our high-productivity Bento workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
              {activeTab === "learn" && (
                <button
                  onClick={() => setActiveTab("challenges")}
                  className="bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 px-5 py-3 rounded-2xl text-xs font-bold shadow-xl shadow-indigo-950/20 flex items-center gap-1.5 transition-all cursor-pointer border border-white"
                >
                  <span>Solve Practical Challenges</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {activeTab !== "sandbox" && (
                <button
                  onClick={() => setActiveTab("sandbox")}
                  className="bg-slate-900/40 hover:bg-slate-900/60 text-white backdrop-blur-md font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-1.5 border border-white/20 transition-all text-center cursor-pointer shadow-lg"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Interactive Sandbox Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Tab Routing Layout */}
        <div className="transition-all duration-300">
          {activeTab === "learn" && <LearnView />}
          {activeTab === "challenges" && <ChallengeView />}
          {activeTab === "sandbox" && <SandboxView />}
          {activeTab === "prompt" && <PromptView />}
          {activeTab === "glossary" && <GlossaryView setActiveTab={setActiveTab} />}
          {activeTab === "showcase" && <ShowcaseView />}
        </div>
      </main>

      {/* Modern Humble Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600 font-sans tracking-tight">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AI Automation Academy. Built for Google AI Studio developers.</p>
          <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
            <span>VER: 2.1.0-STABLE</span>
            <span>•</span>
            <span>SYSTEM CONTEXT OK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
