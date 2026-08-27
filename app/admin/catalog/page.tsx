"use client";

import { Search, Eye, Edit2, Trash2, X, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Movie } from "@/lib/modules/movies/movies.types";
import type { Genre } from "@/lib/modules/genres/genres.types";

export default function AdminCatalogPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals state
  const [isMovieOpen, setIsMovieOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Partial<Movie>>({});
  
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Partial<Genre>>({});

  const fetchMovies = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (selectedGenre) queryParams.set("genreId", selectedGenre);
      if (selectedStatus) queryParams.set("status", selectedStatus);
      
      const endpoint = `/movies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await apiClient(endpoint);
      setMovies(data.items || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedGenre, selectedStatus]);

  const fetchGenres = useCallback(async () => {
    try {
      const data = await apiClient("/genres");
      setGenres(data.items || data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchGenres();
    })();
  }, [fetchGenres]);

  useEffect(() => {
    const t = setTimeout(fetchMovies, 300);
    return () => clearTimeout(t);
  }, [fetchMovies]);

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...editingMovie };
      if (!payload.genres) {
         payload.genres = [];
      }
      
      if (editingMovie.id) {
        await apiClient(`/movies/${editingMovie.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient("/movies", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setIsMovieOpen(false);
      fetchMovies();
    } catch (error: any) {
      alert("Error: " + (error.message || "Failed"));
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiClient(`/movies/${id}`, { method: "DELETE" });
      fetchMovies();
    } catch (e: any) {
      alert("Error: " + (e.message || "Failed"));
    }
  };

  const handleSaveGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGenre.id) {
        await apiClient(`/genres/${editingGenre.id}`, {
          method: "PUT",
          body: JSON.stringify(editingGenre),
        });
      } else {
        await apiClient("/genres", {
          method: "POST",
          body: JSON.stringify(editingGenre),
        });
      }
      setIsGenreOpen(false);
      fetchGenres();
    } catch (error: any) {
      alert("Error: " + (error.message || "Failed"));
    }
  };

  const handleDeleteGenre = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiClient(`/genres/${id}`, { method: "DELETE" });
      fetchGenres();
    } catch (e: any) {
      alert("Error: " + (e.message || "Failed"));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-md text-3xl font-bold mb-1">Movie Management</h1>
          <p className="text-gray-400 text-sm">Manage catalog entries, update metadata, and control visibility.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setEditingGenre({ name: '', slug: '' }); setIsGenreOpen(true); }}
            className="bg-[#161618] border border-brand-border text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors"
          >
            Manage Genres
          </button>
          <button 
            onClick={() => { setEditingMovie({ title: '', slug: '', duration: 120, ageRating: 'PG-13', status: 'UPCOMING', genres: [] }); setIsMovieOpen(true); }}
            className="bg-brand-red hover:bg-brand-red-hover text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_10px_rgba(229,9,20,0.2)]"
          >
            + Add New Movie
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#161618] border border-brand-border rounded-xl p-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Search Catalog</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#222224] border border-brand-border rounded pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Genre</label>
          <select 
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="w-full appearance-none bg-[#222224] border border-brand-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-muted transition-colors text-sm cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Status</label>
          <select 
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full appearance-none bg-[#222224] border border-brand-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-muted transition-colors text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="NOW_SHOWING">Now Showing</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>
      </div>

      {/* Table Header Row (Custom grid layout for list) */}
      <div className="px-6 grid grid-cols-[80px_1fr_200px_100px_150px_100px_120px] gap-4 text-[10px] font-bold uppercase tracking-wider text-brand-muted hidden md:grid">
        <div>Poster</div>
        <div>Movie Title</div>
        <div>Genre</div>
        <div>Duration</div>
        <div>Release Date</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-[#161618] rounded-xl border border-brand-border"></div>)}
          </div>
        ) : movies.length > 0 ? (
          movies.map(movie => (
            <div key={movie.id} className="bg-[#161618] border border-brand-border rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-gray-600 transition-colors">
              <div className="w-[60px] h-[85px] shrink-0 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={movie.posterUrl || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=200&auto=format&fit=crop"} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-[1fr_200px_100px_150px_100px_120px] items-center gap-4 text-sm">
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{movie.title}</h3>
                  <p className="text-brand-muted text-xs">Rating: {movie.ageRating}</p>
                </div>
                <div className="text-gray-300">{movie.genres ? movie.genres.join(", ") : "N/A"}</div>
                <div className="text-gray-300">{movie.duration} min</div>
                <div className="text-gray-300">{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "N/A"}</div>
                <div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    movie.status === 'NOW_SHOWING' ? 'bg-[#ffdad5]/10 text-[#ffb4aa] border border-[#5e3f3b]' : 'bg-[#222224] text-gray-400 border border-[#333]'
                  }`}>
                    {movie.status}
                  </span>
                </div>
                <div className="flex justify-end gap-3 text-brand-muted">
                  <button onClick={() => { setEditingMovie(movie); setIsMovieOpen(true); }} className="hover:text-white transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDeleteMovie(movie.id)} className="hover:text-brand-red transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 border border-brand-border rounded-xl">No movies found.</div>
        )}
      </div>

      {/* Movie Modal */}
      {isMovieOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingMovie.id ? 'Edit Movie' : 'Add Movie'}</h2>
              <button onClick={() => setIsMovieOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMovie} className="space-y-4">
              <div><label className="text-xs text-brand-muted uppercase">Title</label><input required className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.title || ''} onChange={e => setEditingMovie({...editingMovie, title: e.target.value})} /></div>
              <div><label className="text-xs text-brand-muted uppercase">Slug</label><input required className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.slug || ''} onChange={e => setEditingMovie({...editingMovie, slug: e.target.value})} /></div>
              <div><label className="text-xs text-brand-muted uppercase">Description</label><textarea className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.description || ''} onChange={e => setEditingMovie({...editingMovie, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-brand-muted uppercase">Duration (mins)</label><input type="number" required className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.duration || 0} onChange={e => setEditingMovie({...editingMovie, duration: parseInt(e.target.value)})} /></div>
                <div><label className="text-xs text-brand-muted uppercase">Age Rating</label><input required className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.ageRating || ''} onChange={e => setEditingMovie({...editingMovie, ageRating: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs text-brand-muted uppercase">Release Date</label><input type="date" className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.releaseDate ? new Date(editingMovie.releaseDate).toISOString().split('T')[0] : ''} onChange={e => setEditingMovie({...editingMovie, releaseDate: new Date(e.target.value).toISOString()})} /></div>
                 <div><label className="text-xs text-brand-muted uppercase">Language</label><input required className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.language || 'English'} onChange={e => setEditingMovie({...editingMovie, language: e.target.value})} /></div>
              </div>
              <div>
                 <label className="text-xs text-brand-muted uppercase">Genre IDs (comma separated)</label>
                 <input className="w-full bg-[#222224] p-2 rounded mt-1" value={(editingMovie.genres || []).join(', ')} onChange={e => setEditingMovie({...editingMovie, genres: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
              </div>
              <div>
                 <label className="text-xs text-brand-muted uppercase">Status</label>
                 <select className="w-full bg-[#222224] p-2 rounded mt-1" value={editingMovie.status || 'UPCOMING'} onChange={e => setEditingMovie({...editingMovie, status: e.target.value as any})}>
                   <option value="UPCOMING">Upcoming</option>
                   <option value="NOW_SHOWING">Now Showing</option>
                   <option value="ENDED">Ended</option>
                 </select>
              </div>
              <button type="submit" className="w-full btn-primary py-2 rounded mt-4">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Genre Modal */}
      {isGenreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#161618] border border-brand-border rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage Genres</h2>
              <button onClick={() => setIsGenreOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6">
              {genres.map(g => (
                <div key={g.id} className="flex items-center justify-between bg-[#222224] p-3 rounded">
                   <span>{g.name}</span>
                   <div className="flex gap-3 text-brand-muted">
                     <button onClick={() => setEditingGenre(g)}><Edit2 size={16}/></button>
                     <button onClick={() => handleDeleteGenre(g.id)} className="hover:text-brand-red"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
              {genres.length === 0 && <p className="text-sm text-brand-muted">No genres found.</p>}
            </div>

            <form onSubmit={handleSaveGenre} className="border-t border-brand-border pt-4">
              <h3 className="font-bold text-sm mb-3">{editingGenre.id ? 'Edit Genre' : 'New Genre'}</h3>
              <div className="space-y-3">
                <input required placeholder="Genre Name" className="w-full bg-[#222224] p-2 rounded text-sm" value={editingGenre.name || ''} onChange={e => setEditingGenre({...editingGenre, name: e.target.value})} />
                <input required placeholder="Slug (e.g. action)" className="w-full bg-[#222224] p-2 rounded text-sm" value={editingGenre.slug || ''} onChange={e => setEditingGenre({...editingGenre, slug: e.target.value})} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 btn-primary py-2 rounded text-sm">Save</button>
                  {editingGenre.id && <button type="button" onClick={() => setEditingGenre({name:'', slug:''})} className="bg-gray-700 px-4 rounded text-sm">Cancel</button>}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
