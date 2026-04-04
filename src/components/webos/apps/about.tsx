"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function AboutApp() {
  const [storage, setStorage] = useState("Unknown");
  const [resolution, setResolution] = useState("Unknown");
  const [font, setFont] = useState("Unknown");
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0";

  useEffect(() => {
    const res = `${window.screen.width}×${window.screen.height}`;
    const bodyFont = window
      .getComputedStyle(document.body)
      .fontFamily.split(",")[0]
      .replace(/['"]/g, "");

    const storagePromise = navigator.storage?.estimate
      ? navigator.storage.estimate().then(({ quota }) => `${((quota ?? 0) / 1024 / 1024).toFixed(0)} MB`)
      : Promise.resolve("Unknown");

    storagePromise.then((storageVal) => {
      setStorage(storageVal);
      setResolution(res);
      setFont(bodyFont);
    });
  }, []);

  return (
    <div className="bg-purple-200 bg-opacity-70 p-6 w-full h-full gap-5 flex flex-col justify-center items-center text-gray-800 rounded-b-xl">
      <div className="flex items-center space-x-8 mb-4">
        <Image src="/gadgetOS.svg" alt="gadgetOS logo" height={64} width={64} className="rounded-full ring-4 ring-white/30" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">GadgetOS</h2>
          <p className="text-sm text-gray-700">Version: {version}</p>
        </div>
      </div>
      <div className="space-y-1 mb-6 text-sm w-1/2 text-center">
        <p><span className="font-medium">Storage:</span> {storage}</p>
        <p><span className="font-medium">Resolution:</span> {resolution}</p>
        <p><span className="font-medium">Font:</span> {font}</p>
      </div>
    </div>
  );
}
