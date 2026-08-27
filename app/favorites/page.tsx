import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="flex-1 w-full bg-brand-void text-white pb-20 pt-32 px-6 flex justify-center">
      <div className="max-w-xl text-center bg-[#161618] p-10 rounded-xl border border-brand-border mt-12 w-full">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h2 className="headline-md mb-4 text-yellow-500">Feature Unavailable</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          The <strong>Favorites</strong> feature requires backend API support (e.g., <code className="bg-black px-2 py-1 rounded">/api/v1/users/me/favorites</code>) which has not yet been implemented in the backend system.
          <br /><br />
          Dummy data has been removed. Once the backend endpoints are available, this feature can be properly integrated.
        </p>
        <Link href="/" className="btn-primary py-3 px-8 rounded-lg">Go to Home</Link>
      </div>
    </div>
  );
}
