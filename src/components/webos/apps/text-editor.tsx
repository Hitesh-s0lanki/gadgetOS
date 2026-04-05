"use client";

import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import { generateUUID } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTextEditor } from "@/hooks/webos/use-text-editor";
import { toast } from "sonner";

export default function TextEditorApp() {
  const { onClose } = useTextEditor();
  const [notes, setNotes] = useState<[string, string][]>([[generateUUID(), ""]]);
  const [activeId, setActiveId] = useState(notes[0][0]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogName, setDialogName] = useState("");
  const [dialogFolderId, setDialogFolderId] = useState<string | undefined>();

  const folders = useQuery(api.folders.getFolders);
  const createFile = useMutation(api.files.createTextFile);

  useEffect(() => {
    if (!folders?.length) return;
    const desktop = folders.find((f) => f.name.toLowerCase() === "desktop");
    Promise.resolve().then(() => setDialogFolderId(desktop?._id ?? folders[0]._id));
  }, [folders]);

  const activeNote = notes.find(([id]) => id === activeId)!;

  const updateContent = (content: string) => {
    setNotes((prev) => prev.map(([id, t]) => (id === activeId ? [id, content] : [id, t])));
  };

  const handleNew = () => {
    const id = generateUUID();
    setNotes((prev) => [...prev, [id, ""]]);
    setActiveId(id);
  };

  const handleSave = async () => {
    if (!dialogName.trim() || !dialogFolderId) return;
    let name = dialogName.trim();
    if (!/\.[^/.]+$/.test(name)) name += ".txt";
    const content = activeNote[1];
    try {
      await createFile({
        folderId: dialogFolderId as Id<"folders">,
        name,
        type: "text/plain",
        size: new Blob([content]).size.toString(),
        content,
        contentUrl: "",
      });
      toast.success("File saved");
      setShowDialog(false);
      onClose();
    } catch (err) {
      toast.error("Failed to save file");
      console.error(err);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col relative">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-4 py-2 border-b border-white/60">
        <div className="flex border-b border-gray-200">
          {notes.map(([id], idx) => (
            <div
              key={id}
              onClick={() => setActiveId(id)}
              className={`py-2 px-3 cursor-pointer text-sm transition-colors duration-150 ${id === activeId ? "border-b-2 border-indigo-500 text-indigo-600" : "text-black/40 hover:text-black/70"}`}
            >
              Note {idx + 1}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => { setDialogName(`note-${Date.now()}.txt`); setShowDialog(true); }} className="p-1 hover:bg-gray-200 rounded">
            <Save className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={handleNew} className="p-1 hover:bg-gray-200 rounded">
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <textarea
        value={activeNote[1]}
        onChange={(e) => updateContent(e.target.value)}
        className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm"
        placeholder="Start typing…"
      />

      {showDialog && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl w-96">
            <div className="bg-white/50 border-b border-white/60 p-2 rounded-t-2xl">
              <h3 className="text-sm text-center font-semibold">Save File</h3>
            </div>
            <div className="flex flex-col p-4 gap-4">
              <Input
                value={dialogName}
                onChange={(e) => setDialogName(e.target.value)}
                className="bg-white"
                placeholder="filename.txt"
              />
              <Select value={dialogFolderId} onValueChange={setDialogFolderId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {(folders ?? []).map((f) => (
                    <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2 justify-center pb-4">
              <Button onClick={() => setShowDialog(false)} className="px-3 h-8 text-xs bg-white/60 text-black/70 hover:bg-white/80 border border-white/60">Cancel</Button>
              <Button onClick={() => void handleSave()} className="px-3 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
