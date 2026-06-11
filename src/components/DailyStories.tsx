import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  RefreshCw, 
  User, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Compass
} from "lucide-react";
import { AddictionCategory } from "../types";

interface StoryData {
  title: string;
  addictionType: string;
  realLifeSituation: string;
  cognitiveTrap: string;
  sovereignSolution: string;
  keyTakeaway: string;
}

export default function DailyStories({ 
  initialCategory = AddictionCategory.GENERAL 
}: { 
  initialCategory?: AddictionCategory;
}) {
  const [selectedCategory, setSelectedCategory] = useState<AddictionCategory>(initialCategory);
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDailyStory();
  }, [selectedCategory]);

  const fetchDailyStory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-stories?category=${encodeURIComponent(selectedCategory)}`);
      if (res.ok) {
        const data = await res.json();
        setStory(data);
      } else {
        throw new Error("Story lookup failed");
      }
    } catch (err) {
      console.warn("Failed fetching story, using default dynamic generator:", err);
      // Fail-safe default matching look
      setStory({
        title: "The Midnight Reset Routine",
        addictionType: selectedCategory,
        realLifeSituation: "An individual faced a severe compulsive surge late in the evening when exhaustion lowered their cognitive willpower. The sudden physical craving pattern felt deeply automated.",
        cognitiveTrap: "The 'Just Once' illusion: Whispering that starting over tomorrow is easy and that tonight's lapse won't undo previous milestone stakes.",
        sovereignSolution: "They immediately drank a full glass of cold lemon water, transferred 50sh to their accountability ledger, and text-checked their focal anchor teammate.",
        keyTakeaway: "Disrupt physical automatic cue sequences within 15 seconds to empower cognitive choice."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="daily_stories_container" className="bg-white rounded-3xl border-2 border-yellow-150 p-6 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Decorative Warm Yellow Glow Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-105 rounded-bl-full pointer-events-none select-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2.5 bg-pink-100 text-rose-700 font-extrabold uppercase tracking-wider text-[9px] rounded-lg border border-pink-200">
              Live Story Persona 🟡
            </span>
            <span className="text-[9px] font-bold text-gray-500 font-mono">UPDATED DAILY</span>
          </div>
          <h3 className="font-extrabold text-slate-905 text-base md:text-lg tracking-tight flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-yellow-600" />
            Daily Real-Life Sovereign Stories
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Read true biographical scenarios and solutions for any core category.
          </p>
        </div>

        {/* Refill Button */}
        <button
          onClick={fetchDailyStory}
          disabled={loading}
          className="p-1.5 px-3 bg-pink-50 hover:bg-pink-100 text-rose-700 hover:text-rose-800 disabled:opacity-50 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 transition-all self-start md:self-auto"
          title="Regenerate dynamic story"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refill Daily Story
        </button>
      </div>

      {/* Categories Toggle Row inside Ledger */}
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {[
          { id: AddictionCategory.GENERAL, label: "General Care" },
          { id: AddictionCategory.GAMBLING, label: "Gambling" },
          { id: AddictionCategory.ALCOHOL, label: "Alcohol" },
          { id: AddictionCategory.DRUGS, label: "Chemicals" },
          { id: AddictionCategory.NICOTINE, label: "Nicotine" },
          { id: AddictionCategory.SEX, label: "Sex / Porn" },
          { id: AddictionCategory.TECH, label: "Social/Tech" }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-[11px] font-black rounded-xl border transition-all cursor-pointer ${
              selectedCategory === cat.id 
                ? "bg-yellow-400 border-yellow-500 text-slate-950 shadow-xs" 
                : "bg-slate-50 text-gray-500 border-gray-100 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Story Container with Pink Highlights */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400 font-bold space-y-2 animate-pulse">
          <span className="block text-xl">✨</span>
          <span>Connecting live persona coordinates to fetch fresh real-world solutions...</span>
        </div>
      ) : story ? (
        <div className="space-y-4 relative z-10">
          
          {/* Header Card */}
          <div className="bg-gradient-to-tr from-pink-50 via-white to-yellow-50/50 rounded-2xl p-4 border border-pink-100 flex items-start gap-3">
            <span className="p-2.5 bg-yellow-300/60 rounded-xl text-slate-800 font-bold shrink-0 text-sm">
              🔑
            </span>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-pink-600 tracking-wider">
                Sovereign Situation: {story.addictionType}
              </span>
              <h4 className="text-sm md:text-base font-black text-slate-900 leading-snug">
                {story.title}
              </h4>
            </div>
          </div>

          {/* Real Situation Content Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2">
              <h5 className="text-[10px] uppercase tracking-widest font-black text-gray-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-pink-500" />
                The Real Life Situation
              </h5>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                {story.realLifeSituation}
              </p>
            </div>

            <div className="bg-rose-50/30 border border-rose-100/60 rounded-2xl p-4.5 space-y-2">
              <h5 className="text-[10px] uppercase tracking-widest font-black text-rose-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                The Mind's Cognitive Trap
              </h5>
              <p className="text-xs text-rose-900 leading-relaxed font-bold italic">
                "{story.cognitiveTrap}"
              </p>
            </div>

          </div>

          {/* Dynamic Solution with Yellow Highlights */}
          <div className="bg-yellow-50/70 border-2 border-yellow-150 rounded-2xl p-4.5 space-y-2">
            <h5 className="text-[10px] uppercase tracking-widest font-black text-amber-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              Sovereign Solution (How they overcame it)
            </h5>
            <p className="text-xs text-slate-800 leading-relaxed font-extrabold">
              {story.sovereignSolution}
            </p>
          </div>

          {/* Key Actionable Takeaway */}
          <div className="bg-white border border-gray-100 text-center rounded-2xl p-3 text-[11px] text-gray-400 font-bold flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-405 rounded-full animate-ping" />
            <span>Takeaway Lesson: <strong className="text-slate-800">{story.keyTakeaway}</strong></span>
          </div>

        </div>
      ) : (
        <div className="p-4 text-center text-xs text-gray-400">
          No stories generated for this category today. Try refreshing.
        </div>
      )}

    </div>
  );
}
