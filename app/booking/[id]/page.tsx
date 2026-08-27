"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Showtime } from "@/lib/modules/showtimes/showtimes.types";
import type { Movie } from "@/lib/modules/movies/movies.types";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";

interface SeatWithStatus {
  id: string;
  label: string;
  row: string;
  number: number;
  type: "REGULAR" | "VIP" | "DISABLED";
  status: "AVAILABLE" | "INACTIVE" | "BOOKED";
  priceModifier: number;
  price: number;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [seats, setSeats] = useState<SeatWithStatus[]>([]);
  
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sData = await apiClient(`/showtimes/${id}`);
        setShowtime(sData);
        
        const [mData, cData, seatsData] = await Promise.all([
          apiClient(`/movies/${sData.movieId}`),
          apiClient(`/cinemas/${sData.cinemaId}`),
          apiClient(`/showtimes/${id}/seats`),
        ]);
        
        setMovie(mData);
        setCinema(cData);
        setSeats(seatsData);
      } catch (err: any) {
        setError(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20 px-6 text-center animate-pulse">Loading seating chart...</div>;
  }

  if (error || !showtime || !movie || !cinema) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20 px-6 text-center">{error || "Failed to load booking details"}</div>;
  }

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds(prev => {
      if (prev.includes(seatId)) return prev.filter(id => id !== seatId);
      if (prev.length >= 10) {
        alert("Maximum 10 seats per reservation");
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  // Group seats by row to render grid dynamically
  // Normally we would just map them or use a grid template, 
  // but to preserve the look we will group by row and sort by number.
  const rowsMap = new Map<string, SeatWithStatus[]>();
  seats.forEach(s => {
    if (!rowsMap.has(s.row)) rowsMap.set(s.row, []);
    rowsMap.get(s.row)!.push(s);
  });
  
  // Sort rows alphabetically
  const rows = Array.from(rowsMap.keys()).sort();

  const renderSeat = (seat: SeatWithStatus) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const isOccupied = seat.status === 'BOOKED' || seat.status === 'INACTIVE';
    const isPremium = seat.type === 'VIP';
    
    let classes = "w-8 h-8 rounded-sm text-[10px] flex items-center justify-center font-inter font-medium transition-all ";
    
    if (isSelected) {
      classes += "bg-brand-red text-white cursor-pointer";
    } else if (isOccupied) {
      classes += "bg-brand-surface-2 text-brand-muted cursor-not-allowed relative overflow-hidden";
    } else if (isPremium) {
      classes += "bg-brand-surface-2 border border-[#d4af37] text-gray-400 cursor-pointer hover:border-brand-red"; // Gold border
    } else {
      classes += "bg-brand-surface-2 text-gray-400 cursor-pointer hover:bg-brand-border";
    }

    return (
      <div 
        key={seat.id} 
        className={classes}
        onClick={() => !isOccupied && toggleSeat(seat.id)}
        title={`${seat.label} - Rp ${seat.price.toLocaleString()}`}
      >
        {isOccupied ? (
          <>
            <span className="opacity-50">{seat.number}</span>
            <div className="absolute inset-0 border-t border-brand-muted origin-top-left rotate-[45deg] scale-150" />
          </>
        ) : (
          seat.number
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      <div className="h-40 bg-gradient-to-b from-brand-red/10 to-transparent absolute top-0 left-0 right-0 pointer-events-none" />
      
      <div className="max-w-[1440px] mx-auto px-6 mt-10 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        
        {/* Left Column - Seat Selection */}
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-[#161618] rounded-xl p-6 border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="headline-lg">{movie.title}</h1>
              <div className="flex items-center gap-2 text-brand-muted text-sm mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{cinema.name}</span>
              </div>
            </div>
            <div className="md:text-right">
              <div className="text-brand-muted text-xs tracking-wider uppercase mb-1 flex md:justify-end gap-6">
                <span>Date</span>
                <span>Time</span>
              </div>
              <div className="flex gap-6 font-semibold text-lg">
                <span>{new Date(showtime.startAt).toLocaleDateString([], { month: 'short', day: 'numeric'})}</span>
                <span>{new Date(showtime.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
              </div>
            </div>
          </div>

          {/* Screen & Seats */}
          <div className="bg-[#161618] rounded-xl p-10 border border-brand-border overflow-x-auto">
            {/* Screen Arc */}
            <div className="max-w-3xl mx-auto mb-16 relative">
              <div className="h-16 w-full rounded-[100%] border-t-2 border-brand-red opacity-80 shadow-[0_-10px_30px_rgba(229,9,20,0.2)]" />
              <div className="text-center text-brand-muted text-xs tracking-[0.2em] uppercase mt-2">Screen</div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-8 mb-16 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm bg-brand-surface-2" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm bg-brand-surface-2 border border-[#d4af37]" />
                <span className="text-[#d4af37]">VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm bg-brand-red" />
                <span className="text-white">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-sm bg-brand-surface-2 relative overflow-hidden">
                  <div className="absolute inset-0 border-t border-brand-muted origin-top-left rotate-[45deg] scale-150" />
                </div>
                <span>Occupied / Inactive</span>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="min-w-[700px] flex flex-col gap-4 items-center">
              {rows.map(row => {
                // Sort seats by number
                const rowSeats = rowsMap.get(row)!.sort((a, b) => a.number - b.number);
                // Simple heuristic to create aisles: split into 3 chunks if large enough
                const left = rowSeats.slice(0, Math.floor(rowSeats.length * 0.25));
                const center = rowSeats.slice(Math.floor(rowSeats.length * 0.25), Math.ceil(rowSeats.length * 0.75));
                const right = rowSeats.slice(Math.ceil(rowSeats.length * 0.75));
                
                return (
                  <div key={row} className="flex items-center justify-between text-brand-muted text-sm font-medium w-full max-w-4xl">
                    <div className="w-6 text-center">{row}</div>
                    <div className="flex gap-2">
                      {left.map(seat => renderSeat(seat))}
                    </div>
                    <div className="flex gap-2">
                      {center.map(seat => renderSeat(seat))}
                    </div>
                    <div className="flex gap-2">
                      {right.map(seat => renderSeat(seat))}
                    </div>
                    <div className="w-6 text-center">{row}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div>
          <div className="bg-[#161618] rounded-xl p-6 border border-brand-border sticky top-28">
            <h2 className="headline-md mb-6">Booking Summary</h2>
            
            {/* Movie Info */}
            <div className="flex gap-4 pb-6 border-b border-brand-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=200&auto=format&fit=crop"} 
                alt={movie.title}
                className="w-20 h-28 object-cover rounded shadow-md"
              />
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{movie.title}</h3>
                <p className="text-brand-muted text-sm mb-1">{movie.genres?.join(", ")}</p>
                <p className="text-brand-muted text-sm">{movie.duration} min</p>
              </div>
            </div>

            {/* Location & Time */}
            <div className="py-6 border-b border-brand-border space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Theater</span>
                <span className="text-right">{cinema.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Date & Time</span>
                <span className="text-right">
                  {new Date(showtime.startAt).toLocaleDateString([], { month: 'short', day: 'numeric'})}, {new Date(showtime.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                </span>
              </div>
            </div>

            {/* Selected Seats List */}
            <div className="py-6 border-b border-brand-border text-sm">
              <p className="text-brand-muted text-xs tracking-wider uppercase mb-4">Selected Seats</p>
              {selectedSeats.length === 0 ? (
                <p className="text-gray-500 text-sm">No seats selected</p>
              ) : (
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                  {selectedSeats.map(s => (
                    <div key={s.id} className="flex justify-between">
                      <span className="font-medium text-white">{s.label} <span className="text-brand-muted ml-2 font-normal text-xs">{s.type}</span></span>
                      <span>Rp {s.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="py-6 flex items-center justify-between">
              <span className="text-brand-muted text-lg">Total</span>
              <span className="text-2xl font-bold font-montserrat">Rp {totalPrice.toLocaleString()}</span>
            </div>

            <button 
              onClick={() => {
                if (selectedSeatIds.length === 0) return alert('Select at least one seat');
                // Store selections to context or sessionStorage, then route to checkout
                sessionStorage.setItem('booking_seats', JSON.stringify(selectedSeatIds));
                router.push(`/checkout/${id}`);
              }}
              disabled={selectedSeatIds.length === 0}
              className="w-full btn-primary py-4 rounded-lg font-bold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Checkout
              <span className="text-xl leading-none">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
