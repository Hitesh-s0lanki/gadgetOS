// src/lib/screenshot.ts
import html2canvas from "html2canvas";

export async function captureScreenshot(): Promise<void> {
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    allowTaint: false,
    scale: window.devicePixelRatio,
  });
  const link = document.createElement("a");
  link.download = `gadgetos-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
