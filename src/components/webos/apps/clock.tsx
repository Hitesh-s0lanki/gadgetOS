"use client";

import { useEffect, useState } from "react";
import { Calendar, Settings } from "lucide-react";

export default function ClockApp() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
      setDate(`${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()}`);
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 h-full w-full flex flex-col justify-center items-center p-6 text-white">
      <div className="text-center">
        <div className="text-6xl font-thin tracking-tight">{time}</div>
        <div className="mt-1 text-sm opacity-80">{date}</div>
      </div>
      <div className="mt-6 space-y-3 w-48">
        <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl py-2 text-sm text-white transition-colors duration-150">
          <Calendar size={16} /><span>Calendar</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl py-2 text-sm text-white transition-colors duration-150">
          <Settings size={16} /><span>Settings</span>
        </button>
      </div>
    </div>
  );
}
