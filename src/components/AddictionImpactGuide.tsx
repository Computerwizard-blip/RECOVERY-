import React, { useState } from "react";
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Brain, 
  Heart, 
  CheckCircle, 
  Bookmark, 
  ExternalLink,
  Smartphone,
  Gauge
} from "lucide-react";
import { AddictionCategory } from "../types";

interface SystemDetail {
  title: string;
  effects: string[];
  symptoms: string[];
  remedies: string[];
  psychology: string;
}

const IMPACT_METADATA: Record<AddictionCategory, SystemDetail> = {
  [AddictionCategory.DRUGS]: {
    title: "Overcoming Chemical & Opioid Reliance",
    effects: [
      "Hijacks the mesolimbic dopamine pathway, causing severe receptor down-regulation (anhedonia).",
      "Degrades prefrontal cortex gray matter, directly weakening structural impulse control centers.",
      "Creates systemic neuroinflammation, inducing severe memory fog and cognitive deceleration.",
      "Destabilizes cardiovascular function and autonomic nervous system regulation."
    ],
    symptoms: [
      "Severe acute withdrawal anxiety, physical sensory shaking, and intense neural craving spikes.",
      "Compulsive search behaviors coupled with complete loss of natural reward responsiveness."
    ],
    remedies: [
      "Implement strict Cue Avoidance: mapped cues (locations, people) must be systematically cataloged and avoided.",
      "Apply 'Urge Surfing' (Jon Kabat-Zinn CBT model): Accept the craving wave as a physiological peak that recedes within 20-30 mins without action.",
      "Somatic re-centering: Diaphragmatic box breathing (4s in, 4s hold, 4s out, 4s hold) to stabilize autonomic panic."
    ],
    psychology: "Synthetic chemical consumption artificially saturates synaptic clefts. Re-establishing chemical equilibrium requires progressive, deliberate cue restructuring and neuroplastic rest."
  },
  [AddictionCategory.ALCOHOL]: {
    title: "Overcoming Chronic Alcohol Dependence",
    effects: [
      "Suppresses natural GABA transmission, leading to severe rebound glutamate hyperactivity when dry.",
      "Causes chronic brain shrinkage, cellular dehydration, and disrupts critical REM sleep architectures.",
      "Impairs liver metabolic cycles, creating systemic toxicity that affects brain-gut neurochemistry.",
      "Erodes emotional self-regulation, turning minor external stress into immediate physical cues."
    ],
    symptoms: [
      "Morning physiological tremors, hot flashes, acute sensory sensitivity, and mental dread loops."
    ],
    remedies: [
      "Universal application of the HALT trigger model: Hungry, Angry, Lonely, Tired check-ins.",
      "Cognitive restructuring of the 'relief' illusion: writing down the objective physical hangover records during cravings.",
      "Electrolyte replenishment, high-fidelity dietary monitoring, and structured group accountability boards."
    ],
    psychology: "Alcohol operates as a powerful central nervous system depressant. Healing requires soothing glutamate over-excitation through high-fidelity, orderly, calm daily environments."
  },
  [AddictionCategory.SEX]: {
    title: "Overcoming Sex, Pornography & Intimacy Compulsions",
    effects: [
      "Conditions the brain to hyper-stimulated visual novelty, desensitizing reward responses to normal relations.",
      "Erodes authentic neural attachment mechanisms by separating physical arousal from socio-emotional bonds.",
      "Induces a severe post-orgasmic shame feedback cycle that triggers secondary depressive episodes.",
      "Creates dissociative escapism patterns when handling professional or marital stress."
    ],
    symptoms: [
      "Compulsive online screen-seeking, hours spent in isolation, and progressive real-world intimacy detachment."
    ],
    remedies: [
      "Digital hygiene: Establish browser-level locks and keep screen-time in highly public, social rooms.",
      "Acknowledge the stress-escape trigger cycle: replace visual escapes with intense physical workout or cold exposure therapy.",
      "Somatic emotional grounding: Writing vulnerability logs to identify underlying social isolation."
    ],
    psychology: "Intimacy addiction relies on compulsive stress-avoidance. Recovery focuses on rebuilding dopamine sensitivity to slow, healthy, authentic human connections."
  },
  [AddictionCategory.GENERAL]: {
    title: "Overcoming General Behavioral & Process Addictions",
    effects: [
      "Conditions the striatum through random variable-reward schedules (such as gambling or infinite feeds).",
      "Shortens human attention span, reducing tolerance for healthy, productive delayed-gratification tasks.",
      "Impairs systemic financial boundaries and triggers complex relationship trust breakdowns."
    ],
    symptoms: [
      "Anxious physical checking patterns, mental distress when separated from tools, and obsessive escapism."
    ],
    remedies: [
      "The '10-Minute Intervene Rule': postpone the habit loop by 10 minutes, forcing prefrontal cortex override.",
      "Habit-Loop Disruption: swap the reward mechanism of the compulsive cue with an active, high-intensity exercise.",
      "Establish strict micro-financial stakes and daily check-ins to make failure transparent."
    ],
    psychology: "Process addictions hijack natural exploratory circuits. Restructuring requires intentional tactile delays, digital sobriety boundaries, and clear progress visibility."
  }
};

export default function AddictionImpactGuide() {
  const [selectedCat, setSelectedCat] = useState<AddictionCategory>(AddictionCategory.GENERAL);
  const [readAcknowledge, setReadAcknowledge] = useState<Record<string, boolean>>({});

  const activeData = IMPACT_METADATA[selectedCat];

  const handleToggleAcknowledge = (key: string) => {
    setReadAcknowledge(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getThemeClasses = (cat: AddictionCategory) => {
    switch (cat) {
      case AddictionCategory.DRUGS:
        return {
          primaryBg: "bg-rose-50 border-rose-100 text-rose-800",
          accentColor: "text-rose-500",
          borderHover: "hover:border-rose-300",
          activeTab: "bg-rose-600 text-white border-rose-600"
        };
      case AddictionCategory.ALCOHOL:
        return {
          primaryBg: "bg-amber-50 border-amber-100 text-amber-800",
          accentColor: "text-amber-500",
          borderHover: "hover:border-amber-300",
          activeTab: "bg-amber-600 text-slate-950 border-amber-600"
        };
      case AddictionCategory.SEX:
        return {
          primaryBg: "bg-violet-50 border-violet-100 text-violet-800",
          accentColor: "text-violet-500",
          borderHover: "hover:border-violet-300",
          activeTab: "bg-violet-600 text-white border-violet-600"
        };
      default:
        return {
          primaryBg: "bg-indigo-50 border-indigo-100 text-indigo-800",
          accentColor: "text-indigo-500",
          borderHover: "hover:border-indigo-300",
          activeTab: "bg-slate-900 text-white border-slate-900"
        };
    }
  };

  const theme = getThemeClasses(selectedCat);

  return (
    <div id="addiction_impact_medical_guide" className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50 pb-5 mb-5">
        <div className="space-y-1">
          <h3 className="font-extrabold text-blue-950 text-base md:text-lg tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
            Addiction Science & Recovery Toolkit
          </h3>
          <p className="text-xs text-gray-500">
            Select an addiction pathway to inspect physiological impacts and clinical Cognitive Behavioral Therapy (CBT) rewiring steps.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 shrink-0">
          {(Object.keys(IMPACT_METADATA) as AddictionCategory[]).map((cat) => {
            const catTheme = getThemeClasses(cat);
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                type="button"
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  isSelected ? catTheme.activeTab : "bg-gray-50 border-gray-150 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat} Core
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Core Neuropsychology Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-4 rounded-2xl border ${theme.primaryBg} space-y-3`}>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4.5 h-4.5 shrink-0" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Clinical Neuropsychology</h4>
            </div>
            <p className="text-xs leading-relaxed font-serif italic text-gray-800">
              "{activeData.psychology}"
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Diagnostics Framework</span>
            <div className="space-y-2">
              {activeData.symptoms.map((sym, idx) => (
                <div key={idx} className="flex gap-2 items-start shrink-0 text-xs text-slate-700 leading-normal">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Effects & Action-oriented Remedies */}
        <div className="lg:col-span-8 space-y-5">
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Physiological & Psychological Toll:
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeData.effects.map((effect, idx) => {
                const ackKey = `${selectedCat}_effect_${idx}`;
                const isAck = !!readAcknowledge[ackKey];
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleToggleAcknowledge(ackKey)}
                    className={`p-3.5 border rounded-xl cursor-copy transition-all flex items-start gap-2.5 ${
                      isAck 
                        ? "bg-emerald-50/40 border-emerald-200 text-emerald-950" 
                        : "bg-white border-gray-100 text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    <CheckCircle className={`w-4.5 h-4.5 mt-0.5 shrink-0 transition-colors ${isAck ? "text-emerald-600 fill-emerald-100" : "text-gray-300"}`} />
                    <span className="text-xs leading-relaxed font-medium">{effect}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
              Sovereign Clinical Rewiring Strategies (CBT):
            </h4>

            <div className="space-y-2.5">
              {activeData.remedies.map((remedy, idx) => {
                const ackKey = `${selectedCat}_remedy_${idx}`;
                const isAck = !!readAcknowledge[ackKey];
                return (
                  <div 
                    key={idx}
                    onClick={() => handleToggleAcknowledge(ackKey)}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isAck 
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" 
                        : "bg-slate-50/50 border-slate-100 text-gray-800 hover:border-gray-200"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAck ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-indigo-950">
                        {remedy.split(":")[0]}:
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {remedy.split(":").slice(1).join(":")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <span className="flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-indigo-600" />
          Keep your medical tracking updated to build cognitive resilience.
        </span>
        <span className="font-mono text-[10px] bg-slate-100 py-1 px-2.5 rounded-md text-slate-600 font-bold">
          CBT REWIRING METRIC: SYSTEMATIC CUE STABILIZATION
        </span>
      </div>

    </div>
  );
}
