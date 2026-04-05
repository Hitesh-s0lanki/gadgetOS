"use client";

import { useEffect, useState } from "react";

export default function DateTimeDisplay() {
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
    <div className="bg-white/35 backdrop-blur-[16px] border border-white/60 rounded-xl px-4 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex items-center space-x-3">
      <span className="text-sm font-semibold text-black/75">{formattedTime}</span>
      <span className="text-sm text-black/50">{formattedDate}</span>
    </div>
  );
}
