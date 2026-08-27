"use client";

import { Calendar, MapPin, Ticket, DollarSign, Armchair, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("this_month");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [statsData, popularData, resData] = await Promise.all([
          apiClient("/admin/dashboard/stats"),
          apiClient("/admin/dashboard/popular-movies?limit=5"),
            apiClient(`/admin/transactions?limit=50`)
          ]);
          
          setStats(statsData);
          setPopularMovies(popularData || []);
          setReservations(resData.items || []);
        } catch (err: any) {
          setError(err.message || "Failed to load reports");
        } finally {
          setLoading(false);
        }
      };
      
      fetchReports();
    }, [period]);
  
    if (loading) {
      return (
        <div className="flex h-[600px] items-center justify-center text-brand-muted gap-2">
          <Loader2 className="animate-spin" /> Loading reports...
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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="display-md text-3xl font-bold mb-1">Reports & Analytics</h1>
            <p className="text-gray-400 text-sm">Performance metrics across the system.</p>
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-[#161618] border border-brand-border px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm focus:outline-none"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>
  
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-bold tracking-widest text-brand-muted uppercase">TOTAL REVENUE (ALL TIME)</h3>
              <DollarSign size={16} className="text-brand-red" />
            </div>
            <div className="text-4xl font-montserrat font-bold text-white mb-2">
               Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}
            </div>
          </div>
  
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-bold tracking-widest text-brand-muted uppercase">TOTAL RESERVATIONS</h3>
              <Ticket size={16} className="text-brand-red" />
            </div>
            <div className="text-4xl font-montserrat font-bold text-white mb-2">
               {stats?.totalReservations || 0}
            </div>
          </div>
        </div>
  
        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Performing Movies */}
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col">
            <h2 className="headline-md mb-6">Top Performing Movies</h2>
            <div className="space-y-4">
               {popularMovies.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data available.</p>
               ) : (
                  popularMovies.map((pm, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{pm.title || "Unknown Movie"}</span>
                        </div>
                        <div className="h-4 bg-[#222224] rounded-sm overflow-hidden flex">
                          <div className="h-full bg-[#ffb4aa] rounded-sm" style={{ width: `${Math.max(10, 100 - (idx * 15))}%` }}></div>
                        </div>
                      </div>
                  ))
               )}
            </div>
          </div>
  
        </div>
  
        {/* Table */}
        <div className="bg-[#161618] border border-brand-border rounded-xl overflow-hidden mt-6">
          <div className="p-6 border-b border-brand-border">
            <h2 className="headline-md m-0">Recent Reservations Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1A1A1C] text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="px-6 py-4">BOOKING CODE</th>
                  <th className="px-6 py-4">CUSTOMER</th>
                  <th className="px-6 py-4">MOVIE</th>
                  <th className="px-6 py-4">AMOUNT</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-gray-300">
                 {reservations.length === 0 ? (
                     <tr>
                         <td colSpan={6} className="px-6 py-8 text-center text-brand-muted">No reservations found for this period.</td>
                     </tr>
                 ) : (
                     reservations.map((res: any) => (
                         <tr key={res.id} className="hover:bg-[#1A1A1C] transition-colors">
                             <td className="px-6 py-4 font-semibold text-white">#{res.bookingCode || res.id.substring(0,6)}</td>
                             <td className="px-6 py-4">{res.user?.name || "Unknown"}</td>
                             <td className="px-6 py-4">{res.movie?.title || "Unknown"}</td>
                             <td className="px-6 py-4 text-white font-bold">Rp {(res.total || 0).toLocaleString('id-ID')}</td>
                             <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                     res.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                                     res.status === 'CANCELLED' || res.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500' :
                                     'bg-amber-500/10 text-amber-500'
                                 }`}>
                                     {res.status}
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-brand-muted">{new Date(res.createdAt).toLocaleDateString()}</td>
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
