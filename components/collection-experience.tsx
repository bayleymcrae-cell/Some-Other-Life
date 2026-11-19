"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.2" /></svg>;
}
function Close() {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.2" /></svg>;
}
const studies = [
  { name: "Texture", image: "/assets/texture-study.webp", alt: "A close-up of dark waffle texture from the Collection 01 design study", note: "Fine waffle texture." },
  { name: "Embroidery", image: "/assets/embroidery-study.webp", alt: "A partial close-up of multicoloured embroidered emblems on a yellow contrast panel", note: "Colour and embroidered detail." },
] as const;
const scenes = [
  { name: "Collection", title: "Collection 01", description: "Coming soon.", anchor: "details" },
  { name: "Signature", title: "The signature", description: "Some Other Life.", anchor: "signature" },
  { name: "Details", title: "A first look", description: "Texture. Contrast. Embroidery.", anchor: "details" },
] as const;

type Information = "privacy" | "release" | "texture" | "embroidery" | null;

export default function CollectionExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [info, setInfo] = useState<Information>(null);
  const [scene, setScene] = useState(0);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const menuDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const current = scenes[scene];
  useEffect(() => { if (menuOpen) menuDialog.current?.showModal(); else menuDialog.current?.close(); }, [menuOpen]);
  useEffect(() => { if (info) infoDialog.current?.showModal(); else infoDialog.current?.close(); }, [info]);
  useEffect(() => {
    document.body.style.overflow = menuOpen || info ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, info]);

  function register() {
    setMenuOpen(false); setInfo(null);
    window.setTimeout(() => {
      document.getElementById("release-list")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      emailInput.current?.focus({ preventScroll: true });
    }, 60);
  }

  async function joinList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;
    const form = new FormData(event.currentTarget);
    setStatus("saving"); setError("");
    try {
      const response = await fetch("/api/release-list", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, colourway: "undecided", size: "undecided", consent, website: form.get("website") }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Please try again.");
      setStatus("saved");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Please try again.");
      setStatus("error");
    }
  }

  const study = info === "texture" ? studies[0] : info === "embroidery" ? studies[1] : null;

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <button className="nav-button menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-haspopup="dialog"><span className="menu-lines" aria-hidden="true" /><span>Menu</span></button>
      <a className="brand" href="/" aria-label="Some Other Life home"><img className="brand-emblem" src="/assets/logo.jpg" alt="" width="38" height="44" /><span>SOME OTHER LIFE</span></a>
      <button className="nav-button notify-link" onClick={register} aria-label="Receive collection updates"><span>Notify me</span><Arrow diagonal /></button>
    </header>

    <main id="main">
      <section className={`hero scene-${scene}`} aria-labelledby="hero-title">
        <img className="hero-image" src="/assets/entrance.webp" alt="A warm stone doorway opening into golden light" width="1536" height="1024" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-label"><span>SOME OTHER LIFE</span><span>01</span></div>
        <div className="hero-copy" aria-live="polite"><p className="eyebrow">THE FIRST COLLECTION</p><h1 id="hero-title">{current.title}</h1><p className="hero-description">{current.description}</p><a className="hero-link" href={`#${current.anchor}`}>Discover <Arrow /></a></div>
        <button className="door-hotspot" aria-label="Enter the next space" onClick={() => setScene((scene + 1) % scenes.length)}><span><Arrow diagonal /></span><span>Enter</span></button>
        <div className="hero-bottom"><nav className="scene-nav" aria-label="Explore the collection">{scenes.map((item, index) => <button key={item.name} aria-pressed={scene === index} className={scene === index ? "active" : ""} onClick={() => setScene(index)}><span>0{index + 1}</span>{item.name}</button>)}</nav><a href="#details" className="scroll-link" aria-label="Scroll to first details">↓</a></div>
      </section>

      <section className="details-section section-wrap" id="details" aria-labelledby="details-title">
        <div className="section-heading"><div><p className="eyebrow">COLLECTION 01</p><h2 id="details-title">First details</h2></div><p>Texture. Contrast. Embroidery.</p></div>
        <div className="study-grid">{studies.map((item, index) => <figure className={`study study-${index}`} key={item.name}><button className="study-image" onClick={() => setInfo(index === 0 ? "texture" : "embroidery")} aria-label={`View ${item.name.toLowerCase()} detail`}><img src={item.image} alt={item.alt} width="360" height="320" loading="lazy" /><span><Arrow diagonal /></span></button><figcaption><span>0{index + 1}</span>{item.name}</figcaption></figure>)}</div>
        <p className="detail-disclosure">Design studies. Full collection to follow.</p>
      </section>

      <section className="signature-section" id="signature" aria-labelledby="signature-title"><div className="signature-mark"><img src="/assets/logo.jpg" alt="The Some Other Life embroidered emblem supplied by the studio" width="320" height="365" loading="lazy" /></div><div className="signature-copy"><p className="eyebrow">THE SIGNATURE</p><h2 id="signature-title">Some Other Life</h2><p>An embroidered emblem.<br />A different point of view.</p><button className="text-link" onClick={register}>Collection updates <Arrow /></button></div></section>

      <section className="release-section" id="release-list" aria-labelledby="release-title"><div className="release-intro"><p className="eyebrow">COLLECTION UPDATES</p><h2 id="release-title">Be informed.</h2><p>Receive news of the first release.</p></div><div className="release-form-wrap">{status === "saved" ? <div className="success-card" role="status"><p className="eyebrow">SOME OTHER LIFE</p><h3>You’re on the list.</h3><p>Your registration is saved.</p><button className="text-link" onClick={() => { setStatus("idle"); setEmail(""); setConsent(false); }}>Use another email <Arrow /></button></div> : <form className="release-form" onSubmit={joinList}><label className="field-label" htmlFor="release-email">Email address</label><input ref={emailInput} id="release-email" type="email" autoComplete="email" placeholder="Your email address" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /><div className="bot-field" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div><label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required /><span>Email me about collections and releases. Unsubscribe at any time.</span></label><p className="privacy-line"><button type="button" onClick={() => setInfo("privacy")}>Privacy notice</button></p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button submit-button" type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Notify me"}<Arrow /></button></form>}</div></section>
    </main>

    <footer className="site-footer"><a className="footer-brand" href="#" aria-label="Some Other Life, back to top"><img src="/assets/logo.jpg" alt="" width="38" height="44" />SOME OTHER LIFE</a><nav aria-label="Footer"><a href="#details">Collection 01</a><a href="#release-list">Updates</a><button onClick={() => setInfo("release")}>Release information</button><button onClick={() => setInfo("privacy")}>Privacy</button></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} SOME OTHER LIFE</span><a href="/studio">Studio <Arrow diagonal /></a></div></footer>

    <dialog ref={menuDialog} className="menu-dialog" aria-labelledby="menu-title" onClose={() => setMenuOpen(false)} onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}><div className="menu-panel"><div className="dialog-top"><span id="menu-title" className="eyebrow">SOME OTHER LIFE</span><button className="icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><Close /></button></div><nav aria-label="Main navigation"><a href="#details" onClick={() => setMenuOpen(false)}>Collection 01 <Arrow /></a><a href="#signature" onClick={() => setMenuOpen(false)}>The signature <Arrow /></a><button onClick={register}>Updates <Arrow /></button></nav><img className="menu-emblem" src="/assets/logo.jpg" alt="" width="110" height="125" /></div></dialog>

    <dialog ref={infoDialog} className={`info-dialog ${study ? "image-dialog" : ""}`} aria-labelledby="info-title" onClose={() => setInfo(null)} onClick={e => { if (e.target === e.currentTarget) setInfo(null); }}><div className="info-content"><div className="dialog-top"><span className="eyebrow">SOME OTHER LIFE</span><button className="icon-button" aria-label="Close information" onClick={() => setInfo(null)}><Close /></button></div><h2 id="info-title">{study ? study.name : info === "privacy" ? "Privacy" : "Collection 01"}</h2>{study ? <><img className="expanded-study" src={study.image} alt={study.alt} width="540" height="480" /><p className="study-note">{study.note} Design study.</p></> : info === "privacy" ? <><p>We save your email address and consent date to provide Some Other Life collection and release updates. Your details are held by our website provider and are visible only to the studio owner.</p><p>We do not sell subscriber details or use advertising trackers. Essential hosting or sign-in cookies may be used. Anti-spam checks may store a hashed network identifier for up to an hour.</p><p>Unsubscribe from a future email, or <a href="/privacy-request">request removal here</a>.</p></> : <><p>The first collection is in development. The release date, prices and final details will be announced before orders open.</p><p>Registering for updates does not reserve a garment or create an order.</p><button className="button button-dark" onClick={register}>Notify me <Arrow /></button></>}</div></dialog>
  </>;
}
