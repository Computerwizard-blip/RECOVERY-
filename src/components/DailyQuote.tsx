import React, { useState, useEffect } from "react";
import { Quote, RefreshCw, Sparkles, Heart } from "lucide-react";

interface QuoteData {
  text: string;
  author: string;
}

const FALLBACK_QUOTES: QuoteData[] = [
  {
    text: "Sovereignty is not about never failing; it is about reclaiming the power to rule your own mind.",
    author: "Sovereign Guide"
  },
  {
    text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
    author: "Socrates"
  },
  {
    text: "Recovery is an acceptance that your life is in your hands, and you have the strength to heal.",
    author: "Clinical Research Board"
  },
  {
    text: "Do not let the shadows of yesterday block the light of your tomorrow. Walk the sovereign path.",
    author: "Anonymous Supporter"
  },
  {
    text: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi"
  }
];

export default function DailyQuote() {
  const [quote, setQuote] = useState<QuoteData>(FALLBACK_QUOTES[0]);
  const [loading, setLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Fetching from dummyjson which is highly robust and has CORS enabled.
      const res = await fetch("https://dummyjson.com/quotes/random");
      if (!res.ok) {
        throw new Error("API response error");
      }
      const data = await res.json();
      if (data && data.quote && data.author) {
        setQuote({
          text: data.quote,
          author: data.author
        });
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.warn("Failed to fetch quote from API, using fallback recovery quote:", err);
      // Select a random recovery fallback quote to maintain recovery mindset strictly
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
    <div id="daily_inspirational_quote_section" className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Decorative accent background */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50/40 rounded-bl-full pointer-events-none flex items-center justify-end p-4 text-indigo-100 select-none">
        <Quote className="w-12 h-12 rotate-180" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
            Daily Recovery Mindset
          </h4>
        </div>
        
        <button
          onClick={fetchQuote}
          disabled={loading}
          type="button"
          title="Refill inspiration"
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Quote display */}
      <div className="space-y-3 relative z-10">
        <p className="text-gray-800 text-sm md:text-base italic font-serif leading-relaxed px-1">
          "{quote.text}"
        </p>
        
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-500 font-medium">
            — {quote.author}
          </span>
          
          <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            <span>Stay Sovereign</span>
          </span>
        </div>
      </div>
    </div>
  );
}
