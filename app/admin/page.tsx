"use client";

import { Film, Ticket, DollarSign, Megaphone, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, popularData, reservationsData] = await Promise.all([
          apiClient("/admin/dashboard/stats"),
          apiClient("/admin/dashboard/popular-movies?limit=4"),
          apiClient("/admin/dashboard/recent-reservations?limit=10")
        ]);
        
        setStats(statsData);
        setPopularMovies(popularData || []);
        setRecentReservations(reservationsData.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center text-brand-muted gap-2">
        <Loader2 className="animate-spin" /> Loading dashboard...
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="TOTAL USERS" value={stats?.totalUsers || 0} subtitle="Registered accounts" icon={<Users size={20} />} trend="neutral" />
        <StatCard title="TOTAL MOVIES" value={stats?.totalMovies || 0} subtitle="In catalog" icon={<Film size={20} />} trend="neutral" />
        <StatCard title="TOTAL RESERVATIONS" value={stats?.totalReservations || 0} subtitle="All time" icon={<Ticket size={20} />} trend="neutral" />
        <StatCard title="TOTAL REVENUE" value={`Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`} subtitle="From paid bookings" icon={<DollarSign size={20} />} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Chart Area */}
        <div className="bg-[#161618] border border-brand-border rounded-xl p-6 h-[400px] flex flex-col">
          <h2 className="headline-md mb-6">Reservation Trend</h2>
          {/* Mock Chart Area - Still a UI placeholder as we don't have a chart library installed */}
          <div className="flex-1 relative border-l border-b border-[#333] mt-4 ml-6 mb-6 flex items-end">
            <div className="absolute top-0 -left-8 text-xs text-brand-muted">200</div>
            <div className="absolute top-1/4 -left-8 text-xs text-brand-muted">150</div>
            <div className="absolute top-1/2 -left-8 text-xs text-brand-muted">100</div>
            <div className="absolute top-3/4 -left-6 text-xs text-brand-muted">50</div>
            <div className="absolute bottom-0 -left-4 text-xs text-brand-muted">0</div>
            
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 0,80 Q 20,78 40,75 T 60,40 T 80,20 T 100,25" fill="none" stroke="#E50914" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <div className="absolute -bottom-6 w-full flex justify-between text-xs text-brand-muted">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Popular Movies */}
        <div className="bg-[#161618] border border-brand-border rounded-xl p-6">
          <h2 className="headline-md mb-6">Popular Movies</h2>
          <div className="space-y-5">
            {popularMovies.length === 0 ? (
               <p className="text-sm text-brand-muted">No popular movies data.</p>
            ) : (
               popularMovies.map((pm, idx) => (
                  <PopularMovieBar key={pm.id || idx} title={pm.title || "Unknown"} percentage={Math.max(10, 100 - (idx * 20))} />
               ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-[#161618] border border-brand-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <h2 className="headline-md">Recent Reservations</h2>
          <Link href="/admin/reports" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">View Reports</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1C] text-brand-muted text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {recentReservations.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-brand-muted">No recent reservations found.</td>
                 </tr>
              ) : (
                 recentReservations.slice(0, 5).map((res: any) => (
                   <TableRow 
                     key={res.id}
                     id={`#${res.bookingCode || res.id.substring(0,6)}`} 
                     customer={res.user?.name || "Unknown"} 
                     movie={res.movie?.title || "Unknown"} 
                     total={`Rp ${(res.total || 0).toLocaleString('id-ID')}`} 
                     status={res.status} 
                     date={new Date(res.createdAt).toLocaleDateString()} 
                   />
                 ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend }: any) {
  return (
    <div className="bg-[#161618] border border-brand-border rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold tracking-widest text-brand-muted uppercase">{title}</h3>
        <div className="p-2 bg-[#222224] rounded-lg text-gray-400">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-montserrat font-bold mb-2">{value}</div>
      <div className={`text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-brand-muted'} flex items-center gap-1`}>
        {trend === 'up' && <span>↑</span>}
        {subtitle}
      </div>
    </div>
  );
}

function PopularMovieBar({ title, percentage }: { title: string, percentage: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300 truncate w-[120px]">{title}</span>
        <span className="font-bold text-white">{percentage}%</span>
      </div>
      <div className="h-4 bg-[#222224] rounded-sm overflow-hidden flex">
        <div className="h-full bg-[#ffb4aa] rounded-sm" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function TableRow({ id, customer, movie, total, status, date }: any) {
  return (
    <tr className="hover:bg-[#1A1A1C] transition-colors">
      <td className="px-6 py-4 text-brand-muted">{id}</td>
      <td className="px-6 py-4 font-semibold text-white">{customer}</td>
      <td className="px-6 py-4 text-gray-300">{movie}</td>
      <td className="px-6 py-4 font-bold text-white">{total}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
          status === 'CANCELLED' || status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-brand-muted">{date}</td>
    </tr>
  );
}

import { Users } from "lucide-react";
