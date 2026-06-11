import React, { useState, useRef, useEffect } from "react";
import { UserProfile, AddictionCategory } from "../types";
import { 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Info, 
  RotateCcw, 
  MessageSquareHeart, 
  Activity, 
  HeartHandshake,
  User,
  BadgeAlert
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "guide";
  text: string;
  timestamp: string;
}

interface CBTGuideChatProps {
  profile: UserProfile;
}

export default function CBTGuideChat({ profile }: CBTGuideChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "guide",
      text: `Greetings. I am **Sovereign Guide**, your dedicated therapeutic companion. 

Recovery requires courage, and you have taken a monumental step just by being here. How are you feeling today? If you are facing an active craving or emotional challenge, type what's on your mind. 

I can also guide you through specialized exercises. Try a quick-preset below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine tiers based on subscription stakes
  const currentStakes = profile.subscriptionBalance;
  const isLocked = currentStakes < 150 && sessionCount >= 3;
  const currentTier = currentStakes >= 300 
    ? "Premium Therapist Support" 
    : currentStakes >= 150 
    ? "Standard Support Tier" 
    : "Starter Care Tier (3 Sessions)";

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    if (isLocked) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setSessionCount(prev => prev + 1);

    try {
      // Build request body matching the server.ts endpoint expects
      const response = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ sender: m.sender, text: m.text })), { sender: "user", text: textToSend }],
          category: profile.addictionFocus
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with Counselor Server.");
      }

      const data = await response.json();
      
      const guideMsg: Message = {
        id: Math.random().toString(),
        sender: "guide",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, guideMsg]);
    } catch (err) {
      console.error("CBT Guide Chat Error:", err);
      const errMsg: Message = {
        id: Math.random().toString(),
        sender: "guide",
        text: "I am having temporary trouble transmitting counselor advice. Ensure you have stable network. In the meantime, focus on slow, controlled breaths in through your nose for 4 seconds, and out your mouth for 6 seconds.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  return (
    <div id="cbt_guide_chat_container" className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      
      {/* sidebar guide status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between lg:col-span-1">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h4 className="font-semibold text-gray-800">Counselor Status</h4>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-indigo-50/50 rounded-xl">
              <div className="text-xs text-indigo-700 font-bold uppercase tracking-wider mb-0.5">CURRENT LEVEL</div>
              <div className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
                {currentTier}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-500 block">Personal Profile Cues</span>
              <div className="text-xs text-gray-600 space-y-1.5 font-mono">
                <div className="p-2 bg-gray-50 rounded">Focus: <span className="text-slate-900 font-bold">{profile.addictionFocus}</span></div>
                <div className="p-2 bg-gray-50 rounded">Sustained Streak: <span className="text-emerald-700 font-bold">{profile.streakDays} days</span></div>
                <div className="p-2 bg-gray-50 rounded">Active Stakes: <span className="text-blue-700 font-bold">{currentStakes} / 300sh</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          {currentStakes < 300 ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed">
              <span className="font-bold flex items-center gap-1 mb-1 text-amber-900">
                <BadgeAlert className="w-3.5 h-3.5" /> Close to Premium Therapy!
              </span>
              You have staked {currentStakes}sh. Unlocking the 300sh target clears infinite counselor conversations and CBT drills.
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin-slow" /> Premium Therapy Unlocked
            </div>
          )}
          <button 
            onClick={() => setMessages(prev => [prev[0]])}
            type="button" 
            className="w-full py-1.5 text-xs text-gray-500 hover:text-slate-800 flex items-center justify-center gap-1 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear chat records
          </button>
        </div>
      </div>

      {/* main chat screen container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden lg:col-span-3 h-full">
        
        {/* chat messages flow */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`p-2 rounded-xl text-xs shrink-0 ${
                m.sender === "user" ? "bg-slate-900 text-slate-100" : "bg-indigo-50 text-indigo-900"
              }`}>
                {m.sender === "user" ? <User className="w-4 h-4" /> : <MessageSquareHeart className="w-4 h-4" />}
              </div>

              <div>
                <div className={`rounded-2xl p-3.5 text-sm shadow-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none whitespace-pre-wrap"
                }`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
              <div className="p-2 rounded-xl text-xs shrink-0 bg-indigo-50 text-indigo-900">
                <MessageSquareHeart className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="rounded-2xl p-3.5 text-sm bg-white text-gray-500 border border-gray-100 rounded-tl-none flex items-center gap-1.5">
                  <span className="font-serif italic text-xs animate-pulse">Sovereign Guide is formulating response</span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* lock layer overlay */}
        {isLocked ? (
          <div className="p-6 bg-slate-900 text-slate-100 border-t border-slate-800 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <h5 className="font-bold text-gray-100 text-sm">Monthly Stakes Unlocks Professional Counseling</h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your starter daily counselor sessions are complete. To unlock complete unbounded conversation, cognitive exercises, and secure relapse coping tools, please stake at least **150sh** towards your monthly membership goals.
            </p>
          </div>
        ) : (
          /* input forms and triggers */
          <div className="p-3.5 bg-white border-t border-gray-100 space-y-3">
            
            {/* Quick Actions preset suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 select-none no-scrollbar text-xs">
              <span className="text-gray-400 shrink-0 font-medium">Quick Drills:</span>
              <button
                type="button"
                onClick={() => handleQuickAction("I have an active craving right now. Guide me through urge surfing.")}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 px-3 py-1 rounded-full shrink-0 font-semibold cursor-pointer"
              >
                🚨 Active Craving!
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction("Teach me the HALT sensory countdown for emotional control.")}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full shrink-0 font-semibold cursor-pointer"
              >
                🧘 HALT Drill
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction("Give me cognitive breathing exercises to calm panic or distress.")}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full shrink-0 font-semibold cursor-pointer"
              >
                💨 Deep Breathing
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={isLocked ? "Stakes targets needed to unlock chat" : "Message Sovereign Guide..."}
                disabled={loading || isLocked}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 py-2.5 px-4 text-sm bg-gray-100/75 focus:bg-white rounded-xl border border-transparent focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400 font-medium text-slate-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || isLocked}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold p-2.5 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
