"use client";

import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useParams } from "next/navigation";
import type { Movie } from "@/lib/modules/movies/movies.types";
import MovieReviews from "@/components/MovieReviews";

export default function MovieDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const [movieData, cinemasData, genresData] = await Promise.all([
          apiClient(`/movies/${id}`),
          apiClient('/cinemas'),
          apiClient('/genres')
        ]);
        
        // Map genres to names
        if (movieData && movieData.genres && genresData.items) {
          const map: Record<string, string> = {};
          genresData.items.forEach((g: any) => { map[g.id] = g.name; });
          movieData.genreNames = movieData.genres.map((gId: string) => map[gId] || gId);
        }
        
        setMovie(movieData);
        setCinemas(cinemasData.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchShowtimes = async () => {
      try {
        const sRes = await apiClient(`/showtimes?movieId=${id}&date=${selectedDate}`);
        const showtimesList = sRes.items || [];
        
        // Group showtimes by cinema
        const grouped = showtimesList.reduce((acc: any, st: any) => {
          if (!acc[st.cinemaId]) {
             acc[st.cinemaId] = {
               cinemaId: st.cinemaId,
               showtimes: []
             };
          }
          acc[st.cinemaId].showtimes.push(st);
          return acc;
        }, {});
        
        setShowtimes(Object.values(grouped));
      } catch (err) {
        console.error("Failed to load showtimes", err);
      }
    };
    fetchShowtimes();
  }, [id, selectedDate]);

  if (loading) {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20 px-6 animate-pulse">
        <div className="max-w-[1440px] mx-auto h-[400px] bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20 px-6">
        <div className="max-w-[1440px] mx-auto text-center py-32 bg-[#161618] rounded-xl border border-brand-border">
           <h2 className="text-2xl font-bold mb-4">Oops!</h2>
           <p className="text-brand-muted">{error || "Movie not found"}</p>
           <Link href="/movies" className="text-brand-red hover:underline mt-4 inline-block">Back to Movies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-end pb-12">
        {/* Background Image (blurred) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 blur-sm"
          style={{ backgroundImage: `url('${movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000&auto=format&fit=crop"}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-void via-brand-void/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-void via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 flex flex-col md:flex-row items-end gap-10">
          {/* Poster */}
          <div className="w-[240px] shrink-0 rounded-lg overflow-hidden border border-brand-border shadow-2xl relative translate-y-20 hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=500&auto=format&fit=crop"} 
              alt={movie.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1 pb-4">
            <h1 className="display-xl mb-4 text-white">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <span className="inline-block px-2.5 py-0.5 rounded-sm bg-brand-red text-white text-[10px] font-bold tracking-wider border border-brand-red">
                {movie.ageRating}
              </span>
              <span className="text-sm font-medium text-gray-300">
                {(movie as any).genreNames?.join(", ") || movie.genres?.join(", ")}
              </span>
              <span className="text-sm font-medium text-brand-muted flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                {movie.duration} min
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-300 font-inter text-base">
              <div className="flex items-center gap-1 text-brand-red font-bold">
                <Star size={18} className="fill-current" />
                <span>{movie.rating ? movie.rating.toFixed(1) : "N/A"}</span>
              </div>
              {movie.reviewCount !== undefined && (
                 <span className="text-sm">({movie.reviewCount} reviews)</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[1440px] mx-auto px-6 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col (Synopsis & Cast) */}
        <div className="lg:col-span-2 space-y-12">
          {/* Mobile Poster */}
          <div className="w-[200px] rounded-lg overflow-hidden border border-brand-border mx-auto md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=500&auto=format&fit=crop"} 
              alt={movie.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div>
            <h2 className="headline-lg mb-4">Synopsis</h2>
            <p className="body-lg text-gray-400">
              {movie.description || "No synopsis available."}
            </p>
          </div>

          <div>
            <h2 className="headline-lg mb-6">Top Cast</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 text-gray-400">
               Cast information is not provided by the current API schema.
            </div>
          </div>
          
          <MovieReviews movieId={id} />
        </div>

        {/* Right Col (Showtimes) */}
        <div>
          <div className="bg-[#161618] rounded-xl p-6 border border-brand-border sticky top-28 max-h-[80vh] overflow-y-auto">
            <h3 className="headline-md mb-6">Showtimes</h3>
            
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full mb-6 p-3 bg-brand-surface-2 text-white rounded border border-brand-border focus:outline-none focus:border-brand-red [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />

            {showtimes.length === 0 ? (
               <p className="text-sm text-brand-muted mb-6">No showtimes available for this date.</p>
            ) : (
               <div className="space-y-6">
                 {showtimes.map((g, idx) => {
                   const cinema = cinemas.find(c => c.id === g.cinemaId);
                   return (
                     <div key={idx} className="border-b border-brand-border pb-4 last:border-0 last:pb-0">
                       <h4 className="font-bold text-white mb-2">{cinema?.name || g.cinemaId}</h4>
                       <div className="flex flex-wrap gap-2">
                         {g.showtimes.map((st: any) => (
                            <Link 
                              key={st.id} 
                              href={`/booking/${st.id}`} 
                              className="bg-brand-surface-2 border border-brand-border px-3 py-1.5 rounded text-xs hover:border-brand-red hover:text-brand-red transition-colors inline-block text-center"
                            >
                              {new Date(st.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Link>
                         ))}
                       </div>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
