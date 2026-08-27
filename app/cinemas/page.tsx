"use client";

import Link from "next/link";
import { Search, MapPin, MonitorPlay, Coffee, Car } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  
  // Extract unique cities from all cinemas (ideally backend provides this, but we'll extract for mockup purposes from the returned list if possible, or just hardcode some common ones)
  const cities = ["Jakarta", "Bandung", "Surabaya", "Bali"]; 

  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (city) queryParams.set("city", city);
        
        const endpoint = `/cinemas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const data = await apiClient(endpoint);
        setCinemas(data.items || data || []);
      } catch (err) {
        console.error("Failed to fetch cinemas", err);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(fetchCinemas, 300);
    return () => clearTimeout(debounce);
  }, [search, city]);

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      <div className="max-w-[1440px] mx-auto px-6 mt-12">
        
        {/* Header section with search and filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="display-lg mb-2 text-white">Our Cinemas</h1>
            <p className="text-gray-400">Find the perfect location for your cinematic experience.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search cinemas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-64 bg-[#161618] border border-brand-border rounded px-10 py-3 text-sm text-white focus:outline-none focus:border-brand-muted transition-colors"
              />
            </div>
            
            <div className="relative">
              <select 
                value={city}
                onChange={e => setCity(e.target.value)}
                className="appearance-none w-full sm:w-auto bg-[#161618] border border-brand-border rounded pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-brand-muted transition-colors cursor-pointer"
              >
                <option value="">All Locations</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <MapPin size={18} />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Cinemas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="bg-gray-800 h-[400px] rounded-xl animate-pulse"></div>)
          ) : cinemas.length > 0 ? (
            cinemas.map((cinema) => (
              <div key={cinema.id} className="bg-[#161618] rounded-xl overflow-hidden border border-brand-border group flex flex-col">
                {/* Image Header */}
                <div className="relative h-[200px] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-brand-void/30 group-hover:bg-transparent transition-colors z-10" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop"} 
                    alt={cinema.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent z-10" />
                  <h2 className="absolute bottom-4 left-6 right-6 headline-md text-white z-20">
                    {cinema.name}
                  </h2>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-3 text-gray-300 mb-6">
                      <MapPin size={18} className="text-brand-muted mt-0.5 shrink-0" />
                      <span className="text-sm leading-relaxed">{cinema.address}, {cinema.city}</span>
                    </div>

                    {/* Feature Icons */}
                    <div className="flex gap-4 text-brand-muted mb-8">
                        <MonitorPlay size={20} />
                        <Coffee size={20} />
                        <Car size={20} />
                    </div>
                  </div>

                  <Link 
                    href={`/cinemas/${cinema.id}`}
                    className="w-full bg-transparent border border-brand-border text-center py-3 rounded-lg font-bold text-sm hover:bg-brand-surface-2 transition-colors uppercase tracking-wider"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-gray-500 border border-dashed border-brand-border rounded-xl">
              No cinemas found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
