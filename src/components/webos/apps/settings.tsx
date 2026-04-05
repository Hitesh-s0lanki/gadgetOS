"use client";

import { useState } from "react";
import { Search, Home, MoreVertical, ChevronRight } from "lucide-react";
import Image from "next/image";

const SECTIONS = [
  "Appearance", "Workspace Behavior", "Window Management", "Shortcuts",
  "Startup and Shutdown", "Search", "Notifications", "Users",
  "Languages", "Accessibility", "Applications", "Online Accounts",
];

export default function SettingsApp() {
  const [selected, setSelected] = useState("main");

  return (
    <div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white/50 backdrop-blur-xl border-r border-white/50 flex flex-col pb-2">
          <div className="p-3 flex items-center space-x-2">
            <div className="relative flex items-center flex-1">
              <Search className="absolute left-2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-2 py-1 w-full bg-white bg-opacity-60 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
            <button className="p-1 hover:bg-gray-200 rounded-xl"><Home className="text-gray-600 size-4" /></button>
            <button className="p-1 hover:bg-gray-200 rounded"><MoreVertical className="text-gray-600 size-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-1">
            {SECTIONS.map((sec) => (
              <div
                key={sec}
                onClick={() => setSelected(sec)}
                className={`px-3 py-2 flex justify-between items-center cursor-pointer rounded-lg transition-colors duration-150 hover:bg-white/60 ${selected === sec ? "bg-indigo-50 text-indigo-700 font-semibold" : ""}`}
              >
                <span className="text-sm text-gray-800">{sec}</span>
                <ChevronRight className={`size-4 ${selected === sec ? "text-indigo-500" : "text-gray-400"}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto flex flex-col justify-center items-center">
          <div className="flex items-center space-x-4 mb-4">
            <Image src="/settings.svg" alt="Settings" width={80} height={80} className="rounded-lg" />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">GadgetOS</h1>
              <p className="text-gray-600">System Settings</p>
            </div>
          </div>
          {selected !== "main" && (
            <p className="mt-6 text-gray-700 text-sm">
              Content for <span className="font-semibold">{selected}</span> goes here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
