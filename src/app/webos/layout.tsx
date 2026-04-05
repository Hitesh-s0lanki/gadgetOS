import { ConvexClientProvider } from "@/components/webos/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export default function WebOSLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <div className="h-screen w-screen overflow-hidden">
        {children}
        <Toaster position="bottom-right" />
      </div>
    </ConvexClientProvider>
  );
}
