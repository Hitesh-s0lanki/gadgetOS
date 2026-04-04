"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function FileExplorerApp() {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="bg-white bg-opacity-70 backdrop-blur-md w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 bg-white bg-opacity-50 border-r border-gray-200 flex flex-col pb-2">
          <div className="p-3 flex items-center space-x-2">
            <div className="relative flex items-center flex-1">
              <Search className="absolute left-2 text-gray-400 size-4" />
              <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search"
                className="pl-8 text-xs bg-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            <div className="px-4 py-2 text-sm text-gray-500 italic">Connect Convex to see folders</div>
          </div>
        </div>
        <div className="flex-1 p-3 overflow-auto flex flex-col justify-center items-center">
          <Image src="/file.svg" alt="File Explorer" width={80} height={80} className="rounded-lg" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">GadgetOS</h1>
          <p className="text-gray-600">File Explorer</p>
        </div>
      </div>
    </div>
  );
}
