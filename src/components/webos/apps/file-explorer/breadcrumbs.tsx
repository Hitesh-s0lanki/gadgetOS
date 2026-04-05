"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

type Crumb = { _id: string; name: string };

type Props = {
  breadcrumbs: Crumb[];
  folderId: string;
  setFolderId: (id: string) => void;
  onUpload?: (files: FileList, folderId: string) => Promise<void>;
};

export function Breadcrumbs({ breadcrumbs, folderId, setFolderId, onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onUpload) return;
    setIsLoading(true);
    try {
      await onUpload(files, folderId);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mb-4 px-2 py-1 flex w-full items-center justify-between gap-4">
      <nav className="flex text-sm capitalize text-black">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb._id}>
            <button className="hover:text-black" onClick={() => setFolderId(crumb._id)}>
              {crumb.name}
            </button>
            {i < breadcrumbs.length - 1 && <span className="px-2">{">"}</span>}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center space-x-1">
        <input type="file" ref={fileInputRef} className="hidden" multiple disabled={isLoading} onChange={handleFileChange} />
        <button
          onClick={() => !isLoading && fileInputRef.current?.click()}
          disabled={isLoading}
          className={`flex items-center px-2 py-1.5 bg-black/60 text-white text-xs rounded ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-black/30"}`}
        >
          {isLoading ? <Loader2 className="animate-spin size-4" /> : <Upload className="size-4" />}
        </button>
      </div>
    </div>
  );
}
