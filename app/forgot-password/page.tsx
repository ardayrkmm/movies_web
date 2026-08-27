import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white">
      {/* Background Image (Abstract/Dark) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />

      {/* Header Logo outside card */}
      <div className="relative z-10 mb-8">
        <h1 className="text-brand-red font-montserrat font-bold text-2xl tracking-[0.2em] uppercase">CineReserve</h1>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#121212]/95 backdrop-blur-md rounded-xl p-8 md:p-10 border border-[#222] shadow-2xl mx-4">
        
        <h2 className="display-md text-2xl font-montserrat font-bold mb-3 text-white">Forgot Password?</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Enter your email address and we will send you instructions to reset your password.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-brand-muted text-[10px] font-bold tracking-widest mb-2 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full bg-[#1A1A1A] border border-[#333] rounded pl-11 pr-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors text-sm"
              />
            </div>
          </div>

          <button type="button" className="w-full btn-primary py-3.5 rounded font-bold tracking-wider text-xs uppercase flex items-center justify-center gap-2 mt-2">
            Send Reset Link
            <span className="text-lg leading-none">→</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>

      {/* Footer text outside card */}
      <div className="absolute bottom-8 z-10 text-center text-xs text-brand-muted w-full px-4">
        &copy; 2024 CineReserve. Cinematic experiences redefined.
      </div>
    </div>
  );
}
