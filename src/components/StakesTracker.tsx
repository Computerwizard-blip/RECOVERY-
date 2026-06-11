import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "@firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, StakesPayment } from "../types";
import { 
  Coins, 
  QrCode, 
  Plus, 
  History, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle,
  Smartphone
} from "lucide-react";

interface StakesTrackerProps {
  profile: UserProfile;
  onPaymentSuccess: (newBalance: number) => void;
  onPlanUpdate?: (newPlan: "monthly" | "yearly") => void;
}

export default function StakesTracker({ profile, onPaymentSuccess, onPlanUpdate }: StakesTrackerProps) {
  const [payments, setPayments] = useState<StakesPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState<number>(100); // updated default preset for 1500/15000 scale
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<"options" | "phone" | "pin" | "success">("options");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("M-Pesa");
  const [statusMessage, setStatusMessage] = useState("");

  const planType = profile.planType || "monthly";
  const targetSubscription = planType === "yearly" ? 15000 : 1500;
  const currentBalance = profile.subscriptionBalance;
  const progressPercent = Math.min(100, Math.round((currentBalance / targetSubscription) * 100));

  useEffect(() => {
    fetchPayments();
  }, [profile.userId]);

  const fetchPayments = async () => {
    setLoading(true);
    if (!profile.userId || profile.userId === "local_guest_user") {
      try {
        const localPaymentsStr = localStorage.getItem("local_guest_payments") || "[]";
        setPayments(JSON.parse(localPaymentsStr));
      } catch (err) {
        console.error("Failed to parse local guest payments", err);
        setPayments([]);
      }
      setLoading(false);
      return;
    }

    const path = "stakes_payments";
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", profile.userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list: StakesPayment[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          paymentId: docSnap.id,
          userId: d.userId,
          amount: d.amount,
          createdAt: d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleString() : new Date().toLocaleString(),
          method: d.method
        });
      });
      setPayments(list);
    } catch (err) {
      console.error("Error fetching payments history:", err);
      // Fallback if index lacks or offline
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : stakeAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert("Please specify a positive stakes value.");
      return;
    }
    setIsSimulating(true);
    setSimStep("phone");
    setPhoneNumber("");
    setPin("");
    setStatusMessage("");
  };

  const handleInitiateSTKPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      alert("Please provide a valid mobile money number.");
      return;
    }
    setSimStep("pin");
  };

  const handleConfimPIN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      alert("Please enter a 4-digit PIN.");
      return;
    }

    setStatusMessage("Authenticating transaction securely...");
    const amountToPay = customAmount ? parseFloat(customAmount) : stakeAmount;

    if (!profile.userId || profile.userId === "local_guest_user") {
      const newAccumulatedBalance = currentBalance + amountToPay;
      onPaymentSuccess(newAccumulatedBalance);

      const docId = `local_pay_${Math.random().toString(36).substring(2, 11)}`;
      const newLocalPayment: StakesPayment = {
        paymentId: docId,
        userId: "local_guest_user",
        amount: amountToPay,
        createdAt: new Date().toLocaleString(),
        method: paymentMethod
      };

      try {
        const localPaymentsStr = localStorage.getItem("local_guest_payments") || "[]";
        const localPayments = JSON.parse(localPaymentsStr);
        localPayments.unshift(newLocalPayment);
        localStorage.setItem("local_guest_payments", JSON.stringify(localPayments));
        setPayments(localPayments);
      } catch (err) {
        console.error("Failed to save local payments", err);
      }

      setSimStep("success");
      return;
    }

    try {
      // 1. Record the Micro Stakes Payment in Firestore
      const paymentPath = "stakes_payments";
      const paymentData = {
        userId: profile.userId,
        amount: amountToPay,
        method: paymentMethod,
        createdAt: serverTimestamp()
      };

      let docId = Math.random().toString();
      try {
        const docRef = await addDoc(collection(db, paymentPath), paymentData);
        docId = docRef.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, paymentPath);
      }

      // 2. Increment subscriptionBalance in User Profile
      const profilePath = `user_profiles/${profile.userId}`;
      const newAccumulatedBalance = currentBalance + amountToPay;
      
      try {
        const userRef = doc(db, "user_profiles", profile.userId);
        await updateDoc(userRef, {
          subscriptionBalance: newAccumulatedBalance
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, profilePath);
      }

      // Trigger callback to update State in parent
      onPaymentSuccess(newAccumulatedBalance);

      // Add to list visually
      const newLocalPayment: StakesPayment = {
        paymentId: docId,
        userId: profile.userId,
        amount: amountToPay,
        createdAt: new Date().toLocaleString(),
        method: paymentMethod
      };
      setPayments(prev => [newLocalPayment, ...prev]);

      setSimStep("success");
    } catch (err) {
      console.error("Failed to commit stakes payment", err);
      setStatusMessage("Error completing transaction. Please try again.");
    }
  };

  const resetSimulator = () => {
    setIsSimulating(false);
    setSimStep("options");
    setCustomAmount("");
    setStakeAmount(20);
  };

  return (
    <div id="stakes_tracker_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl">
      
      {/* progress bento */}
      <div id="progress_card" className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl rounded-2xl flex flex-col justify-between animate-fade-in">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                <Coins className="w-5 h-5 animate-pulse" />
              </span>
              <h3 className="font-semibold text-white text-lg">Subscription Progress</h3>
            </div>
            
            {/* Interactive Plan Selector Switch */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl text-xs font-bold border border-white/10">
              <button
                type="button"
                onClick={() => onPlanUpdate?.("monthly")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  planType === "monthly" 
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm" 
                    : "text-slate-450 hover:text-white"
                }`}
              >
                Monthly Key (1,500 sh)
              </button>
              <button
                type="button"
                onClick={() => onPlanUpdate?.("yearly")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  planType === "yearly" 
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm" 
                    : "text-slate-450 hover:text-white"
                }`}
              >
                Pay Yearly Once (15,000 sh)
              </button>
            </div>
          </div>

          <div className="my-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-4xl font-extrabold text-white tracking-tight">{currentBalance}sh</span>
                <span className="text-sm text-slate-350 font-medium"> of {targetSubscription}sh reached</span>
              </div>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {progressPercent}% Complete
              </span>
            </div>

            {/* progress line */}
            <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 mt-2.5 font-mono leading-relaxed">
              <span>0 sh</span>
              <span>{planType === "yearly" ? "7,500 sh (Standard)" : "750 sh (Standard)"}</span>
              <span>{planType === "yearly" ? "15,000 sh (Premium Yearly Once)" : "1,500 sh (Premium Monthly)"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 bg-white/5 rounded-xl p-3.5 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            <strong>Small Stakes Guarantee:</strong> We understand that paying the full amount at once can be tough. By offering micro-payments, you can pace contributions incrementally on a stress-free sovereign framework. Selecting the <strong>Yearly Once Plan</strong> lets you protect your account with a single, annual contribution that has zero recurring stress.
          </p>
        </div>
      </div>

      {/* interact contributor box */}
      <div id="payment_card" className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <QrCode className="w-5 h-5 animate-spin-slow" />
          </span>
          <h3 className="font-semibold text-white text-lg">Pay in Small Stakes</h3>
        </div>

        {!isSimulating ? (
          <div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Choose a contribution preset or key in a personalized level.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {(planType === "yearly" ? [500, 1000, 5000, 15000] : [100, 250, 500, 1500]).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setStakeAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    stakeAmount === amt && !customAmount
                      ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm font-extrabold"
                      : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {amt >= 1000 ? `${(amt/1000).toFixed(0)}k` : amt}sh
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Or custom amount (shilling)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full text-sm rounded-lg border border-white/10 bg-white/5 text-slate-100 pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 font-mono font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">sh</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Payment Network</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("M-Pesa")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                    paymentMethod === "M-Pesa"
                      ? "bg-emerald-500/20 border-emerald-500/35 text-emerald-300 shadow-xs"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  M-Pesa Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Airtel Money")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                    paymentMethod === "Airtel Money"
                      ? "bg-rose-500/20 border-rose-500/35 text-rose-300 shadow-xs"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Airtel Money
                </button>
              </div>
            </div>

            <button
              onClick={handleStartSimulation}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-sm hover:bg-emerald-400 transition-all text-sm cursor-pointer"
            >
              <Plus className="w-5 h-5 font-extrabold" /> Push Stake
            </button>
          </div>
        ) : (
          /* Mobile money simulator system */
          <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono select-none shadow-inner border border-white/10">
            <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> STK GATEWAY
              </span>
              <span className="text-emerald-400 font-extrabold">● SECURE</span>
            </div>

            {simStep === "phone" && (
              <form onSubmit={handleInitiateSTKPush}>
                <div className="text-center py-2">
                  <p className="text-xs text-amber-300 mb-2 font-bold animate-pulse">🔒 SECURE DEPOSIT</p>
                  <p className="text-[11px] text-slate-300">
                    Pay <strong>{customAmount ? customAmount : stakeAmount} KES/sh</strong> to Solmontec Recovery life wallet.
                  </p>
                </div>
                
                <div className="my-3">
                  <label className="block text-[10px] text-slate-400 mb-1">Enter Phone ({paymentMethod})</label>
                  <input
                    type="tel"
                    placeholder="0712345678"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-900 text-emerald-400 border border-white/10 rounded px-2 py-2 text-sm font-mono text-center focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={resetSimulator}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 py-1.5 text-xs font-bold rounded cursor-pointer transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 py-1.5 text-xs font-extrabold rounded cursor-pointer transition-all"
                  >
                    Get Prompt
                  </button>
                </div>
              </form>
            )}

            {simStep === "pin" && (
              <form onSubmit={handleConfimPIN}>
                <div className="text-center py-1">
                  <p className="text-xs text-slate-300">Simulating Push Prompt On Phone</p>
                  <p className="text-[10px] text-amber-300 mt-1">Enter 4-Digit Wallet PIN to authorize:</p>
                </div>

                <div className="my-3">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-900 text-white tracking-widest border border-white/10 rounded px-2 py-1.5 text-lg font-mono text-center focus:outline-none focus:ring-0 focus:border-emerald-450"
                  />
                </div>

                <p className="text-[10px] text-center text-slate-450 mb-3 block italic">
                  {statusMessage || "This is a safe local client sandbox simulation."}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={resetSimulator}
                    className="bg-white/5 text-slate-300 py-1 text-xs font-bold rounded cursor-pointer border border-white/5 hover:bg-white/10"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-1 text-xs font-extrabold rounded cursor-pointer transition-all"
                  >
                    Submit PIN
                  </button>
                </div>
              </form>
            )}

            {simStep === "success" && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                <p className="text-xs font-bold text-emerald-400">STAKE RECEIVED!</p>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-mono">
                  Stored transaction of <strong>{customAmount ? customAmount : stakeAmount}sh</strong>. Thank you for staking into your wellness.
                </p>
                <button
                  type="button"
                  onClick={resetSimulator}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-1.5 text-xs rounded transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* history lists ledger */}
      <div id="ledger_card" className="lg:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl rounded-2xl text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <History className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-white text-lg">Stakes Payment History</h3>
          </div>
          <span className="text-xs text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            {payments.length} stake{payments.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="py-6 text-center text-sm text-slate-400">Loading stakes history...</div>
        ) : payments.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400 border border-dashed border-white/10 rounded-xl bg-white/5">
            No contributions made yet records yet. You can make simulation stakes using the sandbox box.
          </div>
        ) : (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-400 font-mono">
                  <th className="pb-2.5 font-semibold">Payment ID</th>
                  <th className="pb-2.5 font-semibold">Network</th>
                  <th className="pb-2.5 font-semibold">Timestamp</th>
                  <th className="pb-2.5 font-semibold text-right">Amount (sh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-slate-400">{p.paymentId.substring(0, 10)}...</td>
                    <td className="py-3 font-medium text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        p.method === "M-Pesa" 
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" 
                          : "bg-rose-500/10 text-rose-300 border-rose-500/25"
                      }`}>
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400">{p.createdAt}</td>
                    <td className="py-3 font-extrabold text-right text-emerald-400">+{p.amount} sh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
