"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search as SearchIcon,
  Star,
  History,
  X,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";

function urlTitle(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function toUrl(input: string): string {
  const q = input.trim();
  return /^https?:\/\//i.test(q)
    ? q
    : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export default function BrowserApp() {
  const [address, setAddress] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [stackIndex, setStackIndex] = useState(-1);
  const [reloadKey, setReloadKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const bookmarks = useQuery(api.browser.getBookmarks) ?? [];
  const history   = useQuery(api.browser.getHistory)   ?? [];
  const addBookmark    = useMutation(api.browser.addBookmark);
  const removeBookmark = useMutation(api.browser.removeBookmark);
  const addHistoryEntry = useMutation(api.browser.addHistoryEntry);
  const clearHistory    = useMutation(api.browser.clearHistory);

  const currentUrl   = stackIndex >= 0 ? stack[stackIndex] : null;
  const canGoBack    = stackIndex > 0;
  const canGoForward = stackIndex < stack.length - 1;
  const isBookmarked = currentUrl ? bookmarks.some((b) => b.url === currentUrl) : false;

  function navigate(url: string) {
    const newStack = stack.slice(0, stackIndex + 1);
    newStack.push(url);
    setStack(newStack);
    setStackIndex(newStack.length - 1);
    setAddress(url);
    void addHistoryEntry({ url, title: urlTitle(url) });
  }

  function handleSearch() {
    const q = address.trim();
    if (!q) return;
    navigate(toUrl(q));
  }

  function handleBack() {
    if (!canGoBack) return;
    const idx = stackIndex - 1;
    setStackIndex(idx);
    setAddress(stack[idx]);
  }

  function handleForward() {
    if (!canGoForward) return;
    const idx = stackIndex + 1;
    setStackIndex(idx);
    setAddress(stack[idx]);
  }

  async function handleToggleBookmark() {
    if (!currentUrl) return;
    if (isBookmarked) {
      const bm = bookmarks.find((b) => b.url === currentUrl);
      if (bm) await removeBookmark({ id: bm._id });
    } else {
      await addBookmark({ url: currentUrl, title: urlTitle(currentUrl) });
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-2xl overflow-hidden w-full h-full flex flex-col">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-white/60">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="p-1 rounded-md hover:bg-white/60 disabled:opacity-30 transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="p-1 rounded-md hover:bg-white/60 disabled:opacity-30 transition-colors duration-150"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          disabled={!currentUrl}
          className="p-1 rounded-md hover:bg-white/60 disabled:opacity-30 transition-colors duration-150"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>

        {/* Address bar */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
          <input
            type="text"
            placeholder="Search or enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-8 pr-3 py-1 bg-white/70 border border-white/60 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
          />
        </div>

        {/* Bookmark star */}
        <button
          onClick={() => void handleToggleBookmark()}
          disabled={!currentUrl}
          className="p-1 rounded-md hover:bg-white/60 disabled:opacity-30 transition-colors duration-150"
        >
          <Star
            className={`w-4 h-4 transition-colors duration-150 ${
              isBookmarked ? "fill-indigo-500 text-indigo-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* History */}
        <div className="relative">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className={`p-1 rounded-md hover:bg-white/60 transition-colors duration-150 ${showHistory ? "bg-indigo-50 text-indigo-600" : ""}`}
          >
            <History className="w-4 h-4 text-gray-600" />
          </button>

          {showHistory && (
            <div className="absolute right-0 top-9 w-72 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/60">
                <span className="text-[10px] font-semibold text-black/50 uppercase tracking-widest">History</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void clearHistory()}
                    title="Clear history"
                    className="p-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 rounded hover:bg-white/60 transition-colors duration-150"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.1) transparent" }}>
                {history.length === 0 ? (
                  <p className="text-xs text-black/35 text-center py-8">No history yet</p>
                ) : (
                  history.map((entry) => (
                    <button
                      key={entry._id}
                      onClick={() => { navigate(entry.url); setShowHistory(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors duration-150 flex flex-col gap-0.5"
                    >
                      <span className="text-xs font-medium text-black/70 truncate">{entry.title}</span>
                      <span className="text-[10px] text-black/35 truncate">{entry.url}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bookmarks bar ────────────────────────────────────────────────── */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1 bg-white/50 border-b border-white/50 overflow-x-auto">
          {bookmarks.map((bm) => (
            <button
              key={bm._id}
              onClick={() => navigate(bm.url)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs text-black/60 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 whitespace-nowrap"
            >
              {bm.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 h-0">
        {currentUrl ? (
          <iframe
            key={`${currentUrl}-${reloadKey}`}
            src={currentUrl}
            className="w-full h-full border-0"
            title="Browser"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <Image src="/icons/firefox.svg" alt="browser" height={48} width={48} className="opacity-80" />
            <h1 className="text-xl font-semibold text-black/60">GadgetOS Browser</h1>
            <div className="flex gap-2 w-1/2">
              <input
                type="text"
                placeholder="Search or enter address…"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-2 bg-white/70 border border-white/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition-colors duration-150"
              >
                Go
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
