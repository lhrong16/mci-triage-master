import { useEffect, useState } from "react";
export function LiveClock() {
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    setT(new Date());
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const formatted = t
    ? t.toLocaleString("en-GB", {
        timeZone: "Asia/Kuala_Lumpur",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " MYT"
    : "";
  return (
    <div className="font-mono text-xs md:text-sm tabular-nums text-muted-foreground">
      <span className="text-triage-red mr-2 animate-pulse">●</span>
      {formatted}
    </div>
  );
}
