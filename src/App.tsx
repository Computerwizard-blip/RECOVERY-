import React, { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from "@firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "@firebase/firestore";
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { 
  UserProfile, 
  AddictionCategory 
} from "./types";
import StakesTracker from "./components/StakesTracker";
import CBTGuideChat from "./components/CBTGuideChat";
import CommunitySupport from "./components/CommunitySupport";
import EducationalLibrary from "./components/EducationalLibrary";
import DailyQuote from "./components/DailyQuote";

import { 
  Activity, 
  Sparkles, 
  LogOut, 
  BookHeart, 
  Flame, 
  Calendar, 
  ShieldCheck, 
  HelpCircle, 
  TrendingUp, 
  Lock,
  User as UserIcon,
  BookOpen,
  MessageSquare,
  Coins
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "stakes" | "forum" | "therapist" | "resources">("dashboard");
  
  // Local profile customization state
  const [aliasInput, setAliasInput] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<AddictionCategory>(AddictionCategory.GENERAL);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Monitor user authentication transitions
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserProfile = async (firebaseUser: User) => {
    const profilePath = `user_profiles/${firebaseUser.uid}`;
    try {
      const docRef = doc(db, "user_profiles", firebaseUser.uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const existingProfile: UserProfile = {
          userId: data.userId,
          alias: data.alias || "Sovereign Companion",
          addictionFocus: (data.addictionFocus as AddictionCategory) || AddictionCategory.GENERAL,
          streakDays: data.streakDays || 0,
          lastCheckIn: data.lastCheckIn || "",
          subscriptionBalance: data.subscriptionBalance || 0,
          joinedAt: data.joinedAt || new Date().toISOString()
        };
        setProfile(existingProfile);
        setAliasInput(existingProfile.alias);
        setSelectedFocus(existingProfile.addictionFocus);
        
        // check if checked in recently
        if (existingProfile.lastCheckIn) {
          const lastDate = new Date(existingProfile.lastCheckIn).toDateString();
          const todayDate = new Date().toDateString();
          setCheckedInToday(lastDate === todayDate);
        }
      } else {
        // Create user initial persistent profile doc
        const defaultProfile: UserProfile = {
          userId: firebaseUser.uid,
          alias: `Companion_${Math.floor(1000 + Math.random() * 9000)}`,
          addictionFocus: AddictionCategory.GENERAL,
          streakDays: 0,
          lastCheckIn: "",
          subscriptionBalance: 0,
          joinedAt: new Date().toISOString()
        };

        await setDoc(docRef, defaultProfile)
          .catch(err => handleFirestoreError(err, OperationType.CREATE, profilePath));
        
        setProfile(defaultProfile);
        setAliasInput(defaultProfile.alias);
        setSelectedFocus(defaultProfile.addictionFocus);
      }
    } catch (err) {
      console.error("Critical Profile Synchronization Error:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !aliasInput.trim()) return;

    const profilePath = `user_profiles/${user.uid}`;
    try {
      const docRef = doc(db, "user_profiles", user.uid);
      await updateDoc(docRef, {
        alias: aliasInput,
        addictionFocus: selectedFocus
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, profilePath));

      setProfile(prev => prev ? { ...prev, alias: aliasInput, addictionFocus: selectedFocus } : null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to commit profile updates:", err);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!user || !profile || checkedInToday) return;

    const profilePath = `user_profiles/${user.uid}`;
    try {
      const docRef = doc(db, "user_profiles", user.uid);
      const nextStreak = profile.streakDays + 1;
      const todayISO = new Date().toISOString();

      await updateDoc(docRef, {
        streakDays: nextStreak,
        lastCheckIn: todayISO
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, profilePath));

      setProfile(prev => prev ? { ...prev, streakDays: nextStreak, lastCheckIn: todayISO } : null);
      setCheckedInToday(true);
    } catch (err) {
      console.error("Check-in update failed:", err);
    }
  };

  const handleAuthLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("External Authentication Popup Failed:", err);
      if (err.code === "auth/popup-closed-by-user" || err.message?.includes("popup-closed-by-user")) {
        setAuthError("The sign-in popup was closed before completing authentication. Please click sign-in and keep the window open to finish logging in.");
      } else {
        setAuthError("Failed to sign in. Please verify your connection and try again.");
      }
    }
  };

  const handleAuthLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Auth SignOut Session Failed:", err);
    }
  };

  const handlePaymentCompleted = (newBalance: number) => {
    setProfile(prev => prev ? { ...prev, subscriptionBalance: newBalance } : null);
  };

  return (
    <div id="sovereign_core_layout" className="min-h-screen bg-[#fafafc] flex flex-col font-sans select-none antialiased text-gray-900">
      
      {/* premium elegant header banner */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white rounded-xl shadow-md cursor-pointer flex items-center">
              <BookHeart className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-extrabold text-blue-950 text-base md:text-lg tracking-tight leading-none">
                Sovereign path
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Addiction Recovery Alliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full px-3 py-1 font-mono text-xs font-bold shadow-xs">
                <Flame className="w-4 h-4 animate-bounce" />
                <span>{profile.streakDays} Day Streak</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-900">{profile?.alias || "Sovereign Companion"}</p>
                  <p className="text-[10px] text-gray-400 font-mono italic">{user.email}</p>
                </div>
                <button
                  onClick={handleAuthLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-gray-100"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthLogin}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" /> Sign In securely
              </button>
            )}
          </div>

        </div>
      </header>

      {/* primary body segment */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {!user ? (
          /* unauthorized Landing Panel */
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm mt-12">
            <div className="space-y-4">
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex mx-auto items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Compassionate Path Forward
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                Reclaim Sovereignty From Addiction
              </h2>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-lg mx-auto">
                Clean, encouraging educational platform tailored for people seeking recovery from drugs, sex compulsions, or alcohol addiction. 
              </p>
            </div>

            {/* features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-left max-w-lg mx-auto">
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <BookOpen className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-gray-900 text-xs uppercase mb-1">CBT Resources</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Scientific rewiring biology and chemical cues education.</p>
              </div>
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <MessageSquare className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-bold text-gray-900 text-xs uppercase mb-1">Community Support</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Global supportive forums using protected, private aliases.</p>
              </div>
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <Coins className="w-5 h-5 text-amber-600 mb-2" />
                <h4 className="font-bold text-gray-900 text-xs uppercase mb-1">Small Stakes</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Budget-friendly 300sh progress locks split over simple weeks.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 space-y-3">
              {authError && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between max-w-lg mx-auto text-left">
                  <span className="font-medium">{authError}</span>
                  <button onClick={() => setAuthError(null)} className="ml-2 font-bold text-amber-700 hover:text-amber-950 shrink-0 cursor-pointer">Dismiss</button>
                </div>
              )}
              <button
                onClick={handleAuthLogin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3 rounded-2xl shadow-md transition-all cursor-pointer text-sm w-full sm:w-auto"
              >
                Get Started Anonymously
              </button>
              <p className="text-[10px] text-gray-400 font-medium">
                Uses Google Single Sign-In to secure your ledger, whilst maintaining total anonymous forums integrity.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="py-24 text-center text-sm text-gray-400">Syncing secure connection parameters...</div>
        ) : (
          /* Authorized user interface board and workspaces */
          <div className="space-y-6">
            
            {/* navigation tabs row */}
            <nav className="flex items-center gap-1 overflow-x-auto pb-1 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-xs select-none no-scrollbar">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "dashboard"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Activity className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab("stakes")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "stakes"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Coins className="w-4 h-4" /> Small Stakes
              </button>
              <button
                onClick={() => setActiveTab("forum")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "forum"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Alliance Forum
              </button>
              <button
                onClick={() => setActiveTab("therapist")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "therapist"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Sparkles className="w-4 h-4" /> CBT Coach Q&A
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "resources"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Learning Library
              </button>
            </nav>

            {/* active tab view rendering */}
            <div id="active-panel" className="transition-all duration-300">
              
              {activeTab === "dashboard" && profile && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* core dashboard summary container */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* clean streaks checkin widget */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1.5 text-center md:text-left">
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                          DAILY VIGILANCE ACCOUNTABILITY
                        </span>
                        <h3 className="font-extrabold text-slate-950 text-xl tracking-tight leading-none pt-1">
                          Declare Sobriety Milestone
                        </h3>
                        <p className="text-xs text-gray-500 max-w-md">
                          Check in once every passing day to celebrate self-sovereignty. Your consecutive streak locks securely on your cloud ledger.
                        </p>
                      </div>

                      <button
                        onClick={handleDailyCheckIn}
                        disabled={checkedInToday}
                        className={`font-semibold px-6 py-3 rounded-2xl text-xs transition-all tracking-wide cursor-pointer w-full md:w-auto text-center ${
                          checkedInToday 
                            ? "bg-emerald-50 text-emerald-700 cursor-default font-bold border border-emerald-100" 
                            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold shadow-sm hover:from-orange-600 hover:to-amber-600"
                        }`}
                      >
                        {checkedInToday ? "✓ Checked Sobriety Today" : "Declare Sobriety (+1 Day)"}
                      </button>
                    </div>

                    {/* Daily Inspirational Quote Section */}
                    <DailyQuote />

                    {/* recovery customizable onboarding settings checklist */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-1.5">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Customize Your Support Profile
                      </h3>

                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Protect Alias (Forum Display)</label>
                            <input
                              type="text"
                              value={aliasInput}
                              onChange={(e) => setAliasInput(e.target.value)}
                              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium text-slate-900"
                              placeholder="Choose an alias..."
                              maxLength={40}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Focus Addiction Focus</label>
                            <select
                              value={selectedFocus}
                              onChange={(e) => setSelectedFocus(e.target.value as AddictionCategory)}
                              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium text-slate-900"
                            >
                              <option value={AddictionCategory.DRUGS}>Overcoming Chemical / Drugs reliance</option>
                              <option value={AddictionCategory.ALCOHOL}>Overcoming Alcohol depedence</option>
                              <option value={AddictionCategory.SEX}>Overcoming Sex / Porn addiction</option>
                              <option value={AddictionCategory.GENERAL}>General multi-layer recovery</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="submit"
                            className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                          >
                            Save Settings
                          </button>
                          {saveSuccess && (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" /> Cloud ledger synced successfully.
                            </span>
                          )}
                        </div>
                      </form>
                    </div>

                  </div>

                  {/* sidebar stakes bento progress dashboard summary */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider flex items-center gap-1">
                        <Coins className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" /> Monthly stakes Progress
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                        Monthly support fee of 300sh split into convenient, budget-friendly stakes contributions.
                      </p>

                      <div className="p-4 bg-indigo-50/50 rounded-2xl mb-4 text-center">
                        <div className="text-3xl font-extrabold text-blue-950">{profile.subscriptionBalance}sh</div>
                        <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mt-1">Stakes Deposited</div>
                      </div>

                      <div className="space-y-2 mt-4 text-xs text-gray-600">
                        <div className="flex justify-between font-medium">
                          <span>Starter (0sh)</span>
                          <span className={profile.subscriptionBalance >= 0 ? "font-bold text-emerald-600" : "text-gray-400"}>Active</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Standard Support (150sh)</span>
                          <span className={profile.subscriptionBalance >= 150 ? "font-bold text-emerald-600" : "text-gray-400"}>
                            {profile.subscriptionBalance >= 150 ? "Unlocked" : "Locked"}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Premium Support (300sh)</span>
                          <span className={profile.subscriptionBalance >= 300 ? "font-bold text-emerald-600" : "text-gray-400"}>
                            {profile.subscriptionBalance >= 300 ? "Unlocked" : "Locked"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("stakes")}
                      className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer text-center"
                    >
                      Stake Small Stakes
                    </button>
                  </div>

                </div>
              )}

              {activeTab === "stakes" && profile && (
                <StakesTracker 
                  profile={profile} 
                  onPaymentSuccess={handlePaymentCompleted} 
                />
              )}

              {activeTab === "forum" && profile && (
                <CommunitySupport profile={profile} />
              )}

              {activeTab === "therapist" && profile && (
                <CBTGuideChat profile={profile} />
              )}

              {activeTab === "resources" && profile && (
                <EducationalLibrary userId={profile.userId} />
              )}

            </div>

          </div>
        )}

      </main>

      {/* supportive professional quiet footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400 leading-normal font-medium">
            © 2026 Sovereign Path, Inc. All therapy guides and mental checks are grounded in standard Cognitive Behavioral Therapy frameworks. This tool is educational and supportive, not a replacement for direct emergency response services.
          </p>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
            <span>Sovereign Security Sandbox Checked</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
