import React, { useState, useEffect } from "react";
import { Quote, RefreshCw, Sparkles, Heart } from "lucide-react";

interface QuoteData {
  text: string;
  author: string;
  reflection?: string;
  milestoneAction?: string;
}

const FALLBACK_QUOTES: QuoteData[] = [
  {
    text: "Sovereignty is not about never failing; it is about reclaiming the power to rule your own mind.",
    author: "Sovereign Guide",
    reflection: "Your past behavior was not your core character. It was an automatic pain-relief system.",
    milestoneAction: "Sit with cold water for 2 minutes and focus purely on your breath."
  },
  {
    text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
    author: "Socrates",
    reflection: "Resistance alone drains willpower. Building positive, healthy alternatives crowds out the old craving patterns.",
    milestoneAction: "Take a 10-minute walk without your digital screen present."
  }
];

export default function DailyQuote() {
  const [quote, setQuote] = useState<QuoteData>(FALLBACK_QUOTES[0]);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-quote");
      if (!res.ok) {
        throw new Error("API response error");
      }
      const data = await res.json();
      if (data && data.text && data.author) {
        setQuote({
          text: data.text,
          author: data.author,
          reflection: data.reflection,
          milestoneAction: data.milestoneAction
        });
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.warn("Failed to fetch quote from server, using fallback recovery quote:", err);
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      setQuote(FALLBACK_QUOTES[randomIndex]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div id="daily_inspirational_quote_section" className="bg-white rounded-3xl border-2 border-pink-100 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Decorative accent background */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-pink-50/40 rounded-bl-full pointer-events-none flex items-center justify-end p-4 text-pink-100 select-none">
        <Quote className="w-12 h-12 rotate-180" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-pink-100/60 rounded-xl text-rose-600 border border-pink-200">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
              Daily Recovery Motivation
            </h4>
            <p className="text-[9px] text-pink-600 font-bold tracking-wider uppercase mt-0.5">
              Refreshed Daily 🟡
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchQuote}
          disabled={loading}
          type="button"
          title="Refill inspiration"
          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-pink-50 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Quote display */}
      <div className="space-y-4 relative z-10">
        <blockquote className="text-gray-800 text-sm md:text-base italic font-serif leading-relaxed px-1 border-l-4 border-yellow-400 pl-3">
          "{quote.text}"
        </blockquote>
        
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-black text-rose-600">
            — {quote.author}
          </span>
          
          <span className="flex items-center gap-1 text-[10px] text-yellow-800 bg-yellow-100 px-2.5 py-1 rounded-md border border-yellow-200 font-bold">
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            <span>Stay Sovereign</span>
          </span>
        </div>

        {quote.reflection && (
          <div className="bg-pink-50/50 rounded-2xl p-3 border border-pink-100/80 text-[11px] text-slate-700 leading-normal">
            <span className="font-extrabold text-rose-700 block uppercase tracking-wider text-[9px] mb-1">Guide Reflection</span>
            {quote.reflection}
          </div>
        )}

        {quote.milestoneAction && (
          <div className="bg-yellow-50/60 rounded-2xl p-3 border border-yellow-150 text-[11px] text-slate-800 font-semibold leading-normal">
            <span className="font-extrabold text-amber-800 block uppercase tracking-wider text-[9px] mb-1">Today's Micro-Achievement</span>
            {quote.milestoneAction}
          </div>
        )}
      </div>
    </div>
  );
}
