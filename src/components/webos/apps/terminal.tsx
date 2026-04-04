"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";

type Entry = { command: string; output: string[] };

export default function TerminalApp() {
  const [history, setHistory] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [history]);
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const runCommand = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (trimmed === "clear") { setHistory([]); setInput(""); return; }
    setHistory((h) => [...h, { command: trimmed, output: ["Command not yet connected to backend."] }]);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); runCommand(); }
  };

  return (
    <div ref={containerRef} className="bg-white text-gray-900 font-mono text-sm p-4 rounded-b-xl h-full overflow-auto">
      {history.map((entry, i) => (
        <div key={i} className="mb-2">
          <div><span className="text-blue-600">admin@gadgetOS:~$</span> {entry.command}</div>
          {entry.output.map((line, j) => (
            <div key={j} className="pl-4 text-gray-700 whitespace-pre-wrap">{line}</div>
          ))}
        </div>
      ))}
      <div className="flex">
        <span className="text-blue-600">admin@gadgetOS:~$</span>
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
