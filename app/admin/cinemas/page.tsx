"use client";

import { Search, Plus, Edit2, Trash2, X, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Cinema } from "@/lib/modules/cinemas/cinemas.types";
import Link from "next/link";

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Partial<Cinema>>({});

  const fetchCinemas = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (statusFilter) q.set("isActive", statusFilter);

      const endpoint = `/cinemas${q.toString() ? `?${q.toString()}` : ''}`;
      const data = await apiClient(endpoint);
      setCinemas(data.items || data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchCinemas, 300);
    return () => clearTimeout(t);
  }, [fetchCinemas]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCinema.id) {
        await apiClient(`/cinemas/${editingCinema.id}`, {
          method: "PUT",
          body: JSON.stringify(editingCinema),
        });
      } else {
        await apiClient("/cinemas", {
          method: "POST",
          body: JSON.stringify(editingCinema),
        });
      }
      setIsOpen(false);
      fetchCinemas();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete cinema? Ensure it has no studios.")) return;
    try {
      await apiClient(`/cinemas/${id}`, { method: "DELETE" });
      fetchCinemas();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-md text-3xl font-bold mb-1">Cinema Management</h1>
          <p className="text-gray-400 text-sm">Manage locations, screens, and operational status.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingCinema({ isActive: true }); setIsOpen(true); }}
            className="bg-brand-red hover:bg-brand-red-hover text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-[0_0_10px_rgba(229,9,20,0.2)] flex items-center gap-2"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#161618] border border-brand-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search cinemas by name or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#222224] border border-brand-border rounded pl-11 pr-4 py-2 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
            />
          </div>
        </div>
        <div className="w-full md:w-40">
          <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-1 uppercase">Status</label>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full appearance-none bg-[#222224] border border-brand-border rounded px-3 py-2 text-white focus:outline-none focus:border-brand-muted transition-colors text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#161618] border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1C] text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="px-6 py-4 flex items-center gap-1">CINEMA NAME</th>
                <th className="px-6 py-4">CITY</th>
                <th className="px-6 py-4">ADDRESS</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-gray-300">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
              ) : cinemas.length > 0 ? (
                cinemas.map(cinema => (
                  <tr key={cinema.id} className="hover:bg-[#1A1A1C] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-brand-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=100&auto=format&fit=crop"} alt={cinema.name} className={`w-full h-full object-cover ${!cinema.isActive ? 'grayscale opacity-60' : ''}`} />
                        </div>
                        <div>
                          <div className="font-bold text-white mb-0.5">{cinema.name}</div>
                          <div className="text-[10px] text-brand-muted">ID: {cinema.id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{cinema.city}</td>
                    <td className="px-6 py-4">{cinema.address}</td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                        cinema.isActive ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 
                        'border-gray-500/30 text-gray-400 bg-gray-500/10'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          cinema.isActive ? 'bg-emerald-500' : 
                          'bg-gray-500'
                        }`}></span>
                        {cinema.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-3 text-brand-muted">
                         <Link href={`/admin/cinemas/${cinema.id}`} className="hover:text-white"><Eye size={18}/></Link>
                         <button onClick={() => { setEditingCinema(cinema); setIsOpen(true); }} className="hover:text-white"><Edit2 size={18}/></button>
                         <button onClick={() => handleDelete(cinema.id)} className="hover:text-brand-red"><Trash2 size={18}/></button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-10">No cinemas found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingCinema.id ? 'Edit Cinema' : 'Add Cinema'}</h2>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="text-xs text-brand-muted uppercase">Name</label><input required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingCinema.name || ''} onChange={e => setEditingCinema({...editingCinema, name: e.target.value})} /></div>
              <div><label className="text-xs text-brand-muted uppercase">Slug</label><input required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingCinema.slug || ''} onChange={e => setEditingCinema({...editingCinema, slug: e.target.value})} /></div>
              <div><label className="text-xs text-brand-muted uppercase">Description</label><textarea className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingCinema.description || ''} onChange={e => setEditingCinema({...editingCinema, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-brand-muted uppercase">City</label><input required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingCinema.city || ''} onChange={e => setEditingCinema({...editingCinema, city: e.target.value})} /></div>
                <div><label className="text-xs text-brand-muted uppercase">Address</label><input required className="w-full bg-[#222224] p-2 rounded mt-1 text-sm" value={editingCinema.address || ''} onChange={e => setEditingCinema({...editingCinema, address: e.target.value})} /></div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={editingCinema.isActive !== false} onChange={e => setEditingCinema({...editingCinema, isActive: e.target.checked})} />
                <label className="text-sm">Active</label>
              </div>
              <button type="submit" className="w-full btn-primary py-2 rounded mt-4 text-sm font-bold">Save Cinema</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
