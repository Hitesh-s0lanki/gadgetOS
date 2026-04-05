"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LockScreen() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isMounted) return null;

  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString("en-GB").replaceAll("/", ".");

  return (
    <div className="h-screen w-full bg-[url('/background.svg')] bg-no-repeat bg-center bg-cover">
      <Link
        href="/webos"
        className="bg-black/40 backdrop-blur-2xl h-screen w-full flex flex-col items-center justify-center text-white gap-2"
      >
        <h1 className="text-8xl font-thin tracking-tight">{formattedTime.split(" ")[0]}</h1>
        <h2 className="text-lg font-medium opacity-80">{formattedDate}</h2>
        <p className="text-xs opacity-50 mt-6 tracking-widest uppercase animate-pulse">Click anywhere to unlock</p>
      </Link>
    </div>
  );
}
