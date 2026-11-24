"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import DailyInspiration from "./daily-inspiration";
import { sizes } from "../lib/collection";

const products = [
  { id: "black-yellow", name: "Black / Yellow", image: "/assets/collection-01-black-yellow.svg" },
  { id: "ivory-indigo", name: "Ivory / Indigo", image: "/assets/collection-01-ivory-indigo.svg" },
  { id: "petrol-ice", name: "Petrol / Faded Ice Blue", image: "/assets/collection-01-petrol-ice.svg" },
] as const;
const garmentSizes = sizes.filter(size => size !== "undecided");
type Information = "privacy" | "release" | null;
type AlertSelection = { colourway: string; size: string };

function Close() {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

export default function CollectionExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [info, setInfo] = useState<Information>(null);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [browsingCollection, setBrowsingCollection] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<AlertSelection | null>(null);
  const [savedSelection, setSavedSelection] = useState<AlertSelection | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [sizeError, setSizeError] = useState<string | null>(null);
  const menuDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const product = products.find(item => item.id === selection?.colourway);
  const savedProduct = products.find(item => item.id === savedSelection?.colourway);

  useEffect(() => {
    const followLink = () => {
      if (window.location.hash === "#daily-note") setDailyOpen(true);
      // Keep existing shared collection links useful after consolidating the shop.
      if (["#signature", "#details", "#release-list"].includes(window.location.hash)) document.getElementById("collection-preview")?.scrollIntoView();
    };
    followLink();
    window.addEventListener("hashchange", followLink);
    return () => window.removeEventListener("hashchange", followLink);
  }, []);
  useEffect(() => {
    const collection = document.getElementById("collection-preview");
    if (!collection) return;
    const observer = new IntersectionObserver(([entry]) => setBrowsingCollection(entry.isIntersecting), { rootMargin: "-88px 0px 0px 0px" });
    observer.observe(collection);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (menuOpen) menuDialog.current?.showModal(); else menuDialog.current?.close(); }, [menuOpen]);
  useEffect(() => { if (info) infoDialog.current?.showModal(); else infoDialog.current?.close(); }, [info]);
  useEffect(() => {
    document.body.style.overflow = menuOpen || info ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, info]);

  function showCollection() {
    setMenuOpen(false); setInfo(null);
    window.setTimeout(() => document.getElementById("collection-preview")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }), 40);
  }

  function chooseAlert(colourway: string) {
    const size = selectedSizes[colourway];
    if (!size) {
      setSizeError(colourway);
      document.getElementById(`size-${colourway}`)?.focus();
      return;
    }
    setSizeError(null); setDailyOpen(false); setSelection({ colourway, size });
    setStatus("idle"); setError(""); setConsent(false);
    window.setTimeout(() => {
      document.getElementById("availability-signup")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest" });
      emailInput.current?.focus({ preventScroll: true });
    }, 60);
  }

  function closeAlert() {
    setSelection(null); setStatus("idle"); setError(""); setConsent(false);
    showCollection();
  }

  async function joinList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving" || !selection) return;
    const form = new FormData(event.currentTarget);
    const requested = { ...selection };
    setStatus("saving"); setError("");
    try {
      const response = await fetch("/api/release-list", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, colourway: requested.colourway, size: requested.size, consent, website: form.get("website") }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Please try again.");
      setSavedSelection(requested); setStatus("saved");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Please try again.");
      setStatus("error");
    }
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <button className="nav-button menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-haspopup="dialog"><span className="menu-lines" aria-hidden="true" /><span>Menu</span></button>
      <a className="brand" href="/" aria-label="Some Other Life home"><img className="brand-emblem" src="/assets/official-insignia.png" alt="" width="38" height="44" /><span>SOME OTHER LIFE</span></a>
      <a className="nav-button shop-nav-link" href="#collection-preview">Collection 01</a>
    </header>

    <main id="main">
      <section className="hero scene-0" aria-labelledby="hero-title">
        <img className="hero-image" src="/assets/entrance.webp" alt="A warm stone doorway opening into golden light" width="1536" height="1024" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-label"><span>SOME OTHER LIFE</span><span>01</span></div>
        <div className="hero-copy"><p className="eyebrow">COLLECTION 01</p><h1 id="hero-title">BLACK SWAN</h1><p className="hero-description">Independent clothing label. Coming soon.</p><a className="hero-link" href="#collection-preview">View collection</a></div>
        <button className="door-hotspot" aria-label="View Collection 01" onClick={showCollection}><span aria-hidden="true">+</span><span>Enter</span></button>
        <div className="hero-bottom"><nav className="shop-section-nav" aria-label="Explore"><a href="#collection-preview">Collection 01</a><a href="#studio-notes">Studio notes</a></nav><a href="#collection-preview" className="scroll-link" aria-label="Scroll to Collection 01">↓</a></div>
      </section>

      <section className="collection-shop section-wrap" id="collection-preview" aria-labelledby="collection-title">
        <div className="shop-heading"><div><p className="eyebrow">SOME OTHER LIFE</p><h2 id="collection-title">BLACK SWAN</h2></div><span className="shop-release-status">Coming soon</span></div>
        <p className="shop-description">Insignia Long Sleeve. Three colourways.</p>
        <div className="product-grid">{products.map(item => <article className="product-card" key={item.id} aria-labelledby={`product-${item.id}`}>
          <div className="product-square"><img src={item.image} alt={`Insignia Long Sleeve design preview in ${item.name.toLowerCase()}`} width="330" height="290" loading="lazy" decoding="async" /></div>
          <div className="product-info"><h3 id={`product-${item.id}`}>Insignia Long Sleeve</h3><p className="product-colour">{item.name}</p><p className="product-availability">Coming soon</p>
            <label className="product-size-label" htmlFor={`size-${item.id}`}>Size</label><div className="product-size-wrap"><select id={`size-${item.id}`} value={selectedSizes[item.id] ?? ""} aria-label={`Size for ${item.name}`} aria-invalid={sizeError === item.id} aria-describedby={sizeError === item.id ? `size-error-${item.id}` : undefined} onChange={event => { setSelectedSizes(previous => ({ ...previous, [item.id]: event.target.value })); setSizeError(null); }}><option value="" disabled>Select size</option>{garmentSizes.map(size => <option key={size} value={size}>{size}</option>)}</select></div>
            {sizeError === item.id && <p className="product-size-error" role="alert" id={`size-error-${item.id}`}>Choose your size first.</p>}
            <button type="button" className="product-notify" onClick={() => chooseAlert(item.id)} aria-expanded={selection?.colourway === item.id} aria-controls="availability-signup">Notify me when available</button>
          </div>
        </article>)}</div>
        <section className="denim-feature" aria-labelledby="elsewhere-title">
          <div className="denim-feature-visual"><img src="/assets/elsewhere-night-study-1120.webp" srcSet="/assets/elsewhere-night-study-640.webp 640w, /assets/elsewhere-night-study-1120.webp 1120w" sizes="(max-width: 700px) 100vw, 86vw" alt="A close detail of blue chenille insignia and washed-indigo cargo denim draped across black leather at night" width="1120" height="1400" loading="lazy" decoding="async" /></div>
          <div className="denim-feature-content"><p className="denim-feature-index">SOME OTHER LIFE</p><div className="denim-feature-bottom"><h3 id="elsewhere-title">ELSEWHERE</h3><p className="denim-feature-coming">COMING SOON</p></div></div>
        </section>
        <p className="shop-preview-note">Design previews · Samples in development. Final details and release date to follow.</p>

        {selection && <section className="shop-signup" id="availability-signup" aria-labelledby="availability-title">
          <div className="shop-signup-intro"><p className="eyebrow">COLLECTION 01</p><h3 id="availability-title">{status === "saved" ? "You’re on the list." : "Notify me when available"}</h3><p>Insignia Long Sleeve<br />{status === "saved" ? savedProduct?.name : product?.name} · Size {status === "saved" ? savedSelection?.size : selection.size}</p><p className="signup-order-note">Availability updates only. No payment or order is taken.</p>{status !== "saved" && <button className="text-link" type="button" onClick={closeAlert}>Back to colourways</button>}</div>
          {status === "saved" ? <div className="shop-signup-success" role="status"><p>Your email is on the release list.</p><button className="product-notify" onClick={closeAlert}>Back to collection</button></div> : <form className="release-form shop-alert-form" onSubmit={joinList}>
            <label className="field-label" htmlFor="release-email">Email address</label><input ref={emailInput} id="release-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
            <div className="bot-field" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
            <label className="consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required /><span>Email me about Collection 01 availability and release updates. Unsubscribe at any time.</span></label>
            <p className="privacy-line"><button type="button" onClick={() => setInfo("privacy")}>Privacy notice</button></p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="product-notify" type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Notify me"}</button>
          </form>}
        </section>}
      </section>

      <section className="studio-notes section-wrap" id="studio-notes" aria-labelledby="notes-title"><div className="studio-note-copy"><p className="eyebrow">FROM THE STUDIO</p><h2 id="notes-title">Give your own life<br />a few hours too.</h2><p>Some Other Life.</p></div><img className="studio-notes-image" src="/assets/studio-notes.webp" alt="An open notebook with a sketch of the Some Other Life emblem" width="1122" height="1402" loading="lazy" decoding="async" /></section>
    </main>

    <footer className="site-footer"><a className="footer-brand" href="#" aria-label="Some Other Life, back to top"><img src="/assets/official-insignia.png" alt="" width="38" height="44" />SOME OTHER LIFE</a><nav aria-label="Footer"><a href="/black-swan.html">BLACK SWAN</a><a href="/about.html">The Studio</a><a href="#collection-preview">Collection 01</a><a href="#studio-notes">Studio notes</a><button onClick={() => setDailyOpen(true)}>Daily inspiration</button><button onClick={() => setInfo("release")}>Release information</button><button onClick={() => setInfo("privacy")}>Privacy</button></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} SOME OTHER LIFE</span><a href="/studio">Studio</a></div></footer>
    <DailyInspiration open={dailyOpen} onOpenChange={setDailyOpen} hidden={menuOpen || info !== null || ((browsingCollection || selection !== null) && !dailyOpen)} />
    <dialog ref={menuDialog} className="menu-dialog" aria-labelledby="menu-title" onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) setMenuOpen(false); }}><div className="menu-panel"><div className="dialog-top"><span id="menu-title" className="eyebrow">SOME OTHER LIFE</span><button className="icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><Close /></button></div><nav aria-label="Main navigation"><a href="#collection-preview" onClick={() => setMenuOpen(false)}>Collection 01</a><a href="#studio-notes" onClick={() => setMenuOpen(false)}>Studio notes</a><button onClick={() => { setMenuOpen(false); setDailyOpen(true); }}>Daily inspiration</button></nav></div></dialog>
    <dialog ref={infoDialog} className="info-dialog" aria-labelledby="info-title" onClose={() => setInfo(null)} onClick={event => { if (event.target === event.currentTarget) setInfo(null); }}><div className="info-content"><div className="dialog-top"><span className="eyebrow">SOME OTHER LIFE</span><button className="icon-button" aria-label="Close information" onClick={() => setInfo(null)}><Close /></button></div><h2 id="info-title">{info === "privacy" ? "Privacy" : "Collection 01"}</h2>{info === "privacy" ? <><p>We save your email, colour and size preferences, and consent date for Collection 01 availability and release updates. Your details are visible only to the studio owner.</p><p>We do not sell subscriber details or use advertising trackers. Anti-spam checks may store a hashed network identifier for up to an hour.</p><p>Unsubscribe from a future email, or <a href="/privacy-request">request removal here</a>.</p></> : <><p>Collection 01 is in development. The release date, final prices and details will be announced before orders open.</p><p>An availability signup does not reserve a garment or create an order.</p><button className="product-notify" onClick={showCollection}>View collection</button></>}</div></dialog>
  </>;
}
