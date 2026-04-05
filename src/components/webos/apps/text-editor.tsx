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

type Note = { id: string; name: string; content: string };

export default function TextEditorApp() {
  const { onClose, pendingFile, clearPendingFile } = useTextEditor();

  const [notes, setNotes] = useState<Note[]>(() => {
    if (pendingFile) {
      return [{ id: generateUUID(), name: pendingFile.name, content: pendingFile.content }];
    }
    return [{ id: generateUUID(), name: "Note 1", content: "" }];
  });
  const [activeId, setActiveId] = useState(notes[0].id);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogName, setDialogName] = useState("");
  const [dialogFolderId, setDialogFolderId] = useState<string | undefined>();

  // Clear pending file after we've consumed it on first render
  useEffect(() => {
    if (pendingFile) clearPendingFile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const folders = useQuery(api.folders.getFolders);
  const createFile = useMutation(api.files.createTextFile);

  useEffect(() => {
    if (!folders?.length) return;
    const desktop = folders.find((f) => f.name.toLowerCase() === "desktop");
    Promise.resolve().then(() => setDialogFolderId(desktop?._id ?? folders[0]._id));
  }, [folders]);

  const activeNote = notes.find((n) => n.id === activeId)!;

  const updateContent = (content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, content } : n)));
  };

  const handleNew = () => {
    const id = generateUUID();
    const name = `Note ${notes.length + 1}`;
    setNotes((prev) => [...prev, { id, name, content: "" }]);
    setActiveId(id);
  };

  const handleSave = async () => {
    if (!dialogName.trim() || !dialogFolderId) return;
    let name = dialogName.trim();
    if (!/\.[^/.]+$/.test(name)) name += ".txt";
    const content = activeNote.content;
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
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={`py-2 px-3 cursor-pointer text-sm transition-colors duration-150 ${note.id === activeId ? "border-b-2 border-indigo-500 text-indigo-600" : "text-black/40 hover:text-black/70"}`}
            >
              {note.name}
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
        value={activeNote.content}
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
