"use client";

import { File } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImagePreview from "./image-preview";
import { Breadcrumbs } from "./breadcrumbs";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type Folder = { _id: string; name: string };
type File_ = { _id: string; name: string; type?: string | null; contentUrl?: string | null };
type Crumb = { _id: string; name: string };

type Props = {
  folderId: string;
  setFolderId: (id: string) => void;
  childFolders: Folder[];
  files: File_[];
  breadcrumbs: Crumb[];
  onCreateFolder: (name: string, parentId: string) => Promise<void>;
  onUpload: (files: FileList, folderId: string) => Promise<void>;
  onFileClick: (contentUrl: string) => void;
};

export default function FolderView({
  folderId, setFolderId, childFolders, files, breadcrumbs, onCreateFolder, onUpload, onFileClick,
}: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogName, setDialogName] = useState("newfolder");

  const handleSave = async () => {
    if (!dialogName.trim()) return;
    await onCreateFolder(dialogName.trim(), folderId);
    setShowDialog(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full overflow-auto relative">
        <Breadcrumbs breadcrumbs={breadcrumbs} folderId={folderId} setFolderId={setFolderId} onUpload={onUpload} />
        <ul className="mb-6 grid grid-cols-4 gap-4">
          {childFolders.map((f) => (
            <li key={f._id}>
              <button
                className="flex flex-col items-center space-y-2 hover:bg-gray-100 px-2 py-3 rounded w-full text-left text-sm text-muted-foreground"
                onClick={() => setFolderId(f._id)}
              >
                <Image src="/file.svg" alt="folder" width={30} height={30} />
                <span>{f.name}</span>
              </button>
            </li>
          ))}
          {files.map((file) => (
            <li key={file._id} onClick={() => file.contentUrl && onFileClick(file.contentUrl)}>
              <div className="flex flex-col items-center space-y-2 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer text-center text-sm text-muted-foreground">
                {IMAGE_TYPES.includes(file.type ?? "") ? (
                  <ImagePreview s3Key={file.contentUrl ?? ""} alt={file.name} />
                ) : (
                  <File className="size-8 text-gray-600" />
                )}
                <span className="truncate">{file.name.slice(0, 10)}</span>
              </div>
            </li>
          ))}
        </ul>

        {showDialog && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/65 rounded-lg shadow-lg w-80">
              <div className="bg-white/50 border-b p-2 rounded-t-xl">
                <h3 className="text-sm text-center font-semibold">New Folder</h3>
              </div>
              <div className="p-4">
                <Input value={dialogName} onChange={(e) => setDialogName(e.target.value)} className="bg-white" />
              </div>
              <div className="flex space-x-2 justify-center pb-4">
                <Button onClick={() => setShowDialog(false)} className="px-3 h-8 text-xs bg-black/60">Cancel</Button>
                <Button onClick={handleSave} className="px-3 h-8 text-xs bg-black/60">Save</Button>
              </div>
            </div>
          </div>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setShowDialog(true)}>New Folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
