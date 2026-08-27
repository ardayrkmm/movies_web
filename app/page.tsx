"use client";

import { MovieCard } from "@/components/MovieCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { Movie } from "@/lib/modules/movies/movies.types";
import type { Genre } from "@/lib/modules/genres/genres.types";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genreMap, setGenreMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch now showing movies and genres in parallel
        const [moviesData, genresData] = await Promise.all([
          apiClient("/movies/now-showing?limit=4"),
          apiClient("/genres")
        ]);
        
        setMovies(moviesData.items || moviesData || []);

        // Create a map of genre ID -> genre name
        const genresList = genresData.items || genresData || [];
        const map: Record<string, string> = {};
        genresList.forEach((g: Genre) => {
          map[g.id] = g.name;
        });
        setGenreMap(map);

      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroMovie = movies.length > 0 ? movies[0] : null;

  // Helper to get genre names from IDs
  const getGenreNames = (genreIds?: string[]) => {
    if (!genreIds || genreIds.length === 0) return "Action";
    return genreIds.map(id => genreMap[id] || "Unknown").join(", ");
  };

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('${heroMovie?.backdropUrl || heroMovie?.posterUrl || "https://images.unsplash.com/photo-1542314831-c6a4d142104d?q=80&w=2070&auto=format&fit=crop"}')`,
          }}
        >
          {/* Gradients for blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-void/90 via-brand-void/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-void via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6">
          <div className="max-w-2xl">
            {loading ? (
               <div className="animate-pulse">
                  <div className="h-12 bg-gray-700 w-2/3 rounded mb-4"></div>
                  <div className="h-6 bg-gray-700 w-1/3 rounded mb-8"></div>
                  <div className="h-24 bg-gray-700 w-full rounded mb-8"></div>
               </div>
            ) : heroMovie ? (
              <>
                <h1 className="display-xl mb-4 text-white">{heroMovie.title}</h1>
                
                <div className="flex items-center gap-3 mb-6 font-inter text-sm font-semibold text-gray-300">
                  <span className="px-2 py-1 rounded border border-gray-600 bg-black/40 uppercase">
                    {getGenreNames(heroMovie.genres)}
                  </span>
                  <span>•</span>
                  <span>{heroMovie.duration}M</span>
                  <span>•</span>
                  <span className="px-2 py-1 rounded border border-gray-600 bg-black/40">
                    {heroMovie.ageRating || "PG-13"}
                  </span>
                </div>

                <p className="body-lg text-gray-300 mb-8 max-w-lg line-clamp-3">
                  {heroMovie.description}
                </p>

                <div className="flex items-center gap-4">
                  <Link href={`/movies/${heroMovie.id}`} className="btn-primary px-8 py-3 rounded font-bold uppercase tracking-wide text-sm">
                    Book Ticket
                  </Link>
                  <Link href={`/movies/${heroMovie.id}`} className="btn-secondary px-8 py-3 rounded font-bold uppercase tracking-wide text-sm">
                    View Details
                  </Link>
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center">
                <p className="text-gray-400">No movies currently showing.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="max-w-[1440px] mx-auto px-6 mt-12 md:mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="headline-lg text-white">Now Showing</h2>
          <Link href="/movies" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            View All
          </Link>
        </div>

        {error && (
          <div className="bg-brand-red/10 border border-brand-red text-brand-red p-4 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-xl h-[400px]"></div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                id={movie.id}
                title={movie.title}
                genre={getGenreNames(movie.genres)}
                imageUrl={movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No movies available at the moment.
          </div>
        )}
      </section>
    </div>
  );
}
