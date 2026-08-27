"use client";

import Link from "next/link";
import { User, MapPin, Calendar, Armchair, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";
import type { Showtime } from "@/lib/modules/showtimes/showtimes.types";
import type { Movie } from "@/lib/modules/movies/movies.types";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";

interface SeatWithStatus {
  id: string;
  label: string;
  row: string;
  number: number;
  type: string;
  status: string;
  priceModifier: number;
  price: number;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatWithStatus[]>([]);
  
  const [reservation, setReservation] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedSeatsStr = sessionStorage.getItem('booking_seats');
        if (!storedSeatsStr) {
          throw new Error("No seats selected. Please go back and select seats.");
        }
        const storedSeatIds = JSON.parse(storedSeatsStr) as string[];
        if (storedSeatIds.length === 0) {
          throw new Error("No seats selected. Please go back and select seats.");
        }

        const sData = await apiClient(`/showtimes/${id}`);
        setShowtime(sData);
        
        const [mData, cData, seatsData] = await Promise.all([
          apiClient(`/movies/${sData.movieId}`),
          apiClient(`/cinemas/${sData.cinemaId}`),
          apiClient(`/showtimes/${id}/seats`),
        ]);
        
        setMovie(mData);
        setCinema(cData);
        
        const mySeats = (seatsData as SeatWithStatus[]).filter(s => storedSeatIds.includes(s.id));
        if (mySeats.length === 0) {
           throw new Error("Selected seats could not be found.");
        }
        
        // Ensure they are available
        const unavailable = mySeats.filter(s => s.status === 'BOOKED' || s.status === 'INACTIVE');
        if (unavailable.length > 0) {
           throw new Error(`Some selected seats are no longer available: ${unavailable.map(s => s.label).join(", ")}`);
        }
        
        setSelectedSeats(mySeats);
        
      } catch (err: any) {
        setError(err.message || "Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleConfirm = async () => {
    if (!user) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    try {
      const res = await apiClient(`/users/me/reservations`, {
        method: "POST",
        body: JSON.stringify({
          showtimeId: id,
          seatIds: selectedSeats.map(s => s.id)
        })
      });
      // Backend source of truth
      setReservation(res);
      sessionStorage.removeItem('booking_seats');
    } catch (err: any) {
      // Handle conflict / double booking
      setError(err.message || "Failed to create reservation. Seats might have been taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 text-center animate-pulse">Loading checkout...</div>;
  }

  if (error && !reservation) {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center">
        <div className="max-w-xl text-center bg-[#161618] p-10 rounded-xl border border-brand-border">
          <AlertCircle className="w-16 h-16 text-brand-red mx-auto mb-6" />
          <h2 className="headline-md mb-4 text-brand-red">Oops!</h2>
          <p className="text-gray-300 mb-8">{error}</p>
          <Link href={`/booking/${id}`} className="btn-primary py-3 px-8 rounded-lg">Go back to Booking</Link>
        </div>
      </div>
    );
  }

  // Reservation Success State
  if (reservation) {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-20">
        <div className="max-w-3xl mx-auto px-6 mt-12">
          <div className="bg-[#161618] rounded-xl p-8 md:p-12 border border-brand-border text-center">
             <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
             <h1 className="display-md mb-2">Reservation Created!</h1>
             <p className="text-gray-400 mb-8">Your booking has been secured. Please complete the payment before it expires.</p>
             
             <div className="bg-[#222224] p-6 rounded-lg mb-8 inline-block w-full max-w-sm border border-brand-border">
               <div className="text-brand-muted text-xs tracking-wider uppercase mb-2">Booking Code</div>
               <div className="text-4xl font-montserrat font-bold text-white tracking-widest">{reservation.bookingCode}</div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left mb-10 bg-[#222224] p-6 rounded-lg border border-brand-border">
               <div>
                  <div className="text-brand-muted text-xs uppercase mb-1">Status</div>
                  <div className="font-semibold text-yellow-500">{reservation.status}</div>
               </div>
               <div>
                  <div className="text-brand-muted text-xs uppercase mb-1">Total Amount</div>
                  <div className="font-semibold">Rp {reservation.total.toLocaleString()}</div>
               </div>
               <div className="md:col-span-2">
                  <div className="text-brand-muted text-xs uppercase mb-1">Expires At</div>
                  <div className="font-semibold text-brand-red">
                     {new Date(reservation.expiresAt).toLocaleString()}
                  </div>
               </div>
             </div>

             <Link href={`/payment/${reservation.id}`} className="btn-primary py-4 px-12 rounded-lg font-bold text-lg inline-block w-full md:w-auto">
               Proceed to Payment
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // Checkout State
  const totalPrice = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-10">
      <div className="max-w-[1440px] mx-auto px-6 mt-12">
        <h1 className="display-lg mb-2 text-white">Secure Checkout</h1>
        <p className="text-gray-400 mb-10">Almost there. Please review your details and confirm.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-[#161618] rounded-xl p-8 border border-brand-border">
              <div className="flex items-center gap-2 mb-6">
                <User className="text-brand-red" size={20} />
                <h2 className="headline-md m-0">Customer Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    readOnly
                    value={user?.name || "Guest"}
                    className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors opacity-70 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    readOnly
                    value={user?.email || "Not signed in"}
                    className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
              {!user && (
                 <p className="text-brand-red mt-4 text-sm">You must be logged in to confirm booking.</p>
              )}
            </div>

            {/* Movie Info */}
            <div className="bg-[#161618] rounded-xl p-8 border border-brand-border flex flex-col sm:flex-row gap-8">
              <div className="w-[180px] shrink-0 rounded-lg overflow-hidden shadow-lg border border-brand-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={movie?.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop"} 
                  alt={movie?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="display-md text-3xl font-montserrat font-bold mb-2">{movie?.title}</h3>
                <p className="text-gray-400 text-sm mb-6">{movie?.genres?.join(", ")} • {movie?.duration} min</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin size={18} className="text-brand-muted" />
                    <span>{cinema?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar size={18} className="text-brand-muted" />
                    <span>
                      {showtime && new Date(showtime.startAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric'})} • 
                      {showtime && new Date(showtime.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-300">
                    <Armchair size={18} className="text-brand-muted mt-1 shrink-0" />
                    <div>
                      <span>Seats: <strong className="text-brand-red">{selectedSeats.map(s => s.label).join(", ")}</strong></span>
                      <p className="text-xs text-brand-muted mt-1">({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-[#161618] rounded-xl p-8 border border-brand-border sticky top-28">
              <h2 className="headline-md mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8 text-sm">
                {selectedSeats.map(seat => (
                  <div key={seat.id} className="flex justify-between text-gray-300">
                    <span>Seat {seat.label} ({seat.type})</span>
                    <span>Rp {seat.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Total Calculation Display (Informational only) */}
              <div className="border-t border-brand-border pt-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted text-lg">Total</span>
                  <span className="text-3xl font-bold font-montserrat">Rp {totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-brand-muted text-xs mt-2 text-right">Final price will be confirmed by system</p>
              </div>

              {error && <p className="text-brand-red text-sm mb-4 bg-brand-red/10 p-3 rounded-lg border border-brand-red/20">{error}</p>}

              <button 
                onClick={handleConfirm}
                disabled={isSubmitting || !user}
                className="w-full btn-primary py-4 rounded-lg font-bold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>
              
              <p className="text-brand-muted text-xs text-center mt-6">
                By clicking &quot;Confirm Booking&quot;, you agree to our Terms of Service and Privacy Policy. Seats are subject to real-time availability.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
