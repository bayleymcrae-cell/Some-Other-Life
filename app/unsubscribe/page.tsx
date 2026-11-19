"use client";
import { useState } from "react";
export default function Unsubscribe() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function remove() {
    setStatus("saving");
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      const response = await fetch("/api/release-list/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error);
      setStatus("done");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); setStatus("idle"); }
  }
  return <main className="studio-page"><p className="eyebrow">SOME OTHER LIFE</p><h1>{status === "done" ? "You’re off the list." : "Leave the release list?"}</h1><p>{status === "done" ? "Your registration has been removed." : "Confirm below to remove your email and collection preferences."}</p>{status !== "done" && <button className="button button-dark" onClick={remove} disabled={status === "saving"}>{status === "saving" ? "Removing…" : "Unsubscribe"}</button>}{error && <p role="alert">{error}</p>}<p><a href="/">Return to Some Other Life</a></p></main>;
}
