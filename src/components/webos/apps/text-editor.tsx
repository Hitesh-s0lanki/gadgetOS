"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { generateUUID } from "@/lib/utils";

export default function TextEditorApp() {
  const [notes, setNotes] = useState<[string, string][]>([[generateUUID(), ""]]);
  const [activeId, setActiveId] = useState(notes[0][0]);

  const activeNote = notes.find(([id]) => id === activeId)!;

  const updateContent = (content: string) => {
    setNotes((prev) => prev.map(([id, t]) => (id === activeId ? [id, content] : [id, t])));
  };

  const handleNew = () => {
    const id = generateUUID();
    setNotes((prev) => [...prev, [id, ""]]);
    setActiveId(id);
  };

  return (
    <div className="bg-white w-full h-full flex flex-col">
      <div className="flex items-center justify-between bg-white px-4 py-2 border-b">
        <div className="flex border-b border-gray-200">
          {notes.map(([id], idx) => (
            <div
              key={id}
              onClick={() => setActiveId(id)}
              className={`py-2 px-3 cursor-pointer text-sm ${id === activeId ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-600"}`}
            >
              Note {idx + 1}
            </div>
          ))}
        </div>
        <button onClick={handleNew} className="p-1 hover:bg-gray-200 rounded">
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <textarea
        value={activeNote[1]}
        onChange={(e) => updateContent(e.target.value)}
        className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm"
        placeholder="Start typing…"
      />
    </div>
  );
}
