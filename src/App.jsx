import { useState, useRef } from "react";
import { Activity, Dumbbell, Utensils, Heart, Camera, FileText, ChevronRight, ChevronLeft, Target, Clock, Flame, TrendingUp, AlertTriangle, AlertCircle, Pill, Moon, BarChart3, X, Upload, Check, Loader2, Zap, Apple, ShieldCheck, Star, ArrowRight, RefreshCw } from "lucide-react";

const GOALS = [
  { id: "fat_loss", label: "Lose Weight / Fat Loss", icon: Flame, color: "#EF4444", bg: "239,68,68", desc: "Burn fat and get leaner" },
  { id: "gain_weight", label: "Gain Weight", icon: TrendingUp, color: "#3B82F6", bg: "59,130,246", desc: "Healthy weight gain" },
  { id: "build_muscle", label: "Build Muscle", icon: Dumbbell, color: "#8B5CF6", bg: "139,92,246", desc: "Increase muscle mass" },
  { id: "fitness_toning", label: "Fitness & Toning", icon: Activity, color: "#10B981", bg: "16,185,129", desc: "Tone and stay fit" },
  { id: "six_pack", label: "Six Pack / Abs", icon: Zap, color: "#F59E0B", bg: "245,158,11", desc: "Visible abs definition" },
  { id: "strength", label: "Strength Training", icon: Dumbbell, color: "#DC2626", bg: "220,38,38", desc: "Get stronger overall" },
  { id: "athletic", label: "Athletic Performance", icon: Star, color: "#0EA5E9", bg: "14,165,233", desc: "Peak performance" },
  { id: "recomp", label: "Body Recomposition", icon: RefreshCw, color: "#7C3AED", bg: "124,58,237", desc: "Lose fat + gain muscle" },
];

const TIMELINES = [
  { months: 2, label: "2 Months", intensity: "Intense" },
  { months: 3, label: "3 Months", intensity: "Aggressive" },
  { months: 6, label: "6 Months", intensity: "Balanced" },
  { months: 9, label: "9 Months", intensity: "Steady" },
  { months: 12, label: "12 Months", intensity: "Sustainable" },
];

const DIET_TYPES = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥬" },
  { id: "non_vegetarian", label: "Non-Veg", emoji: "🍗" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
];

function parseAIResponse(text) {
  const sections = {};
  const patterns = [
    { key: "assessment", pattern: /(?:body assessment|step 2|assessment)(.*?)(?=(?:step 3|transformation strategy|personalized transformation|###?\s*(?:step|gym|workout)|## Step 3|$))/is },
    { key: "strategy", pattern: /(?:transformation strategy|step 3|personalized transformation strategy)(.*?)(?=(?:step 4|workout plan|gym workout|###?\s*(?:step|gym)|## Step 4|$))/is },
    { key: "workout", pattern: /(?:workout plan|step 4|gym workout)(.*?)(?=(?:step 5|diet plan|smart diet|###?\s*(?:step|smart)|## Step 5|$))/is },
    { key: "diet", pattern: /(?:diet plan|step 5|smart diet)(.*?)(?=(?:step 6|step 7|health safety|diet customization|###?\s*(?:step|health)|## Step [67]|$))/is },
    { key: "alerts", pattern: /(?:health safety|step 7|safety alert)(.*?)(?=(?:step 8|supplement|###?\s*step|## Step 8|$))/is },
    { key: "supplements", pattern: /(?:supplement|step 8)(.*?)(?=(?:step 9|lifestyle|###?\s*step|## Step 9|$))/is },
    { key: "lifestyle", pattern: /(?:lifestyle|step 9)(.*?)(?=(?:step 10|progress|tracking|###?\s*step|## Step 10|$))/is },
    { key: "tracking", pattern: /(?:progress tracking|step 10|tracking)(.*?)$/is },
  ];
  for (const { key, pattern } of patterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 20) sections[key] = match[1].trim();
  }
  if (Object.keys(sections).length === 0) sections.full = text;
  return sections;
}

function Md({ text }) {
  if (!text) return <p style={{ color: "#64748B", fontStyle: "italic" }}>No data available for this section.</p>;
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height: 6 }} />;
        if (t.startsWith("#### ")) return <h4 key={i} style={{ fontSize: 15, fontWeight: 700, color: "#C4B5FD", margin: "14px 0 4px" }}>{t.slice(5)}</h4>;
        if (t.startsWith("### ")) return <h3 key={i} style={{ fontSize: 17, fontWeight: 700, color: "#E2E8F0", margin: "16px 0 6px" }}>{t.slice(4)}</h3>;
        if (t.startsWith("## ")) return <h2 key={i} style={{ fontSize: 19, fontWeight: 800, color: "#F1F5F9", margin: "20px 0 8px" }}>{t.slice(3)}</h2>;
        if (t.startsWith("# ")) return <h1 key={i} style={{ fontSize: 22, fontWeight: 800, color: "#FFF", margin: "24px 0 10px" }}>{t.slice(2)}</h1>;
        if (t.startsWith("🔴")) return <div key={i} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "8px 12px", margin: "6px 0", color: "#FCA5A5", fontSize: 14, fontWeight: 500 }}>{t}</div>;
        if (t.startsWith("🟡")) return <div key={i} style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, padding: "8px 12px", margin: "6px 0", color: "#FCD34D", fontSize: 14, fontWeight: 500 }}>{t}</div>;
        if (/^[-*] /.test(t)) {
          const c = t.slice(2);
          return (
            <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4, fontSize: 14, color: "#CBD5E1", lineHeight: 1.65, margin: "2px 0" }}>
              <span style={{ color: "#818CF8", flexShrink: 0 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E2E8F0">$1</strong>') }} />
            </div>
          );
        }
        if (/^\d+\.\s/.test(t)) {
          const num = t.match(/^(\d+)\.\s/)[1];
          const c = t.replace(/^\d+\.\s/, "");
          return (
            <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4, fontSize: 14, color: "#CBD5E1", lineHeight: 1.65, margin: "2px 0" }}>
              <span style={{ color: "#818CF8", fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E2E8F0">$1</strong>') }} />
            </div>
          );
        }
        if (t.startsWith("|")) return <div key={i} style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace", padding: "3px 8px", background: "rgba(15,23,42,0.5)", borderRadius: 4, overflowX: "auto", whiteSpace: "pre" }}>{t}</div>;
        return <p key={i} style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7, margin: "3px 0" }} dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E2E8F0">$1</strong>') }} />;
      })}
    </div>
  );
}

export default function AIFitnessCoach() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([null, null, null]);
  const photoLabels = ["Front View", "Side View", "Back View"];
  const [healthReport, setHealthReport] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [dietType, setDietType] = useState(null);
  const [likedFoods, setLikedFoods] = useState("");
  const [dislikedFoods, setDislikedFoods] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [parsedResult, setParsedResult] = useState({});
  const [activeTab, setActiveTab] = useState("assessment");
  const [error, setError] = useState(null);
  const [customizeInput, setCustomizeInput] = useState("");
  const [customizing, setCustomizing] = useState(false);
  const fr0 = useRef(), fr1 = useRef(), fr2 = useRef();
  const fileRefs = [fr0, fr1, fr2];
  const healthRef = useRef();

  const handlePhoto = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(prev => {
        const n = [...prev];
        n[idx] = { file, preview: ev.target.result, base64: ev.target.result.split(",")[1], type: file.type };
        return n;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleHealth = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setHealthReport({ file, base64: ev.target.result.split(",")[1], type: file.type, isPDF: file.type === "application/pdf" });
    };
    reader.readAsDataURL(file);
  };

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const goalObj = GOALS.find(g => g.id === selectedGoal);
      const timeObj = TIMELINES.find(t => t.months === timeline);
      const dietObj = DIET_TYPES.find(d => d.id === dietType);
      const content = [];
      photos.forEach((p, i) => {
        if (p) {
          content.push({ type: "image", source: { type: "base64", media_type: p.type, data: p.base64 } });
          content.push({ type: "text", text: `[Body Photo - ${photoLabels[i]}]` });
        }
      });
      if (healthReport) {
        if (healthReport.isPDF) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: healthReport.base64 } });
        else content.push({ type: "image", source: { type: "base64", media_type: healthReport.type, data: healthReport.base64 } });
        content.push({ type: "text", text: "[Health Report uploaded]" });
      }
      content.push({ type: "text", text: `USER PROFILE:\n- Goal: ${goalObj.label}\n- Timeline: ${timeObj.label} (${timeObj.intensity})\n- Diet: ${dietObj?.label || "No preference"}\n- Liked Foods: ${likedFoods || "No preference"}\n- Disliked Foods: ${dislikedFoods || "None"}\n\nAnalyze my photos${healthReport ? " and health report" : ""} and generate my complete fitness plan (Steps 2-10). Be specific with exercises, sets, reps, rest times, meal plans with calories. Make it motivational.` });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: `You are an elite AI Fitness Coach, Sports Nutritionist, and Health Analyst. Generate a comprehensive plan with these exact section headers using ## markdown:\n\n## Step 2: Body Assessment\nEstimate body fat %, muscle distribution, fat storage areas, posture issues, fitness level.\n\n## Step 3: Personalized Transformation Strategy\nPhased plan (Foundation > Progressive > Optimization) with milestones.\n\n## Step 4: Gym Workout Plan\nWeekly split with exercises, sets, reps, rest times, progressive overload.\n\n## Step 5: Smart Diet Plan\nDaily calories, macros, full meal plan (Breakfast, Lunch, Dinner, Pre/Post-workout, Snacks).\n\n## Step 7: Health Safety Alerts\nUse red and yellow alert emojis for risk levels.\n\n## Step 8: Supplement Recommendations\nOnly if needed.\n\n## Step 9: Lifestyle Advice\nSleep, hydration, steps, stress, recovery.\n\n## Step 10: Progress Tracking\nWeekly and monthly tracking.\n\nBe specific, motivational, evidence-based. No extreme or unsafe recommendations.`,
          messages: [{ role: "user", content }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const fullText = data.content.map(c => c.text || "").join("\n");
      setResult(fullText);
      setParsedResult(parseAIResponse(fullText));
      setStep(5);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = async () => {
    if (!customizeInput.trim()) return;
    setCustomizing(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: "You are an AI nutritionist. Update the diet plan per the user request. Replace foods with nutritionally similar alternatives maintaining calorie and protein balance. Return only the updated diet in markdown.",
          messages: [{ role: "user", content: `Current diet:\n${parsedResult.diet || result}\n\nRequest: ${customizeInput}` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const newDiet = data.content.map(c => c.text || "").join("\n");
      setParsedResult(prev => ({ ...prev, diet: newDiet }));
      setCustomizeInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCustomizing(false);
    }
  };

  const tabs = [
    { id: "assessment", label: "Assessment", icon: BarChart3 },
    { id: "strategy", label: "Strategy", icon: Target },
    { id: "workout", label: "Workout", icon: Dumbbell },
    { id: "diet", label: "Diet", icon: Apple },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "supplements", label: "Supplements", icon: Pill },
    { id: "lifestyle", label: "Lifestyle", icon: Moon },
    { id: "tracking", label: "Tracking", icon: BarChart3 },
  ];

  const canNext = () => {
    if (step === 1) return photos.some(Boolean);
    if (step === 2) return selectedGoal && timeline;
    if (step === 3) return dietType;
    return true;
  };

  const bg = { minHeight: "100vh", background: "linear-gradient(150deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)", color: "#F1F5F9", fontFamily: "'Inter',-apple-system,sans-serif" };
  const card = { background: "rgba(30,41,59,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 16, padding: 24 };
  const btnP = { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 20px rgba(99,102,241,0.3)" };
  const btnS = { background: "rgba(99,102,241,0.08)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
  const inp = { width: "100%", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 10, padding: "12px 16px", color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" };

  // ===== LANDING PAGE =====
  if (step === 0) return (
    <div style={bg}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 20px 60px" }}>
        <div style={{ textAlign: "center", paddingTop: 50, paddingBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(99,102,241,0.12)", borderRadius: 50, padding: "7px 18px", marginBottom: 22, border: "1px solid rgba(99,102,241,0.2)" }}>
            <Zap size={16} color="#A5B4FC" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#A5B4FC", letterSpacing: 1.2 }}>AI-POWERED FITNESS</span>
          </div>
          <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 900, lineHeight: 1.08, margin: 0, background: "linear-gradient(135deg,#FFF 0%,#A5B4FC 60%,#818CF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Your Personal AI<br/>Fitness Coach
          </h1>
          <p style={{ fontSize: 17, color: "#94A3B8", marginTop: 18, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Upload body photos, set your goals, and get a personalized workout routine, diet plan, and transformation strategy.
          </p>
          <button style={{ ...btnP, padding: "16px 40px", fontSize: 17, marginTop: 28 }} onClick={() => setStep(1)}>
            Start My Transformation <ArrowRight size={20} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginTop: 16 }}>
          {[
            { icon: Camera, title: "Body Analysis", desc: "AI estimates body fat, muscle distribution & posture" },
            { icon: Dumbbell, title: "Custom Workouts", desc: "Gym plans with progressive overload guidance" },
            { icon: Utensils, title: "Smart Diet Plans", desc: "Macro-optimized meals for your preferences" },
            { icon: ShieldCheck, title: "Health Safety", desc: "Alerts based on your health reports" },
            { icon: Pill, title: "Supplements", desc: "Evidence-based supplement guidance" },
            { icon: BarChart3, title: "Progress Tracking", desc: "Weekly & monthly tracking system" },
          ].map(({ icon: I, title, desc }, i) => (
            <div key={i} style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I size={20} color="#818CF8" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ===== RESULTS PAGE =====
  if (step === 5 && result) {
    const sec = parsedResult[activeTab] || parsedResult.full || result;
    return (
      <div style={bg}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "20px 20px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Activity size={22} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Your Fitness Plan</h1>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>{GOALS.find(g => g.id === selectedGoal)?.label} · {timeline} months</p>
            </div>
            <button style={{ ...btnS, padding: "10px 18px", fontSize: 13 }} onClick={() => { setStep(0); setResult(null); setParsedResult({}); setPhotos([null,null,null]); setHealthReport(null); setSelectedGoal(null); setTimeline(null); setError(null); }}>
              New Plan
            </button>
          </div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
            {tabs.map(({ id, label, icon: I }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                background: activeTab === id ? "rgba(99,102,241,0.18)" : "transparent",
                border: activeTab === id ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
                borderRadius: 9, padding: "9px 14px", color: activeTab === id ? "#A5B4FC" : "#64748B",
                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
              }}>
                <I size={15} /> {label}
              </button>
            ))}
          </div>
          <div style={card}><Md text={sec} /></div>
          {activeTab === "diet" && (
            <div style={{ ...card, marginTop: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <RefreshCw size={16} color="#818CF8" /> Customize Diet
              </h3>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 10px" }}>Swap foods, change meals, or adjust for preferences.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={customizeInput} onChange={e => setCustomizeInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCustomize()} placeholder='e.g. "Replace eggs with paneer"' style={{ ...inp, flex: 1 }} />
                <button onClick={handleCustomize} disabled={customizing || !customizeInput.trim()} style={{ ...btnP, padding: "12px 22px", opacity: customizing || !customizeInput.trim() ? 0.5 : 1 }}>
                  {customizing ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Updating...</> : "Update"}
                </button>
              </div>
            </div>
          )}
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // ===== WIZARD STEPS 1-4 =====
  const titles = ["", "Upload Photos", "Set Your Goal", "Diet Preferences", "Review & Generate"];
  const descs = ["", "Add body photos for AI body analysis", "Choose your fitness goal and timeline", "Tell us your dietary preferences", "Confirm and generate your plan"];

  return (
    <div style={bg}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 20px 60px" }}>
        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: s < 4 ? 1 : 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: step >= s ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(30,41,59,0.8)", border: step >= s ? "none" : "1px solid rgba(99,102,241,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: step >= s ? "#fff" : "#64748B", flexShrink: 0 }}>
                {step > s ? <Check size={15} /> : s}
              </div>
              {s < 4 && <div style={{ flex: 1, height: 2, borderRadius: 1, background: step > s ? "#6366F1" : "rgba(99,102,241,0.12)" }} />}
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>{titles[step]}</h2>
        <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 22px" }}>{descs[step]}</p>

        {/* STEP 1: Photos */}
        {step === 1 && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {photoLabels.map((label, i) => (
              <div key={i}>
                <input ref={fileRefs[i]} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhoto(i, e)} />
                {photos[i] ? (
                  <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4" }}>
                    <img src={photos[i].preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => setPhotos(p => { const n=[...p]; n[i]=null; return n; })} style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.7))", padding: "14px 10px 8px", fontSize: 12, fontWeight: 600 }}>{label}</div>
                  </div>
                ) : (
                  <div onClick={() => fileRefs[i].current?.click()} style={{ ...card, aspectRatio: "3/4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 6, border: "2px dashed rgba(99,102,241,0.22)" }}>
                    <Upload size={24} color="#64748B" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>{label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <FileText size={18} color="#818CF8" />
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Health Report <span style={{ fontSize: 12, color: "#64748B", fontWeight: 400 }}>(Optional)</span></h3>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Blood work or checkup PDF/image</p>
              </div>
            </div>
            <input ref={healthRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleHealth} />
            {healthReport ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: 10 }}>
                <Check size={16} color="#10B981" />
                <span style={{ fontSize: 13, color: "#6EE7B7", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{healthReport.file.name}</span>
                <button onClick={() => setHealthReport(null)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 2 }}><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => healthRef.current?.click()} style={{ ...btnS, width: "100%", justifyContent: "center", padding: 11, fontSize: 13 }}>
                <Upload size={15} /> Upload Health Report
              </button>
            )}
          </div>
        </>}

        {/* STEP 2: Goal & Timeline */}
        {step === 2 && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9, marginBottom: 24 }}>
            {GOALS.map(g => {
              const I = g.icon, a = selectedGoal === g.id;
              return (
                <div key={g.id} onClick={() => setSelectedGoal(g.id)} style={{ ...card, padding: 14, cursor: "pointer", borderColor: a ? g.color : "rgba(99,102,241,0.12)", background: a ? `rgba(${g.bg},0.1)` : "rgba(30,41,59,0.55)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <I size={20} color={a ? g.color : "#64748B"} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a ? "#F1F5F9" : "#CBD5E1" }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{g.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color="#818CF8" /> Timeline
          </h3>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {TIMELINES.map(t => (
              <button key={t.months} onClick={() => setTimeline(t.months)} style={{
                background: timeline === t.months ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(30,41,59,0.55)",
                border: timeline === t.months ? "1px solid #818CF8" : "1px solid rgba(99,102,241,0.18)",
                borderRadius: 10, padding: "9px 18px", color: timeline === t.months ? "#fff" : "#94A3B8",
                fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center",
              }}>
                {t.label}
                <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1, opacity: 0.8 }}>{t.intensity}</div>
              </button>
            ))}
          </div>
        </>}

        {/* STEP 3: Diet Preferences */}
        {step === 3 && <>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px" }}>Dietary Type</h3>
          <div style={{ display: "flex", gap: 9, marginBottom: 22 }}>
            {DIET_TYPES.map(d => (
              <button key={d.id} onClick={() => setDietType(d.id)} style={{
                flex: 1, background: dietType === d.id ? "rgba(99,102,241,0.12)" : "rgba(30,41,59,0.55)",
                border: dietType === d.id ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(99,102,241,0.12)",
                borderRadius: 12, padding: "15px 10px", cursor: "pointer", textAlign: "center",
                color: dietType === d.id ? "#A5B4FC" : "#94A3B8", fontSize: 13, fontWeight: 600,
              }}>
                <div style={{ fontSize: 26, marginBottom: 3 }}>{d.emoji}</div>
                {d.label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 5, display: "block" }}>Foods I Like</label>
              <input value={likedFoods} onChange={e => setLikedFoods(e.target.value)} placeholder="e.g., chicken, rice, eggs, bananas..." style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 5, display: "block" }}>Foods I Dislike</label>
              <input value={dislikedFoods} onChange={e => setDislikedFoods(e.target.value)} placeholder="e.g., broccoli, fish, mushrooms..." style={inp} />
            </div>
          </div>
        </>}

        {/* STEP 4: Review & Generate */}
        {step === 4 && <>
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: "#A5B4FC" }}>Summary</h3>
            {[
              ["Photos", `${photos.filter(Boolean).length} uploaded`],
              ["Health Report", healthReport ? healthReport.file.name : "Not uploaded"],
              ["Goal", GOALS.find(g => g.id === selectedGoal)?.label],
              ["Timeline", `${timeline} months`],
              ["Diet", DIET_TYPES.find(d => d.id === dietType)?.label],
              ["Liked Foods", likedFoods || "No preference"],
              ["Disliked Foods", dislikedFoods || "None"],
            ].map(([l, v], i, a) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < a.length - 1 ? "1px solid rgba(99,102,241,0.08)" : "none" }}>
                <span style={{ fontSize: 13, color: "#94A3B8" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
              </div>
            ))}
          </div>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 14, marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#FCA5A5" }}>{error}</span>
            </div>
          )}
          <button onClick={generatePlan} disabled={loading} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 15, fontSize: 17, opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Analyzing & Generating...</> : <><Zap size={20} /> Generate My Fitness Plan</>}
          </button>
          {loading && <p style={{ textAlign: "center", fontSize: 12, color: "#64748B", marginTop: 10 }}>This may take 30-60 seconds. AI is analyzing your photos and building your plan...</p>}
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </>}

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button onClick={() => setStep(s => s - 1)} style={{ ...btnS, opacity: step <= 1 ? 0.3 : 1, pointerEvents: step <= 1 ? "none" : "auto" }}>
            <ChevronLeft size={16} /> Back
          </button>
          {step < 4 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ ...btnP, opacity: canNext() ? 1 : 0.4, pointerEvents: canNext() ? "auto" : "none" }}>
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
