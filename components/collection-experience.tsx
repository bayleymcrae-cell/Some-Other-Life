"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import DailyInspiration from "./daily-inspiration";
import { sizes } from "../lib/collection";

const garmentPreviews = [
  { id: "black-yellow", name: "Black / Yellow", image: "/assets/collection-01-black-yellow.svg" },
  { id: "ivory-indigo", name: "Ivory / Indigo", image: "/assets/collection-01-ivory-indigo.svg" },
  { id: "petrol-ice", name: "Petrol / Faded Ice Blue", image: "/assets/collection-01-petrol-ice.svg" },
] as const;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.2" /></svg>;
}
function Close() {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.2" /></svg>;
}
const studies = [
  { id: "texture", name: "Black / Yellow", image: "/assets/material-black-yellow.webp", alt: "Black waffle fabric with a yellow contrast panel, labelled Material Study 01", note: "Collection 01. Material study." },
  { id: "ivory", name: "Ivory / Indigo", image: "/assets/material-ivory-indigo.webp", alt: "Ivory waffle fabric with an indigo contrast panel, labelled Material Study 02", note: "Collection 01. Material study." },
  { id: "petrol", name: "Petrol / Ice", image: "/assets/material-petrol-ice.webp", alt: "Deep petrol waffle fabric with an ice blue contrast panel, labelled Material Study 03", note: "Collection 01. Material study." },
  { id: "emblem", name: "The signature", image: "/assets/emblem-study.webp", alt: "The Some Other Life emblem embroidered in ivory on dark navy waffle fabric", note: "Collection 01. Emblem study." },
  { id: "embroidery", name: "A closer look", image: "/assets/embroidery-detail.webp", alt: "A macro photograph of the ivory embroidered emblem and dark waffle weave", note: "A closer look at the embroidery." },
  { id: "notebook", name: "Studio notes", image: "/assets/studio-notes.webp", alt: "An open notebook with a pencil drawing of the Some Other Life emblem and a handwritten note about making time for your own life", note: "From the studio." },
  { id: "notice", name: "First notice", image: "/assets/first-notice.webp", alt: "A blue Some Other Life envelope in a sunlit stone doorway, titled First Notice, Collection 01", note: "Receive news of the first release below." },
] as const;
const materials = studies.slice(0, 3);

function EditorialImage({ study, onOpen, className = "", sizes = "(max-width: 700px) 90vw, 40vw" }: { study: typeof studies[number]; onOpen: () => void; className?: string; sizes?: string }) {
  return <button className={`editorial-image ${className}`} onClick={onOpen} aria-label={`View ${study.name.toLowerCase()}`} aria-haspopup="dialog"><img src={study.image} srcSet={`${study.image.replace(".webp", "-560.webp")} 560w, ${study.image} 1122w`} sizes={sizes} alt={study.alt} width="1122" height="1402" loading="lazy" decoding="async" /><span className="image-view" aria-hidden="true">View detail</span></button>;
}
const scenes = [
  { name: "Collection", title: "Collection 01", description: "Coming soon.", anchor: "collection-preview" },
  { name: "Signature", title: "The signature", description: "Some Other Life.", anchor: "signature" },
  { name: "Details", title: "A first look", description: "Texture. Contrast. Embroidery.", anchor: "details" },
] as const;

type Information = "privacy" | "release" | typeof studies[number]["id"] | null;

export default function CollectionExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [info, setInfo] = useState<Information>(null);
  const [scene, setScene] = useState(0);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [colourway, setColourway] = useState("undecided");
  const [size, setSize] = useState("undecided");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const menuDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const current = scenes[scene];
  const garment = garmentPreviews[previewIndex];
  useEffect(() => {
    const followDailyLink = () => { if (window.location.hash === "#daily-note") setDailyOpen(true); };
    followDailyLink();
    window.addEventListener("hashchange", followDailyLink);
    return () => window.removeEventListener("hashchange", followDailyLink);
  }, []);
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
        body: JSON.stringify({ email, colourway, size, consent, website: form.get("website") }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Please try again.");
      setStatus("saved");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Please try again.");
      setStatus("error");
    }
  }

  const study = studies.find(item => item.id === info);

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
        <div className="hero-bottom"><nav className="scene-nav" aria-label="Explore the collection">{scenes.map((item, index) => <button key={item.name} aria-pressed={scene === index} className={scene === index ? "active" : ""} onClick={() => setScene(index)}><span>0{index + 1}</span>{item.name}</button>)}</nav><a href="#collection-preview" className="scroll-link" aria-label="Scroll to the design preview">↓</a></div>
      </section>

      <section className="garment-preview section-wrap" id="collection-preview" aria-labelledby="garment-title">
        <div className="garment-visual"><img key={garment.id} src={garment.image} alt={`Collection 01 design preview: ${garment.name.toLowerCase()} waffle long sleeve with a contrast shoulder panel and embroidered emblems`} width="330" height="290" loading="lazy" decoding="async" /><p>Design preview · Sample in development</p></div>
        <div className="garment-copy"><p className="eyebrow">COLLECTION 01 · COMING SOON</p><h2 id="garment-title">Insignia Long Sleeve</h2><p className="garment-description">A contrast shoulder panel. Embroidered emblems. A first look at Collection 01.</p>
          <fieldset className="garment-colours"><legend>Preview a colour</legend><div>{garmentPreviews.map((item, index) => <button key={item.id} type="button" aria-pressed={previewIndex === index} onClick={() => { setPreviewIndex(index); setColourway(item.id); }}>{item.name}</button>)}</div></fieldset>
          <button className="button garment-notify" onClick={() => { setColourway(garment.id); register(); }}>Notify me when it drops</button><p className="garment-note">Leave your preferred colour and size below. Final details and the release date will follow.</p>
        </div>
      </section>

      <section className="details-section section-wrap material-studies" id="details" aria-labelledby="details-title">
        <div className="section-heading"><div><p className="eyebrow">COLLECTION 01</p><h2 id="details-title">First details</h2></div><p>Texture. Contrast. Embroidery.</p></div>
        <div className="material-grid">{materials.map(item => <figure className="material-study" key={item.id}><EditorialImage study={item} onOpen={() => setInfo(item.id)} sizes="(max-width: 700px) 90vw, 28vw" /><figcaption>{item.name}</figcaption></figure>)}</div>
        <p className="detail-disclosure">Design studies. Full collection to follow.</p>
      </section>

      <section className="signature-editorial" id="signature" aria-labelledby="signature-title"><div className="signature-feature"><EditorialImage study={studies[3]} onOpen={() => setInfo("emblem")} sizes="(max-width: 700px) 90vw, 48vw" /></div><div className="signature-detail"><div className="signature-heading"><p className="eyebrow">THE SIGNATURE</p><h2 id="signature-title">Some Other Life</h2><p>In the detail.</p></div><EditorialImage study={studies[4]} onOpen={() => setInfo("embroidery")} sizes="(max-width: 700px) 70vw, 32vw" /></div></section>

      <section className="studio-notes section-wrap" id="studio-notes" aria-labelledby="notes-title"><div className="studio-note-copy"><p className="eyebrow">FROM THE STUDIO</p><h2 id="notes-title">Give your own life<br />a few hours too.</h2><p>Some Other Life.</p></div><EditorialImage study={studies[5]} onOpen={() => setInfo("notebook")} sizes="(max-width: 700px) 90vw, 44vw" /></section>

      <section className="release-section release-editorial" id="release-list" aria-labelledby="release-title"><EditorialImage study={studies[6]} onOpen={() => setInfo("notice")} className="release-image" sizes="(max-width: 700px) 100vw, 50vw" /><div className="release-panel"><div className="release-intro"><p className="eyebrow">COLLECTION UPDATES</p><h2 id="release-title">Be informed.</h2><p>Receive news of the first release and share your preferred colour and size.</p></div><div className="release-form-wrap">{status === "saved" ? <div className="success-card" role="status"><p className="eyebrow">SOME OTHER LIFE</p><h3>You’re on the list.</h3><p>Your registration is saved.</p><button className="text-link" onClick={() => { setStatus("idle"); setEmail(""); setConsent(false); setColourway("undecided"); setSize("undecided"); }}>Use another email <Arrow /></button></div> : <form className="release-form" onSubmit={joinList}><label className="field-label" htmlFor="release-email">Email address</label><input ref={emailInput} id="release-email" type="email" autoComplete="email" placeholder="Your email address" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /><div className="preference-fields"><div><label className="field-label" htmlFor="release-colour">Preferred colour <span>(optional)</span></label><div className="select-wrap"><select id="release-colour" name="colourway" value={colourway} onChange={e => setColourway(e.target.value)}><option value="undecided">Still deciding</option>{garmentPreviews.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div><div><label className="field-label" htmlFor="release-size">Preferred size <span>(optional)</span></label><div className="select-wrap"><select id="release-size" name="size" value={size} onChange={e => setSize(e.target.value)}>{sizes.map(item => <option key={item} value={item}>{item === "undecided" ? "Still deciding" : item}</option>)}</select></div></div></div><div className="bot-field" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div><label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required /><span>Email me about collections and releases. Unsubscribe at any time.</span></label><p className="privacy-line"><button type="button" onClick={() => setInfo("privacy")}>Privacy notice</button></p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button submit-button" type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Notify me when it drops"}</button></form>}</div></div></section>
    </main>

    <footer className="site-footer"><a className="footer-brand" href="#" aria-label="Some Other Life, back to top"><img src="/assets/logo.jpg" alt="" width="38" height="44" />SOME OTHER LIFE</a><nav aria-label="Footer"><a href="#collection-preview">Collection 01</a><a href="#release-list">Updates</a><button onClick={() => setDailyOpen(true)}>Daily inspiration</button><button onClick={() => setInfo("release")}>Release information</button><button onClick={() => setInfo("privacy")}>Privacy</button></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} SOME OTHER LIFE</span><a href="/studio">Studio <Arrow diagonal /></a></div></footer>

    <DailyInspiration open={dailyOpen} onOpenChange={setDailyOpen} hidden={menuOpen || info !== null} />

    <dialog ref={menuDialog} className="menu-dialog" aria-labelledby="menu-title" onClose={() => setMenuOpen(false)} onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}><div className="menu-panel"><div className="dialog-top"><span id="menu-title" className="eyebrow">SOME OTHER LIFE</span><button className="icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><Close /></button></div><nav aria-label="Main navigation"><a href="#collection-preview" onClick={() => setMenuOpen(false)}>Collection 01 <Arrow /></a><a href="#signature" onClick={() => setMenuOpen(false)}>The signature <Arrow /></a><a href="#studio-notes" onClick={() => setMenuOpen(false)}>Studio notes</a><button onClick={() => { setMenuOpen(false); setDailyOpen(true); }}>Daily inspiration</button><button onClick={register}>Updates <Arrow /></button></nav><img className="menu-emblem" src="/assets/logo.jpg" alt="" width="110" height="125" /></div></dialog>

    <dialog ref={infoDialog} className={`info-dialog ${study ? "image-dialog" : ""}`} aria-labelledby="info-title" onClose={() => setInfo(null)} onClick={e => { if (e.target === e.currentTarget) setInfo(null); }}><div className="info-content"><div className="dialog-top"><span className="eyebrow">SOME OTHER LIFE</span><button className="icon-button" aria-label="Close information" onClick={() => setInfo(null)}><Close /></button></div><h2 id="info-title">{study ? study.name : info === "privacy" ? "Privacy" : "Collection 01"}</h2>{study ? <><img className="expanded-study" src={study.image} alt={study.alt} width="1122" height="1402" /><p className="study-note">{study.note}</p></> : info === "privacy" ? <><p>We save your email address, any colour and size preferences you choose, and consent date to provide Some Other Life collection and release updates. Your details are held by our website provider and are visible only to the studio owner.</p><p>We do not sell subscriber details or use advertising trackers. Essential hosting or sign-in cookies may be used. Anti-spam checks may store a hashed network identifier for up to an hour.</p><p>Unsubscribe from a future email, or <a href="/privacy-request">request removal here</a>.</p></> : <><p>The first collection is in development. The release date, prices and final details will be announced before orders open.</p><p>Registering for updates does not reserve a garment or create an order.</p><button className="button button-dark" onClick={register}>Notify me <Arrow /></button></>}</div></dialog>
  </>;
}
