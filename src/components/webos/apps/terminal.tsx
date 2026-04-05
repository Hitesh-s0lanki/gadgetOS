"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type Entry = { command: string; output: string[] };

export default function TerminalApp() {
  const convex = useConvex();
  const [folderId, setFolderId] = useState<string | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("~");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [history]);
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const prompt = `admin@gadgetOS:${cwd}$`;

  const handleCd = async (args: string[]): Promise<string[]> => {
    if (!args[0]) { setCwd("~"); setFolderId(null); return []; }
    const name = args[0].replace(/\//g, "");
    try {
      const results = await convex.query(api.folders.searchFoldersByName, { name });
      if (!results.length) return [`bash: cd: ${name}: No such file or directory`];
      const newId = results[0]._id;
      setFolderId(newId);
      const breadcrumbs = await convex.query(api.folders.getFolderBreadcrumb, { folderId: newId });
      setCwd((breadcrumbs ?? []).map((c) => c.name).join("/"));
      return [`Changed directory to ${name}`];
    } catch (err) {
      return [`Error: ${String(err)}`];
    }
  };

  const handleLs = async (): Promise<string[]> => {
    if (folderId) {
      const [childFolders, files] = await Promise.all([
        convex.query(api.folders.getFoldersByParent, { parentId: folderId as Id<"folders"> }),
        convex.query(api.files.getFilesByFolder, { folderId: folderId as Id<"folders"> }),
      ]);
      return [
        ...(childFolders ?? []).map((f) => `/${f.name}`),
        ...(files ?? []).map((f) => f.name),
      ];
    }
    const roots = await convex.query(api.folders.getRootFolders);
    return (roots ?? []).map((f) => `/${f.name}`);
  };

  const handleAI = async (cmd: string, args: string[]): Promise<string[]> => {
    try {
      const res = await fetch("/api/openai-terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: `${cmd} ${args.join(" ")}`.trim() }),
      });
      if (res.status === 429) return ["Rate limit exceeded. Try again in a moment."];
      if (res.status === 504) return ["Request timed out. Try again."];
      const data = await res.json();
      if (data.error) return [data.error];
      if (data.steps) return data.steps.map((s: { command: string; description: string }) => `${s.command}  # ${s.description}`);
      if (data.answer) return [data.answer];
      return [`command not found: ${cmd}`];
    } catch {
      return [`command not found: ${cmd}`];
    }
  };

  const runCommand = async () => {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0] ?? "";
    const args = parts.slice(1);
    let output: string[] = [];

    if (cmd === "clear") { setHistory([]); setInput(""); return; }
    if (!cmd) return;

    switch (cmd) {
      case "cd": output = await handleCd(args); break;
      case "ls": output = await handleLs(); break;
      case "help": output = ["Available: ls, cd <dir>, clear, help — anything else goes to AI"]; break;
      case "echo": output = [args.join(" ")]; break;
      default: output = await handleAI(cmd, args);
    }

    setHistory((h) => [...h, { command: input, output }]);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); void runCommand(); }
  };

  return (
    <div ref={containerRef} className="bg-white text-gray-900 font-mono text-sm p-4 rounded-b-xl h-full overflow-auto">
      {history.map((entry, i) => (
        <div key={i} className="mb-2">
          <div><span className="text-blue-600">{prompt}</span> {entry.command}</div>
          {entry.output.map((line, j) => (
            <div key={j} className="pl-4 text-gray-700 whitespace-pre-wrap">{line}</div>
          ))}
        </div>
      ))}
      <div className="flex">
        <span className="text-blue-600">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent flex-1 ml-1 focus:outline-none"
        />
      </div>
    </div>
  );
}
