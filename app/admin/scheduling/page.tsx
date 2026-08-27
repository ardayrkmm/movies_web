"use client";

import { Search, Edit2, Trash2, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Showtime } from "@/lib/modules/showtimes/showtimes.types";
import type { Movie } from "@/lib/modules/movies/movies.types";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";
import type { Studio } from "@/lib/modules/studios/studios.types";

export default function AdminSchedulingPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]); // All studios flat mapped or fetched as needed
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Partial<Showtime>>({});

  const fetchData = useCallback(async () => {
    try {
      const [s, m, c] = await Promise.all([
        apiClient("/showtimes"),
        apiClient("/movies"),
        apiClient("/cinemas")
      ]);
      setShowtimes(s.items || []);
      setMovies(m.items || []);
      setCinemas(c.items || []);
      
      // Fetch studios for all cinemas
      const allCinemas = c.items || [];
      const studiosPromises = allCinemas.map((cinema: Cinema) => apiClient(`/cinemas/${cinema.id}/studios`));
      const studiosResults = await Promise.all(studiosPromises);
      const flatStudios = studiosResults.flatMap(res => res.items || res || []);
      setStudios(flatStudios);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShowtime.id) {
        await apiClient(`/showtimes/${editingShowtime.id}`, {
          method: "PUT",
          body: JSON.stringify(editingShowtime),
        });
      } else {
        await apiClient("/showtimes", {
          method: "POST",
          body: JSON.stringify(editingShowtime),
        });
      }
      setIsOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this showtime?")) return;
    try {
      await apiClient(`/showtimes/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const filteredShowtimes = showtimes.filter(s => {
     const movie = movies.find(m => m.id === s.movieId);
     if (search && movie && !movie.title.toLowerCase().includes(search.toLowerCase())) return false;
     return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-md text-3xl font-bold mb-1">Schedule Management</h1>
          <p className="text-gray-400 text-sm">View and manage upcoming movie screenings across all locations.</p>
        </div>
        <button onClick={() => { setEditingShowtime({ status: 'SCHEDULED' }); setIsOpen(true); }} className="bg-brand-red hover:bg-brand-red-hover text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_10px_rgba(229,9,20,0.2)]">
          + Add New Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by movie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161618] border border-brand-border rounded-lg pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#161618] border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1C] text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Cinema</th>
                <th className="px-6 py-4">Theater</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Start</th>
                <th className="px-6 py-4">End</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-gray-300">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8">Loading...</td></tr>
              ) : filteredShowtimes.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8">No showtimes found</td></tr>
              ) : (
                filteredShowtimes.map(s => {
                  const movie = movies.find(m => m.id === s.movieId);
                  const cinema = cinemas.find(c => c.id === s.cinemaId);
                  const studio = studios.find(st => st.id === s.studioId);
                  
                  return (
                    <tr key={s.id} className="hover:bg-[#1A1A1C] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{movie?.title || s.movieId}</td>
                      <td className="px-6 py-4">{cinema?.name || s.cinemaId}</td>
                      <td className="px-6 py-4">{studio?.name || s.studioId}</td>
                      <td className="px-6 py-4">{new Date(s.startAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{new Date(s.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-6 py-4">{new Date(s.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-6 py-4">Rp {s.basePrice}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                          s.status === 'SCHEDULED' ? 'bg-[#ffdad5]/10 text-[#ffb4aa] border-[#5e3f3b]' : 
                          'bg-[#222224] text-gray-400 border-[#333]'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button onClick={() => { setEditingShowtime(s); setIsOpen(true); }} className="text-brand-muted hover:text-white"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(s.id)} className="text-brand-muted hover:text-brand-red"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingShowtime.id ? 'Edit Showtime' : 'Add Showtime'}</h2>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-brand-muted uppercase">Movie</label>
                <select required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingShowtime.movieId || ''} onChange={e => setEditingShowtime({...editingShowtime, movieId: e.target.value})}>
                  <option value="">Select Movie</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase">Cinema</label>
                <select required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingShowtime.cinemaId || ''} onChange={e => setEditingShowtime({...editingShowtime, cinemaId: e.target.value})}>
                  <option value="">Select Cinema</option>
                  {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase">Studio</label>
                <select required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingShowtime.studioId || ''} onChange={e => setEditingShowtime({...editingShowtime, studioId: e.target.value})}>
                  <option value="">Select Studio</option>
                  {studios.filter(s => s.cinemaId === editingShowtime.cinemaId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase">Start Time (Local)</label>
                <input type="datetime-local" required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" 
                  value={editingShowtime.startAt ? new Date(editingShowtime.startAt).toISOString().slice(0,16) : ''} 
                  onChange={e => setEditingShowtime({...editingShowtime, startAt: new Date(e.target.value).toISOString()})} 
                />
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase">Base Price (IDR)</label>
                <input type="number" required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingShowtime.basePrice || 0} onChange={e => setEditingShowtime({...editingShowtime, basePrice: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs text-brand-muted uppercase">Status</label>
                <select required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingShowtime.status || 'SCHEDULED'} onChange={e => setEditingShowtime({...editingShowtime, status: e.target.value as any})}>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="ONGOING">ONGOING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <button type="submit" className="w-full btn-primary py-2 rounded mt-4 font-bold">Save Showtime</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
