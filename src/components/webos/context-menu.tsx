"use client";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

export function DesktopContextMenu() {
  return (
    <ContextMenuContent className="w-48 bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl rounded-xl">
      <ContextMenuItem inset>
        Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset disabled>
        Paste <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset>New Folder</ContextMenuItem>
      <ContextMenuItem inset>New File</ContextMenuItem>
    </ContextMenuContent>
  );
}
