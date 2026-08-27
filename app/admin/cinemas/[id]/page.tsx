"use client";

import { Plus, Accessibility, Ear, Armchair, Wrench, Edit2, Trash2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";
import type { Studio } from "@/lib/modules/studios/studios.types";

export default function TheaterRoomsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Partial<Studio>>({});

  const fetchData = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([
        apiClient(`/cinemas/${id}`),
        apiClient(`/cinemas/${id}/studios`)
      ]);
      setCinema(c);
      setStudios(s.items || s || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      (async () => {
        await fetchData();
      })();
    }
  }, [id, fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...editingStudio };
      if (!payload.cinemaId) payload.cinemaId = id;
      
      if (editingStudio.id) {
        await apiClient(`/studios/${editingStudio.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient(`/cinemas/${id}/studios`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setIsOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (studioId: string) => {
    if (!confirm("Are you sure you want to delete this studio?")) return;
    try {
      await apiClient(`/studios/${studioId}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading studios...</div>;
  }

  if (!cinema) {
    return <div className="p-10 text-center">Cinema not found.</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <button onClick={() => router.push('/admin/cinemas')} className="text-brand-muted text-xs font-bold tracking-widest uppercase mb-1 hover:text-white">&larr; BACK TO CINEMAS</button>
          <h1 className="display-md text-4xl font-bold mb-1 text-white">{cinema.name} - Studios</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => { setEditingStudio({ totalSeats: 100, type: 'REGULAR', isActive: true }); setIsOpen(true); }}
            className="bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_10px_rgba(229,9,20,0.2)] flex items-center gap-2"
          >
            <Plus size={16} /> Add Theater Room
          </button>
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        
        {studios.map(studio => (
          <div key={studio.id} className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col justify-between h-full hover:border-gray-600 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{studio.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider border ${
                   studio.isActive ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 
                   'border-amber-500/30 text-amber-500 bg-amber-500/10'
                }`}>
                  {studio.isActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> : <Wrench size={12} />}
                  {studio.isActive ? 'ACTIVE' : 'MAINTENANCE'}
                </span>
              </div>
              
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] font-bold uppercase tracking-widest">
                  {studio.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest mb-1">CAPACITY</p>
                  <p className="text-2xl font-bold text-white">{studio.totalSeats} <span className="text-sm font-normal text-gray-400">seats</span></p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <span className="text-sm text-gray-300"></span>
              <div className="flex gap-2">
                 <button onClick={() => { setEditingStudio(studio); setIsOpen(true); }} className="p-2 bg-[#222224] rounded-lg text-gray-400 hover:text-white hover:bg-[#333] transition-colors border border-brand-border">
                   <Edit2 size={16} />
                 </button>
                 <button onClick={() => handleDelete(studio.id)} className="p-2 bg-[#222224] rounded-lg text-brand-red hover:bg-brand-red-hover hover:text-white transition-colors border border-brand-border">
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Room */}
        <button onClick={() => { setEditingStudio({ totalSeats: 100, type: 'REGULAR', isActive: true }); setIsOpen(true); }} className="border-2 border-dashed border-[#333] bg-brand-void/50 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-brand-red hover:bg-brand-red/5 transition-colors min-h-[300px]">
          <div className="w-14 h-14 bg-[#222224] rounded-xl flex items-center justify-center text-white">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Add Theater Room</h3>
            <p className="text-brand-muted text-sm max-w-[200px] mx-auto">
              Configure a new screening environment for this location.
            </p>
          </div>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingStudio.id ? 'Edit Studio' : 'Add Studio'}</h2>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-brand-muted uppercase">Name (e.g. Studio 1)</label>
                <input required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingStudio.name || ''} onChange={e => setEditingStudio({...editingStudio, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-brand-muted uppercase">Capacity (Seats)</label>
                  <input type="number" required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingStudio.totalSeats || 0} onChange={e => setEditingStudio({...editingStudio, totalSeats: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs text-brand-muted uppercase">Type</label>
                  <select required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingStudio.type || 'REGULAR'} onChange={e => setEditingStudio({...editingStudio, type: e.target.value as any})}>
                    <option value="REGULAR">REGULAR</option>
                    <option value="IMAX">IMAX</option>
                    <option value="PREMIERE">PREMIERE</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                 <input type="checkbox" checked={editingStudio.isActive !== false} onChange={e => setEditingStudio({...editingStudio, isActive: e.target.checked})} />
                 <label className="text-sm">Active</label>
              </div>
              <button type="submit" className="w-full btn-primary py-2 rounded mt-4 text-sm font-bold">Save Studio</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
