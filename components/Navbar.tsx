"use client";

import Link from "next/link";
import { MapPin, Bell, User, LogOut, Ticket } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/api-client";

export function Navbar() {
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
    <nav className="sticky top-0 z-50 w-full bg-brand-void/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-brand-red text-2xl font-bold font-montserrat tracking-tight">
          CineReserve
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white border-b-2 border-transparent hover:border-brand-red pb-1 transition-colors">
            Home
          </Link>
          <Link href="/movies" className="text-gray-400 hover:text-white border-b-2 border-transparent hover:border-brand-red pb-1 transition-colors">
            Movies
          </Link>
          <Link href="/cinemas" className="text-gray-400 hover:text-white border-b-2 border-transparent hover:border-brand-red pb-1 transition-colors">
            Cinemas
          </Link>
        </div>

        <div className="flex items-center gap-5 text-gray-400">
          <button className="hover:text-white transition-colors" aria-label="Location">
            <MapPin size={20} />
          </button>
          {user ? (
            <>
              <button className="hover:text-white transition-colors" aria-label="Notifications">
                <Bell size={20} />
              </button>
              {user.role !== "ADMIN" && (
                <Link href="/bookings" className="hover:text-brand-red transition-colors" aria-label="My Bookings">
                  <Ticket size={20} />
                </Link>
              )}
              <Link href={user.role === "ADMIN" ? "/admin" : "/profile"} className="hover:text-white transition-colors" aria-label="User Profile">
                <User size={20} className="text-brand-red" />
              </Link>
              <button onClick={handleLogout} className="hover:text-brand-red transition-colors" aria-label="Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-white transition-colors" aria-label="User Login">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
