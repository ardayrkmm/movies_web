"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function TicketPage() {
  const params = useParams();
  const reservationId = params.id as string;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (!user) {
        // Option: wait for auth to load or redirect. handled by AuthContext ideally, but just in case:
        return;
    }
    
    const fetchTicket = async () => {
      try {
        const data = await apiClient(`/users/me/reservations/${reservationId}`);
        if (!data) throw new Error("Ticket not found");
        setTicket(data);
      } catch (err: any) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [reservationId, user]);

  if (loading) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 text-center animate-pulse">Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center">
        <div className="max-w-xl text-center bg-[#161618] p-10 rounded-xl border border-brand-border">
          <AlertCircle className="w-16 h-16 text-brand-red mx-auto mb-6" />
          <h2 className="headline-md mb-4 text-brand-red">Oops!</h2>
          <p className="text-gray-300 mb-8">{error || "Ticket not found"}</p>
          <Link href="/" className="btn-primary py-3 px-8 rounded-lg">Go to Home</Link>
        </div>
      </div>
    );
  }

  const { movie, cinema, showtime, studio, items, bookingCode, status } = ticket;

  return (
    <div className="flex-1 w-full bg-brand-void text-white flex items-center justify-center p-6 py-20 min-h-[calc(100vh-80px-200px)]">
      
      {/* Ticket Container */}
      <div className="w-full max-w-4xl bg-[#161618] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-brand-border relative">
        
        {/* Notch details (visual) */}
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-brand-void rounded-full -translate-y-1/2 border-r border-brand-border hidden md:block" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-brand-void rounded-full -translate-y-1/2 border-l border-brand-border hidden md:block" />

        {/* Left Side (Visual Ticket) */}
        <div className="md:w-[320px] shrink-0 bg-[#0A0A0B] p-6 relative flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-brand-border border-dashed">
          <div className="w-[180px] aspect-[2/3] rounded overflow-hidden shadow-lg mb-6 bg-brand-surface-2 flex items-center justify-center">
            {movie?.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={movie.posterUrl} 
                alt={movie.title || "Movie Poster"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-brand-muted text-xs">No Poster</span>
            )}
          </div>
          
          <h2 className="font-montserrat font-bold text-xl mb-1 uppercase tracking-wider">{movie?.title || "Unknown Movie"}</h2>
          {showtime?.startAt && (
             <p className="text-brand-muted text-xs mb-1">
               {new Date(showtime.startAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()} | 
               {new Date(showtime.startAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
             </p>
          )}
          
          <p className="text-brand-muted text-xs mb-4">
            {cinema?.name || "Unknown Cinema"} | {studio?.name || "Unknown Studio"}<br/>
            {items?.length || 0} Seat(s)
          </p>
          
          {/* Mock QR Code */}
          <div className="mt-auto bg-white p-2 rounded w-32 h-32 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingCode || reservationId}`} alt="QR Code" className="w-full h-full" />
          </div>
        </div>

        {/* Right Side (Details & Actions) */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#161618]">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="display-lg text-4xl mb-0">{movie?.title || "Unknown Movie"}</h1>
              {status === 'PAID' ? (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-widest border border-emerald-500/30">Paid</span>
              ) : status === 'CANCELLED' ? (
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-widest border border-red-500/30">Cancelled</span>
              ) : status === 'EXPIRED' ? (
                <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-widest border border-orange-500/30">Expired</span>
              ) : (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-widest border border-yellow-500/30">{status}</span>
              )}
            </div>
            <p className="text-brand-muted text-sm tracking-widest mb-10">BOOKING ID: {bookingCode || reservationId.toUpperCase()}</p>

            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <div>
                <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Cinema</p>
                <p className="font-medium text-lg">{cinema?.name || "N/A"}</p>
                <p className="text-brand-muted text-xs">{cinema?.city}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Theater</p>
                <p className="font-medium text-lg">{studio?.name || "N/A"}</p>
              </div>
              
              <div>
                <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-medium text-lg">
                  {showtime?.startAt ? new Date(showtime.startAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Seats</p>
                <div className="flex gap-2 flex-wrap">
                  {items && items.length > 0 ? items.map((item: any, idx: number) => (
                      <span key={idx} className="bg-brand-surface-2 px-3 py-1 rounded text-sm font-bold border border-brand-border">
                        {item.seatLabel || item.seatId}
                      </span>
                  )) : (
                      <span className="text-sm font-medium">None</span>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Customer</p>
                <p className="font-medium text-lg">{user?.name || "User"}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-brand-border pt-8">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto ml-auto">
              <button onClick={() => window.print()} className="flex-1 md:flex-none btn-secondary px-6 py-3 rounded flex items-center justify-center gap-2 font-medium text-sm hover:bg-brand-surface-2 transition-colors">
                <Printer size={18} />
                Print / Download
              </button>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
