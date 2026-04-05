import { ConvexClientProvider } from "@/components/webos/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      {children}
      <Toaster position="bottom-right" />
    </ConvexClientProvider>
  );
}
