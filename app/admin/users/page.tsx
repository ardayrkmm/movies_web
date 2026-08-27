"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Loader2, Search, Users as UsersIcon } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient("/admin/users?limit=50");
        setUsers(res.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center text-brand-muted gap-2">
        <Loader2 className="animate-spin" /> Loading users...
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
        <h1 className="display-sm text-2xl flex items-center gap-3">
          <UsersIcon className="text-brand-red" />
          User Management
        </h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search user..." 
              className="bg-[#161618] border border-brand-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-red"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#161618] border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#1A1A1C] text-brand-muted text-[10px] font-bold uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {users.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-brand-muted">No users found.</td>
                 </tr>
              ) : (
                 users.map((u) => (
                   <tr key={u.id} className="hover:bg-[#1A1A1C] transition-colors">
                     <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                     <td className="px-6 py-4 text-gray-300">{u.email}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                         u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                         'bg-[#222224] text-gray-400 border border-gray-700'
                       }`}>
                         {u.role}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-gray-400">{u.phone || '-'}</td>
                     <td className="px-6 py-4">
                       {u.isActive ? (
                          <span className="text-emerald-500 text-xs font-bold">Active</span>
                       ) : (
                          <span className="text-red-500 text-xs font-bold">Suspended</span>
                       )}
                     </td>
                     <td className="px-6 py-4 text-brand-muted">
                       {new Date(u.createdAt).toLocaleDateString()}
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
