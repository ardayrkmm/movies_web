"use client";

import Link from "next/link";
import { Star, MapPin, MonitorPlay, Speaker, Armchair, GlassWater, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";
import type { Studio } from "@/lib/modules/studios/studios.types";
import type { Movie } from "@/lib/modules/movies/movies.types";

export default function CinemaDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    const fetchCinemaData = async () => {
      try {
        const [cinemaRes, studiosRes] = await Promise.all([
          apiClient(`/cinemas/${id}`),
          apiClient(`/cinemas/${id}/studios`)
        ]);
        setCinema(cinemaRes);
        setStudios(studiosRes.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to load cinema details");
      } finally {
        setLoading(false);
      }
    };
    fetchCinemaData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchShowtimes = async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          apiClient(`/showtimes?cinemaId=${id}&date=${selectedDate}`),
          apiClient('/movies') // Fetch all movies to map titles (inefficient but works for this scale)
        ]);
        
        const showtimesList = sRes.items || [];
        const moviesList = mRes.items || [];
        
        // Group showtimes by movie
        const grouped = showtimesList.reduce((acc: any, st: any) => {
          if (!acc[st.movieId]) {
             acc[st.movieId] = {
               movie: moviesList.find((m: any) => m.id === st.movieId),
               showtimes: []
             };
          }
          acc[st.movieId].showtimes.push(st);
          return acc;
        }, {});
        
        const groupedArray = Object.values(grouped).filter((g: any) => g.movie);
        setShowtimes(groupedArray);
      } catch (err) {
        console.error("Failed to load showtimes", err);
      }
    };
    fetchShowtimes();
  }, [id, selectedDate]);

  if (loading) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20 px-6 animate-pulse">
        <div className="max-w-[1440px] mx-auto h-[400px] bg-gray-800 rounded-xl"></div>
    </div>;
  }

  if (error || !cinema) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20 px-6">
      <div className="text-center py-32 bg-[#161618] rounded-xl border border-brand-border">
         <p className="text-brand-muted">{error || "Cinema not found"}</p>
         <Link href="/cinemas" className="text-brand-red hover:underline mt-4 inline-block">Back</Link>
      </div>
    </div>;
  }

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-end pb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-void via-brand-void/60 to-transparent" />
        
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6">
          <div className="flex items-center gap-4 mb-4 text-xs font-bold tracking-wider">
            <span className="bg-brand-red text-white px-3 py-1 rounded uppercase">Premium Experience</span>
            <div className="flex items-center gap-1 text-gray-300">
              <Star size={14} className="text-brand-red fill-current" />
              <span>4.9 (1.2k Reviews)</span>
            </div>
          </div>
          <h1 className="display-xl mb-3 text-white">{cinema.name}</h1>
          <div className="flex items-center gap-2 text-gray-300 font-inter">
            <MapPin size={18} className="text-brand-red" />
            <span>{cinema.address}, {cinema.city}</span>
          </div>
        </div>
      </section>

      {/* Description & Studios/Features */}
      <section className="max-w-[1440px] mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-brand-border pb-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-brand-red rounded-full" />
            <h2 className="headline-lg">The Ultimate Viewing Destination</h2>
          </div>
          <p className="body-lg text-gray-400 leading-relaxed mb-6">
            {cinema.description || "Experience cinema redefined. Located in the heart of the city, offering a sanctuary for film enthusiasts."}
          </p>
          <div className="space-y-4">
             <h3 className="font-bold text-white mb-2">Available Studios</h3>
             {studios.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {studios.map(st => (
                   <span key={st.id} className="px-3 py-1 bg-brand-surface-2 border border-brand-border rounded text-sm text-gray-300">
                     {st.name} ({st.type})
                   </span>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-gray-500">No studios listed for this cinema yet.</p>
             )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <MonitorPlay size={32} className="text-brand-muted" />
            <span className="font-semibold text-sm">IMAX / Premium</span>
          </div>
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <Speaker size={32} className="text-brand-muted" />
            <span className="font-semibold text-sm">Dolby Atmos</span>
          </div>
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <Armchair size={32} className="text-brand-muted" />
            <span className="font-semibold text-sm">Luxury Recliners</span>
          </div>
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <GlassWater size={32} className="text-brand-muted" />
            <span className="font-semibold text-sm">Premium Bar</span>
          </div>
        </div>
      </section>

      {/* Now Showing (Mocked schedules but real movies) */}
      <section className="max-w-[1440px] mx-auto px-6 mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <h2 className="display-lg">Now Showing</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-brand-red text-white border-brand-red' : 'bg-transparent text-gray-400 border-brand-border hover:border-white'} border px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap`}
            >
              Today
            </button>
            <button 
              onClick={() => {
                const tmr = new Date();
                tmr.setDate(tmr.getDate() + 1);
                setSelectedDate(tmr.toISOString().split('T')[0]);
              }}
              className={`${selectedDate === new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] ? 'bg-brand-red text-white border-brand-red' : 'bg-transparent text-gray-400 border-brand-border hover:border-white'} border px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap`}
            >
              Tomorrow
            </button>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 bg-transparent text-gray-400 hover:text-white transition-colors ml-2 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        <div className="space-y-6">
          {showtimes.length > 0 ? showtimes.map(({ movie, showtimes: movieShowtimes }) => (
            <div key={movie.id} className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col md:flex-row gap-8">
              <div className="w-[160px] shrink-0 rounded-lg overflow-hidden hidden md:block">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={movie.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop"} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="headline-md mb-2">{movie.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-sm bg-brand-red text-white text-[10px] font-bold tracking-wider border border-brand-red">
                    {movie.ageRating}
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {movie.genres?.join(", ")}
                  </span>
                  <span className="text-sm font-medium text-brand-muted flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    {movie.duration} min
                  </span>
                </div>
                
                <div className="space-y-6">
                  {/* Group showtimes by studio type or just studio for now. We don't have studio details loaded deeply here, so we will just show them all under "Standard" unless we map studios. */}
                  <div>
                    <p className="text-xs font-bold tracking-wider text-brand-muted uppercase mb-3">Showtimes</p>
                    <div className="flex flex-wrap gap-3">
                      {movieShowtimes.map((st: any) => (
                        <Link 
                           key={st.id} 
                           href={`/booking/${st.id}`} 
                           className="bg-brand-surface-2 border border-brand-border px-6 py-2 rounded text-sm hover:border-brand-red hover:text-brand-red transition-colors inline-block text-center"
                        >
                           {new Date(st.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
             <div className="text-center py-10 text-gray-500 border border-brand-border rounded">No movies playing at this cinema for the selected date.</div>
          )}
        </div>
      </section>
    </div>
  );
}
