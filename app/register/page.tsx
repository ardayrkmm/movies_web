"use client";

import Link from "next/link";
import { User, Mail, Phone, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password }),
      });
      login(response.accessToken, response.refreshToken, response.user);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center bg-brand-void text-white overflow-y-auto">
      {/* Background Image (Right side focused) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 fixed"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-void via-brand-void/80 to-transparent fixed" />

      {/* Register Card (Left aligned) */}
      <div className="relative z-10 w-full max-w-[500px] ml-0 md:ml-20 lg:ml-32 p-8 md:p-12 bg-brand-void/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none border border-brand-border md:border-none rounded-xl mx-4 md:mx-0 my-8">
        
        <h1 className="display-lg text-5xl mb-2 text-white leading-tight font-montserrat">
          Join<br/>CineReserve
        </h1>
        <p className="text-gray-300 mb-10 font-medium">
          Unlock the ultimate cinematic experience.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#161618] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#161618] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#161618] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#161618] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm tracking-widest"
                />
              </div>
            </div>
            <div>
              <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Confirm Password</label>
              <div className="relative">
                <Unlock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#161618] border border-brand-border rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm tracking-widest"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-6 mb-8 pt-2">
            <input 
              type="checkbox" 
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-[#161618] border-brand-border text-brand-red focus:ring-brand-red cursor-pointer shrink-0" 
            />
            <span className="text-gray-300 text-xs leading-relaxed">
              I agree to the Terms & Conditions and Privacy Policy.
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded font-bold tracking-wider text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING..." : "Create Account"}
            {!loading && <span className="text-2xl leading-none">→</span>}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-bold hover:text-brand-red transition-colors uppercase tracking-wider text-[11px] ml-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
