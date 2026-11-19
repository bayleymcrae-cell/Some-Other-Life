"use client";

import { useEffect, useState } from "react";
import { dailyQuotes, getDailyInspiration } from "../lib/daily-inspiration";

export default function DailyInspiration({ open, onOpenChange, hidden }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hidden: boolean;
}) {
  // Static markup and hydration share the same fallback. The browser then
  // selects today's note in Queensland, regardless of the visitor's timezone.
  const [day, setDay] = useState<ReturnType<typeof getDailyInspiration> | null>(null);
  const quote = day?.quote ?? dailyQuotes[0];

  useEffect(() => {
    let timer: number | undefined;
    function synchronize() {
      window.clearTimeout(timer);
      setDay(getDailyInspiration());
      // Align with the next minute, including the midnight date change.
      timer = window.setTimeout(synchronize, 60000 - Date.now() % 60000 + 25);
    }
    function onVisibility() { if (!document.hidden) synchronize(); }
    synchronize();
    window.addEventListener("focus", synchronize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", synchronize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <details className="daily-note" id="daily-note" open={open} hidden={hidden} onToggle={event => onOpenChange(event.currentTarget.open)}>
    <summary className="daily-note-trigger" aria-label="Daily inspiration">
      <img className="daily-note-emblem" src="/assets/logo.jpg" alt="" width="32" height="32" />
      <span className="daily-note-meta"><span className="daily-note-label">DAILY INSPIRATION</span><span className="daily-note-person">{quote.person}</span></span>
      <span className="daily-note-expand" aria-hidden="true">+</span>
    </summary>
    <div className="daily-note-content">
      <div className="daily-note-date"><time dateTime={day?.dateKey}>{day?.dateLabel ?? "A new note each day"}</time>{day && <span>{day.timeLabel} AEST</span>}</div>
      <p className="daily-note-kind">{quote.kind}</p>
      <blockquote>{quote.text}</blockquote>
      {quote.influence && <p className="daily-note-influence">{quote.influence}</p>}
      <div className="daily-note-credit"><span>WORDS / <strong>{quote.author}</strong></span>{quote.source && <a href={quote.source} target="_blank" rel="noopener noreferrer">View source</a>}</div>
      <p className="daily-note-schedule">New at midnight · Queensland time</p>
    </div>
  </details>;
}
