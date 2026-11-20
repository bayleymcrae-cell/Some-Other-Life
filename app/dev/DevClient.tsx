"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EventEntry = { at: string; type?: string; text: string };
type Supplier = {
 id: string; name: string; email: string; status: string; threadUrl?: string; favourite?: boolean;
 sampleBase?: number|null; sampleShipping?: number|null; sampleLanded?: number|null;
 bulk30?: number|null; bulk50?: number|null; bulk90?: number|null; bulk100?: number|null;
 moq?: number|null; latestIncoming?: string; latestOutgoing?: string;
 precut?: Record<string, boolean>; inspection?: Record<string, boolean>; timeline?: EventEntry[];
 [key: string]: any;
};
type Workspace = { version?: number; brand?: string; packVersion?: string; sourceEmail?: string; suppliers: Supplier[]; [key:string]:any };
type Document = { id:string; owner:string; name:string; category:string; blob:Blob; date:string; size:number };
const STAGES = ["contacted","replied","sample quote received","sample ordered","sample received","inspection","revision needed","approved for pricing/MOQ","rejected","bounced"];
const PRECUT = ["Wearer's LEFT shoulder labelled on front/back flats","Scaled panel pattern and A–E measurements approved","Size M measurements and seam allowances approved","Physical body and panel colour swatches approved","Cotton content, GSM and fabric hand feel approved","Original four-lobed emblem trace approved — not a diamond","20 / 27 / 35 mm stitch tests approved","4–6 motifs, irregular placement and seam clearance approved","Distressing strike-off and wash test approved","Sample invoice, shipping and payment terms approved","Owner's written approval before ANY paid sample work"];
const INSPECT = ["Body/shoulder/sleeve fit against size M targets","LEFT shoulder panel and seam construction","Original emblem cutouts/tips and actual patch geometry","Thread colours, stitch quality and no puckering","Fabric weight, texture, drape and comfort","Body/panel colour accuracy and controlled distressing","Neck rib, cuff recovery, hem construction","Wash shrinkage and colourfastness","Care/origin/brand labels and packaging","Supplier photos, measurements and revision decisions"];
const DETAIL: {label:string;key:string;area?:boolean}[] = [
 {label:"Quote basis / what's included",key:"sampleCostBasis",area:true},
 {label:"Sample customs / GST",key:"sampleDuty",area:true},
 {label:"Development / setup fees",key:"developmentFees"},
 {label:"Fabric composition, GSM and choices",key:"fabric",area:true},
 {label:"Sewn shoulder panel",key:"panel",area:true},
 {label:"Emblem / embroidery methods",key:"embroidery",area:true},
 {label:"Revisions / second sample cost",key:"revisions",area:true},
 {label:"Shipping to Gold Coast 4209",key:"shipping",area:true},
 {label:"Sample lead time",key:"sampleLead"},
 {label:"Bulk lead time (quote only)",key:"bulkLead"},
 {label:"Payment terms / protection",key:"payment",area:true},
 {label:"Sample credit",key:"sampleCredit"},
 {label:"Bulk price basis (EXW / DDP etc)",key:"bulkBasis"},
 {label:"Quality observations",key:"quality",area:true},
 {label:"Risks / missing evidence",key:"risk",area:true},
 {label:"Factory sign-off evidence",key:"factorySignoff",area:true},
 {label:"Tracking / shipment URL",key:"trackingUrl"},
 {label:"Tracking number",key:"tracking"},
 {label:"Carrier",key:"shippingCarrier"},
 {label:"Dispatch date",key:"dispatchDate"},
 {label:"Arrival date",key:"arrivalDate"},
 {label:"Sample decision (not bulk approval)",key:"sampleDecision",area:true},
];
const today = () => new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Australia/Brisbane"}).format(new Date());
const currency = (v:unknown) => v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? "Unconfirmed" : "US$"+Number(v).toFixed(2);
const safe = (v:unknown) => String(v ?? "");
const empty:Workspace = {brand:"SOME OTHER LIFE",packVersion:"REV B — 16 NOV 2026",sourceEmail:"someotherlifetm@gmail.com",suppliers:[]};
const first = (s:Supplier) => s.sampleLanded==null ? Infinity : Number(s.sampleLanded);
function metricRank(s:Supplier) {
  if(!Number.isFinite(first(s)) || s.status==="rejected" || s.status==="bounced")return -9999;
  let v=80-Math.min(55,first(s)*.18);
  if(/17[05]|180|185|190/.test(s.fabric||""))v+=12;
  if(/trade assurance|paypal|escrow/i.test(s.payment||""))v+=10;
  if(/included|free/i.test(s.revisions||""))v+=8;
  if(s.moq!=null && Number(s.moq)<=30)v+=6;
  if(/buyer|unconfirmed|exclu|check/i.test(s.sampleDuty||""))v-=7;
  if(s.risk)v-=3;
  return v;
}
function openDraft(s:Supplier) {
 const subject="Re: SOME OTHER LIFE Collection 01 — first sample quotation";
 const body=`Hi ${s.name} team,\n\nI'm comparing the first physical samples for Collection 01. Could you confirm your latest all-in delivered total for one black/yellow size M to Gold Coast 4209, including any taxes and duties? Please confirm the fine cotton waffle GSM, sewn wearer's-left panel, original emblem stitch test, included revisions, dispatch date and protected payment terms.\n\nPlease send the final quote, photos and pattern proof by email. This is a quotation request only — no paid work or cutting until I approve the specifications and invoice in writing.\n\nThanks,\nSOME OTHER LIFE`;
 window.open("https://mail.google.com/mail/?authuser=someotherlifetm%40gmail.com&view=cm&fs=1&to="+encodeURIComponent(s.email||"")+"&su="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body),"_blank","noopener,noreferrer");
}
let dbPromise:Promise<IDBDatabase>|null=null;
function docsDB(){
 if(typeof indexedDB==="undefined")return Promise.reject(new Error("Browser files unavailable"));
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((ok,bad)=>{const req=indexedDB.open("SOL_PRIVATE_DEV_DOCUMENTS",1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("docs"))req.result.createObjectStore("docs",{keyPath:"id"})};req.onsuccess=()=>ok(req.result);req.onerror=()=>bad(req.error)});
 return dbPromise;
}
async function docsAll():Promise<Document[]> {const d=await docsDB();return new Promise((ok,bad)=>{const q=d.transaction("docs","readonly").objectStore("docs").getAll();q.onsuccess=()=>ok(q.result as Document[]);q.onerror=()=>bad(q.error)})}
async function docsPut(item:Document){const d=await docsDB();return new Promise<void>((ok,bad)=>{const q=d.transaction("docs","readwrite").objectStore("docs").put(item);q.onsuccess=()=>ok();q.onerror=()=>bad(q.error)})}
async function docsDelete(id:string){const d=await docsDB();return new Promise<void>((ok,bad)=>{const q=d.transaction("docs","readwrite").objectStore("docs").delete(id);q.onsuccess=()=>ok();q.onerror=()=>bad(q.error)})}

export default function DevClient(){
 const [data,setData]=useState<Workspace|null>(null);
 const [loaded,setLoaded]=useState(false);
 const [saveStatus,setSaveStatus]=useState("Connecting to private workspace…");
 const [tab,setTab]=useState("overview");
 const [selected,setSelected]=useState("");
 const [filter,setFilter]=useState("");
 const [note,setNote]=useState("");
 const [documents,setDocuments]=useState<Document[]>([]);
 const [docOwner,setDocOwner]=useState("_master");
 const [newName,setNewName]=useState("");
 const [newEmail,setNewEmail]=useState("");
 const [busy,setBusy]=useState(false);
 const queue=useRef<Promise<void>>(Promise.resolve());
 const importInput=useRef<HTMLInputElement>(null);
 const fileInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{
   let cancelled=false;
   fetch("/api/dev/data",{cache:"no-store",credentials:"same-origin"}).then(async res=>{if(!res.ok)throw new Error("Private DB unavailable");const d=await res.json();if(!cancelled){setData(d);setLoaded(true);setSaveStatus("Private workspace connected")}})
     .catch(()=>{if(!cancelled){setData(empty);setLoaded(true);setSaveStatus("Database unavailable — export any changes before leaving")}});
   docsAll().then(setDocuments).catch(()=>{});
   return()=>{cancelled=true};
 },[]);
 useEffect(()=>{
   if(!loaded||!data)return;
   const timer=setTimeout(()=>{
     const payload=JSON.stringify(data);
     queue.current=queue.current.catch(()=>{}).then(async()=>{
       const res=await fetch("/api/dev/data",{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:payload});
       if(!res.ok)throw new Error("Save failed");
       setSaveStatus("Saved to private workspace");
     }).catch(()=>setSaveStatus("Save failed — export a backup"));
   },850);
   return()=>clearTimeout(timer);
 },[data,loaded]);
 const supplier=data?.suppliers.find(s=>s.id===selected)||null;
 const ranked=useMemo(()=>[...(data?.suppliers||[])].filter(s=>Number.isFinite(first(s)) && !["bounced","rejected"].includes(s.status)).sort((a,b)=>metricRank(b)-metricRank(a)||first(a)-first(b)),[data]);
 const visible=(data?.suppliers||[]).filter(s=>(s.name+" "+s.email+" "+s.status).toLowerCase().includes(filter.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
 function change(patch:Partial<Workspace>){setData(d=>d?{...d,...patch}:d)}
 function changeSupplier(id:string,key:string,value:unknown){setData(d=>!d?d:{...d,suppliers:d.suppliers.map(s=>s.id===id?{...s,[key]:value}:s)})}
 function addEvent(id:string,type:string,message:string){const text=message.trim();if(!text)return;setData(d=>!d?d:{...d,suppliers:d.suppliers.map(s=>s.id===id?{...s,timeline:[...(s.timeline||[]),{at:today(),type,text}]}:s)});setNote("")}
 function changeStage(s:Supplier,next:string){setData(d=>!d?d:{...d,suppliers:d.suppliers.map(x=>x.id===s.id?{...x,status:next,timeline:[...(x.timeline||[]),{at:today(),type:"stage",text:"Stage changed to "+next}]}:x)})}
 async function onImport(file?:File){if(!file)return;try{
   const parsed=JSON.parse(await file.text());
   const workspace=parsed.state&&Array.isArray(parsed.state.suppliers)?parsed.state:parsed;
   if(!Array.isArray(workspace.suppliers)||workspace.suppliers.some((x:Supplier)=>!x.id||!x.name))throw new Error("Invalid workspace");
   if(data?.suppliers.length&&!confirm("Replace current supplier records with this import? Export a backup first."))return;
   setData({...workspace,brand:"SOME OTHER LIFE"});setSelected("");setTab("overview");setSaveStatus("Import loaded — saving securely");
 }catch{alert("This file must be the private Supplier Studio JSON import or a Studio backup.")}finally{if(importInput.current)importInput.current.value=""}}
 function exportData(){if(!data)return;const blob=new Blob([JSON.stringify({format:"SOL_SUPPLIER_STUDIO_BACKUP_V1",exportedAt:new Date().toISOString(),state:data},null,2)],{type:"application/json"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="SOME_OTHER_LIFE_supplier_backup_"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(u),10000)}
 async function uploadDocs(files:FileList|null){if(!files)return;setBusy(true);try{for(const f of Array.from(files)){if(f.size>25*1024*1024)continue;await docsPut({id:"doc_"+Date.now()+"_"+Math.random().toString(36).slice(2),owner:docOwner,name:f.name,category:docOwner==="_master"?"Manufacturer pack":"Supplier evidence",blob:f,date:today(),size:f.size})}setDocuments(await docsAll())}catch{alert("File storage unavailable on this device.")}setBusy(false);if(fileInput.current)fileInput.current.value=""}
 async function removeDoc(id:string){if(!confirm("Remove this document from this browser?"))return;await docsDelete(id);setDocuments(await docsAll())}
 function downloadDoc(d:Document){const url=URL.createObjectURL(d.blob);const a=document.createElement("a");a.href=url;a.download=d.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
 function addSupplier(){if(!newName.trim()||!data)return;const supplier:Supplier={id:"sol_"+Date.now(),name:newName.trim(),email:newEmail.trim(),status:"contacted",threadUrl:"",currency:"USD",timeline:[{at:today(),type:"note",text:"New supplier contact added"}],precut:{},inspection:{}};change({suppliers:[...data.suppliers,supplier]});setSelected(supplier.id);setTab("detail");setNewName("");setNewEmail("")}
 function viewSupplier(s:Supplier){setSelected(s.id);setDocOwner(s.id);setTab("detail");setNote("")}
 const f=(s:Supplier,key:string,label:string,numeric=false,area=false)=>(
   <label key={key} className={"sd-field"+(area?" full":"")}>
     <span>{label}</span>{area?
       <textarea rows={3} value={safe(s[key])} onChange={e=>changeSupplier(s.id,key,e.target.value)}/>:
       <input type={numeric?"number":"text"} step={numeric?"0.01":undefined} min={numeric?"0":undefined} value={s[key]??""} placeholder="Not confirmed" onChange={e=>changeSupplier(s.id,key,numeric?(e.target.value===""?null:Number(e.target.value)):e.target.value)}/>}
   </label>);
 function checklist(s:Supplier,key:"precut"|"inspection",labels:string[]){const checked=s[key]||{};return <div className="sd-checklist">{labels.map(label=><label key={label}><input type="checkbox" checked={!!checked[label]} onChange={e=>changeSupplier(s.id,key,{...checked,[label]:e.target.checked})}/><span>{label}</span></label>)}</div>}
 function attachments(owner:string){return <section className="sd-panel"><div className="sd-section-title"><h3>Evidence & documents</h3><small>Stored only in this browser; keep original copies</small></div><label className="sd-upload">Upload {owner==="_master"?"manufacturer pack / original logo":"quote, sample photos, tracking, approvals"}<input ref={fileInput} type="file" multiple onChange={e=>{setDocOwner(owner);void uploadDocs(e.target.files)}} disabled={busy}/></label>{documents.filter(d=>d.owner===owner).map(d=><div className="sd-document" key={d.id}><span>{d.name}<small>{Math.round(d.size/1024)} KB · {d.date}</small></span><button onClick={()=>downloadDoc(d)}>Open</button><button onClick={()=>void removeDoc(d.id)}>Remove</button></div>)}{!documents.some(d=>d.owner===owner)&&<p className="sd-muted">No files uploaded here yet.</p>}</section>}
 if(!loaded||!data)return <main className="studio-page"><h1>Opening private supplier studio…</h1></main>;
 return <div className="sd">
   <style>{STYLES}</style>
   <aside className="sd-sidebar"><a href="/" className="sd-back">← SOME OTHER LIFE</a><div className="sd-logotype">SUPPLIER<br/>STUDIO<span>.</span></div><div className="sd-kicker">COLLECTION 01 / PRIVATE</div><nav>{[["overview","Overview"],["suppliers","All suppliers"],["shortlist","Quote shortlist"],["sampling","Sample pipeline"],["communications","Communications"],["authority","Design authority"],["backup","Data & backup"]].map(([k,v])=><button className={tab===k?"active":""} key={k} onClick={()=>{setTab(k);setSelected("");setDocOwner("_master")}}>{v}</button>)}</nav><a href="/studio" className="sd-studio-link">Release-list studio ↗</a><small>Quotation and first-sample development only. No bulk approvals.</small></aside>
   <main className="sd-content"><header className="sd-top"><span>ATELIER / {tab==="detail"?"SUPPLIER":tab.toUpperCase()}</span><span className="sd-save">{saveStatus}</span></header>
   {tab==="overview"&&<div className="sd-page"><div className="sd-head"><small>MANUFACTURING / COLLECTION 01</small><h1>Build the first sample right.</h1><p>Private supplier quotes, correspondence and approval checkpoints from your actual outreach. Quotes are not purchase commitments.</p></div>
   <div className="sd-metrics">{[["Contacts",data.suppliers.length],["Replied",data.suppliers.filter(s=>!!s.latestIncoming).length],["Quoted",data.suppliers.filter(s=>s.status==="sample quote received").length],["Bounced",data.suppliers.filter(s=>s.status==="bounced").length]].map(([label,n])=><div key={label}><small>{label}</small><strong>{n}</strong></div>)}</div>
   {!data.suppliers.length&&<section className="sd-panel"><h3>Import your supplier records</h3><p>The existing 23 private Gmail-derived records are deliberately not stored in your public GitHub code. Import the private JSON file once, then records save to the protected database and appear on your other devices.</p><button className="sd-primary" onClick={()=>importInput.current?.click()}>Import supplier records</button></section>}
   <section className="sd-panel"><div className="sd-section-title"><h2>Strongest current quotes</h2><button onClick={()=>setTab("shortlist")}>View comparison →</button></div>{ranked.slice(0,5).map((s,i)=><button key={s.id} className="sd-quote-row" onClick={()=>viewSupplier(s)}><span><b>{String(i+1).padStart(2,"0")} &nbsp;{s.name}</b><small>{s.sampleCostBasis||"Sample quotation"}</small></span><strong>{currency(s.sampleLanded)}</strong></button>)}{!ranked.length&&<p className="sd-muted">Import records or add a supplier to begin comparing quotations.</p>}</section>
   <section className="sd-panel"><h2>Supplier stages</h2><div className="sd-status-grid">{STAGES.map(k=><div key={k}><b>{data.suppliers.filter(s=>s.status===k).length}</b><span>{k}</span></div>)}</div></section></div>}
   {tab==="suppliers"&&<div className="sd-page"><div className="sd-head"><small>ALL ENQUIRIES</small><h1>Supplier directory.</h1><p>Open a supplier to edit their full quote, emails, sample approvals and quality notes.</p></div><input className="sd-search" placeholder="Search supplier, email or stage" value={filter} onChange={e=>setFilter(e.target.value)}/><div className="sd-panel sd-table-scroll"><table><thead><tr><th>Supplier</th><th>Stage</th><th>Sample total</th><th>MOQ / colour</th><th></th></tr></thead><tbody>{visible.map(s=><tr key={s.id} onClick={()=>viewSupplier(s)}><td><b>{s.name}</b><small>{s.email}</small></td><td>{s.status}</td><td>{currency(s.sampleLanded)}</td><td>{s.moq??"—"}</td><td>Open ↗</td></tr>)}</tbody></table></div><section className="sd-panel"><h3>Add supplier</h3><div className="sd-fields"><label className="sd-field"><span>Company</span><input value={newName} onChange={e=>setNewName(e.target.value)}/></label><label className="sd-field"><span>Email</span><input value={newEmail} onChange={e=>setNewEmail(e.target.value)}/></label></div><button className="sd-primary" onClick={addSupplier}>Add contact</button></section></div>}
   {tab==="shortlist"&&<div className="sd-page"><div className="sd-head"><small>LOW-UPFRONT-COST OPTIONS</small><h1>Compare before spending.</h1><p>Rankings update when quotes change. All figures remain in the currency quoted (typically USD). Unknown shipping, customs or payment terms must be checked before choosing a sample.</p></div><div className="sd-panel sd-table-scroll"><table><thead><tr><th>Supplier</th><th>Sample delivered*</th><th>MOQ / colour</th><th>30 pcs</th><th>50 pcs</th><th>90 pcs</th><th>100 pcs</th><th>Payment / risk</th></tr></thead><tbody>{ranked.map((s,i)=><tr key={s.id} onClick={()=>viewSupplier(s)}><td><b>{i+1}. {s.name}</b></td><td>{currency(s.sampleLanded)}</td><td>{s.moq??"—"}</td><td>{currency(s.bulk30)}</td><td>{currency(s.bulk50)}</td><td>{currency(s.bulk90)}</td><td>{currency(s.bulk100)}</td><td>{s.payment||s.risk||"Unconfirmed"}</td></tr>)}</tbody></table></div><p className="sd-muted">*Supplier-stated delivered sample offers, not independent landed-cost verification. Bulk unit prices are for comparison only — this workspace cannot approve production.</p></div>}
   {tab==="sampling"&&<div className="sd-page"><div className="sd-head"><small>PROTOTYPE CONTROL</small><h1>Sample pipeline.</h1><p>Never move to physical cutting until each pre-cut item has evidence and your written permission.</p></div><div className="sd-panel sd-table-scroll"><table><thead><tr><th>Factory</th><th>Stage</th><th>Pre-cut checks</th><th>Inspection</th><th>Tracking</th></tr></thead><tbody>{data.suppliers.filter(s=>s.status!=="bounced").map(s=><tr key={s.id} onClick={()=>viewSupplier(s)}><td><b>{s.name}</b></td><td>{s.status}</td><td>{Object.values(s.precut||{}).filter(Boolean).length}/{PRECUT.length}</td><td>{Object.values(s.inspection||{}).filter(Boolean).length}/{INSPECT.length}</td><td>{s.tracking||"—"}</td></tr>)}</tbody></table></div></div>}
   {tab==="communications"&&<div className="sd-page"><div className="sd-head"><small>EMAIL HISTORY</small><h1>Keep every conversation.</h1><p>Each record links to its original thread in someotherlifetm@gmail.com. Drafts open in Gmail for your review — nothing sends automatically.</p></div><div className="sd-panel">{data.suppliers.map(s=><div className="sd-comm" key={s.id}><div><b>{s.name}</b><small>{s.email} · Last supplier reply: {s.latestIncoming||"Awaiting reply"}</small></div><span><button onClick={()=>viewSupplier(s)}>Record</button>{s.threadUrl&&<a href={s.threadUrl} target="_blank" rel="noopener noreferrer">Gmail ↗</a>}<button onClick={()=>openDraft(s)}>Draft reply ↗</button></span></div>)}</div></div>}
   {tab==="authority"&&<div className="sd-page"><div className="sd-head"><small>REV B / 16 NOV 2026</small><h1>Design authority.</h1><p>The original manufacturer pack is the only design authority. No guessed panel measurements, mirror-flipped left shoulder or substituted emblem shape.</p></div><div className="sd-metrics"><div><small>GARMENT</small><strong>01</strong></div><div><small>COLOURWAYS</small><strong>03</strong></div><div><small>FABRIC TARGET</small><strong>180</strong><small>GSM</small></div></div><section className="sd-panel"><h2>Locked design requirements</h2><p>Wearer's LEFT asymmetric shoulder panel, including front and back. Black / vivid yellow; ivory / distressed indigo; dark petrol / faded ice blue. Lightweight 100% combed cotton fine-waffle jersey target 170–190 GSM. Tailored-relaxed fit with narrow rib cuffs and crewneck.</p><p>Original four-lobed, hooked emblem; no diamond/star substitution. Four to six motifs per shirt; test actual stitches at 20, 27 and 35 mm. Panel measurements A–E remain TBD until scaled patterns are approved. First samples: one size M per colourway. Nothing here permits bulk production.</p></section>{attachments("_master")}</div>}
   {tab==="backup"&&<div className="sd-page"><div className="sd-head"><small>DATA MANAGEMENT</small><h1>Private workspace.</h1><p>Supplier records sync to the existing site's private D1 database. Files you upload are stored only in this browser; download separate copies. Gmail threads are linked rather than automatically synchronized.</p></div><section className="sd-panel"><h2>Import / export</h2><div className="sd-actions"><button className="sd-primary" onClick={()=>importInput.current?.click()}>Import supplier JSON</button><button onClick={exportData}>Export private backup JSON</button></div><p className="sd-muted">Never put supplier import JSON, your manufacturer PDF or original logo in the public GitHub repository. Save regular backups.</p></section>{attachments("_master")}</div>}
   {tab==="detail"&&supplier&&<div className="sd-page"><button className="sd-back-list" onClick={()=>setTab("suppliers")}>← All suppliers</button><div className="sd-head"><small>PRIVATE SUPPLIER RECORD / {supplier.id}</small><h1>{supplier.name}</h1><p>{supplier.email} · Original thread and editable sample-development terms.</p></div><div className="sd-actions"><button className="sd-primary" onClick={()=>supplier.threadUrl&&window.open(supplier.threadUrl,"_blank","noopener,noreferrer")}>Open full Gmail thread ↗</button><button onClick={()=>openDraft(supplier)}>Draft tailored response ↗</button><button onClick={()=>changeSupplier(supplier.id,"favourite",!supplier.favourite)}>{supplier.favourite?"★ Shortlisted":"☆ Add to shortlist"}</button></div>
   <section className="sd-panel"><div className="sd-section-title"><h2>Stage and quotation</h2><small>Quotes only — no orders placed</small></div><label className="sd-field full"><span>Supplier status</span><select value={supplier.status} onChange={e=>changeStage(supplier,e.target.value)}>{STAGES.map(status=><option key={status}>{status}</option>)}</select></label><div className="sd-fields">{[["sampleBase","Sample price (USD)"],["sampleShipping","Sample shipping (USD)"],["sampleLanded","Total delivered sample (USD)"],["moq","MOQ per colour"],["bulk30","30 units per colour"],["bulk50","50 units per colour"],["bulk90","90 units per colour"],["bulk100","100 units per colour"]].map(([key,label])=>f(supplier,key,label,true))}</div></section>
   <section className="sd-panel"><div className="sd-section-title"><h2>Materials, payment and quality</h2><small>Editable supplier claims</small></div><div className="sd-fields">{DETAIL.map(item=>f(supplier,item.key,item.label,false,item.area))}</div></section>
   <section className="sd-panel"><div className="sd-section-title"><h2>Pre-cut approval</h2><small>{Object.values(supplier.precut||{}).filter(Boolean).length} / {PRECUT.length} checked</small></div><p className="sd-muted">Checkboxes document review. They do not authorise a supplier to start cutting or charge a payment.</p>{checklist(supplier,"precut",PRECUT)}</section>
   <section className="sd-panel"><div className="sd-section-title"><h2>Post-delivery inspection</h2><small>{Object.values(supplier.inspection||{}).filter(Boolean).length} / {INSPECT.length} checked</small></div>{checklist(supplier,"inspection",INSPECT)}</section>
   <section className="sd-panel"><h2>Conversation & revision log</h2><div className="sd-note"><textarea rows={3} value={note} placeholder="Add a dated note, revision request, factory sign-off or follow-up…" onChange={e=>setNote(e.target.value)}/><div><button onClick={()=>addEvent(supplier.id,"note",note)}>Save note</button><button onClick={()=>addEvent(supplier.id,"revision",note)}>Log revision</button><button onClick={()=>addEvent(supplier.id,"follow-up",note)}>Log follow-up</button></div></div><div className="sd-log">{[...(supplier.timeline||[])].reverse().map((evt,i)=><div key={i}><time>{evt.at}</time><span><b>{evt.type||"note"}</b> {evt.text}</span></div>)}</div></section>{attachments(supplier.id)}</div>}
   </main>
   <input ref={importInput} type="file" accept=".json,application/json" hidden onChange={e=>void onImport(e.target.files?.[0])}/>
 </div>;
}
const STYLES = `
.sd{display:grid;grid-template-columns:245px minmax(0,1fr);min-height:100vh;background:#f4f1ec;color:#222824;font:14px Arial,Helvetica,sans-serif}.sd *{box-sizing:border-box}.sd-sidebar{position:sticky;top:0;align-self:start;height:100vh;display:flex;flex-direction:column;background:#17241f;color:#f3f0e7;padding:29px 23px}.sd-back{font-size:10px;letter-spacing:.12em;color:#c2c5b9;margin-bottom:45px}.sd-logotype{font:36px/.95 Georgia,serif;letter-spacing:-.045em}.sd-logotype span{color:#c09c66}.sd-kicker{font-size:9px;letter-spacing:.18em;color:#acb0a4;margin:15px 0 40px}.sd-sidebar nav{display:grid;gap:4px}.sd-sidebar nav button{text-align:left;border:0;padding:13px 12px;color:#bac5be;font-size:12px;background:none;border-radius:5px;cursor:pointer}.sd-sidebar nav button.active,.sd-sidebar nav button:hover{background:#ffffff18;color:#fff}.sd-studio-link{color:#c5b494;margin-top:auto;font-size:12px}.sd-sidebar>small{color:#9eaaa1;line-height:1.7;font-size:10px;margin-top:30px}.sd-content{min-width:0}.sd-top{display:flex;justify-content:space-between;gap:18px;align-items:center;border-bottom:1px solid #ddd8ce;height:65px;padding:0 35px;background:#f8f6f0;font-size:10px;letter-spacing:.09em}.sd-save{font-size:10px;letter-spacing:0;color:#637567}.sd-page{padding:41px max(26px,4.5vw) 90px;max-width:1400px;margin:0 auto}.sd-head{margin-bottom:32px}.sd-head>small{font-size:10px;letter-spacing:.17em;color:#8e846e}.sd-head h1{font:normal clamp(37px,4.3vw,63px)/1.1 Georgia,serif;letter-spacing:-.04em;margin:14px 0 15px}.sd-head p{max-width:750px;color:#6b726c;line-height:1.7;font-size:13px}.sd-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:25px 0}.sd-metrics>div{border:1px solid #dcd7cc;background:#fffdf9;min-height:130px;padding:20px;display:flex;flex-direction:column;gap:11px}.sd-metrics small{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#7e877b}.sd-metrics strong{font:normal 36px Georgia,serif;color:#23332b}.sd-panel{border:1px solid #dcd8cd;background:#fffefa;padding:25px;margin:18px 0;min-width:0}.sd-panel h2{font:normal 27px Georgia,serif;letter-spacing:-.02em;margin:0 0 14px}.sd-panel h3{font:normal 21px Georgia,serif;margin:0 0 12px}.sd-panel p{color:#676e66;line-height:1.7;margin:14px 0}.sd-section-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:17px}.sd-section-title small{font-size:10px;color:#7b847a}.sd-section-title button{font-size:11px;border:0;background:transparent;text-decoration:underline}.sd-quote-row{display:flex;width:100%;align-items:center;justify-content:space-between;gap:25px;border:0;border-bottom:1px solid #e7e2d9;padding:18px 4px;background:none;text-align:left;cursor:pointer}.sd-quote-row>span{min-width:0}.sd-quote-row b{font-size:13px}.sd-quote-row small{display:block;font-size:10px;line-height:1.4;color:#7b8378;margin-top:6px}.sd-quote-row>strong{font:normal 24px Georgia,serif;white-space:nowrap}.sd-status-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:15px}.sd-status-grid>div{display:flex;flex-direction:column;gap:6px}.sd-status-grid b{font:normal 25px Georgia,serif}.sd-status-grid span{font-size:10px;line-height:1.5;color:#757e73}.sd-primary{background:#213d31!important;color:#fff!important;border:1px solid #213d31!important}.sd button:not(.sd-sidebar button){cursor:pointer}.sd-actions{display:flex;flex-wrap:wrap;gap:10px;margin:15px 0 22px}.sd-actions button,.sd-panel>button,.sd-note button,.sd-comm button,.sd-comm a,.sd-document button,.sd-upload{display:inline-flex;align-items:center;justify-content:center;padding:12px 17px;border:1px solid #d6d7cf;background:#f7f7f1;color:#29372d;font-size:11px;text-decoration:none}.sd-muted{color:#858b81!important;font-size:11px!important;line-height:1.6}.sd-search{width:100%;padding:16px;margin-bottom:13px;background:white;border:1px solid #dad6cb}.sd-table-scroll{overflow-x:auto;padding:0}.sd table{width:100%;border-collapse:collapse;font-size:12px;min-width:660px}.sd table th{font-size:10px;letter-spacing:.05em;color:#778176;text-align:left;padding:20px 16px;background:#faf8f2;white-space:nowrap}.sd table td{border-top:1px solid #e7e4db;padding:19px 16px;vertical-align:top;min-width:75px}.sd table tr{cursor:pointer}.sd table tbody tr:hover{background:#f3f5ef}.sd table td small{display:block;color:#868e85;font-size:10px;margin-top:7px}.sd-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.sd-field{display:flex;flex-direction:column;gap:8px;min-width:0}.sd-field.full{grid-column:1/-1}.sd-field span{font-size:11px;color:#69776b}.sd-field input,.sd-field select,.sd-field textarea,.sd-note textarea{background:#fff;border:1px solid #d9ddd4;border-radius:3px;min-width:0;padding:12px;font-size:13px;color:#24342b;width:100%;font-family:Arial,sans-serif}.sd-field textarea,.sd-note textarea{resize:vertical;line-height:1.5}.sd-checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sd-checklist label{display:flex;align-items:flex-start;gap:11px;background:#f7f8f4;padding:12px;line-height:1.5;font-size:12px}.sd-checklist input{accent-color:#284b37;margin-top:3px;flex-shrink:0}.sd-note>div{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 20px}.sd-log>div{display:grid;grid-template-columns:115px 1fr;gap:18px;border-top:1px solid #e8e5dc;padding:13px 0;line-height:1.7;font-size:11px}.sd-log time{color:#8a918a}.sd-log span{overflow-wrap:anywhere}.sd-log b{text-transform:uppercase;font-size:10px;margin-right:8px;color:#718171}.sd-comm{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 0;border-bottom:1px solid #eee9e1}.sd-comm small{display:block;color:#90998e;font-size:10px;margin-top:6px}.sd-comm span{display:flex;gap:8px;flex-wrap:wrap}.sd-comm a,.sd-comm button{padding:8px 11px}.sd-document{display:flex;align-items:center;gap:10px;border-top:1px solid #e3e7e0;padding:12px 0}.sd-document>span{flex:1;min-width:0;overflow-wrap:anywhere}.sd-document small{display:block;color:#92978f;margin-top:3px}.sd-document button{padding:8px}.sd-upload{margin:10px 0 15px;cursor:pointer;display:inline-block}.sd-upload input{display:block;max-width:300px;margin-top:7px}.sd-back-list{border:0;background:none;font-size:12px;color:#677b6b;padding:0 0 23px}
@media(max-width:960px){.sd{grid-template-columns:1fr}.sd-sidebar{position:relative;height:auto;padding:18px;gap:7px}.sd-back{margin:0}.sd-logotype{font-size:25px}.sd-kicker{margin:0 0 5px}.sd-sidebar nav{display:flex;overflow-x:auto;gap:3px;padding:9px 0}.sd-sidebar nav button{white-space:nowrap;font-size:11px;padding:10px}.sd-studio-link,.sd-sidebar>small{display:none}.sd-content{width:100%}.sd-top{padding:15px 20px;height:auto;flex-wrap:wrap}.sd-page{padding:28px 18px 80px}.sd-metrics{grid-template-columns:repeat(2,1fr)}.sd-status-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.sd-fields{grid-template-columns:1fr}.sd-checklist{grid-template-columns:1fr}.sd-panel{padding:18px}.sd-head h1{font-size:38px}.sd-comm{align-items:flex-start;flex-direction:column}.sd-document{flex-wrap:wrap}}
`;
