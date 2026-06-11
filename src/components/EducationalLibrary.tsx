import React, { useState, useEffect } from "react";
import { EDUCATIONAL_RESOURCES } from "../data/resources";
import { ResourceItem, AddictionCategory } from "../types";
import { 
  BookOpen, 
  Search, 
  Clock, 
  BookMarked, 
  Activity, 
  HelpCircle, 
  ArrowLeft,
  CheckSquare,
  Square
} from "lucide-react";

interface EducationalLibraryProps {
  userId: string;
}

export default function EducationalLibrary({ userId }: EducationalLibraryProps) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [completedDocs, setCompletedDocs] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`completed_resources_${userId}`);
    if (saved) {
      setCompletedDocs(JSON.parse(saved));
    }
  }, [userId]);

  const toggleCompleteResource = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // don't open content drawer if clicking tick
    let next: string[];
    if (completedDocs.includes(id)) {
      next = completedDocs.filter(docId => docId !== id);
    } else {
      next = [...completedDocs, id];
    }
    setCompletedDocs(next);
    localStorage.setItem(`completed_resources_${userId}`, JSON.stringify(next));
  };

  const filteredResources = EDUCATIONAL_RESOURCES.filter((res) => {
    const matchesTab = activeTab === "All" || res.category === activeTab;
    const matchesSearch = 
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.description.toLowerCase().includes(search.toLowerCase()) ||
      res.content.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div id="educational_library_panel" className="space-y-6">
      
      {!selectedResource ? (
        <div>
          {/* filters, searches */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {["All", "Drugs", "Sex", "Alcohol", "General"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                    activeTab === cat
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                  }`}
                >
                  {cat} Focus
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search coping drills, biology..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-blue-400 focus:bg-white rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          {/* grid of resources card items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => {
              const isCompleted = completedDocs.includes(res.id);
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        res.category === AddictionCategory.DRUGS ? "bg-rose-50 text-rose-700" :
                        res.category === AddictionCategory.SEX ? "bg-violet-50 text-violet-700" :
                        res.category === AddictionCategory.ALCOHOL ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {res.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {res.duration}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors">
                      {res.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {res.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-gray-50 mt-2">
                    <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                      <BookOpen className="w-4 h-4" /> Start Reading
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleCompleteResource(res.id, e)}
                      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded font-bold transition-all ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {isCompleted ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      <span>{isCompleted ? "Fully Read" : "Mark Read"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 flex flex-col sm:flex-row items-center gap-4">
            <span className="p-3.5 bg-blue-100/50 rounded-xl text-blue-800">
              <BookMarked className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h5 className="font-bold text-blue-950 text-sm">Mental Sovereignty Challenge</h5>
              <p className="text-xs text-blue-800/80 leading-relaxed mt-1">
                Read all four psychiatric guidance guides and check them off to complete your first step towards rewiring automatic triggers. You have fully checked off **{completedDocs.length} out of 4** guides. Keep pushing forward!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Full reading display detail */
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <button
            onClick={() => setSelectedResource(null)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-slate-800 font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Guides Index
          </button>

          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedResource.category === AddictionCategory.DRUGS ? "bg-rose-50 text-rose-700" :
                selectedResource.category === AddictionCategory.SEX ? "bg-violet-50 text-violet-700" :
                selectedResource.category === AddictionCategory.ALCOHOL ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
              }`}>
                {selectedResource.category} Focus
              </span>
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedResource.duration}
              </span>
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-snug">
              {selectedResource.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-1 italic">
              Written by Sovereign Recovery Clinical Research Board
            </p>
          </div>

          {/* body content formatted parsing */}
          <div className="prose prose-sm font-normal text-gray-700 select-text max-w-none space-y-4">
            {selectedResource.content.split("\n\n").map((chunk, idx) => {
              if (chunk.startsWith("###")) {
                return (
                  <h4 key={idx} className="text-lg font-black text-gray-900 mt-6 leading-relaxed">
                    {chunk.replace("###", "").trim()}
                  </h4>
                );
              }
              if (chunk.startsWith("####")) {
                return (
                  <h5 key={idx} className="text-sm font-extrabold text-indigo-900 mt-4">
                    {chunk.replace("####", "").trim()}
                  </h5>
                );
              }
              if (chunk.startsWith("-") || chunk.startsWith("*")) {
                return (
                  <ul key={idx} className="list-disc pl-5 my-2 space-y-1.5 text-xs md:text-sm">
                    {chunk.split("\n").map((item, itemIdx) => (
                      <li key={itemIdx} className="leading-relaxed">
                        {item.replace(/^[-*]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-relaxed text-xs md:text-sm text-gray-600">
                  {chunk}
                </p>
              );
            })}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 rounded text-emerald-600">
                <CheckSquare className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-950">Finished the study?</p>
                <p className="text-[11px] text-gray-400">Lock your achievement milestone into your recovery profile.</p>
              </div>
            </div>

            <button
              onClick={(e) => {
                toggleCompleteResource(selectedResource.id, e);
              }}
              className={`font-semibold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer ${
                completedDocs.includes(selectedResource.id)
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-indigo-600 text-white shadow-sm hover:bg-slate-800"
              }`}
            >
              {completedDocs.includes(selectedResource.id) ? "✓ Completed Study Guide" : "Mark Course Completed"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
