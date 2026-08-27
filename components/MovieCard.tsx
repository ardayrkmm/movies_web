import Image from "next/image";
import Link from "next/link";

interface MovieCardProps {
  id: string;
  title: string;
  genre: string;
  imageUrl: string;
}

export function MovieCard({ id, title, genre, imageUrl }: MovieCardProps) {
  return (
    <Link href={`/movies/${id}`} className="block group w-full">
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-brand-border bg-brand-surface-1 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-brand-red group-hover:shadow-[0_0_15px_rgba(229,9,20,0.4)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-full"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-montserrat font-bold text-xl mb-1">{title}</h3>
          <p className="text-gray-300 font-inter text-sm">{genre}</p>
        </div>
      </div>
    </Link>
  );
}
