"use client";

import { useEffect, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Movie } from "@/lib/modules/movies/movies.types";
import type { Genre } from "@/lib/modules/genres/genres.types";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"now-showing" | "upcoming">("now-showing");
  const [selectedGenre, setSelectedGenre] = useState("");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await apiClient("/genres");
        setGenres(data.items || data || []);
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError("");
      try {
        let endpoint = `/movies/${activeTab}`;
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (selectedGenre) queryParams.set("genreId", selectedGenre);
        
        const qs = queryParams.toString();
        if (qs) endpoint += `?${qs}`;
        
        const data = await apiClient(endpoint);
        setMovies(data.items || data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMovies, 300);
    return () => clearTimeout(debounce);
  }, [activeTab, search, selectedGenre]);

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      <div className="max-w-[1440px] mx-auto px-6 mt-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="display-lg mb-2 text-white">Movies</h1>
            <p className="text-gray-400">Discover what&apos;s playing and what&apos;s coming soon.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search movies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-[#161618] border border-brand-border rounded px-10 py-3 text-sm text-white focus:outline-none focus:border-brand-muted transition-colors"
              />
            </div>
            
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-[#161618] border border-brand-border rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-muted transition-colors cursor-pointer"
            >
              <option value="">All Genres</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-brand-border mb-8">
          <button 
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'now-showing' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('now-showing')}
          >
            Now Showing
          </button>
          <button 
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'upcoming' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Coming Soon
          </button>
        </div>

        {error && (
          <div className="bg-brand-red/10 border border-brand-red text-brand-red p-4 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-xl h-[350px]"></div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                id={movie.id}
                title={movie.title}
                genre={movie.genres?.join(", ") || "N/A"}
                imageUrl={movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No movies found matching your criteria.
          </div>
        )}

      </div>
    </div>
  );
}
