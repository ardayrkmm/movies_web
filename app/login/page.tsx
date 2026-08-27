"use client";

import Link from "next/link";
import { Mail, Lock, Clapperboard } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(response.accessToken, response.refreshToken, response.user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-void text-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-void via-transparent to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#161618]/90 backdrop-blur-md rounded-xl p-8 border border-brand-border shadow-2xl mx-4">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clapperboard className="text-brand-red" size={28} />
          <span className="text-brand-red font-montserrat font-bold text-3xl tracking-tight">CineReserve</span>
        </div>
        
        <p className="text-center text-gray-300 mb-8 font-medium">
          Sign in to your cinematic experience.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="director@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#222224] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#222224] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm tracking-widest"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded bg-[#222224] border-brand-border text-brand-red focus:ring-brand-red cursor-pointer" />
              <span className="text-gray-400 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-gray-400 hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded font-bold tracking-wider text-sm mt-2 shadow-[0_0_15px_rgba(229,9,20,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-brand-border pt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white font-bold hover:text-brand-red transition-colors uppercase tracking-wider text-[11px] ml-1">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
