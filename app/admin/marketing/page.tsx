"use client";

import { Megaphone, Search } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="display-sm text-2xl flex items-center gap-3">
          <Megaphone className="text-brand-red" />
          Marketing Campaigns
        </h1>
        <button className="bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-red/90 transition-colors">
          + New Campaign
        </button>
      </div>

      <div className="bg-[#161618] border border-brand-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <Megaphone size={48} className="text-[#333] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Campaigns</h2>
        <p className="text-gray-400 max-w-md">
          Marketing features (promocodes, email blasts, and discount vouchers) will be available in the upcoming Version 2.0 release.
        </p>
      </div>
    </div>
  );
}
