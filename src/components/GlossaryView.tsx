import { useState } from "react";
import { Search, Info, HelpCircle, ExternalLink, ShieldCheck, Cpu, ArrowRight, Tag, BookOpen, Terminal } from "lucide-react";
import { LESSONS } from "../data/lessons";

interface GlossaryTerm {
  term: string;
  category: "ai" | "rpa" | "process-mining" | "tools" | "general";
  definition: string;
  toolDetails?: string;
  linkText: string;
  targetTab: "learn" | "sandbox" | "challenges" | "prompt";
  targetLessonId?: string;
}

interface GlossaryViewProps {
  setActiveTab: (tab: "learn" | "sandbox" | "challenges" | "prompt" | "glossary" | "showcase") => void;
}

export default function GlossaryView({ setActiveTab }: GlossaryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ai" | "rpa" | "process-mining" | "tools">("all");

  const GLOSSARY_DETAILS: GlossaryTerm[] = [
    {
      term: "Process Mining",
      category: "process-mining",
      definition: "An analytical automation discipline focused on harvesting event database logs and timestamp details to construct, monitor, and optimize actual current enterprise workflow graphs.",
      toolDetails: "Tools like Celonis or Fluxicon Disco read event streams, revealing process loops, compliance gaps, and timing bottlenecks.",
      linkText: "Read Process Mining Tutorial",
      targetTab: "learn",
      targetLessonId: "process-mining",
    },
    {
      term: "RPA (Robotic Process Automation)",
      category: "rpa",
      definition: "A category of automation technology that deploys lightweight software 'robots' to mimic manual keyboard strokes, click sequences, and screen scraping on legacy user-interfaces.",
      toolDetails: "RPA tools (like UiPath or BluePrism) automate archaic systems lacking database connection adapters or programmatic APIs.",
      linkText: "Learn RPA Basics",
      targetTab: "learn",
      targetLessonId: "rpa-basics",
    },
    {
      term: "Cognitive Agent",
      category: "ai",
      definition: "An intelligent autonomous pipeline unit powered by a Large Language Model (specifically Google Gemini) capable of contextual text reasoning, intent classification, and multi-variable extraction in real-time.",
      toolDetails: "Leverages deep semantic parsing to replace legacy rigid regular expression logic (regex) in unstructured operations.",
      linkText: "Test AI Block in Sandbox",
      targetTab: "sandbox",
    },
    {
      term: "Few-Shot Prompting",
      category: "ai",
      definition: "An engineering method of enclosing strict input-output samples inside system prompts to enforce precise structural alignment and block conversational chat rambling.",
      toolDetails: "Essential for background services to ensure the model output is strictly focused and perfectly adheres to schema keys.",
      linkText: "Launch Prompt Optimizer Studio",
      targetTab: "prompt",
    },
    {
      term: "Webhook Hook Listener",
      category: "tools",
      definition: "An instant HTTP POST event communication mechanism triggered automatically. When an source database gets updated, it dispatches structured payload variables instantly.",
      toolDetails: "The starting catalyst (Trigger) in event-driven setups, eliminating expensive continuous cron polling.",
      linkText: "See Trigger Mechanics",
      targetTab: "learn",
      targetLessonId: "intro",
    },
    {
      term: "JSON Schema Output Constraint",
      category: "ai",
      definition: "An advanced LLM setting enforcing high-integrity structural outputs matching a specific key-value type list, preventing downstream system parsers from crashing on text clutter.",
      toolDetails: "@google/genai SDK utilizes responseMimeType: 'application/json' alongside a rigid Type array catalog.",
      linkText: "Configure LLM Prompts",
      targetTab: "prompt",
    },
    {
      term: "Condition Group Filter",
      category: "tools",
      definition: "A robust structural checkpoint validating runtime values (e.g., dealSize > 5000) before letting an event cascade further, conserving network limits and preventing visual clutter.",
      toolDetails: "Evaluates dynamically. If variables do not match criteria, execution terminates safely with 'filtered' state.",
      linkText: "Read Smart Routing Syllabus",
      targetTab: "learn",
      targetLessonId: "filters-routing",
    },
    {
      term: "Idempotence Block",
      category: "general",
      definition: "The core reliable systems design property where executing an outbound automation step multiple times with identical payloads produces exactly one side-effect, avoiding double charges.",
      toolDetails: "Crucial inside payment bridges (Stripe) and lead dispatchers to prevent client and user spam irritation.",
      linkText: "Study Resilient Systems Classes",
      targetTab: "learn",
      targetLessonId: "resilient-workflow",
    },
    {
      term: "Google Gemini 3.5 Flash",
      category: "tools",
      definition: "Google's ultra-fast, high-efficiency lightweight multimodal LLM. Specially optimized for speed, logic reasoning, structured JSON outputs, and large multi-variable workspace contexts.",
      toolDetails: "The primary engine backing our cognitive AI visual blocks inside this workspace.",
      linkText: "Test Gemini Prompts in Sandbox",
      targetTab: "sandbox",
    },
    {
      term: "n8n / Make / Zapier",
      category: "tools",
      definition: "Popular node-based workflow integration platforms utilized by teams to wire APIs, drag connection variables, and establish visual orchestrators with simple integrations.",
      toolDetails: "Acts as a visual representation, similar to our custom Sandbox Studio canvas.",
      linkText: "Build Workflow Canvas",
      targetTab: "sandbox",
    }
  ];

  // Apply filters
  const filteredGlossary = GLOSSARY_DETAILS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.toolDetails && item.toolDetails.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters Search Bento Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-grow max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, RPA tools, Gemini APIs, process logging..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500/40 outline-none font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {(
              [
                { id: "all", label: "All Terms" },
                { id: "ai", label: "Cognitive AI" },
                { id: "rpa", label: "RPA Legacy" },
                { id: "process-mining", label: "Process Mining" },
                { id: "tools", label: "Automation Tools" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredGlossary.length === 0 ? (
        <div className="h-[260px] border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/10">
          <HelpCircle className="w-10 h-10 text-slate-700 mb-2" />
          <span className="text-xs font-bold text-slate-400">No matching concepts found</span>
          <span className="text-[11px] text-slate-500 max-w-sm mt-1 leading-normal">
            Try searching for terms such as "RPA", "Mining", "Gemini", "Few-Shot", or adjust your categories filter.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGlossary.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 flex flex-col justify-between shadow-sm hover:border-slate-750 transition-all group"
            >
              <div className="space-y-3.5">
                {/* Header term / Badge */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                    {item.term}
                  </h3>
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    item.category === "ai"
                      ? "bg-violet-950/40 text-violet-400 border-violet-850/60"
                      : item.category === "rpa"
                      ? "bg-amber-950/45 text-amber-500 border-amber-900/40"
                      : item.category === "process-mining"
                      ? "bg-cyan-950/40 text-cyan-400 border-cyan-850/50"
                      : "bg-slate-950 text-slate-450 border-slate-850"
                  }`}>
                    {item.category.toUpperCase()}
                  </span>
                </div>

                {/* Definition */}
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  {item.definition}
                </p>

                {/* Tools Info details */}
                {item.toolDetails && (
                  <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-850/60 flex items-start gap-2.5 text-[11px] text-slate-450 leading-relaxed font-sans">
                    <Terminal className="w-3.5 h-3.5 mt-0.5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Typical Implementation</span>
                      {item.toolDetails}
                    </div>
                  </div>
                )}
              </div>

              {/* Resource redirection Link */}
              <div className="pt-3 border-t border-slate-850 flex items-center justify-end">
                <button
                  id={`btn-glossary-link-${item.term.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    setActiveTab(item.targetTab);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold tracking-tight transition-colors cursor-pointer group/btn"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Learning Blocks */}
      <div className="bg-gradient-to-br from-indigo-900/10 via-indigo-950/5 to-transparent border border-indigo-505/15 rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h4 className="text-white text-xs font-mono font-bold tracking-wider uppercase">Academy Architecture Guidelines</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-sans">
          <div className="space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-200 block">1. Cognitive Orchestration</span>
            <span className="text-slate-450 text-[11px] block">
              Always isolate LLM layers into micro-services and let filters determine validation before dispatching outputs.
            </span>
          </div>
          <div className="space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-200 block">2. Failure Recovery</span>
            <span className="text-slate-450 text-[11px] block">
              Incorporate exponential retry backoffs inside webhooks and use standard Dead Letter alerts to trace timeout leaks.
            </span>
          </div>
          <div className="space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-200 block">3. Structured Formats</span>
            <span className="text-slate-450 text-[11px] block">
              Draft strictly defined prompt templates inside the optimizer and export fields cleanly as JSON variables.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
