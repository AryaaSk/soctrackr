"use client"
import { useEffect, useMemo, useState } from "react";
import { SocietyEvent } from "../app/interfaces";
import { motion } from "framer-motion";

type SortOption = "dateAsc" | "dateDesc" | "recent" | "nameAZ" | "society" | "none";

// Helper function to proxy images through our API to bypass CORS
const getProxiedImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // All event images are external, so proxy them all to avoid CORS issues
    // This includes Instagram CDN images and any other external image sources
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export default function UpcomingEvents() {
    const [events, setEvents] = useState<SocietyEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateAsc");
  const [selectedSocieties, setSelectedSocieties] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [quickDateFilter, setQuickDateFilter] = useState<"all"|"today"|"week"|"month">("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showAllSocieties, setShowAllSocieties] = useState(false);

  // Get unique societies from events
  const uniqueSocieties = Array.from(new Set(events.map(e => e.sourceIdentifier))).sort();

  // Initialize state from URL parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    
    // Load filters from URL
    const societiesParam = params.get('societies');
    if (societiesParam) {
      const societies = societiesParam.split(',').filter(Boolean);
      setSelectedSocieties(new Set(societies));
    }
    
    const sortParam = params.get('sort') as SortOption | null;
    if (sortParam && ['dateAsc', 'dateDesc', 'recent', 'nameAZ', 'society', 'none'].includes(sortParam)) {
      setSortBy(sortParam);
    }
    
    const dateParam = params.get('date') as "all"|"today"|"week"|"month" | null;
    if (dateParam && ['all', 'today', 'week', 'month'].includes(dateParam)) {
      setQuickDateFilter(dateParam);
    }
    
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Update URL whenever filters change (skip on initial load)
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialLoad) return;
    
    const params = new URLSearchParams();
    
    // Add societies filter
    if (selectedSocieties.size > 0) {
      params.set('societies', Array.from(selectedSocieties).join(','));
    }
    
    // Add sort
    if (sortBy !== 'dateAsc') {
      params.set('sort', sortBy);
    }
    
    // Add date filter
    if (quickDateFilter !== 'all') {
      params.set('date', quickDateFilter);
    }
    
    // Add search
    if (debouncedQuery) {
      params.set('search', debouncedQuery);
    }
    
    // Update URL without page reload
    const newUrl = params.toString() ? `/events?${params.toString()}` : '/events';
    window.history.replaceState({}, '', newUrl);
  }, [selectedSocieties, sortBy, quickDateFilter, debouncedQuery, isInitialLoad]);

  useEffect(() => {
    const GetData = async () => {
      const currentEpoch = Math.round(new Date().getTime() / 1000);

      const response = await fetch('/api/get-all-events', {
        method: 'POST',
        body: JSON.stringify({
          currentEpoch: currentEpoch
        }),
      });

      const events = await response.json();
      setEvents(events);
    }

    GetData();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // helpers for date ranges
  const now = useMemo(() => new Date(), []);
  const startOfToday = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000, [now]);
  const endOfToday = useMemo(() => startOfToday + 86400 - 1, [startOfToday]);
  const endOfWeek = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = 6 - day; // end of current week (Saturday if week starts Sunday)
    d.setDate(d.getDate() + diff);
    d.setHours(23,59,59,999);
    return Math.floor(d.getTime() / 1000);
  }, [now]);
  const endOfMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    d.setHours(23,59,59,999);
    return Math.floor(d.getTime() / 1000);
  }, [now]);

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      // Text search filter
      const q = debouncedQuery.toLowerCase();
      const matchesSearch = q.length === 0 ||
        event.name.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.sourceIdentifier.toLowerCase().includes(q);
      
      // Society filter
      const matchesSociety = selectedSocieties.size === 0 || selectedSocieties.has(event.sourceIdentifier);

      // Quick date filter by epochTimestampStart
      const ts = event.epochTimestampStart;
      let matchesDate = true;
      if (quickDateFilter === "today") {
        matchesDate = ts >= startOfToday && ts <= endOfToday;
      } else if (quickDateFilter === "week") {
        matchesDate = ts >= startOfToday && ts <= endOfWeek;
      } else if (quickDateFilter === "month") {
        matchesDate = ts >= startOfToday && ts <= endOfMonth;
      }
      
      return matchesSearch && matchesSociety && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "dateAsc") {
        return a.epochTimestampStart - b.epochTimestampStart;
      } else if (sortBy === "dateDesc") {
        return b.epochTimestampStart - a.epochTimestampStart;
      } else if (sortBy === "recent") {
        // recently added: assume larger id is newer insert
        return b.id - a.id;
      } else if (sortBy === "nameAZ") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "society") {
        return a.sourceIdentifier.localeCompare(b.sourceIdentifier);
      }
      return 0;
    });

  const toggleSociety = (society: string) => {
    setSelectedSocieties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(society)) {
        newSet.delete(society);
      } else {
        newSet.add(society);
      }
      return newSet;
    });
  };

  const handleImageError = (eventId: number, imageURL: string) => {
    setImageErrors(prev => new Set(prev).add(eventId));
    // Try to reload after a short delay
    setTimeout(() => {
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-4xl font-bold text-[#e4e4e7] mb-2">Upcoming Events</h1>
        <p className="text-sm md:text-base text-[#a1a1aa] mb-8">Find and explore events happening near you</p>

        {/* Search and Sort Controls */}
        <div className="bg-[#18181b] backdrop-blur-sm border-2 border-[rgba(82,82,91,0.3)] rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <label htmlFor="search" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Search Events
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, description, location, or society..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-[#2d2d31] border border-[#2d2d31] rounded-lg text-[#e4e4e7] placeholder:text-[#71717a] focus:ring-2 focus:ring-[#42f5b9] focus:border-transparent outline-none"
                />
              </div>
              <div className="w-full md:w-64">
                <label htmlFor="sort" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2 bg-[#2d2d31] border border-[#2d2d31] rounded-lg text-[#e4e4e7] focus:ring-2 focus:ring-[#42f5b9] focus:border-transparent outline-none"
                >
                  <option value="dateAsc" className="bg-[#2d2d31]">Date (Soonest)</option>
                  <option value="dateDesc" className="bg-[#2d2d31]">Date (Latest)</option>
                  <option value="recent" className="bg-[#2d2d31]">Recently Added</option>
                  <option value="nameAZ" className="bg-[#2d2d31]">Alphabetical (A-Z)</option>
                  <option value="society" className="bg-[#2d2d31]">Society</option>
                  <option value="none" className="bg-[#2d2d31]">None</option>
                </select>
              </div>
            </div>

            {/* Quick Date Filters */}
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Quick Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  {k: "all", label: "All"},
                  {k: "today", label: "Today"},
                  {k: "week", label: "This Week"},
                  {k: "month", label: "This Month"},
                ] as const).map(opt => (
                  <button
                    key={opt.k}
                    onClick={() => setQuickDateFilter(opt.k)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      quickDateFilter === opt.k
                        ? 'bg-[#42f5b9] text-[#0a0a0f] shadow-md'
                        : 'bg-[#18181b] text-[#e4e4e7] hover:bg-[#2d2d31] border border-[rgba(82,82,91,0.3)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Society Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#a1a1aa]">
                  Filter by Society
                </label>
                <button
                  onClick={() => setShowAllSocieties(!showAllSocieties)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showAllSocieties ? '▼ Show less' : '▶ Show all societies'}
                </button>
              </div>
              
              {/* Selected societies - always visible */}
              {selectedSocieties.size > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {Array.from(selectedSocieties).map(society => (
                    <button
                      key={society}
                      onClick={() => toggleSociety(society)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all bg-[#42f5b9] text-[#0a0a0f] shadow-md hover:brightness-110 inline-flex items-center gap-2"
                    >
                      {society}
                      <span className="text-xs">×</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedSocieties(new Set())}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-[rgba(66,245,185,0.1)] text-[#42f5b9] hover:bg-[rgba(66,245,185,0.2)] border border-[rgba(66,245,185,0.5)]"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* All societies - shown when expanded */}
              {showAllSocieties && (
                <div className="flex flex-wrap gap-2 border-t border-[rgba(82,82,91,0.3)] pt-4 mt-2">
                  {uniqueSocieties.map(society => (
                    <button
                      key={society}
                      onClick={() => toggleSociety(society)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedSocieties.has(society)
                          ? 'bg-[#42f5b9] text-[#0a0a0f] shadow-md'
                          : 'bg-[#18181b] text-[#e4e4e7] hover:bg-[#2d2d31] border border-[rgba(82,82,91,0.3)]'
                      }`}
                    >
                      {society}
                    </button>
                  ))}
                </div>
              )}

              {/* Show message when none selected and collapsed */}
              {selectedSocieties.size === 0 && !showAllSocieties && (
                <p className="text-[#71717a] text-sm">No societies filtered - showing all</p>
              )}
            </div>
          </div>
        </div>

        {/* Events Display */}
        {filteredEvents.length === 0 ? (
          <div className="bg-[rgba(39,39,42,0.4)] backdrop-blur-[20px] border-2 border-[rgba(82,82,91,0.3)] rounded-[30px] shadow-lg p-12 text-center">
            <p className="text-[#a1a1aa] text-lg">
              {searchQuery ? `No events found matching "${searchQuery}"` : "No events available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEvents.map((event, index) => {
              const proxiedImageUrl = getProxiedImageUrl(event.imageURL);
              return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[rgba(39,39,42,0.4)] backdrop-blur-[20px] border-2 border-[rgba(82,82,91,0.3)] rounded-lg shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-slate-600">
                <div className="flex flex-col md:flex-row">
                  {/* Image Section - Left on Desktop, Top on Mobile */}
                  {proxiedImageUrl && !imageErrors.has(event.id) && (
                    <div className="relative w-full md:w-64 md:flex-shrink-0 bg-[#2d2d31] overflow-hidden flex items-center justify-center h-64 md:h-full md:min-h-[240px]">
                      <img 
                        src={proxiedImageUrl} 
                        alt={event.name}
                        className="w-full h-full object-contain"
                        onError={() => handleImageError(event.id, proxiedImageUrl)}
                        loading="lazy"
                      />
                    </div>
                  )}
                  {proxiedImageUrl && imageErrors.has(event.id) && (
                    <div className="w-full md:w-64 md:flex-shrink-0 bg-[#2d2d31] flex items-center justify-center h-64 md:min-h-[240px]">
                      <p className="text-[#71717a] text-sm">Image loading...</p>
                    </div>
                  )}
                  
                  {/* Details Section - Right on Desktop, Below on Mobile */}
                  <div className="p-4 md:p-6 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-[#e4e4e7] line-clamp-2">{event.name}</h3>
                      {Boolean(event.signUpRequired) && (
                        <span className="sm:ml-2 px-2 py-1 text-xs font-semibold bg-[#84cc16] text-[#0a0a0f] rounded-full whitespace-nowrap self-start">
                          Sign-up Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#a1a1aa] mb-1 font-medium">{event.sourceIdentifier}</p>
                    <p className="text-[#a1a1aa] mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-[#a1a1aa]">
                        <span className="font-medium">📍</span> {event.location}
                      </p>
                      <p className="text-sm text-[#a1a1aa]">
                        <span className="font-medium">📅 Starts:</span> {new Date(event.epochTimestampStart * 1000).toLocaleString()}
                      </p>
                      {event.epochTimestampEnd && (
                        <p className="text-sm text-[#a1a1aa]">
                          <span className="font-medium">🕐 Ends:</span> {new Date(event.epochTimestampEnd * 1000).toLocaleString()}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-sm text-[#42f5b9] bg-[rgba(66,245,185,0.1)] border border-[rgba(66,245,185,0.5)] p-2 rounded">
                          <span className="font-medium">ℹ️</span> {event.notes}
                        </p>
                      )}
                      {event.link && (
                        <p className="text-sm">
                          <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-[#2dd4bf] font-medium underline inline-flex items-center gap-1.5 transition-colors"
                          >
                            <img src="/instagram.webp" alt="Instagram" className="w-4 h-4" />
                            Instagram
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}

        {searchQuery && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

  