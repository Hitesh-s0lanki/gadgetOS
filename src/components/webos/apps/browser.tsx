"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search as SearchIcon, Menu } from "lucide-react";
import Image from "next/image";

export default function BrowserApp() {
  const [address, setAddress] = useState("");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const handleSearch = () => {
    const query = address.trim();
    if (!query) return;
    const url = /^https?:\/\//i.test(query)
      ? query
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    setCurrentUrl(url);
  };

  return (
    <div className="bg-white overflow-hidden w-full h-full flex flex-col">
      <div className="flex items-center space-x-2 px-4 py-2 border-b">
        <button className="p-1 rounded hover:bg-gray-200"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><RefreshCw className="w-4 h-4 text-gray-600" /></button>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <input
            type="text"
            placeholder="Search or enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-8 pr-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button onClick={handleSearch} className="p-1 rounded hover:bg-gray-200">
          <SearchIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1 rounded hover:bg-gray-200"><Menu className="w-4 h-4 text-gray-600" /></button>
      </div>
      <div className="flex-1 h-0">
        {currentUrl ? (
          <iframe src={currentUrl} className="w-full h-full" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-10 space-y-6">
            <Image src="/icons/firefox.svg" alt="browser" height={50} width={50} />
            <h1 className="text-2xl font-bold">Welcome to GadgetOS Browser</h1>
            <input
              type="text"
              placeholder="Search or enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-1/2 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
              Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
