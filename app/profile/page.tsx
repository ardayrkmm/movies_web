"use client";

import { User, Settings, Lock, Loader2, LogOut, Image as ImageIcon, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [profile, setProfile] = useState<any>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!user) {
        // Automatically pushed out by protected route, but we wait just in case
        return;
    }

    const fetchProfile = async () => {
      try {
        const data = await apiClient("/users/me");
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setPhotoUrl(data.photoUrl || "");
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const data = await apiClient("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
           name: name || undefined,
           phone: phone || undefined,
           photoUrl: photoUrl || undefined
        })
      });
      setProfile(data);
      setSuccessMsg("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = async () => {
      try {
          await apiClient("/auth/logout", { method: "POST" });
      } catch (e) {
          // ignore
      }
      logout();
  };

  if (loading) {
     return <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex items-center justify-center animate-pulse"><Loader2 size={32} className="animate-spin text-brand-red mr-4"/> Loading profile...</div>;
  }

  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20">
      <div className="max-w-[1000px] mx-auto px-6 mt-12">
        
        <h1 className="display-lg mb-2 text-white">My Profile</h1>
        <p className="text-gray-400 mb-10">Manage your personal information and preferences.</p>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
          
          {/* Sidebar */}
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 bg-[#2a1614] text-brand-red border-l-2 border-brand-red px-4 py-3 text-sm font-semibold text-left transition-colors">
              <User size={18} />
              Personal Info
            </button>
            <button 
              onClick={() => router.push('/bookings')}
              className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#161618] border-l-2 border-transparent px-4 py-3 text-sm font-semibold text-left transition-colors"
            >
              <Ticket size={18} />
              My Bookings
            </button>
            <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#161618] border-l-2 border-transparent px-4 py-3 text-sm font-semibold text-left transition-colors cursor-not-allowed opacity-50" title="Feature not available yet">
              <Settings size={18} />
              Preferences (WIP)
            </button>
            <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#161618] border-l-2 border-transparent px-4 py-3 text-sm font-semibold text-left transition-colors cursor-not-allowed opacity-50" title="Feature not available yet">
              <Lock size={18} />
              Security (WIP)
            </button>
            <div className="pt-6 mt-6 border-t border-brand-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-brand-red hover:text-red-400 hover:bg-[#161618] border-l-2 border-transparent px-4 py-3 text-sm font-semibold text-left transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Personal Information */}
            <section className="bg-[#161618] rounded-xl p-8 border border-brand-border">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-brand-border">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-border bg-brand-surface-2 shrink-0 flex items-center justify-center">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="headline-md m-0 mb-1">Personal Information</h2>
                  <div className="flex items-center gap-2 mt-2">
                     <ImageIcon size={14} className="text-brand-muted" />
                     <input 
                         type="url"
                         placeholder="Paste a new avatar URL"
                         value={photoUrl}
                         onChange={(e) => setPhotoUrl(e.target.value)}
                         className="text-xs bg-transparent border-b border-brand-border focus:border-brand-red outline-none px-1 py-0.5 w-64 text-gray-300"
                     />
                  </div>
                </div>
              </div>

              {error && <p className="text-brand-red text-sm mb-6 bg-brand-red/10 p-3 rounded-lg border border-brand-red/20">{error}</p>}
              {successMsg && <p className="text-green-400 text-sm mb-6 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{successMsg}</p>}

              <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-gray-500 cursor-not-allowed"
                    title="Email cannot be changed"
                  />
                </div>
                <div>
                  <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>
                
                <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded font-bold text-sm shadow-[0_0_10px_rgba(229,9,20,0.2)] disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
