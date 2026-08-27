"use client";

import { useEffect, useState } from "react";
import { Ticket, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";

export default function BookingsPage() {
  const { user } = useAuth();
  
  const [tab, setTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  
  const page = 1;

  useEffect(() => {
    if (!user) return;
    
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        // Define how we filter by tab
        // UPCOMING = PENDING | PAID
        // COMPLETED = COMPLETED (if backend supports it, else we map by date. Actually let's just leave status empty and filter manually or rely on backend status)
        // Since backend status is: PENDING, PAID, CANCELLED, EXPIRED.
        // We can request without statusFilter and filter locally for ease, or request with multiple status.
        // The API /users/me/reservations currently only supports single statusFilter in getUserBookingHistory.
        
        const data = await apiClient(`/users/me/reservations?page=${page}&limit=20`);
        if (data.items) {
           setBookings(data.items);
        } else {
           setBookings([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, page]);

  // Filter bookings locally based on tabs
  const filteredBookings = bookings.filter((b) => {
      if (tab === "CANCELLED") {
          return b.status === "CANCELLED" || b.status === "EXPIRED" || b.status === "FAILED";
      }
      if (tab === "COMPLETED") {
          // Ideally check if showtime.startAt is in the past
          if (!b.showtime?.startAt) return false;
          return new Date(b.showtime.startAt) < new Date() && b.status === 'PAID';
      }
      // UPCOMING:
      if (b.status === "PENDING") return true;
      if (b.status === "PAID") {
          if (!b.showtime?.startAt) return true;
          return new Date(b.showtime.startAt) >= new Date();
      }
      return false;
  });

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      <div className="max-w-[1000px] mx-auto px-6 mt-12">
        
        <h1 className="display-lg mb-8 text-white">My Bookings</h1>
        
        {/* Tabs */}
        <div className="flex gap-8 border-b border-brand-border mb-8">
          <button 
            onClick={() => setTab("UPCOMING")}
            className={`pb-4 font-semibold text-sm transition-colors ${tab === "UPCOMING" ? "text-brand-red border-b-2 border-brand-red" : "text-gray-400 hover:text-white"}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setTab("COMPLETED")}
            className={`pb-4 font-semibold text-sm transition-colors ${tab === "COMPLETED" ? "text-brand-red border-b-2 border-brand-red" : "text-gray-400 hover:text-white"}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setTab("CANCELLED")}
            className={`pb-4 font-semibold text-sm transition-colors ${tab === "CANCELLED" ? "text-brand-red border-b-2 border-brand-red" : "text-gray-400 hover:text-white"}`}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          
          {loading ? (
             <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-3">
               <Loader2 size={32} className="animate-spin text-brand-red" />
               <p>Loading your bookings...</p>
             </div>
          ) : error ? (
             <div className="text-center text-brand-red py-10 bg-[#161618] rounded-xl border border-brand-border">
               <p>{error}</p>
             </div>
          ) : filteredBookings.length === 0 ? (
             <div className="text-center text-gray-400 py-10 bg-[#161618] rounded-xl border border-brand-border">
               <p className="mb-4">No {tab.toLowerCase()} bookings found.</p>
               <Link href="/" className="text-brand-red hover:underline">Browse Movies</Link>
             </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-[#161618] rounded-xl overflow-hidden border border-brand-border flex flex-col md:flex-row shadow-lg">
                <div className="w-[180px] shrink-0 hidden md:block bg-brand-surface-2 flex items-center justify-center">
                  {booking.movie?.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={booking.movie.posterUrl} 
                      alt={booking.movie.title || "Movie"} 
                      className={`w-full h-full object-cover ${tab === "CANCELLED" ? "grayscale opacity-70" : ""}`} 
                    />
                  ) : (
                    <span className="text-brand-muted text-xs">No Poster</span>
                  )}
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between mb-2 gap-4">
                      <h2 className="headline-md m-0">{booking.movie?.title || "Unknown Movie"}</h2>
                      {booking.status === 'PAID' ? (
                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Paid</span>
                      ) : booking.status === 'PENDING' ? (
                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Pending Payment</span>
                      ) : (
                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{booking.status}</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-6">{booking.studio?.name} - {booking.cinema?.name}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-brand-muted text-xs font-bold tracking-wider mb-1 uppercase">Date & Time</p>
                        <p className="text-sm">
                          {booking.showtime?.startAt ? new Date(booking.showtime.startAt).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs font-bold tracking-wider mb-1 uppercase">Seats</p>
                        <p className="text-sm">
                          {booking.items && booking.items.length > 0 
                              ? booking.items.map((i: any) => i.seatLabel || i.seatId).join(', ') 
                              : "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs font-bold tracking-wider mb-1 uppercase">Booking ID</p>
                        <p className="text-sm">{booking.bookingCode || booking.id}</p>
                      </div>
                      <div>
                         <p className="text-brand-muted text-xs font-bold tracking-wider mb-1 uppercase">Total</p>
                         <p className="text-sm text-brand-red font-bold">Rp {booking.total?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-brand-border flex justify-end">
                    {booking.status === 'PAID' ? (
                      <Link href={`/ticket/${booking.id}`} className="btn-primary px-6 py-2 rounded font-bold flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(229,9,20,0.2)]">
                        <Ticket size={16} />
                        View Ticket
                      </Link>
                    ) : booking.status === 'PENDING' ? (
                      <Link href={`/payment/${booking.id}`} className="bg-[#222224] hover:bg-[#2a2a2c] border border-brand-border text-white px-6 py-2 rounded font-bold flex items-center gap-2 text-sm transition-colors">
                        <CreditCard size={16} />
                        Continue Payment
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}
