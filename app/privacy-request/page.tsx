"use client";
import { useState, type FormEvent } from "react";
export default function PrivacyRequest() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function requestRemoval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("saving");
    setError("");
    try {
      const response = await fetch("/api/privacy-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), website: form.get("website") }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error);
      setStatus("done");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); setStatus("idle"); }
  }
  return <main className="studio-page"><a href="/">← Some Other Life</a><p className="eyebrow">YOUR DETAILS</p><h1>{status === "done" ? "Request received." : "Leave the release list."}</h1><p>{status === "done" ? "The studio will review your removal request. For immediate removal, use the unsubscribe link in a release email." : "Enter the email address you registered with to ask the studio to remove your release-list registration."}</p>{status !== "done" && <form className="release-form" style={{ maxWidth: 450 }} onSubmit={requestRemoval}><label htmlFor="privacy-email" className="field-label">Email address</label><input id="privacy-email" name="email" type="email" required maxLength={254} autoComplete="email" /><div className="bot-field" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div><button className="button button-dark" type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Request removal"}</button></form>}{error && <p role="alert">{error}</p>}<p><a href="/">Return to the collection</a></p></main>;
}
