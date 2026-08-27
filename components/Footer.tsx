import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-brand-void border-t border-brand-border py-10 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="text-brand-red text-2xl font-bold font-montserrat tracking-tight">
          CineReserve
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <Link href="/movies" className="hover:text-white transition-colors">Movies</Link>
          <Link href="/cinemas" className="hover:text-white transition-colors">Cinemas</Link>
          <Link href="/bookings" className="hover:text-white transition-colors">Bookings</Link>
          <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
          <Link href="/company" className="hover:text-white transition-colors">Company</Link>
        </div>

        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CineReserve. All rights reserved. Cinematic experiences redefined.
        </div>
      </div>
    </footer>
  );
}
