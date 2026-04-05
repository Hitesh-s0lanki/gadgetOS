"use client";

import { File as FileIcon } from "lucide-react";
import ImagePreview from "./image-preview";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type FileResult = { _id: string; type?: string | null; contentUrl?: string | null; name?: string | null };

type Props = {
  results: FileResult[];
  isLoading: boolean;
  searchTerm: string;
};

export default function SearchWindow({ results, isLoading, searchTerm }: Props) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading…</div>;
  }
  if (searchTerm && results.length === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-gray-500">No files found</div>;
  }
  return (
    <ul className="mb-6 grid grid-cols-4 gap-4 w-full">
      {results.map((file) => (
        <li key={file._id}>
          <div className="flex flex-col items-center space-y-2 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer text-center text-sm text-muted-foreground">
            {IMAGE_TYPES.includes(file.type ?? "") ? (
              <ImagePreview s3Key={file.contentUrl ?? ""} alt={file.name ?? ""} />
            ) : (
              <FileIcon className="w-8 h-8 text-gray-600" />
            )}
            <span className="truncate">{(file.name ?? "").slice(0, 10)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
