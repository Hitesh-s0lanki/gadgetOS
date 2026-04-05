"use client";

import React, { useState } from "react";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { cn, generateUUID } from "@/lib/utils";
import { WindowStore } from "@/hooks/webos/create-window-store";

type WindowBaseProps = {
  store: () => WindowStore;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: string;
  height?: string;
};

export default function WindowBase({
  store,
  children,
  defaultPosition = { x: 440, y: 100 },
  width = "w-[650px]",
  height = "h-[450px]",
}: WindowBaseProps) {
  const { isOpen } = store();
  const [position, setPosition] = useState(defaultPosition);
  const [id] = useState(() => generateUUID());

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x + delta.x, window.innerWidth - 200)),
      y: Math.max(0, Math.min(prev.y + delta.y, window.innerHeight - 100)),
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <DndContext onDragEnd={handleDragEnd}>
      <ModalWindow
        id={id}
        x={position.x}
        y={position.y}
        store={store}
        width={width}
        height={height}
      >
        {children}
      </ModalWindow>
    </DndContext>,
    document.body
  );
}

type ModalWindowProps = {
  id: string;
  x: number;
  y: number;
  store: () => WindowStore;
  children: React.ReactNode;
  width: string;
  height: string;
};

function ModalWindow({ id, x, y, store, children, width, height }: ModalWindowProps) {
  const { title, isMinimized, onClose, onMinimize } = store();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id });

  const translateX = x + (transform?.x ?? 0);
  const translateY = y + (transform?.y ?? 0);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: isFullscreen
          ? "none"
          : `translate(${translateX}px, ${translateY}px)`,
      }}
      className={cn(
        "fixed top-0 left-0 z-50 bg-white/60 backdrop-blur-2xl rounded-xl border border-white/65 shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-white/30 flex flex-col animate-in fade-in-0 zoom-in-95 duration-200",
        !isFullscreen ? `${width} ${height}` : "inset-x-0 top-8 bottom-24 w-full rounded-none",
        isMinimized && "hidden"
      )}
    >
      {/* Title bar */}
      <div className="grid grid-cols-3 items-center bg-white/55 backdrop-blur-2xl border-b border-white/60 p-2 rounded-t-xl">
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
            aria-label="Close"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500"
            aria-label="Minimize"
          />
          <button
            onClick={(e) => { e.stopPropagation(); setIsFullscreen((f) => !f); }}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"
            aria-label="Fullscreen"
          />
        </div>
        <span
          {...listeners}
          className="font-semibold text-sm text-center cursor-move select-none"
        >
          {title}
        </span>
      </div>

      {/* App content */}
      <div className="flex-1 overflow-hidden rounded-b-xl">
        {children}
      </div>
    </div>
  );
}
