import { useEffect, useState } from "react";
export function LiveClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <div className="font-mono text-xs md:text-sm tabular-nums text-muted-foreground">
      <span className="text-triage-red mr-2 animate-pulse">●</span>
      {t.toUTCString().replace("GMT","UTC")}
    </div>
  );
}
