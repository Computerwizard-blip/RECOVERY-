import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Flame, 
  HelpCircle, 
  Calculator, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Coins, 
  Heart, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  CornerDownRight,
  BookOpen
} from "lucide-react";
import { AddictionCategory } from "../types";

interface QuoteData {
  text: string;
  author: string;
  reflection?: string;
  milestoneAction?: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export default function Homepage({ 
  profile, 
  onNavigateToTab 
}: { 
  profile: any; 
  onNavigateToTab?: (tab: "dashboard" | "stakes" | "forum" | "therapist") => void;
}) {
  // Quote States
  const [quote, setQuote] = useState<QuoteData>({
    text: "You are not broken. You are a sovereign spirit reclaiming the power to rule your own mind.",
    author: "Sovereign Guide",
    reflection: "Every action of recovery resets a neurochemical cycle that was designed to catch you.",
    milestoneAction: "Sit quiet for 2 minutes and focus your eyes on a single yellow or warm object to ground yourself."
  });
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Core Areas AI states
  const [selectedAICategory, setSelectedAICategory] = useState<AddictionCategory>(AddictionCategory.GENERAL);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    [AddictionCategory.GENERAL]: [
      { sender: "bot", text: "Welcome. Select any area above or type your current struggle. I am your Live AI Sovereign Guide, powered by Gemini. Let's take it 24 hours at a time." }
    ]
  });
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const preFilledPrompts = {
    [AddictionCategory.DRUGS]: [
      "I am sweating and shaking right now. How do I survive this craving?",
      "Help me map my triggers when I feel idle or down.",
      "What is the brain science of chemical detox?",
      "Write a short motivation speech for my morning sobriety walk."
    ],
    [AddictionCategory.ALCOHOL]: [
      "Everyone is drinking at the party/bar. What is my exit strategy?",
      "How do I repair relationships with my family when they don't trust me?",
      "Why does my brain tell me 'just one drink is fine' when I'm tired?",
      "Guide me through a physical craving wave right now."
    ],
    [AddictionCategory.GAMBLING]: [
      "I just lost KES 5,000 on Aviator and want to deposit more to win it back. Help!",
      "How do I block multiple betting accounts securely in Kenya?",
      "What is the random ratio reward dopamine trap inside casino slots?",
      "Write a 1-day step-by-step program to stay clean from sports betting."
    ],
    [AddictionCategory.NICOTINE]: [
      "I throw away my vape but buy a new one every 3 days. Why?",
      "What is the exact physical timeline of nicotine leaving my body?",
      "My chest feels heavy and I have immediate smoking urges. Help.",
      "How do I breathe or replace the hand-to-mouth motion when stressed?"
    ],
    [AddictionCategory.SEX]: [
      "I fallback to late night private browser triggers. How do I build a lock?",
      "Explain the dopamine depletion cycle that leaves me flat after relapse.",
      "Give me 3 strict physical boundaries for bedroom tech usage.",
      "How do I restore healthy intimate self-respect?"
    ],
    [AddictionCategory.TECH]: [
      "I scroll TikTok/social media for 6 hours a day and feel empty. Help me stop.",
      "What is a digital fast and how do I conduct it tonight?",
      "Suggest 3 non-tech hobbies that trigger high-quality offline dopamine.",
      "How do I cope with the anxiety of being unconnected?"
    ],
    [AddictionCategory.GENERAL]: [
      "Explain why I cycle between doing great and immediately self-sabotaging.",
      "Give me a 5-minute deep breathing blueprint for sudden panic.",
      "What is cognitive reframing and how do I use it when feeling anxious?",
      "Why is a small stake system (saving cash daily) so powerful for recovery?"
    ]
  };

  // Fetch true Daily Quote on mount
  useEffect(() => {
    fetchDailyQuote();
  }, []);

  const fetchDailyQuote = async () => {
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/daily-quote");
      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          setQuote(data);
        }
      }
    } catch (e) {
      console.warn("Error loading server dynamic daily quote:", e);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const category = selectedAICategory;
    const currentHistory = chatMessages[category] || [];
    
    // Add user message to history
    const updatedWithUser = [...currentHistory, { sender: "user", text: textToSend } as ChatMessage];
    setChatMessages(prev => ({
      ...prev,
      [category]: updatedWithUser
    }));
    setUserInput("");
    setChatLoading(true);

    try {
      // Map history formatted for the backend api endpoint
      const formattedForApi = updatedWithUser.map(msg => ({
        sender: msg.sender === "user" ? "user" : "assistant",
        text: msg.text
      }));

      const response = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedForApi,
          category: category
        })
      });

      if (!response.ok) {
        throw new Error("Failed server-side AI connection");
      }

      const resData = await response.json();
      const botResponse = resData.reply || "I am processing that. Let's make a conscious choice together.";

      setChatMessages(prev => ({
        ...prev,
        [category]: [...updatedWithUser, { sender: "bot", text: botResponse }]
      }));
    } catch (err) {
      console.error("AI fetch failed on homepage:", err);
      setChatMessages(prev => ({
        ...prev,
        [category]: [
          ...updatedWithUser,
          { sender: "bot", text: "The Live AI Sovereign Guide had a sudden offline meditation. Please verify your connection or try again." }
        ]
      }));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div id="homepage_container" className="space-y-8 pb-12">
      
      {/* 1. HERO HERO BANNER - Vibrant Pink, White, Yellow 🟡 Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 rounded-3xl p-8 md:p-12 text-white shadow-xl border border-pink-400">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-yellow-300/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-200">
            <span className="animate-spin-slow text-yellow-300 font-extrabold">🟡</span>
            <span className="text-xs font-black uppercase tracking-widest text-yellow-100">
              Live & Active Recovery Center
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Claim Your Tomorrow. <span className="text-yellow-200 text-shadow-sm font-serif italic">Walk Free</span> Today.
          </h2>

          <p className="text-sm md:text-base font-semibold text-pink-100 max-w-2xl leading-relaxed">
            Welcome to <span className="font-bold underline decoration-yellow-300">Solmontec Recovery life</span>. 
            We provide evidence-based, compassionate support and micro-accountability layers to help you dismantle addiction—one precise day at a time.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={() => onNavigateToTab?.("therapist")}
              className="bg-white hover:bg-yellow-100 text-pink-600 font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 duration-150"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              Begin CBT Counseling
            </button>
            <button
              onClick={() => onNavigateToTab?.("stakes")}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 duration-150"
            >
              <Coins className="w-4 h-4 text-yellow-900" />
              Pledge Small Stakes (10sh+)
            </button>
          </div>
        </div>

        {/* Floating Quick Action Stats Banner */}
        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-pink-200 tracking-wider">Live Companions</span>
            <p className="text-lg font-black text-yellow-100">1,482 Active</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-pink-200 tracking-wider">M-PESA Stakes Managed</span>
            <p className="text-lg font-black text-yellow-100">Sovereign Cloud</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-pink-200 tracking-wider">Urgent Survival Rates</span>
            <p className="text-lg font-black text-yellow-100">94.2% Sustained</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-pink-200 tracking-wider">Therapy Philosophy</span>
            <p className="text-lg font-black text-yellow-100">Micro-Commitments</p>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC ROW: DUAL RECOVERY INSIGHTS (AI Daily Quotes) */}
      <div className="w-full">
        
        {/* DAILY RECOVERY QUOTE PANEL: Elegant Pink & Yellow Framed Design */}
        <div id="dynamic_ai_quotes_container" className="bg-white rounded-3xl border-2 border-pink-100 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100/40 rounded-bl-full pointer-events-none flex items-center justify-end p-4 text-pink-300">
            <span className="text-4xl font-serif font-black select-none">“</span>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-pink-50 rounded-xl text-pink-500 border border-pink-100">
                  <Flame className="w-4 h-4 animate-pulse" />
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                    Generative Quote of the Day
                  </h4>
                  <p className="text-[10px] text-pink-600 font-bold tracking-wider uppercase mt-1">
                    NEW & LIVE DAILY 🟡
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDailyQuote}
                disabled={quoteLoading}
                className="p-1 px-2.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Query Gemini for a new motivational quote"
              >
                <RefreshCw className={`w-3 h-3 ${quoteLoading ? "animate-spin" : ""}`} />
                Refill
              </button>
            </div>

            {quoteLoading ? (
              <div className="py-6 text-center text-xs text-gray-400 font-medium space-y-2 animate-pulse">
                <span className="block text-xl">✨</span>
                <span>Connecting server coordinates to synthesize fresh mental code...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <blockquote className="text-gray-800 text-sm md:text-base italic font-serif leading-relaxed pl-3 border-l-4 border-yellow-400">
                  "{quote.text}"
                </blockquote>
                
                <div className="text-right">
                  <cite className="text-xs font-black text-rose-600">— {quote.author}</cite>
                </div>

                {quote.reflection && (
                  <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100">
                    <div className="flex gap-2">
                      <span className="text-xs">💡</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase block">
                          Guide Reflection
                        </span>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          {quote.reflection}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {quote.milestoneAction && (
                  <div className="bg-yellow-50/70 rounded-2xl p-4 border border-yellow-100/80">
                    <div className="flex gap-2">
                      <span className="text-xs">🎯</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase block">
                          Today's Micro-Achievement
                        </span>
                        <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                          {quote.milestoneAction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Seeded via server datetime</span>
            <span className="flex items-center gap-0.5 text-pink-500 font-bold">
              <CheckCircle className="w-3.5 h-3.5 fill-pink-50 text-pink-500" /> Safe Sovereign Standard
            </span>
          </div>
        </div>

      </div>

      {/* 3. CORE CORE FOCUS: AI EMERGENCY COGNITIVE RECOVERY ASSISTANT FOR ALL AREAS */}
      <div id="ai_cognitive_recovery_segment" className="bg-white rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden">
        
        {/* Banner with attractive yellow-pink accent bar */}
        <div className="h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-indigo-500" />

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-widest bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-md font-mono">
                  MULTIMODAL SUPPORT HUB
                </span>
                <span className="text-[10px] font-extrabold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-md tracking-wider border border-yellow-100 font-mono">
                  GEMINI AI COGNITION
                </span>
              </div>
              <h3 className="text-xl font-black text-blue-950 tracking-tight leading-none pt-1">
                Sovereign Companion: AI Support to All Core Areas
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Click a category below to access customized prompts, counseling scripts, and trigger management guidelines handled on our secure server.
              </p>
            </div>

            <div className="space-y-1.5 md:text-right text-xs text-gray-400 font-semibold">
              <span className="flex items-center md:justify-end gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4 fill-emerald-50 text-emerald-600" /> Server Connection: Live
              </span>
              <p className="text-[10px] text-gray-400">Never exposes secrets to the browser</p>
            </div>
          </div>

          {/* Category Selector Rows */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { id: AddictionCategory.GENERAL, label: "General Care", icon: "🧠" },
              { id: AddictionCategory.GAMBLING, label: "Gambling", icon: "🎲" },
              { id: AddictionCategory.ALCOHOL, label: "Alcohol", icon: "🍺" },
              { id: AddictionCategory.DRUGS, label: "Chemicals", icon: "💊" },
              { id: AddictionCategory.NICOTINE, label: "Nicotine", icon: "💨" },
              { id: AddictionCategory.SEX, label: "Sex / Porn", icon: "🔒" },
              { id: AddictionCategory.TECH, label: "Social/Tech", icon: "📱" },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedAICategory(cat.id)}
                className={`py-3 px-2 text-xs rounded-2xl border text-center font-bold tracking-tight transition-all duration-150 cursor-pointer flex flex-col items-center gap-1 hover:scale-103 ${
                  selectedAICategory === cat.id
                    ? "bg-gradient-to-tr from-pink-50 via-rose-50 to-yellow-50/50 border-pink-400 text-slate-900 shadow-md ring-1 ring-pink-300"
                    : "bg-slate-50/65 border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* The Live Interactive Active Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Prompt Starter Panel (Vibrant & Helpful) */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-pink-50/40 border border-pink-100 p-4 rounded-2xl">
                <h5 className="text-[11px] font-black text-rose-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-sans">
                  <Lightbulb className="w-4 h-4 text-rose-500" /> Focus Starter Prompts
                </h5>
                <p className="text-[11px] text-gray-500 leading-normal mb-3 font-medium">
                  We compiled these critical psychological questions based on clinical recovery pathways for <strong>{selectedAICategory}</strong>:
                </p>

                <div className="space-y-1.5">
                  {(preFilledPrompts[selectedAICategory] || preFilledPrompts[AddictionCategory.GENERAL]).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendChatMessage(p)}
                      disabled={chatLoading}
                      className="w-full text-left p-2.5 bg-white border border-gray-150 hover:border-pink-300 hover:bg-pink-50/30 text-[11px] font-semibold text-gray-700 leading-normal rounded-xl transition-all cursor-pointer flex gap-1.5 group"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 duration-150" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed font-semibold">
                <span className="block text-slate-800 font-extrabold uppercase mb-1 tracking-wider text-[10px]">
                  CBT Reframing Blueprint
                </span>
                Addiction recovery requires addressing the behavioral cue, substituting the reward, and managing the initial 20-minute physical surge.
              </div>
            </div>

            {/* Right Chat Dialog Workspace */}
            <div className="lg:col-span-2 border border-gray-150 rounded-2xl flex flex-col justify-between bg-slate-50/50 h-[380px] overflow-hidden">
              
              {/* Header inside the chat indicating active scope */}
              <div className="bg-white border-b border-gray-150 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping shrink-0" />
                  <span className="text-xs font-black text-slate-800">
                    Sovereign Companion — {selectedAICategory} Recovery Guidance
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">Grounded in CBT</span>
              </div>

              {/* Chat turns */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-medium">
                {(chatMessages[selectedAICategory] || chatMessages[AddictionCategory.GENERAL]).map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl space-y-1.5 leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-slate-900 text-white font-semibold rounded-tr-none text-right"
                          : "bg-white border border-gray-150 text-slate-850 rounded-tl-none whitespace-pre-wrap shadow-xs"
                      }`}
                    >
                      <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">
                        {msg.sender === "user" ? "You" : "Sovereign Guide"}
                      </span>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-none p-4 max-w-[80%] flex items-center gap-2 text-slate-500">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
                      <span>The guide is typing therapeutic instruction...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input section */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage(userInput);
                }}
                className="bg-white border-t border-gray-150 p-2.5 flex gap-2"
              >
                <input
                  type="text"
                  value={userInput}
                  disabled={chatLoading}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={`Ask anything about ${selectedAICategory} trigger management...`}
                  className="flex-1 bg-slate-50 border border-gray-200 focus:border-pink-300 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 text-slate-800 font-medium"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !userInput.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
