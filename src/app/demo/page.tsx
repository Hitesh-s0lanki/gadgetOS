import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <h1 className="text-2xl font-semibold text-foreground">Web OS Demo</h1>
      <p className="max-w-md text-center text-muted-foreground">
        The Web OS Demo will be available here. Connect your sandboxed
        browser-based GadgetOS environment when ready.
      </p>
      <Button asChild>
        <Link href="/#web-demo">Back to Home</Link>
      </Button>
    </main>
  );
}
