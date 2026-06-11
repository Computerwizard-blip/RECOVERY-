import React, { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
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
import AddictionImpactGuide from "./components/AddictionImpactGuide";

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

  // Credentials Signup/Login States
  const [isSignUp, setIsSignUp] = useState(true);
  const [signUpName, setSignUpName] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpFocus, setSignUpFocus] = useState<AddictionCategory>(AddictionCategory.GENERAL);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [credentialsSuccess, setCredentialsSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Restore profile from localStorage immediately if it exists, to support instant offline-first bypass
    const cachedProfile = localStorage.getItem("sovereign_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        setProfile(parsed);
        setAliasInput(parsed.alias);
        setSelectedFocus(parsed.addictionFocus);
        setUser({
          uid: parsed.userId || "local_guest_user",
          email: "companion@sovereign.local"
        } as any);

        if (parsed.lastCheckIn) {
          const lastDate = new Date(parsed.lastCheckIn).toDateString();
          const todayDate = new Date().toDateString();
          setCheckedInToday(lastDate === todayDate);
        }
        setLoading(false);
      } catch (e) {
        console.error("Local profile parse failed:", e);
      }
    }

    // Monitor user authentication transitions as a background stream
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserProfile(firebaseUser);
      } else {
        const userId = "local_guest_user";
        setUser({
          uid: userId,
          email: "companion@sovereign.local"
        } as any);

        setProfile(prev => {
          if (prev) return prev;
          const defaultProfile: UserProfile = {
            userId: userId,
            alias: "Sovereign Companion",
            addictionFocus: AddictionCategory.GENERAL,
            streakDays: 0,
            lastCheckIn: "",
            subscriptionBalance: 0,
            joinedAt: new Date().toISOString()
          };
          setAliasInput(defaultProfile.alias);
          setSelectedFocus(defaultProfile.addictionFocus);
          return defaultProfile;
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Autosave profile state to localStorage in real time
  useEffect(() => {
    if (profile) {
      localStorage.setItem("sovereign_profile", JSON.stringify(profile));
    }
  }, [profile]);

  const syncUserProfile = async (firebaseUser: User) => {
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

        try {
          await setDoc(docRef, defaultProfile);
        } catch (err) {
          console.warn("Could not write initial profile to firestore, using local copy:", err);
        }
        
        setProfile(defaultProfile);
        setAliasInput(defaultProfile.alias);
        setSelectedFocus(defaultProfile.addictionFocus);
      }
    } catch (err) {
      console.warn("Critical Profile Synchronization Error (resilient bypass):", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !aliasInput.trim()) return;

    try {
      const docRef = doc(db, "user_profiles", user.uid);
      await updateDoc(docRef, {
        alias: aliasInput,
        addictionFocus: selectedFocus
      });
    } catch (err) {
      console.warn("Profile update cloud sync skipped/failed:", err);
    }

    setProfile(prev => prev ? { ...prev, alias: aliasInput, addictionFocus: selectedFocus } : null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDailyCheckIn = async () => {
    if (!user || !profile || checkedInToday) return;

    const nextStreak = profile.streakDays + 1;
    const todayISO = new Date().toISOString();

    try {
      const docRef = doc(db, "user_profiles", user.uid);
      await updateDoc(docRef, {
        streakDays: nextStreak,
        lastCheckIn: todayISO
      });
    } catch (err) {
      console.warn("Check-in cloud sync skipped/failed:", err);
    }

    setProfile(prev => prev ? { ...prev, streakDays: nextStreak, lastCheckIn: todayISO } : null);
    setCheckedInToday(true);
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError(null);
    setCredentialsSuccess(null);

    // Validate Password length (minimum 5 letters/chars)
    if (signUpPassword.length < 5) {
      setCredentialsError("Password creation error: Password must be at least 5 letters or characters long.");
      return;
    }

    if (!signUpUsername.trim()) {
      setCredentialsError("Please provide a valid username.");
      return;
    }

    if (isSignUp && !signUpName.trim()) {
      setCredentialsError("Please provide your full name.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign-up process:
        const localRegistryStr = localStorage.getItem("sovereign_local_registry") || "{}";
        const localRegistry = JSON.parse(localRegistryStr);
        
        if (localRegistry[signUpUsername]) {
          setCredentialsError("This username is already registered. Please choose another one or log in.");
          setLoading(false);
          return;
        }

        // Perform authentic Anonymous sign in so that Firestore is authorized
        const authCred = await signInAnonymously(auth);
        const firebaseUser = authCred.user;

        const newProfile: UserProfile = {
          userId: firebaseUser.uid,
          alias: signUpUsername,
          addictionFocus: signUpFocus,
          streakDays: 0,
          lastCheckIn: "",
          subscriptionBalance: 0,
          joinedAt: new Date().toISOString(),
          fullName: signUpName,
          username: signUpUsername
        };

        const profilePath = `user_profiles/${firebaseUser.uid}`;
        const docRef = doc(db, "user_profiles", firebaseUser.uid);
        await setDoc(docRef, newProfile)
          .catch(err => handleFirestoreError(err, OperationType.CREATE, profilePath));

        localRegistry[signUpUsername] = {
          fullName: signUpName,
          username: signUpUsername,
          password: signUpPassword,
          userId: firebaseUser.uid,
          profile: newProfile
        };
        localStorage.setItem("sovereign_local_registry", JSON.stringify(localRegistry));

        setUser(firebaseUser);
        setProfile(newProfile);
        setAliasInput(signUpUsername);
        setSelectedFocus(signUpFocus);
        setCredentialsSuccess("Profile created! Welcome to Sovereign Path.");
      } else {
        // Log-in process:
        const localRegistryStr = localStorage.getItem("sovereign_local_registry") || "{}";
        const localRegistry = JSON.parse(localRegistryStr);

        const savedAccount = localRegistry[signUpUsername];
        if (!savedAccount || savedAccount.password !== signUpPassword) {
          setCredentialsError("Incorrect username or password. Please verify your credentials.");
          setLoading(false);
          return;
        }

        let currentFirebaseUser = auth.currentUser;
        if (!currentFirebaseUser) {
          const authCred = await signInAnonymously(auth);
          currentFirebaseUser = authCred.user;
        }

        const docRef = doc(db, "user_profiles", savedAccount.userId);
        let activeProfile: UserProfile = savedAccount.profile;
        try {
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            activeProfile = {
              userId: data.userId,
              alias: data.alias || savedAccount.username,
              addictionFocus: (data.addictionFocus as AddictionCategory) || savedAccount.profile.addictionFocus,
              streakDays: data.streakDays || 0,
              lastCheckIn: data.lastCheckIn || "",
              subscriptionBalance: data.subscriptionBalance || 0,
              joinedAt: data.joinedAt || savedAccount.profile.joinedAt,
              fullName: data.fullName || savedAccount.fullName,
              username: data.username || savedAccount.username
            };
          }
        } catch (fetchErr) {
          console.warn("Could not reach cloud ledger, using offline profile:", fetchErr);
        }

        setUser(currentFirebaseUser);
        setProfile(activeProfile);
        setAliasInput(activeProfile.alias);
        setSelectedFocus(activeProfile.addictionFocus);
        setCredentialsSuccess("Log-in verified!");
      }
    } catch (err: any) {
      console.error("Credentials Authentication Failed:", err);
      setCredentialsError("Authentication failed: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCompleted = (newBalance: number) => {
    setProfile(prev => prev ? { ...prev, subscriptionBalance: newBalance } : null);
  };

  const handleUpdatePlanType = async (newPlan: "monthly" | "yearly") => {
    if (!user || !profile) return;
    const profilePath = `user_profiles/${user.uid}`;
    try {
      const docRef = doc(db, "user_profiles", user.uid);
      await updateDoc(docRef, {
        planType: newPlan
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, profilePath));

      setProfile(prev => prev ? { ...prev, planType: newPlan } : null);
    } catch (err) {
      console.error("Plan type update failed:", err);
    }
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

            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-905">{profile.alias || "Sovereign Companion"}</p>
                  {profile.username && (
                    <p className="text-[10px] text-gray-400 font-mono italic">@{profile.username}</p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* primary body segment */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {loading ? (
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
                <div className="space-y-6 font-sans">
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

                    {/* Optional Registration Card to persist account */}
                    {!profile.username && (
                      <div className="bg-gradient-to-br from-indigo-55 to-slate-50 border border-indigo-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-indigo-100/50 pb-3">
                          <div>
                            <span className="text-[9px] text-indigo-700 font-bold uppercase tracking-wider bg-indigo-100 border border-indigo-150 px-2 py-0.5 rounded-md">
                              SECURE DATABASE PERSISTENCE
                            </span>
                            <h3 className="font-extrabold text-blue-950 text-base md:text-lg tracking-tight leading-none mt-1.5">
                              {isSignUp ? "Claim Session & Create Account" : "Access Registered Account"}
                            </h3>
                          </div>
                          
                          <div className="flex bg-gray-105 p-1 rounded-xl text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSignUp(true);
                                setCredentialsError(null);
                                setCredentialsSuccess(null);
                              }}
                              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${isSignUp ? "bg-white text-slate-950 shadow-xs font-extrabold" : "text-gray-500 hover:text-slate-900"}`}
                            >
                              Register
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSignUp(false);
                                setCredentialsError(null);
                                setCredentialsSuccess(null);
                              }}
                              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${!isSignUp ? "bg-white text-slate-950 shadow-xs font-extrabold" : "text-gray-500 hover:text-slate-900"}`}
                            >
                              Log In
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-normal">
                          {isSignUp 
                            ? "Secure your daily milestones, small stakes contributions, and customization preferences with a permanent username." 
                            : "Log in with your existing credentials to restore your personalized settings."}
                        </p>

                        <form onSubmit={handleCredentialsAuth} className="space-y-4">
                          {isSignUp ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                  type="text"
                                  value={signUpName}
                                  onChange={(e) => setSignUpName(e.target.value)}
                                  className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-400 font-medium"
                                  placeholder="e.g. John Doe"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Username</label>
                                <input
                                  type="text"
                                  value={signUpUsername}
                                  onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().trim().replace(/[^a-z0-9_]/g, ""))}
                                  className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-400 font-medium"
                                  placeholder="e.g. jdoe24"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Password (Min 5 Letters)</label>
                                <input
                                  type="password"
                                  value={signUpPassword}
                                  onChange={(e) => setSignUpPassword(e.target.value)}
                                  className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-400 font-medium"
                                  placeholder="••••••••"
                                  required
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Username</label>
                                <input
                                  type="text"
                                  value={signUpUsername}
                                  onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().trim().replace(/[^a-z0-9_]/g, ""))}
                                  className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white text-slate-905 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-400 font-medium"
                                  placeholder="Your username"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Password</label>
                                <input
                                  type="password"
                                  value={signUpPassword}
                                  onChange={(e) => setSignUpPassword(e.target.value)}
                                  className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white text-slate-905 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-400 font-medium"
                                  placeholder="••••••••"
                                  required
                                />
                              </div>
                            </div>
                          )}

                          {credentialsError && (
                            <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-[11px] rounded-xl font-medium">
                              {credentialsError}
                            </div>
                          )}

                          {credentialsSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-[11px] rounded-xl font-medium">
                              {credentialsSuccess}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wide"
                          >
                            {isSignUp ? "Register Sovereign Profile" : "Sign In & Load Profile"}
                          </button>
                        </form>
                      </div>
                    )}

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

                    {/* sidebar stakes bento progress dashboard summary */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider flex items-center gap-1">
                          <Coins className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" /> {profile.planType === "yearly" ? "Yearly Stakes Protection" : "Monthly Stakes Progress"}
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                          {profile.planType === "yearly" 
                            ? "Single yearly fee of 15,000sh that removes recurring subscription stress entirely." 
                            : "Monthly support fee of 1,500sh split into convenient, budget-friendly stakes contributions."}
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
                            <span>Standard Support ({profile.planType === "yearly" ? "7,500" : "750"}sh)</span>
                            <span className={profile.subscriptionBalance >= (profile.planType === "yearly" ? 7500 : 750) ? "font-bold text-emerald-600" : "text-gray-400"}>
                              {profile.subscriptionBalance >= (profile.planType === "yearly" ? 7500 : 750) ? "Unlocked" : "Locked"}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Premium Support ({profile.planType === "yearly" ? "15,000" : "1,500"}sh)</span>
                            <span className={profile.subscriptionBalance >= (profile.planType === "yearly" ? 15000 : 1500) ? "font-bold text-emerald-600" : "text-gray-400"}>
                              {profile.subscriptionBalance >= (profile.planType === "yearly" ? 15000 : 1500) ? "Unlocked" : "Locked"}
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
                    </div>            </div>

                </div>

                {/* Full Width Addiction Impact and Recovery Guide */}
                <AddictionImpactGuide />
              </div>
            )}

              {activeTab === "stakes" && profile && (
                <StakesTracker 
                  profile={profile} 
                  onPaymentSuccess={handlePaymentCompleted} 
                  onPlanUpdate={handleUpdatePlanType}
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
