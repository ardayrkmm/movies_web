import Link from "next/link";
import { EyeOff, ArrowLeft, Clapperboard, RotateCcw } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white">
      {/* Background Image (Abstract/Dark) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#121212]/95 backdrop-blur-md rounded-xl p-8 md:p-10 border border-[#222] shadow-2xl mx-4">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clapperboard className="text-brand-red" size={28} />
          <span className="text-brand-red font-montserrat font-bold text-3xl tracking-tight">CineReserve</span>
        </div>
        
        <h2 className="display-md text-2xl font-montserrat font-bold mb-2 text-white text-center">Reset Password</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed text-center">
          Create a new, strong password for your account.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">New Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-4 pr-11 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm tracking-widest"
              />
              <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white transition-colors" size={18} />
            </div>
            {/* Strength indicator */}
            <div className="flex gap-1 mt-2">
              <div className="h-1 flex-1 bg-brand-red rounded-full"></div>
              <div className="h-1 flex-1 bg-[#333] rounded-full"></div>
              <div className="h-1 flex-1 bg-[#333] rounded-full"></div>
              <div className="h-1 flex-1 bg-[#333] rounded-full"></div>
            </div>
          </div>

          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Confirm New Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-4 pr-11 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm tracking-widest"
              />
              <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white transition-colors" size={18} />
            </div>
          </div>

          <button type="button" className="w-full btn-primary py-3.5 rounded font-bold tracking-wider text-sm flex items-center justify-center gap-2 mt-4 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
            Reset Password
            <RotateCcw size={16} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#222] pt-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>

      {/* Footer text outside card */}
      <div className="absolute bottom-8 z-10 text-center text-xs text-brand-muted w-full px-4">
        &copy; 2024 CineReserve. All rights reserved. Cinematic experiences redefined.
      </div>
    </div>
  );
}
