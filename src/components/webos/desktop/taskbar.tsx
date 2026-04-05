"use client";

import Image from "next/image";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useTerminal } from "@/hooks/webos/use-terminal";
import { useAbout } from "@/hooks/webos/use-about";
import { useBrowser } from "@/hooks/webos/use-browser";
import { useFileExplorer } from "@/hooks/webos/use-file-explorer";
import { useSettings } from "@/hooks/webos/use-settings";
import { useClock } from "@/hooks/webos/use-clock";
import { useTextEditor } from "@/hooks/webos/use-text-editor";
import { useTrashBin } from "@/hooks/webos/use-trash-bin";
import { useChat } from "@/hooks/webos/use-chat";

export default function Taskbar() {
  const { onOpen: openTerminal, isOpen: terminalOpen } = useTerminal();
  const { onOpen: openAbout, isOpen: aboutOpen } = useAbout();
  const { onOpen: openBrowser, isOpen: browserOpen } = useBrowser();
  const { onOpen: openFileExplorer, isOpen: fileExplorerOpen } = useFileExplorer();
  const { onOpen: openSettings, isOpen: settingsOpen } = useSettings();
  const { onOpen: openClock, isOpen: clockOpen } = useClock();
  const { onOpen: openTextEditor, isOpen: textEditorOpen } = useTextEditor();
  const { onOpen: openTrashBin, isOpen: trashBinOpen } = useTrashBin();
  const { onOpen: openChat, isOpen: chatOpen } = useChat();

  const links = [
    { title: "About",         icon: <Image src="/about.svg"     alt="About"         width={50} height={50} className="h-full w-full" />, onClick: openAbout,        isOpen: aboutOpen },
    { title: "Browser",       icon: <Image src="/browser.svg"   alt="Browser"       width={50} height={50} className="h-full w-full" />, onClick: openBrowser,      isOpen: browserOpen },
    { title: "Chat",          icon: <Image src="/ai.svg"        alt="Chat"          width={50} height={50} className="h-full w-full" />, onClick: openChat,        isOpen: chatOpen },
    { title: "Terminal",      icon: <Image src="/shell.svg"     alt="Terminal"      width={50} height={50} className="h-full w-full" />, onClick: openTerminal,     isOpen: terminalOpen },
    { title: "File Explorer", icon: <Image src="/file.svg"      alt="File Explorer" width={50} height={50} className="h-full w-full" />, onClick: openFileExplorer, isOpen: fileExplorerOpen },
    { title: "Settings",      icon: <Image src="/settings.svg"  alt="Settings"      width={50} height={50} className="h-full w-full" />, onClick: openSettings,     isOpen: settingsOpen },
    { title: "Date & Time",   icon: <Image src="/date_time.svg" alt="Clock"         width={50} height={50} className="h-full w-full" />, onClick: openClock,        isOpen: clockOpen },
    { title: "Text Editor",   icon: <Image src="/notes.svg"     alt="Text Editor"   width={50} height={50} className="h-full w-full" />, onClick: openTextEditor,   isOpen: textEditorOpen },
    { title: "Trash Bin",     icon: <Image src="/recent.svg"    alt="Trash Bin"     width={50} height={50} className="h-full w-full" />, onClick: openTrashBin,     isOpen: trashBinOpen },
  ];

  return (
    <div className="flex items-center justify-center w-full absolute bottom-8">
      <FloatingDock mobileClassName="translate-y-20" items={links} />
    </div>
  );
}
