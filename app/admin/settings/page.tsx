"use client";

import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="display-sm text-2xl flex items-center gap-3">
          <Settings className="text-brand-red" />
          System Settings
        </h1>
        <button className="bg-brand-red text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-red/90 transition-colors">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="bg-[#161618] border border-brand-border rounded-xl p-8">
        <h2 className="headline-sm mb-6 text-white border-b border-brand-border pb-4">General Configuration</h2>
        
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Platform Name</label>
            <input 
              type="text" 
              defaultValue="CineReserve"
              className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Support Email</label>
            <input 
              type="email" 
              defaultValue="support@cinereserve.com"
              className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-brand-muted text-xs font-bold tracking-wider mb-2 uppercase">Maintenance Mode</label>
            <select className="w-full bg-[#222224] border border-brand-border rounded px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors appearance-none">
              <option value="off">Off (Live)</option>
              <option value="on">On (Under Construction)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">When enabled, customers will see a maintenance page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
