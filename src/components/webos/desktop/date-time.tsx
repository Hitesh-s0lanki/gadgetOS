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
    <div className="bg-white/40 h-16 rounded-2xl px-4 flex items-center space-x-3 text-black">
      <span className="text-lg font-semibold">{formattedTime}</span>
      <span className="text-lg">{formattedDate}</span>
    </div>
  );
}
