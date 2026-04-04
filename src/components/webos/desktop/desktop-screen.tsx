import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import Navbar from "./navbar";
import Taskbar from "./taskbar";
import WindowProvider from "@/components/webos/providers/window-provider";
import { DesktopContextMenu } from "@/components/webos/context-menu";

export default function DesktopScreen() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="h-screen w-full bg-[url('/background.svg')] bg-no-repeat bg-center bg-cover relative">
          <Navbar />
          <WindowProvider />
          <Taskbar />
        </div>
      </ContextMenuTrigger>
      <DesktopContextMenu />
    </ContextMenu>
  );
}
