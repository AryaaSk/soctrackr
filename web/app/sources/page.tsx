"use client"
import { useEffect, useMemo, useState } from "react";
import { Source } from "../interfaces";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"az"|"recent">("az");

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/get-all-sources', { method: 'POST' });
      const data = await res.json();
      setSources(data);
    };
    load();
  }, []);

  const items = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = sources.filter(s => s.identifier.toLowerCase().includes(q) || s.type.toLowerCase().includes(q));
    return filtered.sort((a,b) => {
      if (sortBy === 'az') return a.identifier.localeCompare(b.identifier);
      return b.lastCheckedEpochTimestamp - a.lastCheckedEpochTimestamp;
    });
  }, [sources, query, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-4xl font-bold text-[#e4e4e7] mb-2">Sources</h1>
        <p className="text-sm md:text-base text-[#a1a1aa] mb-4">Manage the societies and sources you follow</p>

        {/* Request new source notice */}
        <div className="bg-[rgba(39,39,42,0.4)] backdrop-blur-[20px] border-2 border-[rgba(82,82,91,0.3)] rounded-[14px] p-4 mb-8">
          <p className="text-[#a1a1aa] text-sm">
            If you would like to request a new source be tracked, please email
            {' '}<a href="mailto:as3790@cam.ac.uk" className="text-[#42f5b9] hover:text-[#2dd4bf] underline">as3790@cam.ac.uk</a>.
          </p>
        </div>

        <div className="bg-[#18181b] backdrop-blur-sm border-2 border-[rgba(82,82,91,0.3)] rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Search sources</label>
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[#2d2d31] border border-[#2d2d31] rounded-lg text-[#e4e4e7] placeholder:text-[#71717a] focus:ring-2 focus:ring-[#42f5b9] focus:border-transparent outline-none"
                placeholder="Search sources..."
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Sort</label>
              <select
                value={sortBy}
                onChange={(e)=>setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 bg-[#2d2d31] border border-[#2d2d31] rounded-lg text-[#e4e4e7] focus:ring-2 focus:ring-[#42f5b9] focus:border-transparent outline-none"
              >
                <option value="az" className="bg-[#2d2d31]">Alphabetical (A-Z)</option>
                <option value="recent" className="bg-[#2d2d31]">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(src => (
            <div key={src.id} className="bg-[rgba(39,39,42,0.4)] backdrop-blur-[20px] border-2 border-[rgba(82,82,91,0.3)] rounded-[30px] shadow-lg p-4 hover:border-[#42f5b9] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {src.type === 'instagram' && (
                    <img src="/instagram.webp" alt="Instagram" className="w-5 h-5 flex-shrink-0" />
                  )}
                  <h3 className="text-[#e4e4e7] font-semibold truncate">{src.identifier}</h3>
                </div>
                <span className="text-xs text-[#71717a] uppercase">{src.type}</span>
              </div>
              <p className="text-[#a1a1aa] text-sm">Last checked: {new Date(src.lastCheckedEpochTimestamp * 1000).toLocaleString()}</p>
              <div className="mt-3 flex gap-3 flex-wrap">
                <a 
                  href={`/events?societies=${encodeURIComponent(src.identifier)}`} 
                  className="text-[#42f5b9] hover:text-[#2dd4bf] text-sm underline"
                >
                  View events
                </a>
                {src.type === 'instagram' && (
                  <a 
                    href={`https://instagram.com/${src.identifier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-[#7c3aed] text-sm underline text-"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


