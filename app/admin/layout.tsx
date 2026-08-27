"use client";

import Link from "next/link";
import { 
  LayoutDashboard, Film, Clock, CreditCard, Users, 
  Megaphone, BarChart3, Settings, HelpCircle, LogOut, Bell 
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/api-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      logout();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-white overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-[#161618] border-r border-brand-border flex flex-col justify-between h-full">
        <div>
          <div className="p-6 pb-8">
            <h1 className="text-brand-red font-montserrat font-bold text-2xl tracking-tight">CineReserve</h1>
            <p className="text-brand-muted text-xs uppercase tracking-widest mt-1">System Management</p>
          </div>

          <div className="px-4 mb-6">
            <button className="w-full bg-brand-red text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(229,9,20,0.2)]">
              <span className="text-lg leading-none">+</span> New Reservation
            </button>
          </div>

          <nav className="space-y-1 px-3">
            <NavItem href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem href="/admin/catalog" icon={<Film size={18} />} label="Catalog" />
            <NavItem href="/admin/scheduling" icon={<Clock size={18} />} label="Scheduling" />
            <NavItem href="/admin/transactions" icon={<CreditCard size={18} />} label="Transactions" />
            <NavItem href="/admin/users" icon={<Users size={18} />} label="Users" />
            <NavItem href="/admin/marketing" icon={<Megaphone size={18} />} label="Marketing" />
            <NavItem href="/admin/reports" icon={<BarChart3 size={18} />} label="Reports" />
            <NavItem href="/admin/settings" icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        <div className="p-4 border-t border-brand-border space-y-1">
          <NavItem href="/admin/support" icon={<HelpCircle size={18} />} label="Support" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-[#222224] transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
          
          {/* User Profile small */}
          <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-3 px-3">
             <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-surface-2 flex items-center justify-center font-bold text-xs uppercase text-brand-red">
                {user?.name?.charAt(0) || "A"}
             </div>
             <div>
               <p className="text-xs font-bold text-white truncate max-w-[150px]">{user?.name || "Admin"}</p>
               <p className="text-[10px] text-brand-muted truncate max-w-[150px]">{user?.email || "admin@cinereserve.com"}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 bg-[#0A0A0B] border-b border-brand-border flex items-center justify-between px-8">
          <div className="text-sm font-medium text-gray-400">
            <span className="text-white">Admin</span> &gt; Dashboard
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-surface-2 border border-brand-border flex items-center justify-center font-bold text-xs uppercase text-brand-red">
                {user?.name?.charAt(0) || "A"}
              </div>
              <span className="text-sm font-semibold truncate max-w-[100px]">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-[#222224] transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
