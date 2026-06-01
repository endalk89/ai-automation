import { Cpu, Award, Zap, BookOpen, Sparkles, HelpCircle, Rocket } from "lucide-react";

interface HeaderProps {
  activeTab: "learn" | "sandbox" | "challenges" | "prompt" | "glossary" | "showcase";
  setActiveTab: (tab: "learn" | "sandbox" | "challenges" | "prompt" | "glossary" | "showcase") => void;
  hasApiKey: boolean;
}

export default function Header({ activeTab, setActiveTab, hasApiKey }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <Cpu className="w-3 h-3 text-indigo-600" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>AI Automation Academy</span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                SYSTEM ACTIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Learn, build & verify cognitive event pipelines with Gemini
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <nav className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          <button
            id="nav-learn"
            onClick={() => setActiveTab("learn")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "learn"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Learn Syllabus
          </button>
          
          <button
            id="nav-challenges"
            onClick={() => setActiveTab("challenges")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "challenges"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Challenge Hub
          </button>

          <button
            id="nav-sandbox"
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "sandbox"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Sandbox Studio
          </button>

          <button
            id="nav-prompt"
            onClick={() => setActiveTab("prompt")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "prompt"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Prompt Optimizer
          </button>

          <button
            id="nav-glossary"
            onClick={() => setActiveTab("glossary")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "glossary"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Knowledge Base
          </button>

          <button
            id="nav-showcase"
            onClick={() => setActiveTab("showcase")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "showcase"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Project Showcase
          </button>
        </nav>

        {/* Metadata Status Display */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-slate-500">STU_EMAIL</span>
            <span className="text-xs font-medium text-slate-300">endalkuk@gmail.com</span>
          </div>
          <div className="h-4 w-px bg-slate-800 hidden lg:block" />
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasApiKey ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasApiKey ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {hasApiKey ? "Active" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
