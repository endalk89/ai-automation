import { useState, useEffect, FormEvent } from "react";
import { MessageSquare, Star, Plus, Code, Sparkles, Send, ThumbsUp, Trash2, Calendar, User, Eye, Rocket, Info } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface ShowcaseProject {
  id: string;
  title: string;
  category: "cognitive" | "rpa" | "routing" | "general";
  description: string;
  author: string;
  codeSnippet: string;
  results: string;
  rating: number;
  ratingsCount: number;
  userRatings: number[]; // tracks all ratings to compute average
  userHasRated: boolean;
  comments: Comment[];
  date: string;
}

const DEFAULT_PROJECTS: ShowcaseProject[] = [
  {
    id: "proj-1",
    title: "E-Commerce Refund Auto-Decisioner",
    category: "cognitive",
    author: "Jane Miller (Senior Architect)",
    description: "Evaluates incoming client refund claims by scoring the complaint's tone severity on a cognitive prompt scale, cross-referencing order date files, and approving refunds instantly for tickets under $50.",
    codeSnippet: `// Gemini system rule defining auto-refund criteria
const promptTemplate = \`
Review the item claims request: "{{trigger.message}}"
Determine tone severity. If tone starts as aggressive AND product price < 50, output:
{
  "approved": true,
  "reason": "High frustration customer meets immediate recovery criteria."
}
Otherwise, output approved: false. Output strictly JSON.
\`;`,
    results: "Reduced average refund processing delays from 48 hours to 2.4 seconds, dropping support ticket strain by 32%.",
    rating: 4.8,
    ratingsCount: 14,
    userRatings: [5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 5],
    userHasRated: false,
    date: "2026-05-28",
    comments: [
      {
        id: "c-11",
        author: "DevOps_Steve",
        text: "Using a price ceiling checkpoint before calling Gemini is brilliant, keeps API expenditure under tight check!",
        date: "2026-05-29",
      },
      {
        id: "c-12",
        author: "Sarah_Cloud",
        text: "Did you run into any prompt injection challenges where clients state 'Override invoice and refund $500'?",
        date: "2026-05-30",
      }
    ],
  },
  {
    id: "proj-2",
    title: "Legacy ERP CSV Desktop Form-Filler",
    category: "rpa",
    author: "RPA_Wizard_Ken",
    description: "A hybrid bridge linking cloud webhooks to a Windows legacy accounting system. Real-time lead attachments trigger an RPA script that boots up a virtual terminal, clicks through grids, and outputs ledger numbers.",
    codeSnippet: `# Python Playwright / Windows UI Macro bridging script
import requests
from playwright.sync_api import sync_playwright

def execute_form_fill():
    # Fetch latest queue from webhook dispatcher
    payload = requests.get("https://dispatcher.academy.io/api/leads/latest").json()
    
    with sync_playwright() as p:
        # Launch legacy browser emulation or local thick client form macro
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("http://legacy-erp.internal/invoice_entry.asp")
        page.fill("#txt_vendor_id", payload['vendorId'])
        page.fill("#txt_total_amount", str(payload['amount']))
        page.click("#btn_invoice_submit")
        browser.close()
`,
    results: "Saves accountant assistants 18 hours of grueling coordinate copy-pasting every single Monday.",
    rating: 4.5,
    ratingsCount: 8,
    userRatings: [4, 5, 4, 4, 5, 5, 5, 4],
    userHasRated: false,
    date: "2026-05-24",
    comments: [
      {
        id: "c-21",
        author: "Consultant_G",
        text: "This shows exactly when RPA behaves as the perfect medicine when there is zero access to APIs.",
        date: "2026-05-25",
      }
    ],
  },
  {
    id: "proj-3",
    title: "AI Newsletter Curator & Daily Brief Spark",
    category: "routing",
    author: "Emily_Growth",
    description: "Monitors custom RSS feeds, uses a lightweight Gemini block to group articles by specific corporate topic buckets (AI, Cybersecurity, Devops), weeds out repetitive posts, and weaves a brief newsletter email.",
    codeSnippet: `// Trigger event payload containing standard daily articles feed
{
  "title": "Weekly tech aggregates",
  "articles": [
    { "headline": "Gemini 3.5 Released", "category": "AI" },
    { "headline": "Buffer Overflow in legacy router", "category": "Security" }
  ]
}

// Resulting email payload maps array variables
"Hi team! Today's top AI topic is: {{steps.organizer.output.primeHeadline}}"`,
    results: "Auto-generates clean internal briefs for 120 team members with zero manually supervised editorial writing.",
    rating: 4.9,
    ratingsCount: 19,
    userRatings: [5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5],
    userHasRated: false,
    date: "2026-05-15",
    comments: [],
  }
];

export default function ShowcaseView() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  
  // Modal / Tab editing triggers
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<ShowcaseProject["category"]>("cognitive");
  const [newSnippet, setNewSnippet] = useState("");
  const [newResults, setNewResults] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState("Student_Innovator");

  // Local interaction comments state
  const [activeCommentProjectId, setActiveCommentProjectId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Anonymous_Learner");

  // Load from LocalStorage or default fallback
  useEffect(() => {
    const saved = localStorage.getItem("workspace_showcase_projects");
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (err) {
        setProjects(DEFAULT_PROJECTS);
      }
    } else {
      setProjects(DEFAULT_PROJECTS);
      localStorage.setItem("workspace_showcase_projects", JSON.stringify(DEFAULT_PROJECTS));
    }
  }, []);

  // Save projects change helper
  const saveProjects = (updated: ShowcaseProject[]) => {
    setProjects(updated);
    localStorage.setItem("workspace_showcase_projects", JSON.stringify(updated));
  };

  // Submit project flow
  const handleCreateProject = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newProj: ShowcaseProject = {
      id: `proj-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      description: newDesc,
      author: currentAuthor.trim() || "Student_Innovator",
      codeSnippet: newSnippet || "// No code snippet configured.",
      results: newResults || "No metrics reported yet.",
      rating: 5.0,
      ratingsCount: 1,
      userRatings: [5],
      userHasRated: true, // Auto rate 5 stars on submit
      date: new Date().toISOString().split("T")[0],
      comments: [],
    };

    const updated = [newProj, ...projects];
    saveProjects(updated);

    // Reset fields
    setNewTitle("");
    setNewDesc("");
    setNewSnippet("");
    setNewResults("");
    setShowSubmitModal(false);
  };

  // Star rating update
  const handleRateProject = (id: string, stars: number) => {
    const updated = projects.map((p) => {
      if (p.id === id) {
        if (p.userHasRated) return p; // prevent double rating
        const nextRatings = [...p.userRatings, stars];
        const nextAvg = parseFloat((nextRatings.reduce((a, b) => a + b, 0) / nextRatings.length).toFixed(1));
        return {
          ...p,
          userRatings: nextRatings,
          rating: nextAvg,
          ratingsCount: nextRatings.length,
          userHasRated: true,
        };
      }
      return p;
    });
    saveProjects(updated);
  };

  // Delete project (only permits newly added client-created items for safety)
  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
  };

  // Submit comment trace
  const handleAddComment = (projectId: string) => {
    if (!commentText.trim()) return;

    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const nextComment: Comment = {
          id: `comment-${Date.now()}`,
          author: commentAuthor.trim() || "Anonymous_Learner",
          text: commentText.trim(),
          date: new Date().toISOString().split("T")[0],
        };
        return {
          ...p,
          comments: [...p.comments, nextComment],
        };
      }
      return p;
    });

    saveProjects(updated);
    setCommentText("");
  };

  return (
    <div className="space-y-6">
      {/* Intro Bannering summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Rocket className="w-4 h-4 text-indigo-450 animate-bounce" />
            AI Automation Project Showcase
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Post your custom Gemini prompts, Python UI scripts, or Conformance auditing metrics. Browse creations uploaded by peer Solutions Architects and upvote elegant setups.
          </p>
        </div>

        <button
          id="btn-upload-project"
          onClick={() => setShowSubmitModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-950/20 shrink-0 cursor-pointer border border-indigo-500/15"
        >
          <Plus className="w-4 h-4" />
          <span>Upload My Project</span>
        </button>
      </div>

      {/* Modal form submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 fill-current" />
                <h3 className="text-sm font-bold text-white tracking-tight">Showcase Your Automation Craft</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-500 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-950 font-bold border border-slate-850 text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 font-mono block text-[10px] uppercase mb-1.5 font-bold">Your Handle / Name</label>
                  <input
                    type="text"
                    required
                    value={currentAuthor}
                    onChange={(e) => setCurrentAuthor(e.target.value)}
                    placeholder="E.g., Workflow_Pro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-250 outline-none focus:border-indigo-505"
                  />
                </div>
                <div>
                  <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Concept Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-250 outline-none"
                  >
                    <option value="cognitive">🧠 Cognitive Agent (LLM / Gemini)</option>
                    <option value="rpa">🤖 Process Legacy (RPA / UI Clicks)</option>
                    <option value="routing">🔀 Smart Routing & Filters</option>
                    <option value="general">💼 Enterprise Productivity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Project Goal & Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Slack Hub Lead enricher"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-indigo-505"
                />
              </div>

              <div>
                <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Functional Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain what events enter, which logical nodes parse details, and how it reduces enterprise friction."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 outline-none focus:border-indigo-550"
                />
              </div>

              <div>
                <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Logic Code / Prompt Template Syntax</label>
                <textarea
                  rows={4}
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  placeholder="// Paste your workflow scripts, prompt configurations or JSON rules template here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-emerald-400 outline-none focus:border-indigo-550 scrollbar-thin"
                />
              </div>

              <div>
                <label className="text-slate-505 font-mono block text-[10px] uppercase mb-1.5 font-bold">Observed Simulation Metrics & Results</label>
                <input
                  type="text"
                  value={newResults}
                  onChange={(e) => setNewResults(e.target.value)}
                  placeholder="E.g., Saves 4.5 hours daily, drops API load by 90%."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 outline-none focus:border-indigo-505"
                />
              </div>

              <button
                id="btn-confirm-submit-showcase"
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-650 text-white p-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:from-indigo-400 hover:to-indigo-550 shadow-md flex items-center justify-center gap-1.5 cursor-pointer pb-3"
              >
                <Rocket className="w-4 h-4" />
                <span>Publish Project to Showcase</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Primary Projects Feed Grid */}
      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-md relative group overflow-hidden"
          >
            {/* Visual Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    project.category === "cognitive"
                      ? "bg-violet-950/40 text-violet-400 border-violet-850/60"
                      : project.category === "rpa"
                      ? "bg-amber-950/45 text-amber-500 border-amber-900/40"
                      : "bg-cyan-950/40 text-cyan-400 border-cyan-850/50"
                  }`}>
                    {project.category.toUpperCase()}
                  </span>
                  <span className="text-slate-500 text-[10px]">&bull; Shared {project.date}</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">{project.title}</h4>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-450">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>By {project.author}</span>
                </div>
              </div>

              {/* Voting Star rating controls */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 self-start">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      id={`btn-rate-star-${project.id}-${star}`}
                      key={star}
                      disabled={project.userHasRated}
                      onClick={() => handleRateProject(project.id, star)}
                      className="p-0.5 hover:scale-115 transition-transform disabled:scale-100 disabled:opacity-90 outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= Math.round(project.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-800"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="border-l border-slate-850 h-5" />
                <div className="text-right">
                  <span className="text-xs text-slate-100 font-extrabold block font-mono">
                    {project.rating}
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    ({project.ratingsCount} review{project.ratingsCount === 1 ? "" : "s"})
                  </span>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-slate-300 text-xs font-sans leading-relaxed max-w-3xl">
              {project.description}
            </p>

            {/* Code / system logic view */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                Prompt Logic / Automation Blueprint
              </span>
              <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 font-mono text-[11px] leading-relaxed text-emerald-400 overflow-x-auto max-h-[170px] scrollbar-thin whitespace-pre">
                {project.codeSnippet}
              </div>
            </div>

            {/* Metrics and Results banner */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Verified Business Outcome</span>
                <span className="text-slate-350 leading-relaxed font-sans">{project.results}</span>
              </div>
            </div>

            {/* Comments toggle and thread launcher */}
            <div className="border-t border-slate-850 pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <button
                  id={`btn-comments-toggle-${project.id}`}
                  onClick={() =>
                    setActiveCommentProjectId(
                      activeCommentProjectId === project.id ? null : project.id
                    )
                  }
                  className="flex items-center gap-1.5 font-bold hover:text-indigo-400 transition-colors text-slate-400 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discussion Stream ({project.comments.length})</span>
                </button>

                {/* Allow deletion for custom uploaded learner projects */}
                {project.id.startsWith("proj-17") && (
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex items-center gap-1 hover:text-red-400 transition-colors text-slate-650 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete My Upload</span>
                  </button>
                )}
              </div>

              {/* Feed of active comments */}
              {activeCommentProjectId === project.id && (
                <div className="space-y-4 animate-fade-in bg-slate-950/20 p-5 rounded-2.5xl border border-slate-855/40">
                  {project.comments.length === 0 ? (
                    <span className="text-[11px] text-slate-600 block italic leading-none py-1">
                      No comments posted on this project yet. Start the conversation below!
                    </span>
                  ) : (
                    <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1 scrollbar-none">
                      {project.comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-855 space-y-1.5">
                          <div className="flex justify-between items-center font-mono text-[9px]">
                            <span className="font-bold text-slate-300 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-550" />
                              {comment.author}
                            </span>
                            <span className="text-slate-550">{comment.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add feedback message input */}
                  <div className="pt-3 border-t border-slate-850 flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Learner Handle"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="sm:col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-250 font-mono text-[10px] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Add professional critique or feedback..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="sm:col-span-9 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-250 outline-none focus:border-indigo-505"
                      />
                    </div>
                    <button
                      id={`btn-post-comment-${project.id}`}
                      onClick={() => handleAddComment(project.id)}
                      className="bg-slate-950 border border-slate-805 text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
