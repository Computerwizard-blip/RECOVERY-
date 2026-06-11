import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot, 
  serverTimestamp 
} from "@firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, CommunityPost, AddictionCategory } from "../types";
import { 
  MessageSquare, 
  Send, 
  Heart, 
  Filter, 
  CheckCircle2, 
  Megaphone,
  UserCheck, 
  ShieldAlert,
  Trash2
} from "lucide-react";

interface CommunitySupportProps {
  profile: UserProfile;
}

export default function CommunitySupport({ profile }: CommunitySupportProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedTag, setSelectedTag] = useState<AddictionCategory>(AddictionCategory.GENERAL);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    // Read liked posts from localStorage
    const saved = localStorage.getItem(`liked_posts_${profile.userId}`);
    if (saved) {
      setLikedPosts(JSON.parse(saved));
    }

    // Set up high-fidelity real-time sync with onSnapshot as required in the Firebase skill
    const path = "community_posts";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CommunityPost[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          postId: docSnap.id,
          userId: d.userId,
          userAlias: d.userAlias,
          content: d.content,
          category: d.category as AddictionCategory,
          createdAt: d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleString() : new Date().toLocaleString(),
          likesCount: d.likesCount || 0
        });
      });
      setPosts(list);
      setLoading(false);
    }, (error) => {
      // MANDATORY: Error handler callback
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [profile.userId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const path = "community_posts";
    const authorAlias = isAnonymous ? "Anonymous Companion" : profile.alias;

    try {
      const payload = {
        userId: profile.userId,
        userAlias: authorAlias,
        content: newPost,
        category: selectedTag,
        createdAt: serverTimestamp(),
        likesCount: 0
      };

      await addDoc(collection(db, path), payload)
        .catch((err) => handleFirestoreError(err, OperationType.CREATE, path));

      setNewPost("");
    } catch (err) {
      console.error("Error creating post on forum:", err);
    }
  };

  const handleLikePost = async (postId: string, currentLikes: number) => {
    if (likedPosts.includes(postId)) {
      // Unlike state (simulated)
      try {
        const revised = likedPosts.filter(id => id !== postId);
        setLikedPosts(revised);
        localStorage.setItem(`liked_posts_${profile.userId}`, JSON.stringify(revised));

        await updateDoc(doc(db, "community_posts", postId), {
          likesCount: Math.max(0, currentLikes - 1)
        });
      } catch (err) {
        console.error("Error unliking", err);
      }
      return;
    }

    // Like Action
    try {
      const revised = [...likedPosts, postId];
      setLikedPosts(revised);
      localStorage.setItem(`liked_posts_${profile.userId}`, JSON.stringify(revised));

      // We ONLY update the specific likesCount key to satisfy Firebase secure diff rules safely
      await updateDoc(doc(db, "community_posts", postId), {
        likesCount: currentLikes + 1
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to remove this post?")) return;
    try {
      await deleteDoc(doc(db, "community_posts", postId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("You can only remove posts that you created.");
    }
  };

  // Filter list
  const filteredPosts = posts.filter(post => 
    filterCategory === "All" ? true : post.category === filterCategory
  );

  return (
    <div id="community_support_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* active drafting section */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </span>
          <h3 className="font-semibold text-gray-800 text-lg">Share Encouragement</h3>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Focus Group Category</label>
            <div className="flex flex-wrap gap-1.5">
              {[AddictionCategory.DRUGS, AddictionCategory.SEX, AddictionCategory.ALCOHOL, AddictionCategory.GENERAL].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedTag(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    selectedTag === cat
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message Content</label>
            <textarea
              placeholder="Your encouraging story, milestone breakthrough, or vulnerable support request... Keeps everyone accountable."
              rows={4}
              maxLength={1500}
              required
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700">Post Anonymously?</span>
              <span className="text-[10px] text-gray-400">Protects your real recovery alias</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-12 h-6 rounded-full p-0.5 transition-all outline-none ${
                isAnonymous ? "bg-slate-900 justify-end" : "bg-gray-300 justify-start"
              } flex items-center`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-slate-800 transition-all text-sm cursor-pointer"
          >
            <Send className="w-4 h-4" /> Share with Community
          </button>
        </form>

        <div className="mt-5 p-3.5 bg-amber-50 rounded-xl text-[11px] text-amber-800 space-y-1 pb-4 border border-amber-100">
          <span className="font-bold flex items-center gap-1 text-amber-900">
            <Megaphone className="w-3.5 h-3.5 shrink-0" /> Community Guidelines:
          </span>
          <p className="leading-relaxed">
            This space is purely for support, validation, and resources sharing. Spamming, advertising, explicit triggering vocabulary, or offensive conduct translates to permanent suspension. We keep each other safe.
          </p>
        </div>
      </div>

      {/* global message flow board details */}
      <div id="posts_timeline" className="lg:col-span-2 space-y-4">
        
        {/* category filtering elements */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Filter className="w-4 h-4 text-gray-400" />
            <span>Filter Feed:</span>
          </div>
          
          <div className="flex gap-1">
            {["All", "Drugs", "Sex", "Alcohol", "General"].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterCategory(opt)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filterCategory === opt
                    ? "bg-blue-50 text-blue-700"
                    : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* timeline posts loop */}
        {loading ? (
          <div className="py-12 bg-white text-center text-sm text-gray-400 rounded-2xl border border-gray-100">
            Loading real-time timelines...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            No support posts in {filterCategory} group yet. Be the first to express solidarity!
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const isOwner = post.userId === profile.userId;
              const hasLiked = likedPosts.includes(post.postId);
              
              // dynamic theme layouts depending on post category type
              const catThemes = {
                [AddictionCategory.DRUGS]: "bg-rose-50 text-rose-700 border-rose-100",
                [AddictionCategory.SEX]: "bg-violet-50 text-violet-700 border-violet-100",
                [AddictionCategory.ALCOHOL]: "bg-amber-50 text-amber-700 border-amber-100",
                [AddictionCategory.GENERAL]: "bg-slate-50 text-slate-700 border-slate-100"
              };

              return (
                <div key={post.postId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-sm transition-all relative">
                  
                  {/* header user */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-100 flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                        {post.userAlias.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-900">{post.userAlias}</span>
                          {post.userAlias !== "Anonymous Companion" && (
                            <span className="p-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-semibold flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" /> Verified Alias
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{post.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catThemes[post.category] || "bg-gray-50"}`}>
                        {post.category}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeletePost(post.postId)}
                          className="p-1 px-2 text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded-md flex items-center gap-0.5 font-bold transition-all border border-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* text */}
                  <p className="text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 pt-3.5 border-t border-gray-50 text-xs">
                    <button
                      onClick={() => handleLikePost(post.postId, post.likesCount)}
                      className={`flex items-center gap-1.5 font-bold py-1 px-3 border rounded-lg transition-all cursor-pointer ${
                        hasLiked 
                          ? "bg-rose-50 border-rose-200 text-rose-600" 
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-800"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-rose-600" : ""}`} />
                      <span>{post.likesCount} support heart{post.likesCount === 1 ? "" : "s"}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
