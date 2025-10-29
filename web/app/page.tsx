"use client"
import { useEffect, useState } from "react";
import { SocietyEvent } from "./interfaces";
import { motion } from "framer-motion";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<SocietyEvent[]>([]);

  useEffect(() => {
    const loadFeatured = async () => {
      const currentEpoch = Math.round(new Date().getTime() / 1000);
      const response = await fetch('/api/get-all-events', {
        method: 'POST',
        body: JSON.stringify({ currentEpoch }),
      });
      const events = await response.json() as SocietyEvent[];
      // Get first 6 upcoming events
      setFeaturedEvents(events.slice(0, 6));
    };
    loadFeatured();
  }, []);

  return (
    <div className="bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center px-16">
        <div className="max-w-5xl mx-auto text-center pt-8">
          <motion.img 
            src="/cambridgeLogo.png" 
            alt="Cambridge Logo" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-24 mb-6 mx-auto sm:h-24 md:h-36 lg:h-48"
          />
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-7xl font-bold text-[#e4e4e7] mb-6"
          >
            Never Miss a Cambridge Event Again
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#a1a1aa] mb-8 max-w-3xl mx-auto"
          >
            Track events from over 150 Cambridge societies, all in one unified platform
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="/events" className="px-8 py-4 text-[#0a0a0f] font-semibold rounded-lg shadow-lg btn-animated-gradient">
              Explore Events
            </a>
            <a href="/sources" className="px-8 py-4 bg-[#18181b] hover:bg-[#2d2d31] border-2 border-[#42f5b9] text-[#42f5b9] font-semibold rounded-lg transition-colors">
              Browse by Society
            </a>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-[#e4e4e7] text-center mb-12"
          >
            How SocTrackr Works
          </motion.h2>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 bg-[#18181b] border-2 border-[#8b5cf6] rounded-lg p-6"
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-[#e4e4e7] mb-2">We check Instagram daily</h3>
              <p className="text-[#a1a1aa]">Every day, SocTrackr scans 150+ society Instagram accounts and looks for new posts that mention events.</p>
            </motion.div>
            {/* Arrow between stage 1 and 2 */}
            <div className="hidden md:flex text-[#71717a] text-4xl">→</div>
            <div className="md:hidden flex justify-center text-[#71717a] text-3xl">↓</div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 bg-[#18181b] border-2 border-[#8b5cf6] rounded-lg p-6"
            >
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-[#e4e4e7] mb-2">We extract the details</h3>
              <p className="text-[#a1a1aa]">From those posts, we pull out the event name, date, time, location, and link — all in plain English.</p>
            </motion.div>
            {/* Arrow between stage 2 and 3 */}
            <div className="hidden md:flex text-[#71717a] text-4xl">→</div>
            <div className="md:hidden flex justify-center text-[#71717a] text-3xl">↓</div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-1 bg-[#18181b] border-2 border-[#8b5cf6] rounded-lg p-6"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-[#e4e4e7] mb-2">You see it all in one place</h3>
              <p className="text-[#a1a1aa]">We show upcoming events in a single, searchable page — no more hopping between accounts or missing posts.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Removed Featured Events and CTA sections as requested */}
    </div>
  );
}

