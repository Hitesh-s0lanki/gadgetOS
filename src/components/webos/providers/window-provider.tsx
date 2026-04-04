"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { cn, generateUUID } from "@/lib/utils";
import WindowBase from "@/components/webos/window/window-base";
import { useAbout } from "@/hooks/webos/use-about";
import { useBrowser } from "@/hooks/webos/use-browser";
import { useClock } from "@/hooks/webos/use-clock";
import { useFileExplorer } from "@/hooks/webos/use-file-explorer";
import { useSettings } from "@/hooks/webos/use-settings";
import { useTerminal } from "@/hooks/webos/use-terminal";
import { useTextEditor } from "@/hooks/webos/use-text-editor";
import { useTrashBin } from "@/hooks/webos/use-trash-bin";
import { useImagePreview } from "@/hooks/webos/use-image-preview";
import AboutApp from "@/components/webos/apps/about";
import BrowserApp from "@/components/webos/apps/browser";
import ClockApp from "@/components/webos/apps/clock";
import FileExplorerApp from "@/components/webos/apps/file-explorer/file-explorer";
import SettingsApp from "@/components/webos/apps/settings";
import TerminalApp from "@/components/webos/apps/terminal";
import TextEditorApp from "@/components/webos/apps/text-editor";
import TrashBinApp from "@/components/webos/apps/trash-bin";
import ImagePreview from "@/components/webos/apps/file-explorer/image-preview";

// Dedicated draggable portal for image preview (different onOpen signature from WindowStore)
function ImagePreviewWindow() {
  const { isOpen, url, onClose } = useImagePreview();
  const [position, setPosition] = useState({ x: 300, y: 100 });
  const id = generateUUID();

  const handleDragEnd = (e: DragEndEvent) => {
    setPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x + e.delta.x, window.innerWidth - 200)),
      y: Math.max(0, Math.min(prev.y + e.delta.y, window.innerHeight - 100)),
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <DndContext onDragEnd={handleDragEnd}>
      <ImagePreviewInner id={id} x={position.x} y={position.y} url={url} onClose={onClose} />
    </DndContext>,
    document.body
  );
}

function ImagePreviewInner({ id, x, y, url, onClose }: { id: string; x: number; y: number; url: string; onClose: () => void }) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{ transform: `translate(${x + (transform?.x ?? 0)}px, ${y + (transform?.y ?? 0)}px)` }}
      className="fixed top-0 left-0 z-50 bg-white rounded-xl shadow-xl flex flex-col w-[500px] h-[420px]"
    >
      <div className="grid grid-cols-3 items-center bg-gray-100 border-b p-2 rounded-t-xl">
        <div className="flex items-center gap-2 px-2">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600" aria-label="Close" />
        </div>
        <span {...listeners} className="font-semibold text-sm text-center cursor-move select-none">Image Preview</span>
      </div>
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        <ImagePreview s3Key={url} alt="preview" height={350} width={450} />
      </div>
    </div>
  );
}

export default function WindowProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  return (
    <>
      <WindowBase store={useTerminal} defaultPosition={{ x: 200, y: 80 }}>
        <TerminalApp />
      </WindowBase>
      <WindowBase store={useAbout} defaultPosition={{ x: 300, y: 100 }} width="w-[500px]" height="h-[400px]">
        <AboutApp />
      </WindowBase>
      <WindowBase store={useBrowser} defaultPosition={{ x: 150, y: 60 }} width="w-[800px]" height="h-[550px]">
        <BrowserApp />
      </WindowBase>
      <WindowBase store={useFileExplorer} defaultPosition={{ x: 180, y: 80 }} width="w-[700px]" height="h-[500px]">
        <FileExplorerApp />
      </WindowBase>
      <WindowBase store={useSettings} defaultPosition={{ x: 250, y: 100 }} width="w-[700px]" height="h-[500px]">
        <SettingsApp />
      </WindowBase>
      <WindowBase store={useClock} defaultPosition={{ x: 400, y: 150 }} width="w-[300px]" height="h-[350px]">
        <ClockApp />
      </WindowBase>
      <WindowBase store={useTextEditor} defaultPosition={{ x: 200, y: 100 }} width="w-[600px]" height="h-[450px]">
        <TextEditorApp />
      </WindowBase>
      <WindowBase store={useTrashBin} defaultPosition={{ x: 350, y: 120 }} width="w-[400px]" height="h-[300px]">
        <TrashBinApp />
      </WindowBase>
      <ImagePreviewWindow />
    </>
  );
}
