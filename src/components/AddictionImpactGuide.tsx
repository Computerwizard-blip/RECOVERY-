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
  Gauge,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  FileText
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
  },
  [AddictionCategory.GAMBLING]: {
    title: "Overcoming Sports Betting & Gambling Compulsions",
    effects: [
      "Subverts the reward error prediction signal, building persistent urges based on near-misses.",
      "Leads to rapid capital depletion, debt accumlation, and severe, stressful secret-keeping patterns.",
      "Triggers intense surge-adrenaline spikes that make normal activities feel flat and unstimulating."
    ],
    symptoms: [
      "Obsessive tracking of odds, chasing past losses, and feeling high arousal during sports events."
    ],
    remedies: [
      "Set structural roadblocks: Block card and mobile money deposits on major platforms.",
      "Convert money to non-liquid deposits or pledge small, daily low-stakes accountability fees here.",
      "Remind your brain: A near-miss is a mathematical loss designed by an algorithm to provoke you."
    ],
    psychology: "Gambling tricks the mind into treating losses as progress indicators. Breaking this loop requires establishing external, non-negotiable financial barriers and mindful delays."
  },
  [AddictionCategory.NICOTINE]: {
    title: "Overcoming Nicotine & Vaping Dependency",
    effects: [
      "Binds instantly to nicotinic acetylcholine receptors, provoking artificial dopamine dumps.",
      "Increases heart rate, elevates baseline blood pressure, and thickens respiratory passages.",
      "Builds a short, high-stress withdrawal cycle, making you easily irritated every few hours."
    ],
    symptoms: [
      "Compulsive search for vapes, physical restlessness during meetings, and throat dryness or coughing."
    ],
    remedies: [
      "Substitute the hand-to-mouth tactile motion with mints, sugar-free gum, or cold water sipping.",
      "Track the physical detox timeline: receptors begin resetting merely 48 hours after your last inhale.",
      "Deep-breathing pacing: Inhale slowly for 4 seconds, mimic the vapor release for 6 seconds."
    ],
    psychology: "Nicotine tricks the brain into treating craving-relief as stress reduction. True stress reduction starts when baseline receptors are fully starved of synthetic nicotine."
  },
  [AddictionCategory.TECH]: {
    title: "Overcoming Social Media & Screen Overload",
    effects: [
      "Feeds on scrolling-novelty dopamine spikes, shrinking the capacity for deep focus.",
      "Elevates baseline anxiety, FOMO, and causes social comparisons that disrupt sleep cycles.",
      "Triggers screen-induced posture stress and chronic eye-strain fatigue."
    ],
    symptoms: [
      "Phantom vibes, opening apps automatically without thinking, and late-night sleep delay."
    ],
    remedies: [
      "Establish grey-scale screen settings to remove visual allure.",
      "Un-install attention-mining applications on weekdays, using web-versions only for necessary checks.",
      "Build a tech-free bedroom zone—no chargers or phone stands within arm's reach of your bed."
    ],
    psychology: "Modern screens are built to monetize human focus. Reclaiming screen sovereignty requires replacing the passive scroll with high-effort offline creative play."
  }
};

interface FieldGuidePage {
  title: string;
  subtitle: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
}

const CLEAR_PATH_GENERAL_PAGES: FieldGuidePage[] = [
  {
    title: "Page 1: Start Here – You Are Not Broken",
    subtitle: "Welcome to Day One",
    paragraphs: [
      "Addiction is not a moral failure. It’s not about being weak. It’s a learned loop between your brain, your environment, and your pain. The same brain that learned the addiction can unlearn it.",
      "This guide is for any habit that’s running your life instead of you running it: alcohol, drugs, porn, gambling, food, gaming, social media, shopping. The principles are the same because the brain mechanism is the same: trigger → behavior → reward → shame → repeat.",
      "If you picked up this page, something in you wants change. That part of you is stronger than the addiction. Recovery won’t give you your old life back. It will give you a new one you actually want to live in.",
      "The path isn’t straight. You will stumble. The goal isn’t to never fall. The goal is to stand up one more time than you fall."
    ],
    bullets: [
      "Do this now: Tell one safe person you’re starting. Addiction grows in secrets. Shame dies in sunlight."
    ],
    callout: "The Only Rule: You don’t have to be perfect. You just have to be honest for the next 24 hours. Your Day One starts now. Welcome to New Dawn."
  },
  {
    title: "Page 2: How Addiction Hijacks Your Brain",
    subtitle: "The Science Without the Jargon",
    paragraphs: [
      "Your brain has a “Go” system and a “Stop” system.",
      "Dopamine = Go. It’s the chemical of wanting, not liking. Drugs, jackpots, likes, and porn flood your brain with 10x the dopamine of natural rewards like food, sex, or hugs. Your brain adapts by turning down dopamine receptors to protect itself. Now normal life feels grey. Only the addiction brings color. That’s tolerance.",
      "Prefrontal Cortex = Stop. This is your CEO brain. It handles planning, consequences, and “maybe later.” Addiction weakens this part while strengthening the automatic trigger → behavior loop in the basal ganglia. So you end up promising “never again” at night and relapsing at noon. That’s not weakness. That’s neuroscience.",
      "Key idea: You don’t have an addiction problem. You have a pain relief problem. The addiction worked. It numbed anxiety, loneliness, trauma, or boredom. Until it didn’t. Now it causes more pain than it solves."
    ],
    callout: "HALT is real: Most cravings hit when you’re Hungry, Angry, Lonely, or Tired. Fix those first and half your urges disappear."
  },
  {
    title: "Page 3: The 3 Enemies of Recovery",
    subtitle: "Know What You’re Fighting",
    paragraphs: [
      "1. Triggers: People, places, emotions, and times of day that cue the craving. For gambling it’s M-PESA + payday. For alcohol it’s that bar on the way home. For porn it’s late nights alone. You can’t avoid all triggers, but you can map them. Keep a log: What happened right before the urge?",
      "2. Secrets: Addiction needs darkness. Shame tells you “if they knew the real me, they’d leave.” So you hide. The hiding keeps you sick. Recovery starts when you drag one secret into the light with a safe person: sponsor, therapist, or anonymous group.",
      "3. Overconfidence: Day 30 is the most dangerous day. You feel cured. Your brain isn’t. It needs 90+ days to rewire basic pathways, and 2 years for deep healing. “I can handle one bet” or “just a sip” is how most relapses start. Respect the disease."
    ],
    callout: "Rule: You don’t have to be stronger than your environment forever. You just have to change your environment today. Delete apps. Take a new route home. Block sites. Make relapse harder than recovery."
  },
  {
    title: "Page 4: The 5-Stage Recovery Plan",
    subtitle: "Navigate Your Timeline",
    paragraphs: [
      "Stage 1: Interrupt – Days 1-7\nGoal: Break the physical cycle. Expect withdrawal: sweat, insomnia, irritability, cravings. Sleep, hydrate, walk. Cravings peak at 72 hours then drop. Use the 3x3x3 rule when urges hit: Name 3 things you see, 3 you hear, move 3 body parts. It breaks the trance.",
      "Stage 2: Stabilize – Days 8-30\nGoal: Replace, don’t just remove. Boredom is relapse fuel. Schedule your day in 2-hour blocks: wake, walk, work, meeting, call lifeline, cook, sleep. Join a peer group. Isolation is the drug talking.",
      "Stage 3: Understand – Days 31-90\nGoal: Find your “why” beneath the “what.” Most addictions medicate trauma, ADHD, or grief. Journal: “What was happening the first time I used?” “What does this habit give me that I can get another way?” Therapy helps here.",
      "Stage 4: Rebuild – Months 4-12\nGoal: Build a life you don’t want to escape from. Fix sleep, food, exercise. Repair one relationship. Find one hobby that gives natural dopamine: football, farming, music, prayer.",
      "Stage 5: Give Back – Year 2+\nGoal: Stay sober by helping others. Sponsor someone, share your story. Service kills self-pity, and self-pity kills sobriety."
    ]
  },
  {
    title: "Page 5: Relapse Is Not Failure, It’s Data",
    subtitle: "What to Do If You Slip",
    paragraphs: [
      "Relapse doesn’t erase clean time. If you fall, do this within 1 hour:",
      "1. Tell someone. Shame doubles when hidden. Text your sponsor: “I slipped. I’m safe. Help.”",
      "2. Don’t binge on guilt. One mistake ≠ “I’ve lost all progress.” Your brain still has 27 clean days out of 30. You don’t lose fitness by missing one gym day.",
      "3. Analyze, don’t agony: What was the trigger? What time? What emotion? What will I do differently next time? Write it down. That’s data.",
      "4. Restart the clock, but keep the lesson. Most people relapse 3-5 times before long-term recovery sticks. This is part of it."
    ],
    bullets: [
      "Urge Surfing: Cravings are waves. They rise for 20 min, then fall. Don’t fight it. Watch it like a wave. Breathe. It will pass if you don’t act. Set a 20-minute timer and clean something. When it dings, the worst is over.",
      "Play the Tape: Don’t think of the first high. Think of the end: 3 AM shame, money gone, trust broken. Play the whole tape, not the trailer."
    ]
  },
  {
    title: "Page 6: Tools & Boundaries That Actually Work",
    subtitle: "Build Your Recovery Toolbox",
    paragraphs: [
      "1. Phone a Lifeline: Pre-save 3 numbers. Rule: Call before you use. Even at 2 AM. Most relapses happen because we didn’t make one call.",
      "2. Environment Design: Remove the app. Give your M-PESA PIN to your spouse. Use website blockers. If the bar is on your route home, take a boda a different way. Willpower fails. Systems don’t.",
      "3. Daily Check-In: 60 seconds each morning. Rate mood 1-10. List 1 trigger you’ll face today. List 1 thing you’re grateful for. Awareness prevents ambushes.",
      "4. The 5-Minute Rule: When an urge hits, tell yourself “I can do it in 5 minutes if I still want to.” Do pushups, cold water on face, or call someone. Urges are temporary.",
      "For Families & Friends:",
      "1. Don’t enable: Paying debts or lying for them prevents rock bottom.",
      "2. Don’t shame: “Why can’t you just stop?” adds to the pain they’re numbing.",
      "3. Set boundaries: “I love you, but I won’t give you money. I will drive you to a meeting.”",
      "4. Get your own help: You didn’t cause it and you can’t cure it."
    ]
  },
  {
    title: "Page 7: When to Get Professional Help",
    subtitle: "This Site Is Support, Not Treatment",
    paragraphs: [
      "Call 1199 suicide hotline or 1192 NACADA helpline in Kenya immediately if: you’re suicidal, seeing things, having seizures from alcohol/benzo withdrawal, or using IV drugs. Detox from alcohol and benzos can kill you. Get medical help.",
      "Medication helps and is not cheating: Naltrexone for alcohol/opioids, Buprenorphine for opioids, Varenicline for nicotine. Talk to a doctor or psychiatrist. Diabetes needs insulin. Addiction needs treatment.",
      "Therapy works: CBT helps you reframe triggers. Trauma therapy addresses the root pain. Group therapy like AA, NA, or GA gives you people who get it.",
      "You’re not alone: The National Authority for the Campaign Against Alcohol and Drug Abuse NACADA offers free counseling and rehab referrals. Walk into any county hospital for help."
    ],
    callout: "Final Word: Look in the mirror. That person has survived 100% of your worst days. Tired, but not done. The path is not straight. Fall down 7 times, stand up 8. Your Day One can be today. Again. Welcome to New Dawn."
  }
];

const CLEAR_PATH_GAMBLING_PAGES: FieldGuidePage[] = [
  {
    title: "Page 1: Start Here – The House Always Wins, But You Can Walk Away",
    subtitle: "Welcome to Day One",
    paragraphs: [
      "Gambling addiction isn’t about money. It’s about chasing a feeling. That rush when the Aviator plane climbs. The “almost won” on the slots. The belief that the next bet will fix all the last bets.",
      "Your brain was hijacked by design. Betting apps, casinos, and slots use the same neuroscience as cocaine: random rewards + lights + sound = 10x dopamine. Your brain thinks this is survival. It isn’t. It’s a business model.",
      "The Lie: “I’ll stop when I win it back.”\nThe Truth: The house edge means you _will_ lose over time. Safaricom and the betting companies already took their cut the second you hit “Place Bet.”",
      "Recovery doesn’t start when you’re rich. It starts when you’re honest for 24 hours: “I can’t gamble today.”"
    ],
    bullets: [
      "Do this now: Delete betting apps. Give your M-PESA PIN to someone you trust. Tell one person: “I’m trying to quit betting.” Secrets keep you broke. Shame dies in sunlight."
    ],
    callout: "Your Day One starts now. Welcome to New Dawn."
  },
  {
    title: "Page 2: How Betting Rewires Your Brain",
    subtitle: "Why You Can’t “Just Stop”",
    paragraphs: [
      "Your brain has a “Go” system and a “Stop” system.",
      "Dopamine = Go. It’s the chemical of wanting. A win on Sportpesa or a 20x on Aviator floods your brain with more dopamine than food, sex, or a salary alert. Near-misses trigger almost the same rush as wins. Your brain learns: “Bet = possible jackpot.” It craves that maybe.",
      "After months, your brain turns down dopamine receptors to cope. Now nothing feels good except gambling. Payday feels boring. Time with kids feels flat. Only the bet brings color. That’s tolerance. So you bet bigger to feel anything.",
      "Prefrontal Cortex = Stop. This is your CEO brain. It calculates odds and consequences. Gambling weakens it while strengthening the automatic trigger → bet loop. That’s why you swear off betting at 9 AM and you’re depositing to Betika by noon. Not weakness. Neuroscience.",
      "Key idea: You don’t have a money problem. You have a pain relief problem. Betting numbed stress, debt, boredom, or loneliness. Until it created more of all four."
    ],
    callout: "HALT for Gamblers: Most bets happen when you’re Hungry, Angry, Lonely, Tired, or Broke. Fix those first."
  },
  {
    title: "Page 3: The 3 Enemies of Gambling Recovery",
    subtitle: "Know What You’re Up Against",
    paragraphs: [
      "1. Triggers: Payday + M-PESA SMS = instant urge. Football matches, WhatsApp group tips, “cashout” notifications, late nights alone, and that one friend who always “has a sure bet.” Your phone is the casino. Map your triggers: What time? What app? What emotion before I deposit?",
      "2. Chasing Losses: The deadliest lie in gambling: “I just need one win to recover.” Chasing turns a 500 KES loss into 50,000 KES debt. The math: If you lose 10 bets in a row at 50% odds, you need to bet 512x your original stake just to break even. The house designed it this way.",
      "3. Overconfidence: Day 30 clean, your brain says “I can control it now. Just 100 bob.” You can’t. One bet reactivates the whole loop. Gambling addiction is like a peanut allergy. One bet and your brain goes into “allergic reaction” mode. Abstinence is the treatment."
    ],
    callout: "Rule: You won’t beat willpower forever. Make gambling hard. Self-exclude from all betting sites via BCLB. Remove M-PESA app. Use a basic kabambe phone for 90 days."
  },
  {
    title: "Page 4: The 5-Stage Plan to Quit Betting",
    subtitle: "Navigate Your Timeline",
    paragraphs: [
      "Stage 1: Interrupt – Days 1-7\nGoal: Break the physical cycle. Expect withdrawal: anxiety, irritability, dreams about winning. Sleep, walk, drink water. Cravings peak at 72 hours.",
      "Stage 2: Stabilize – Days 8-30\nGoal: Replace the rush. Boredom = deposit. Schedule your evenings: 6pm gym, 8pm church/GA meeting, 9pm call sponsor, 10pm sleep. Join Gamblers Anonymous Kenya or an online group. Isolation is the bet talking.",
      "Stage 3: Understand – Days 31-90\nGoal: Find what you’re escaping. Gambling medicates debt stress, job loss, trauma, or ADHD. Journal: “What was I feeling before I placed my last bet?” “What did winning promise me?” Therapy helps. So does debt counseling.",
      "Stage 4: Rebuild – Months 4-12\nGoal: Build a life you don’t want to bet away. Create a cash budget. Repay debts slowly. Repair trust with family by showing M-PESA statements. Find natural dopamine: football, farming, biz, church. Your brain is relearning that joy exists without the “maybe.”",
      "Stage 5: Give Back – Year 2+\nGoal: Stay clean by helping others. Share your story. Sponsor someone new in GA. Service kills self-pity, and self-pity leads back to Betika."
    ],
    bullets: [
      "Use 3x3x3: Name 3 things you see, 3 you hear, move 3 body parts."
    ]
  },
  {
    title: "Page 5: Relapse Is Data, Not Disaster",
    subtitle: "What to Do If You Bet Again",
    paragraphs: [
      "1. Tell someone in 1 hour. Text: “I bet. I lost 2k. I’m stopping now.” Shame grows in secret and makes you bet more to hide the loss.",
      "2. Don’t chase. One bet ≠ “I’ve lost all progress.” You still have 29 clean days out of 30. Don’t turn 2k loss into 20k loss.",
      "3. Analyze: What time was it? Were you alone? Did you get a deposit SMS? What will you block next time? Write it. That’s your firewall.",
      "4. Restart the clock, keep the lesson. Most people relapse 3-5 times before long-term recovery. This is part of quitting."
    ],
    bullets: [
      "Urge Surfing for Gamblers: Cravings last 20 min. When you want to deposit, set a 20-min timer. Cold shower. 50 pushups. Call your GA sponsor. When the timer ends, the worst is over. The urge passes if you don’t feed it.",
      "Play the Whole Tape: Don’t remember the win. Remember the end: 3 AM, account zero, lying to your wife, fuliza debt, selling assets. Play the whole tape."
    ]
  },
  {
    title: "Page 6: Tools & Boundaries for Gamblers",
    subtitle: "Build Your Anti-Bet Toolkit",
    paragraphs: [
      "1. Financial Fence: No M-PESA app. No bank apps. Salary goes to spouse/trusted person. Use cash for 90 days. Remove fuliza and KCB M-PESA loans. If you can’t access money at 2 AM, you can’t bet at 2 AM.",
      "2. Self-Exclude: Register with BCLB to block all Kenyan betting sites for 6 months minimum. Email all sites: “Close my account for gambling addiction.” They must comply.",
      "3. Phone a Lifeline: Pre-save 3 numbers: GA sponsor, wife, pastor. Rule: Call before you deposit. Most relapses happen because we didn’t make one call.",
      "4. Replace the Rush: Gambling gave you risk + reward. Replace it: Start a small biashara, trade on NSE, learn forex demo accounts, play competitive sports. Your brain needs healthy “maybe.”",
      "For Families:",
      "1. Don’t bail out debts – it funds the next bet.",
      "2. Don’t shame – “You’re stupid” adds to pain they’re numbing.",
      "3. Control money – Hold cards, M-PESA, logins. “I love you, but I won’t enable you.”",
      "4. Get help – Gam-Anon Kenya for families."
    ]
  },
  {
    title: "Page 7: Get Help Before Betting Takes Everything",
    subtitle: "This Site Is Support, Not Treatment",
    paragraphs: [
      "Emergency: If you’re suicidal over gambling debt, call 1199 right now. If you’re having thoughts of harming yourself or others because of losses, get to hospital. Debt can be repaid. Life can’t.",
      "Professional Help:\n1. Gamblers Anonymous Kenya: Free meetings in Nairobi, Mombasa, Kisumu. Search “GA Kenya” online. 12-step program that works.\n2. NACADA: Call 1192 for free 24/7 counseling and rehab referrals.\n3. Therapy: CBT therapists in Kenya can help rewire trigger → bet thoughts.\n4. BCLB: Betting Control and Licensing Board can enforce self-exclusion across all sites.",
      "Debt Reality: You cannot win it back. If you’re 500k in debt, another bet won’t fix it. A payment plan will. Talk to a financial counselor. Most creditors prefer slow payment vs you disappearing."
    ],
    callout: "Final Word: The casino was never designed for you to win. But you can win by walking away. You’ve survived 100% of your worst days after losses. You’re tired, not done. Fall down 7 times, stand up 8. Block the sites. Call the number. Your Day One starts now. Welcome to New Dawn."
  }
];

export default function AddictionImpactGuide() {
  const [selectedCat, setSelectedCat] = useState<AddictionCategory>(AddictionCategory.GENERAL);
  const [readAcknowledge, setReadAcknowledge] = useState<Record<string, boolean>>({});
  const [activePage, setActivePage] = useState<number>(0);
  const [bookletType, setBookletType] = useState<"general" | "gambling">("general");

  const activeBookletPages = bookletType === "general" ? CLEAR_PATH_GENERAL_PAGES : CLEAR_PATH_GAMBLING_PAGES;
  const activeData = IMPACT_METADATA[selectedCat];

  const handleToggleAcknowledge = (key: string) => {
    setReadAcknowledge(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDownloadTXT = () => {
    const title = bookletType === "general" 
      ? "THE CLEAR PATH: A FIELD GUIDE TO BREAKING ANY ADDICTION" 
      : "THE CLEAR PATH: A FIELD GUIDE TO BREAKING GAMBLING ADDICTION";
    
    const pages = bookletType === "general" ? CLEAR_PATH_GENERAL_PAGES : CLEAR_PATH_GAMBLING_PAGES;
    
    let docText = `${title}\n`;
    docText += `=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=\n`;
    docText += `New Dawn Recovery Clinical Manual • Companion Booklet\n`;
    docText += `=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=".=\n\n`;
    
    pages.forEach((pageObj) => {
      docText += `---------------------------------------------------------\n`;
      docText += `${pageObj.title.toUpperCase()}\n`;
      docText += `SUBTITLE: ${pageObj.subtitle}\n`;
      docText += `---------------------------------------------------------\n\n`;
      
      pageObj.paragraphs.forEach(p => {
        docText += `${p}\n\n`;
      });
      
      if (pageObj.bullets && pageObj.bullets.length > 0) {
        docText += `ACTIONS:\n`;
        pageObj.bullets.forEach(b => {
          docText += `  • ${b}\n`;
        });
        docText += `\n`;
      }
      
      if (pageObj.callout) {
        docText += `NOTE: ${pageObj.callout}\n\n`;
      }
      
      docText += `\n`;
    });
    
    const blob = new Blob([docText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = bookletType === "general" ? "the_clear_path_any_addiction.txt" : "the_clear_path_gambling_addiction.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintBooklet = () => {
    const title = bookletType === "general" 
      ? "The Clear Path: A Field Guide to Breaking Any Addiction" 
      : "The Clear Path: A Field Guide to Breaking Gambling Addiction";
    
    const pages = bookletType === "general" ? CLEAR_PATH_GENERAL_PAGES : CLEAR_PATH_GAMBLING_PAGES;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print/save the handbook.");
      return;
    }

    let htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a202c; 
              max-width: 800px; 
              margin: 40px auto; 
              padding: 20px; 
            }
            h1 { 
              text-align: center; 
              font-size: 24px; 
              font-weight: 800; 
              border-bottom: 2px solid #e2e8f0; 
              padding-bottom: 12px; 
              margin-bottom: 30px; 
            }
            .meta { 
              text-align: center; 
              color: #4a5568; 
              font-size: 14px; 
              margin-bottom: 40px; 
              font-weight: 600;
            }
            .page { 
              page-break-after: always; 
              margin-bottom: 40px; 
              padding-bottom: 30px; 
              border-bottom: 1px dashed #e2e8f0; 
            }
            .page:last-child { 
              page-break-after: avoid; 
              border-bottom: none; 
            }
            h2 { 
              font-size: 18px; 
              font-weight: 700; 
              color: #2d3748; 
              margin-top: 0; 
            }
            h3 { 
              font-size: 14px; 
              font-weight: 600; 
              color: #4f46e5; 
              margin-bottom: 15px; 
              margin-top: -5px; 
              text-transform: uppercase; 
            }
            p { 
              font-size: 14px; 
              color: #2d3748; 
              margin-bottom: 12px; 
              text-align: justify; 
            }
            ul { 
              margin-top: 10px; 
              margin-bottom: 15px; 
              padding-left: 20px; 
            }
            li { 
              font-size: 13px; 
              color: #4a5568; 
              margin-bottom: 6px; 
            }
            .callout { 
              background-color: #fffbeb; 
              border-left: 4px solid #f59e0b; 
              padding: 12px 16px; 
              border-radius: 4px; 
              margin-top: 15px; 
              font-style: italic; 
              font-size: 13px; 
              color: #78350f; 
            }
            @media print {
              body { margin: 20px; }
              .page { margin-bottom: 0; padding-bottom: 0; page-break-after: always; }
              .page:last-child { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">New Dawn Recovery Companion Booklet • Clinical Rewiring Guide</div>
    `;

    pages.forEach((pageObj) => {
      let bulletsHtml = "";
      if (pageObj.bullets && pageObj.bullets.length > 0) {
        bulletsHtml = "<ul>" + pageObj.bullets.map(b => `<li>${b}</li>`).join("") + "</ul>";
      }

      let calloutHtml = "";
      if (pageObj.callout) {
        calloutHtml = `<div class="callout">${pageObj.callout}</div>`;
      }

      htmlContent += `
        <div class="page">
          <h2>${pageObj.title}</h2>
          <h3>${pageObj.subtitle}</h3>
          ${pageObj.paragraphs.map(p => `<p>${p}</p>`).join("")}
          ${bulletsHtml}
          ${calloutHtml}
        </div>
      `;
    });

    htmlContent += `
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
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

      {/* Field Guide Page for General Core */}
      {selectedCat === AddictionCategory.GENERAL && (
        <div id="clear_path_field_guide" className="mt-8 border-t border-gray-100 pt-8 space-y-6">
          <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-100 space-y-6">
            
            {/* Booklet Version Selection Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest font-mono block">
                  FIELD GUIDE EDITION
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Select a targeted handbook version for process & behavioral recovery.
                </p>
              </div>
              <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setBookletType("general");
                    setActivePage(0);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    bookletType === "general"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  General Addiction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookletType("gambling");
                    setActivePage(0);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    bookletType === "gambling"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Betting & Gambling
                </button>
              </div>
            </div>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl shrink-0">
                  <BookOpen className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-none">
                    The Clear Path
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {bookletType === "general" 
                      ? "A Field Guide to Breaking Any Addiction" 
                      : "A Field Guide to Breaking Gambling Addiction"}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:self-auto self-start mt-2 sm:mt-0">
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md tracking-wider border border-indigo-100">
                  PAGE {activePage + 1} OF {activeBookletPages.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrintBooklet}
                  title="Print or Save Booklet as PDF"
                  className="p-1.5 px-2.5 bg-white border border-gray-200 text-slate-700 rounded-lg hover:bg-slate-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  Save as PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTXT}
                  title="Download Booklet as Plain Text"
                  className="p-1.5 px-2.5 bg-white border border-gray-200 text-slate-700 rounded-lg hover:bg-slate-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Text Book (.txt)
                </button>
              </div>
            </div>

            {/* Book Page Frame */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-150/80 shadow-xs space-y-4 font-sans text-slate-800 leading-relaxed max-w-4xl mx-auto">
              {/* Page Indicator Tag */}
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase font-mono">
                  FIELD GUIDE • COMPANION BOOKLET ({bookletType === "general" ? "GENERAL" : "GAMBLING"})
                </span>
                <span className="text-[10px] text-gray-300 font-mono font-bold">
                  New Dawn Recovery Clinical Manual
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 pt-1">
                <h3 className="text-lg md:text-xl font-black text-gray-950 tracking-tight leading-tight">
                  {activeBookletPages[activePage].title}
                </h3>
                <p className="text-xs font-bold text-indigo-700 font-sans tracking-wide uppercase italic">
                  {activeBookletPages[activePage].subtitle}
                </p>
              </div>

              {/* Body Content Paragraphs */}
              <div className="space-y-4 text-xs md:text-sm text-gray-700 pt-2">
                {activeBookletPages[activePage].paragraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed whitespace-pre-line font-medium text-gray-800">
                    {p}
                  </p>
                ))}
              </div>

              {/* Optional Bullet Points */}
              {activeBookletPages[activePage].bullets && activeBookletPages[activePage].bullets!.length > 0 && (
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4 space-y-2 mt-4">
                  {activeBookletPages[activePage].bullets!.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-gray-700 leading-relaxed font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quote Block / Highlight Callouts */}
              {activeBookletPages[activePage].callout && (
                <div className="border-l-4 border-amber-500 bg-amber-50/40 p-4 rounded-r-xl mt-4">
                  <p className="text-xs font-semibold text-amber-900 leading-relaxed italic">
                    {activeBookletPages[activePage].callout}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex gap-1.5 order-2 sm:order-1 overflow-x-auto max-w-full pb-1 no-scrollbar overflow-y-hidden">
                {activeBookletPages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePage(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 border cursor-pointer ${
                      activePage === idx 
                        ? "bg-slate-900 border-slate-900 text-white font-black" 
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2 shrink-0">
                <button
                  type="button"
                  disabled={activePage === 0}
                  onClick={() => setActivePage(prev => Math.max(0, prev - 1))}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    activePage === 0 
                      ? "bg-gray-100/50 border-gray-150 text-gray-400 cursor-not-allowed" 
                      : "bg-white border-gray-200 text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev Page
                </button>
                
                <button
                  type="button"
                  disabled={activePage === activeBookletPages.length - 1}
                  onClick={() => setActivePage(prev => Math.min(activeBookletPages.length - 1, prev + 1))}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    activePage === activeBookletPages.length - 1 
                      ? "bg-gray-100/50 border-gray-150 text-gray-400 cursor-not-allowed" 
                      : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-xs"
                  }`}
                >
                  Next Page
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

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
