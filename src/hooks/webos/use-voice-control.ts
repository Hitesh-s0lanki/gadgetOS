// src/hooks/webos/use-voice-control.ts
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOsState } from "./use-os-state";
import { useTerminal } from "./use-terminal";
import { useBrowser } from "./use-browser";
import { useFileExplorer } from "./use-file-explorer";
import { useSettings } from "./use-settings";
import { useClock } from "./use-clock";
import { useTextEditor } from "./use-text-editor";
import { useTrashBin } from "./use-trash-bin";
import { captureScreenshot } from "@/lib/screenshot";

// Web Speech API types (not yet in all lib.dom.d.ts versions)
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function useVoiceControl() {
  const router = useRouter();
  const {
    isListening,
    setIsListening,
    setIsSleeping,
  } = useOsState();

  const handleTranscript = useCallback(
    async (transcript: string) => {
      const t = transcript.toLowerCase().trim();

      // Pass 1 — keyword matching
      if (t.includes("open terminal")) {
        useTerminal.getState().onOpen();
        toast.success("Opening Terminal");
        return;
      }
      if (t.includes("open browser")) {
        useBrowser.getState().onOpen();
        toast.success("Opening Browser");
        return;
      }
      if (t.includes("open files") || t.includes("open file explorer")) {
        useFileExplorer.getState().onOpen();
        toast.success("Opening File Explorer");
        return;
      }
      if (t.includes("open settings")) {
        useSettings.getState().onOpen();
        toast.success("Opening Settings");
        return;
      }
      if (t.includes("open clock")) {
        useClock.getState().onOpen();
        toast.success("Opening Clock");
        return;
      }
      if (t.includes("open editor") || t.includes("open text editor")) {
        useTextEditor.getState().onOpen();
        toast.success("Opening Text Editor");
        return;
      }
      if (t.includes("open trash")) {
        useTrashBin.getState().onOpen();
        toast.success("Opening Trash");
        return;
      }
      if (/\block\b/.test(t) || /\bsleep\b/.test(t)) {
        setIsSleeping(true);
        toast.success(t.includes("sleep") ? "Sleeping" : "Locking screen");
        return;
      }
      if (t.includes("shutdown")) {
        router.push("/webos/lock-screen");
        return;
      }
      if (t.includes("restart")) {
        window.location.reload();
        return;
      }
      if (t.includes("unmute")) {
        if (useOsState.getState().isMuted) {
          useOsState.getState().toggleMute();
        }
        toast.success("Unmuted");
        return;
      }
      if (t.includes("mute")) {
        if (!useOsState.getState().isMuted) {
          useOsState.getState().toggleMute();
        }
        toast.success("Muted");
        return;
      }
      if (t.includes("volume up")) {
        const { volume: v, setVolume: sv } = useOsState.getState();
        sv(Math.min(100, v + 10));
        toast.success("Volume up");
        return;
      }
      if (t.includes("volume down")) {
        const { volume: v, setVolume: sv } = useOsState.getState();
        sv(Math.max(0, v - 10));
        toast.success("Volume down");
        return;
      }
      if (t.includes("screenshot")) {
        toast.success("Taking screenshot…");
        try {
          await captureScreenshot();
        } catch {
          toast.error("Screenshot failed");
        }
        return;
      }
      if (t.includes("brightness up")) {
        const { brightness: b, setBrightness: sb } = useOsState.getState();
        sb(Math.min(100, b + 10));
        toast.success("Brightness up");
        return;
      }
      if (t.includes("brightness down")) {
        const { brightness: b, setBrightness: sb } = useOsState.getState();
        sb(Math.max(10, b - 10));
        toast.success("Brightness down");
        return;
      }

      // Pass 2 — AI fallback
      try {
        const res = await fetch("/api/openai-terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: transcript }),
        });
        const data = (await res.json()) as { answer?: string; error?: string };
        if (data.answer) {
          toast.info(data.answer, { duration: 6000 });
        } else if (data.error) {
          toast.error(data.error);
        }
      } catch {
        toast.error("Voice AI fallback failed");
      }
    },
    [router, setIsSleeping]
  );

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      void handleTranscript(transcript);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "audio-capture") {
        toast.error(
          e.error === "not-allowed"
            ? "Microphone access denied. Enable it in browser settings."
            : "No microphone found."
        );
        setIsListening(false);
      }
      // "no-speech" is a normal timeout — onend will restart recognition
    };

    recognition.onend = () => {
      if (useOsState.getState().isListening) {
        recognition.start();
      }
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.abort();
    };
  }, [isListening, handleTranscript, setIsListening]);
}
