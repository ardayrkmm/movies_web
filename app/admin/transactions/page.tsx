"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Loader2, Search, Filter, Edit2, CheckCircle, XCircle } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await apiClient("/admin/transactions?limit=50");
      setTransactions(res.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this transaction as ${newStatus}?`)) return;
    
    setUpdatingId(id);
    try {
      await apiClient(`/admin/transactions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      // Refresh list
      await fetchTransactions();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center text-brand-muted gap-2">
        <Loader2 className="animate-spin" /> Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-brand-red/10 border border-brand-red text-brand-red p-4 rounded text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="display-sm text-2xl">Transactions</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search booking code..." 
              className="bg-[#161618] border border-brand-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-red"
            />
          </div>
          <button className="bg-[#161618] border border-brand-border text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#222224] transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-[#161618] border border-brand-border rounded-xl overflow-hidden overflow-x-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1C] text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Booking Code</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {transactions.length === 0 ? (
                 <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-brand-muted">No transactions found.</td>
                 </tr>
              ) : (
                 transactions.map((t) => (
                   <tr key={t.id} className="hover:bg-[#1A1A1C] transition-colors">
                     <td className="px-6 py-4 font-mono text-brand-muted">#{t.bookingCode || t.id.substring(0,8)}</td>
                     <td className="px-6 py-4 text-gray-300">
                       {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </td>
                     <td className="px-6 py-4 font-semibold text-white">{t.user?.name}</td>
                     <td className="px-6 py-4 text-gray-300 truncate max-w-[150px]">{t.movie?.title}</td>
                     <td className="px-6 py-4 text-gray-400">{t.cinema?.name}</td>
                     <td className="px-6 py-4 font-bold text-white">Rp {(t.total || 0).toLocaleString('id-ID')}</td>
                     <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                         t.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                         t.status === 'CANCELLED' || t.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                         'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                       }`}>
                         {t.status}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                           <button 
                             onClick={() => handleUpdateStatus(t.id, 'PAID')}
                             disabled={updatingId === t.id || t.status === 'PAID'}
                             className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-30"
                             title="Mark as PAID"
                           >
                             <CheckCircle size={16} />
                           </button>
                           <button 
                             onClick={() => handleUpdateStatus(t.id, 'CANCELLED')}
                             disabled={updatingId === t.id || t.status === 'CANCELLED' || t.status === 'EXPIRED'}
                             className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-30"
                             title="Mark as CANCELLED"
                           >
                             <XCircle size={16} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
