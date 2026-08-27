"use client";

import Link from "next/link";
import { CreditCard, Landmark, Wallet, QrCode, Lock, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";
import type { Reservation } from "@/lib/modules/reservations/reservations.types";
import type { Payment } from "@/lib/modules/payments/payments.types";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  
  const [selectedMethod, setSelectedMethod] = useState<string>("CREDIT_CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [payment, setPayment] = useState<Payment & { paymentUrl?: string } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await apiClient(`/users/me/reservations/${reservationId}`);
        setReservation(data);
        
        // Let's also check if there is an active payment for this reservation
        // The endpoint GET /api/v1/users/me/reservations/[id] does not include the payment details directly.
        // We might just assume there isn't one yet unless we want to fetch it.
        // For simplicity, we'll wait for the user to initiate.
      } catch (err: any) {
        setError(err.message || "Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };
    
    if (reservationId) fetchReservation();
  }, [reservationId]);

  const handlePay = async () => {
    if (!user) return router.push("/login");
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await apiClient(`/users/me/reservations/${reservationId}/payment`, {
        method: "POST",
        body: JSON.stringify({
          method: selectedMethod,
        }),
      });
      setPayment(res);
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRefreshStatus = async () => {
    if (!payment) return;
    setIsPolling(true);
    try {
      const updated = await apiClient(`/payments/${payment.id}`);
      setPayment((prev: any) => ({ ...prev, ...updated }));
      
      if (updated.status === 'PAID') {
        router.push(`/ticket/${reservationId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to check status");
    } finally {
      setIsPolling(false);
    }
  };

  if (loading) {
    return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 text-center animate-pulse">Loading payment details...</div>;
  }

  if (error && !reservation) {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center">
        <div className="max-w-xl text-center bg-[#161618] p-10 rounded-xl border border-brand-border">
          <AlertCircle className="w-16 h-16 text-brand-red mx-auto mb-6" />
          <h2 className="headline-md mb-4 text-brand-red">Oops!</h2>
          <p className="text-gray-300 mb-8">{error}</p>
          <Link href="/" className="btn-primary py-3 px-8 rounded-lg">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (reservation?.status === 'PAID' || payment?.status === 'PAID') {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center text-center">
        <div className="max-w-xl bg-[#161618] p-10 rounded-xl border border-brand-border">
          <Lock className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="headline-md mb-4 text-green-500">Payment Successful!</h2>
          <p className="text-gray-300 mb-8">Your payment was completed successfully.</p>
          <Link href={`/ticket/${reservationId}`} className="btn-primary py-3 px-8 rounded-lg">View Ticket</Link>
        </div>
      </div>
    );
  }

  if (reservation?.status === 'EXPIRED' || payment?.status === 'EXPIRED') {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center text-center">
        <div className="max-w-xl bg-[#161618] p-10 rounded-xl border border-brand-border">
          <AlertCircle className="w-16 h-16 text-brand-red mx-auto mb-6" />
          <h2 className="headline-md mb-4 text-brand-red">Payment Expired</h2>
          <p className="text-gray-300 mb-8">Your reservation time has expired. Please make a new booking.</p>
          <Link href="/" className="btn-primary py-3 px-8 rounded-lg">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (payment?.status === 'FAILED') {
    return (
      <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center text-center">
        <div className="max-w-xl bg-[#161618] p-10 rounded-xl border border-brand-border">
          <AlertCircle className="w-16 h-16 text-brand-red mx-auto mb-6" />
          <h2 className="headline-md mb-4 text-brand-red">Payment Failed</h2>
          <p className="text-gray-300 mb-8">We could not process your payment. You can try again.</p>
          <button onClick={() => setPayment(null)} className="btn-primary py-3 px-8 rounded-lg">Retry Payment</button>
        </div>
      </div>
    );
  }

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await apiClient(`/users/me/reservations/${reservationId}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'cancel' })
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="flex-1 w-full bg-brand-void text-white flex flex-col items-center justify-center p-6 py-20 min-h-[calc(100vh-80px-200px)]">
      
      <div className="text-center mb-8">
        <h1 className="display-lg mb-2">Complete Payment</h1>
        <p className="text-gray-400">Complete your transaction to secure your seats.</p>
        
        {reservation && reservation.status === 'PENDING' && (
          <div className="inline-flex items-center gap-2 bg-[#2a1614] border border-[#5e3f3b] text-brand-red px-4 py-1.5 rounded-full text-sm font-bold mt-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Expires: {new Date(reservation.expiresAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl">
        <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex items-center justify-between mb-10">
          <div>
            <p className="text-brand-muted text-xs font-bold tracking-wider mb-1 uppercase">Booking ID</p>
            <p className="font-montserrat font-bold text-2xl">{reservation?.bookingCode}</p>
          </div>
          <div className="text-right">
            <p className="text-brand-muted text-xs font-bold tracking-wider mb-1 uppercase">Total Amount</p>
            <p className="font-montserrat font-bold text-2xl text-brand-red">
              Rp {reservation?.total?.toLocaleString()}
            </p>
          </div>
        </div>

        {error && <p className="text-brand-red text-sm mb-6 bg-brand-red/10 p-3 rounded-lg border border-brand-red/20">{error}</p>}

        {payment ? (
          <div className="bg-[#161618] border border-brand-border rounded-lg p-8 text-center">
             <h2 className="headline-md mb-4">Payment Initiated</h2>
             <p className="text-gray-300 mb-6">Your payment has been created. Status: <strong className="text-yellow-500">{payment.status}</strong></p>
             
             {payment.paymentUrl && (
               <a 
                 href={payment.paymentUrl} 
                 target="_blank" 
                 rel="noreferrer"
                 className="inline-flex items-center gap-2 text-brand-red border border-brand-red px-6 py-3 rounded-lg hover:bg-brand-red hover:text-white transition-colors mb-6"
               >
                 <ExternalLink size={18} />
                 Proceed to Payment Gateway
               </a>
             )}
             
             <div className="space-y-4">
               <button 
                 onClick={handleRefreshStatus}
                 disabled={isPolling}
                 className="w-full btn-primary py-4 rounded-lg font-bold flex justify-center items-center gap-2 disabled:opacity-50"
               >
                 <RefreshCw size={18} className={isPolling ? "animate-spin" : ""} />
                 Refresh Status
               </button>
               
               <p className="text-brand-muted text-xs">
                 (For mock payments, the status may not update automatically. You can simulate success via webhook endpoint in development).
               </p>
             </div>
          </div>
        ) : (
          <>
            <h2 className="headline-md mb-4 text-left w-full">Select Payment Method</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div 
                onClick={() => setSelectedMethod("CREDIT_CARD")}
                className={`bg-[#161618] border rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-colors ${selectedMethod === "CREDIT_CARD" ? "border-brand-red shadow-[0_0_10px_rgba(229,9,20,0.1)]" : "border-brand-border hover:border-white"}`}
              >
                <CreditCard size={24} className="text-white" />
                <span className="font-semibold text-white">Credit/Debit Card</span>
              </div>

              <div 
                onClick={() => setSelectedMethod("BANK_TRANSFER")}
                className={`bg-[#161618] border rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-colors ${selectedMethod === "BANK_TRANSFER" ? "border-brand-red shadow-[0_0_10px_rgba(229,9,20,0.1)]" : "border-brand-border hover:border-white"}`}
              >
                <Landmark size={24} className="text-white" />
                <span className="font-semibold text-white">Bank Transfer</span>
              </div>

              <div 
                onClick={() => setSelectedMethod("E_WALLET")}
                className={`bg-[#161618] border rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-colors ${selectedMethod === "E_WALLET" ? "border-brand-red shadow-[0_0_10px_rgba(229,9,20,0.1)]" : "border-brand-border hover:border-white"}`}
              >
                <Wallet size={24} className="text-white" />
                <span className="font-semibold text-white">E-Wallet (OVO/GoPay)</span>
              </div>

              <div 
                onClick={() => setSelectedMethod("QRIS")}
                className={`bg-[#161618] border rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-colors ${selectedMethod === "QRIS" ? "border-brand-red shadow-[0_0_10px_rgba(229,9,20,0.1)]" : "border-brand-border hover:border-white"}`}
              >
                <QrCode size={24} className="text-white" />
                <span className="font-semibold text-white">QRIS</span>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <button 
                onClick={handlePay}
                disabled={isSubmitting || reservation?.status !== 'PENDING'}
                className="w-full btn-primary py-4 rounded-lg font-bold flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock size={18} />
                {isSubmitting ? "Processing..." : "Pay Now"}
              </button>
              <button 
                onClick={handleCancelBooking}
                className="w-full bg-transparent border border-brand-border py-4 rounded-lg font-bold flex justify-center items-center text-gray-400 hover:text-white hover:border-white transition-colors block text-center"
              >
                Cancel Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
