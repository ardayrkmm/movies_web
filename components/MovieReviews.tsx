"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Trash2, Edit2, Loader2, User as UserIcon } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";

export default function MovieReviews({ movieId }: { movieId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [eligibleReservationId, setEligibleReservationId] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fetchReviews = async () => {
    try {
      const data = await apiClient(`/movies/${movieId}/reviews?limit=50`);
      setReviews(data.items || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
       await fetchReviews();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);
  
  useEffect(() => {
    if (!user) return;
    
    // Check eligibility
    const checkEligibility = async () => {
       setCheckingEligibility(true);
       try {
         // Fetch recent user reservations (could paginate, but keeping it simple for now)
         const resData = await apiClient(`/users/me/reservations?limit=50`);
         const reservations = resData.items || [];
         
         const valid = reservations.find((r: any) => {
             // MUST be PAID or CONFIRMED
             if (r.status !== 'PAID' && r.status !== 'CONFIRMED') return false;
             
             // MUST match movieId
             if (r.movie?.id !== movieId) return false;
             
             // MUST be in the past
             if (r.showtime?.startAt) {
                 return new Date(r.showtime.startAt) < new Date();
             }
             return false;
         });
         
         if (valid) {
             setEligibleReservationId(valid.id);
         }
       } catch (err) {
           console.error("Error checking eligibility", err);
       } finally {
           setCheckingEligibility(false);
       }
    };
    checkEligibility();
  }, [user, movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0) {
          setError("Please provide a rating");
          return;
      }
      
      setSubmitting(true);
      setError("");
      
      try {
          if (editingId) {
              await apiClient(`/reviews/${editingId}`, {
                  method: "PATCH",
                  body: JSON.stringify({ rating, comment })
              });
          } else {
              if (!eligibleReservationId) throw new Error("Not eligible to review");
              await apiClient(`/movies/${movieId}/reviews`, {
                  method: "POST",
                  body: JSON.stringify({
                      rating,
                      comment,
                      reservationId: eligibleReservationId
                  })
              });
          }
          
          setRating(0);
          setComment("");
          setShowForm(false);
          setEditingId(null);
          await fetchReviews();
      } catch (err: any) {
          setError(err.message || "Failed to submit review");
      } finally {
          setSubmitting(false);
      }
  };
  
  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this review?")) return;
      try {
          await apiClient(`/reviews/${id}`, { method: "DELETE" });
          await fetchReviews();
      } catch (err: any) {
          alert(err.message || "Failed to delete");
      }
  };
  
  const handleEdit = (review: any) => {
      setEditingId(review.id);
      setRating(review.rating);
      setComment(review.comment || "");
      setShowForm(true);
      window.scrollTo({ top: document.getElementById('review-form')?.offsetTop, behavior: 'smooth' });
  };

  if (loading) {
      return <div className="animate-pulse flex gap-2 items-center text-brand-muted"><Loader2 className="animate-spin" size={16}/> Loading reviews...</div>;
  }

  const userHasReviewed = reviews.some(r => r.userId === user?.id);

  return (
    <div className="mt-16 pt-12 border-t border-brand-border">
      <div className="flex items-center justify-between mb-8">
        <h2 className="headline-lg flex items-center gap-2">
            <MessageSquare size={24} className="text-brand-red" />
            Reviews ({reviews.length})
        </h2>
        
        {user && !userHasReviewed && eligibleReservationId && !showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded text-sm font-bold shadow-[0_0_10px_rgba(229,9,20,0.2)]">
               Write a Review
            </button>
        )}
      </div>
      
      {showForm && (
          <div id="review-form" className="bg-[#161618] rounded-xl p-6 border border-brand-border mb-10">
              <h3 className="font-bold mb-4">{editingId ? "Edit Review" : "Write a Review"}</h3>
              {error && <p className="text-brand-red text-sm mb-4 bg-brand-red/10 p-3 rounded">{error}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Rating</label>
                      <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                              <button 
                                key={star} 
                                type="button" 
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                  <Star size={28} className={star <= rating ? "fill-brand-red text-brand-red" : "text-gray-600"} />
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Comment (Optional)</label>
                      <textarea 
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red h-24"
                          placeholder="What did you think of the movie?"
                      />
                  </div>
                  <div className="flex gap-4">
                      <button type="submit" disabled={submitting} className="btn-primary px-6 py-2 rounded text-sm font-bold">
                          {submitting ? "Saving..." : "Submit Review"}
                      </button>
                      <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setRating(0); setComment(""); }} className="text-gray-400 hover:text-white px-4">
                          Cancel
                      </button>
                  </div>
              </form>
          </div>
      )}
      
      {user && !userHasReviewed && !eligibleReservationId && !checkingEligibility && (
          <div className="text-sm text-brand-muted bg-brand-surface-2 p-4 rounded mb-8 border border-brand-border">
              You must watch this movie before you can write a review.
          </div>
      )}
      {!user && (
           <div className="text-sm text-brand-muted bg-brand-surface-2 p-4 rounded mb-8 border border-brand-border">
              Please log in to write a review.
          </div>
      )}

      {reviews.length === 0 ? (
          <p className="text-gray-400 italic">No reviews yet. Be the first to review!</p>
      ) : (
          <div className="space-y-6">
              {reviews.map((r: any) => {
                  const isOwner = user?.id === r.userId;
                  return (
                      <div key={r.id} className="bg-[#161618] rounded-xl p-6 border border-brand-border flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-brand-surface-2 flex items-center justify-center">
                                      {r.user?.photoUrl ? (
                                           // eslint-disable-next-line @next/next/no-img-element
                                          <img src={r.user.photoUrl} alt="User" className="w-full h-full rounded-full object-cover"/>
                                      ) : (
                                          <UserIcon size={20} className="text-gray-500"/>
                                      )}
                                  </div>
                                  <div>
                                      <p className="font-bold">{r.user?.name || "User"}</p>
                                      <div className="flex items-center gap-1 mt-0.5">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={12} className={i < r.rating ? "fill-brand-red text-brand-red" : "text-gray-600"} />
                                          ))}
                                          <span className="text-xs text-brand-muted ml-2">{new Date(r.createdAt).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              {isOwner && (
                                  <div className="flex gap-2">
                                      <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-white bg-[#222224] rounded transition-colors" title="Edit">
                                          <Edit2 size={14} />
                                      </button>
                                      <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:text-white hover:bg-red-500 bg-[#222224] rounded transition-colors" title="Delete">
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                              )}
                          </div>
                          {r.comment && <p className="text-gray-300 text-sm leading-relaxed">{r.comment}</p>}
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}
