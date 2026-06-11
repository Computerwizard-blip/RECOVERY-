export enum AddictionCategory {
  DRUGS = "Drugs",
  SEX = "Sex",
  ALCOHOL = "Alcohol",
  GENERAL = "General"
}

export interface UserProfile {
  userId: string;
  alias: string;
  addictionFocus: AddictionCategory;
  streakDays: number;
  lastCheckIn?: string;
  subscriptionBalance: number; // current contribution towards targeted subscription fee
  joinedAt: string;
  fullName?: string;
  username?: string;
  planType?: "monthly" | "yearly";
}

export interface StakesPayment {
  paymentId: string;
  userId: string;
  amount: number; // e.g. 10, 20, 50, 100 KES
  createdAt: string;
  method: string; // "M-Pesa" | "Airtel Money" | "Card"
}

export interface CommunityPost {
  postId: string;
  userId: string;
  userAlias: string;
  content: string;
  category: AddictionCategory;
  createdAt: string;
  likesCount: number;
}

export interface JournalEntry {
  entryId: string;
  userId: string;
  mood: string; // e.g. "Peaceful", "Anxious", "Struggling", "Hopeful"
  note: string;
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: AddictionCategory;
  type: "article" | "exercise" | "guide";
  duration: string;
  description: string;
  content: string;
}
