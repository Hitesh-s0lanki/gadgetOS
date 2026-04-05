"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { useImagePreview } from "@/hooks/webos/use-image-preview";
import FolderView from "./folder-view";
import SearchWindow from "./search-window";
import { toast } from "sonner";
import { FileData } from "@/types";

export default function FileExplorerApp() {
  const [selected, setSelected] = useState("main");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { onOpen: openImagePreview } = useImagePreview();
  const rootFolders = useQuery(api.folders.getRootFolders);
  const vectorSearch = useAction(api.search.searchFiles);
  const textResults = useQuery(
    api.files.searchFiles,
    searchText ? { searchTerm: searchText } : "skip"
  );
  const createFileMutation = useMutation(api.files.createFile);
  const createFolderMutation = useMutation(api.folders.createFolder);

  const childFolders = useQuery(
    api.folders.getFoldersByParent,
    selected !== "main" ? { parentId: selected as Id<"folders"> } : "skip"
  ) ?? [];

  const filesInFolder = useQuery(
    api.files.getFilesByFolder,
    selected !== "main" ? { folderId: selected as Id<"folders"> } : "skip"
  ) ?? [];

  const breadcrumbs = useQuery(
    api.folders.getFolderBreadcrumb,
    selected !== "main" ? { folderId: selected as Id<"folders"> } : "skip"
  ) ?? [];

  useEffect(() => {
    if (!searchText) {
      Promise.resolve().then(() => setSearchResults([]));
      return;
    }
    if (textResults && textResults.length > 0) {
      Promise.resolve().then(() => setSearchResults(textResults));
      return;
    }
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) setIsSearching(true); });
    void vectorSearch({ query: searchText })
      .then((r) => {
        if (!cancelled) {
          setSearchResults(r ?? []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [searchText, textResults, vectorSearch]);

  const handleUpload = async (files: FileList, folderId: string) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("file", f));
    formData.append("folderId", folderId);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      toast.error(`Upload failed: ${res.statusText}`);
      return;
    }
    const data = await res.json();
    for (const file of data.files as FileData[]) {
      await createFileMutation({
        folderId: folderId as Id<"folders">,
        name: file.name,
        contentUrl: file.contentUrl,
        type: file.type,
        size: file.size,
        description: file.description,
        content: file.content,
        vector: file.vector,
      });
    }
    toast.success("Files uploaded successfully");
  };

  const handleCreateFolder = async (name: string, parentId: string) => {
    try {
      await createFolderMutation({ name, parentId: parentId as Id<"folders"> });
    } catch (err) {
      toast.error("Failed to create folder");
      console.error(err);
    }
  };

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
            {(rootFolders ?? []).map((folder: Record<string, unknown>) => (
              <div
                key={String(folder._id)}
                onClick={() => setSelected(String(folder._id))}
                className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-white/50 ${selected === String(folder._id) ? "bg-white/50 font-semibold" : ""}`}
              >
                <span className="text-sm text-gray-800 capitalize">{String(folder.name)}</span>
                <ChevronRight className="text-gray-500 size-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-3 overflow-auto flex flex-col justify-center items-center">
          {selected === "main" && searchText === "" && (
            <div className="flex items-center space-x-4 mb-4">
              <Image src="/file.svg" alt="File Explorer" width={80} height={80} className="rounded-lg" />
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">GadgetOS</h1>
                <p className="text-gray-600">File Explorer</p>
              </div>
            </div>
          )}

          {selected !== "main" && searchText === "" && (
            <FolderView
              folderId={selected}
              setFolderId={setSelected}
              childFolders={childFolders}
              files={filesInFolder}
              breadcrumbs={breadcrumbs}
              onCreateFolder={handleCreateFolder}
              onUpload={handleUpload}
              onFileClick={openImagePreview}
            />
          )}

          {searchText !== "" && (
            <SearchWindow results={searchResults} isLoading={isSearching} searchTerm={searchText} />
          )}
        </div>
      </div>
    </div>
  );
}
