// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LEVELS, PROJECTS, CAPSTONE, SKILL_RUBRIC, LEVELS_OF, CRITICAL, ALL, README, SCHED, FEATURES, CONNECT } from "./curriculum";
import * as st from "./store";
import { S, env, STATUS, HOSTED, byId, sk, pj, cap, statusOf, levelDone, levelOpen, allDone, mastered, curLevel, commit, log, today } from "./store";

const TABS = [["home", "Dashboard"], ["path", "Learning Path"], ["lab", "Practice Lab"], ["projects", "Projects"], ["skills", "Skills"], ["evidence", "Evidence"], ["features", "Features"], ["connect", "Connect tools"], ["scheduler", "Scheduler"], ["readme", "Readme"], ["account", "Account"]];
const TONE = { ok: "bg-ok-soft text-ok border-ok/30", bad: "bg-bad-soft text-bad border-bad/30", warn: "bg-warn-soft text-warn border-warn/30", info: "bg-info-soft text-info border-info/30" };
const ST_TONE = ["bg-muted text-muted-foreground", "bg-info-soft text-info", "bg-warn-soft text-warn", "bg-accent text-accent-foreground", "bg-ok-soft text-ok"];
const ST_DOT = ["bg-border", "bg-info", "bg-warn", "bg-primary", "bg-ok"];

const Eyebrow = ({ children, className = "" }) => <p className={cn("font-mono text-[11px] uppercase tracking-[.08em] text-muted-foreground", className)}>{children}</p>;
const Note = ({ tone = "info", children, className = "" }) => <Alert className={cn("border py-2.5", TONE[tone], className)}><AlertDescription className="text-sm text-current [&_button]:ml-2">{children}</AlertDescription></Alert>;
const Pill = ({ tone, children }) => <Badge variant="outline" className={cn("whitespace-nowrap border-transparent font-mono text-[11px] font-medium", tone)}>{children}</Badge>;
const StatusPill = ({ id }) => <Pill tone={ST_TONE[statusOf(id)]}>{STATUS[statusOf(id)]}</Pill>;
const Quote = ({ children }) => <div className="whitespace-pre-wrap break-words rounded-md bg-muted px-3 py-2.5 font-mono text-[13px] leading-relaxed">{children}</div>;
const Head = ({ eyebrow, title, children }) => <div className="space-y-1"><Eyebrow>{eyebrow}</Eyebrow><h2 className="text-2xl font-bold">{title}</h2>{children}</div>;
const Rows = ({ rows }) => <div className="divide-y">{rows.map((x) => <div key={x[0]} className="grid gap-x-4 gap-y-1 py-2.5 text-sm sm:grid-cols-[200px_1fr]"><b>{x[0]}</b><span className="min-w-0">{x[1]}</span></div>)}</div>;
const Field = ({ id, label, children }) => <div className="grid gap-1.5"><Label htmlFor={id}>{label}</Label>{children}</div>;

function Checklist({ rkey }) {
  const a = st.target(rkey), cs = st.critsFor(rkey); a.ans = a.ans || {}; a.crit = a.crit || {};
  const yes = cs.filter((c, i) => a.ans[i] === true).length, isCap = rkey === "cap";
  const set = (i, v) => { a.ans[i] = v; commit(); };
  return <div className="space-y-4">
    <Eyebrow>{isCap ? "Check each step" : "Check Claude's answer"}</Eyebrow>
    <p className="text-sm text-muted-foreground">Answer each question honestly by looking at {isCap ? "what you wrote for that step" : "the reply you pasted above"}. This is a checklist for you, not a test you can fail forever: anything you answer No to tells you exactly what to fix, and you can try again.</p>
    <div className="divide-y rounded-lg border">{cs.map((c, i) => <div key={i} className="flex flex-wrap items-start justify-between gap-3 p-3">
      <div className="min-w-0 flex-1 basis-64 text-sm"><b>{isCap ? `${i + 1}. ${c[0]}` : c[2]}</b>{!isCap && <><br /><span className="text-[13px] text-muted-foreground">How to check: {c[3]}</span></>}{isCap && <><br /><span className="text-[13px] text-muted-foreground">Did you complete this step and record it above?</span></>}</div>
      <div className="flex gap-1.5" role="group" aria-label={c[0]}>{[[true, "Yes"], [false, "No"]].map(([v, l]) => <Button key={l} size="sm" variant={a.ans[i] === v ? "default" : "outline"} className={cn(a.ans[i] === v && v === false && "bg-bad text-white hover:bg-bad/90")} aria-pressed={a.ans[i] === v} onClick={() => set(i, v)}>{l}</Button>)}</div>
    </div>)}</div>
    {!isCap && <div className="space-y-2"><Eyebrow>Did any of these happen? (tick only if true)</Eyebrow>{CRITICAL.map((c, i) => <div key={i} className="flex items-start gap-2 text-sm"><Checkbox id={`cr-${rkey}-${i}`} checked={!!a.crit[i]} onCheckedChange={(v) => { a.crit[i] = !!v; commit(); }} className="mt-0.5" /><label htmlFor={`cr-${rkey}-${i}`}>{c}</label></div>)}</div>}
    <p className="text-[13px] text-muted-foreground"><b>To pass:</b> {st.passRule(rkey)} So far: {yes} Yes of {cs.length}.</p>
    <Button onClick={() => st.grade(rkey)}>Submit</Button>
  </div>;
}
function Result({ rkey, advice }) {
  const a = st.target(rkey), cs = st.critsFor(rkey); if (a.score == null) return null;
  if (a.ok) return <Note tone="ok"><b>Passed ({st.scoreText(a)}).</b> Your evidence is saved.</Note>;
  const no = cs.filter((c, i) => a.ans?.[i] === false).map((c) => c[0]), crit = Object.values(a.crit || {}).some(Boolean);
  return <Note tone="bad"><b>Not passed yet ({st.scoreText(a)}).</b> {a.msg} {crit && "You ticked something under \"Did any of these happen?\", which needs fixing first. "}{no.length > 0 && "Fix: " + no.join(", ") + ". "}{advice}</Note>;
}

function Home() {
  const m = ALL.filter((s) => statusOf(s.id) === 4).length, pp = PROJECTS.filter((p) => (S.projects[p.id] || {}).ok).length + (S.cap.ok ? 1 : 0);
  const pct = Math.round(((m + pp) / (ALL.length + 6)) * 100), g = ALL.filter((s) => S.skills[s.id]?.g.ok).length, c = ALL.filter((s) => S.skills[s.id]?.c.ok).length;
  const stats = [[m, "skills mastered"], [ALL.length - m, "skills pending"], [g, "guided exercises done"], [c, "challenges passed"], [pp + "/6", "projects passed"]];
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4"><Head eyebrow="Dashboard" title={mastered() ? "Claude Mastery Demonstrated" : `Level ${curLevel()}: ${LEVELS[curLevel() - 1].title}`} />
      <div className="w-full max-w-xs space-y-1.5"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Overall mastery</span><b className="tabular-nums">{pct}%</b></div><Progress value={pct} className="h-2" /></div></div>
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-5">{stats.map((x) => <div key={x[1]} className="bg-card px-4 py-3"><b className="block font-display text-[26px] leading-tight tabular-nums">{x[0]}</b><span className="text-[13px] text-muted-foreground">{x[1]}</span></div>)}</div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-lg">Levels</CardTitle></CardHeader><CardContent className="space-y-3">{LEVELS.map((l) => { const d = l.skills.filter((s) => statusOf(s[0]) === 4).length; return <div key={l.n} className="space-y-1.5"><div className="flex justify-between text-sm"><span><b style={{ color: `hsl(var(--l${l.n}))` }}>●</b> {l.n}. {l.title}</span><span className="text-[13px] text-muted-foreground">{levelDone(l.n) ? "Complete" : levelOpen(l.n) ? `${d}/${l.skills.length}` : "Locked"}</span></div><div className="h-2 overflow-hidden rounded bg-muted"><div className="h-full" style={{ width: `${(d / l.skills.length) * 100}%`, background: `hsl(var(--l${l.n}))` }} /></div></div>; })}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-lg">Recent activity</CardTitle></CardHeader><CardContent className="space-y-1.5 text-[13px]">{S.activity.length ? S.activity.slice(0, 8).map((a, i) => <div key={i}><span className="text-muted-foreground">{new Date(a.t).toLocaleDateString()}</span> {a.msg}</div>) : <p className="text-muted-foreground">Nothing yet. Your first attempt in the Practice Lab will appear here.</p>}</CardContent></Card>
    </div></>;
}

function Path({ open, go }) {
  return <><Head eyebrow="Learning path" title="Five levels, in order"><p className="text-muted-foreground">A level opens when every skill in the one before is Mastered and its project has passed.</p></Head>
    {LEVELS.map((l) => { const o = levelOpen(l.n), p = PROJECTS[l.n - 1], pok = (S.projects[p.id] || {}).ok; return <div key={l.n} className="grid grid-cols-[44px_1fr] items-start gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-full font-display text-lg font-bold text-[#1a0d05]" style={{ background: `hsl(var(--l${l.n}))` }}>{l.n}</div>
      <Card className={cn("min-w-0", !o && "opacity-60")}><CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0"><div><CardTitle className="text-lg">{l.title}</CardTitle><CardDescription>{l.goal}</CardDescription></div><Pill tone={levelDone(l.n) ? ST_TONE[4] : o ? ST_TONE[2] : ST_TONE[0]}>{levelDone(l.n) ? "Level complete" : o ? "Open" : "Locked"}</Pill></CardHeader>
        <CardContent><div className="divide-y border-t">{l.skills.map((s) => <div key={s[0]} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="min-w-0 flex-1 basis-52 text-sm"><b>{s[0]}</b> {s[1]}<br /><span className="text-[13px] text-muted-foreground">{s[2]}</span></span><span className="flex items-center gap-2"><StatusPill id={s[0]} /><Button variant="outline" size="sm" disabled={!o} onClick={() => open(s[0])}>{statusOf(s[0]) === 4 ? "Revisit" : "Practise"}</Button></span></div>)}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"><span><b>Project</b> {p.title}</span><span className="flex items-center gap-2"><Pill tone={pok ? ST_TONE[4] : ST_TONE[0]}>{pok ? "Passed" : "Not passed"}</Pill><Button variant="outline" size="sm" disabled={!o} onClick={() => go("projects")}>Open</Button></span></div></div>
          <Accordion type="single" collapsible><AccordionItem value="a" className="border-0"><AccordionTrigger className="py-2 text-[13px]">How this level is assessed</AccordionTrigger><AccordionContent className="space-y-1.5 text-[13px]"><p><b>Each skill:</b> learn it on a real use case and practise, take an independent challenge, then run your prompt in Claude and check the real answer with six yes/no questions.</p><p><b>The six questions:</b> {SKILL_RUBRIC.map((r) => r[0]).join(" · ")}</p><p><b>Required evidence:</b> {l.evidence}</p></AccordionContent></AccordionItem></Accordion>
        </CardContent></Card></div>; })}
    <div className="grid grid-cols-[44px_1fr] items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-lg text-background">★</div><Card className={cn(!allDone() && "opacity-60")}><CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0"><div><CardTitle className="text-lg">{CAPSTONE.title}</CardTitle><CardDescription>Opens when all five levels are complete.</CardDescription></div><Pill tone={S.cap.ok ? ST_TONE[4] : ST_TONE[0]}>{S.cap.ok ? "Passed" : allDone() ? "Open" : "Locked"}</Pill></CardHeader></Card></div></>;
}

function Lab({ skill, stage, setStage, open }) {
  const s = byId(skill) || ALL[0], k = sk(s.id), o = levelOpen(s.level);
  const [res, setRes] = useState(null), [hint, setHint] = useState(false), [sol, setSol] = useState(false), [liveOut, setLiveOut] = useState(null), [busy, setBusy] = useState(""), [copied, setCopied] = useState("");
  useEffect(() => { setRes(null); setHint(false); setSol(false); setLiveOut(null); setCopied(""); }, [skill, stage]);
  const g = stage === "learn", d = g ? k.g : k.c;
  const done = { learn: k.g.ok, challenge: k.c.ok, assess: k.a.ok };
  const text = d.text || (g && !d.touched ? s.starter : d.text);
  const changed = st.runChecks(s.strong, s.gc, 0).filter((r, i) => i < s.gc.length && r.pass).map((r) => r.label);
  const check = () => { const t = text; d.text = t; const r = st.runChecks(t, g ? s.gc : s.cc, g ? 15 : 30);
    if (g && t.trim() === s.starter) r.push({ label: "Changed from the starter", pass: false, fix: "Rewrite the starter prompt." });
    r.push(st.ownWords(t, g ? s.strong : s.sol, g ? "the example above" : "the model answer"));
    const pass = r.every((x) => x.pass); d.n++; if (pass) d.ok = true; k.demo = true; k.last = today(); k.hist.unshift({ d: today(), what: (g ? "Practice" : "Challenge") + " attempt " + d.n, ok: pass }); k.hist = k.hist.slice(0, 30);
    log(`${s.id} ${s.name}: ${g ? "practice" : "challenge"} ${pass ? "passed" : "attempted"}`); setRes(r); commit(); };
  const runLive = async (into) => { const q = into ? k.c.text : text; if (!q.trim()) return; setBusy("live"); try { const out = await st.live(q); if (into) { k.a.ev = out; commit(); } else setLiveOut({ ok: true, t: out }); } catch (e) { setLiveOut({ ok: false, t: e.message || "Live run unavailable. Try again later." }); } setBusy(""); };
  const copy = async (t) => { try { await navigator.clipboard.writeText(t); setCopied("Copied. Now paste it into Claude."); } catch (e) { setCopied("Select the prompt above and copy it with your keyboard."); } };
  const checks = () => res && <><div><Eyebrow>Checks</Eyebrow><div className="divide-y">{res.map((r, i) => <div key={i} className="flex gap-3 py-1.5 text-sm"><b className={cn("w-10 shrink-0 font-mono text-xs leading-5", r.pass ? "text-ok" : "text-bad")}>{r.pass ? "PASS" : "FAIL"}</b><span>{r.label}{!r.pass && <><br /><span className="text-[13px] text-muted-foreground">{r.fix}</span></>}</span></div>)}</div></div>
    {res.every((r) => r.pass) ? <Note tone="ok">{g ? "Practice passed. Next: try the same skill on your own, without a starter." : "Challenge passed. Next: run it in Claude and check the real answer."}<Button size="sm" variant="outline" onClick={() => setStage(g ? "challenge" : "assess")}>Continue</Button></Note> : <Note tone="bad">Not yet. Fix the failed checks and try again.</Note>}</>;
  const editor = (label) => <Field id="ed" label={label}><Textarea id="ed" spellCheck={false} className="min-h-[160px] font-mono text-[13px]" value={text} onChange={(e) => { d.text = e.target.value; d.touched = true; commit(); }} /></Field>;
  let body;
  if (!o) body = <Note tone="warn">This skill is locked. Finish Level {s.level - 1} first.</Note>;
  else if (stage === "learn") body = <>
    <p className="text-[15px]"><b>The skill:</b> {s.obj}</p>
    <div className="rounded-lg border bg-muted/40 p-4"><Eyebrow>Use case</Eyebrow><p className="mt-1 font-medium">{s.scene}</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-lg border border-bad/30 p-3"><p className="text-sm font-semibold text-bad">✗ Weak prompt</p><Quote>{s.weak}</Quote><p className="text-sm"><b>What you typically get:</b> {s.weakGet}</p></div>
      <div className="space-y-2 rounded-lg border border-ok/30 p-3"><p className="text-sm font-semibold text-ok">✓ Better prompt</p><Quote>{s.strong}</Quote><p className="text-sm"><b>What you get:</b> {s.strongGet}</p></div></div>
    <div className="space-y-1.5"><Eyebrow>What changed</Eyebrow><div className="flex flex-wrap gap-2">{changed.map((c) => <Pill key={c} tone={ST_TONE[4]}>✓ {c}</Pill>)}</div><p className="text-sm text-muted-foreground">{s.why}</p></div>
    <Separator />
    <div className="space-y-3"><h3 className="text-lg font-bold">Your turn</h3><p className="text-sm"><b>New case, same skill:</b> {s.gtask}</p><p className="text-[13px] text-muted-foreground">The starter prompt below is weak on purpose. Rewrite it using what changed above. The checks look for those parts; they don't run Claude.</p>
      {editor("Your prompt")}
      <div className="flex flex-wrap items-center gap-2"><Button onClick={check}>Check my prompt</Button><Button variant="outline" onClick={() => setHint(!hint)}>Hint</Button><span className="text-[13px] text-muted-foreground">Attempts: {d.n}</span></div>
      {hint && <Note><b>Hint:</b> {s.hint}</Note>}{checks()}</div></>;
  else if (stage === "challenge") body = !k.g.ok ? <Note tone="warn">Pass the practice in step 1 first.</Note> : <>
    <p className="text-sm text-muted-foreground">Now the same skill on a harder case, with no starter. Write the whole prompt yourself.</p>
    <div className="rounded-lg border bg-muted/40 p-4"><Eyebrow>Challenge</Eyebrow><p className="mt-1 font-medium">{s.ctask}</p></div>
    {editor("Your prompt")}
    <div className="flex flex-wrap items-center gap-2"><Button onClick={check}>Check my prompt</Button><Button variant="outline" onClick={() => setHint(!hint)}>Hint</Button><Button variant="outline" onClick={() => setSol(!sol)}>{sol ? "Hide model answer" : "Show model answer"}</Button>{env.canLive && <Button variant="outline" disabled={busy === "live"} onClick={() => runLive(false)}>{busy === "live" ? "Running…" : "Try it in Claude (live)"}</Button>}<span className="text-[13px] text-muted-foreground">Attempts: {d.n}</span></div>
    {hint && <Note><b>Hint:</b> {s.hint}</Note>}
    {sol && <div className="space-y-1.5"><Eyebrow>One possible answer</Eyebrow><Quote>{s.sol}</Quote><p className="text-[13px] text-muted-foreground">Use it to compare, not to copy: a prompt that mostly repeats it fails the "own words" check.</p></div>}
    {checks()}
    {liveOut && (liveOut.ok ? <div className="space-y-1.5"><Pill tone={TONE.ok}>Live Claude response</Pill><Quote>{liveOut.t}</Quote></div> : <Note tone="bad">{liveOut.t}</Note>)}</>;
  else body = !k.c.ok ? <Note tone="warn">Pass the challenge in step 2 first.</Note> : <>
    <p className="text-sm text-muted-foreground">The checks so far only looked at your prompt. Now see what Claude actually does with it, and judge the answer.</p>
    <div className="space-y-3 rounded-lg border p-4"><Eyebrow>Step A: get Claude's real answer</Eyebrow>
      <div className="space-y-1.5"><p className="text-sm font-medium">Your challenge prompt</p><Quote>{k.c.text}</Quote></div>
      <ol className="list-decimal space-y-1 pl-5 text-sm"><li><Button size="sm" variant="outline" onClick={() => copy(k.c.text)}>Copy prompt</Button> {copied && <span className="text-[13px] text-muted-foreground">{copied}</span>}</li>
        <li>Open <a href="https://claude.ai/new" target="_blank" rel="noreferrer" className="text-info underline underline-offset-2">claude.ai</a> in a new tab, paste the prompt and send it. Replace any [placeholders] with real details from your own work first.</li>
        <li>Copy Claude's whole reply and paste it in the box below.</li></ol>
      {env.canLive && <p className="text-sm">Or skip the copying: <Button size="sm" variant="outline" disabled={busy === "live"} onClick={() => runLive(true)}>{busy === "live" ? "Running…" : "Run it here and fill the box"}</Button></p>}
      {liveOut && !liveOut.ok && <Note tone="bad">{liveOut.t}</Note>}
      <Field id="ev-s" label="Claude's reply"><Textarea id="ev-s" className="min-h-[140px]" value={k.a.ev} onChange={(e) => { k.a.ev = e.target.value; commit(); }} placeholder="Paste Claude's reply here" /></Field></div>
    <div className="rounded-lg border p-4"><Checklist rkey={"s:" + s.id} /></div>
    <Result rkey={"s:" + s.id} advice="Go back to step 2, improve the prompt for those points, run it again and resubmit." /></>;
  return <><Head eyebrow="Practice lab" title={`${s.id} ${s.name}`}><div className="flex items-center gap-2 pt-1"><StatusPill id={s.id} /><span className="text-[13px] text-muted-foreground">Level {s.level}</span></div></Head>
    <div className="grid gap-4 md:grid-cols-[250px_1fr]">
      <Card className="min-w-0"><ScrollArea className="md:h-[70vh]"><div className="p-2">{LEVELS.map((l) => <div key={l.n}><Eyebrow className="px-2 pb-1 pt-2">Level {l.n}{levelOpen(l.n) ? "" : " · locked"}</Eyebrow>{l.skills.map((x) => <button key={x[0]} disabled={!levelOpen(l.n)} onClick={() => open(x[0])} className={cn("flex w-full items-start justify-between gap-2 rounded px-2 py-1.5 text-left text-[13px] disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring", x[0] === s.id && "bg-muted font-medium")}><span>{x[0]} {x[1]}</span><i className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", ST_DOT[statusOf(x[0])])} /></button>)}</div>)}</div></ScrollArea></Card>
      <div className="min-w-0 space-y-4">
        <Card><CardContent className="space-y-4 pt-4"><Tabs value={stage} onValueChange={setStage}><TabsList className="h-auto flex-wrap justify-start">{[["learn", "1 Learn & practise"], ["challenge", "2 Challenge"], ["assess", "3 Check in Claude"]].map((t) => <TabsTrigger key={t[0]} value={t[0]}>{t[1]}{done[t[0]] && <b className="ml-1.5 text-ok">✓</b>}</TabsTrigger>)}</TabsList></Tabs>
          <p className="text-[13px] text-muted-foreground">{{ learn: "See the skill in a real situation, then use it on a new case.", challenge: "Use the skill on your own, on a harder case.", assess: "Run your prompt in Claude and check the real answer." }[stage]}</p>{body}</CardContent></Card>
        {o && <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Attempt history</CardTitle></CardHeader><CardContent className="space-y-1 text-[13px]">{k.hist.length ? k.hist.slice(0, 8).map((h, i) => <div key={i}><span className="text-muted-foreground">{h.d}</span> {h.what} <b className={h.ok ? "text-ok" : "text-bad"}>{h.ok ? "pass" : "fail"}</b></div>) : <p className="text-muted-foreground">No attempts yet.</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-lg">Your notes</CardTitle></CardHeader><CardContent><Field id="notes" label="What worked, what you would change"><Textarea id="notes" value={k.notes} onChange={(e) => { k.notes = e.target.value; commit(); }} /></Field></CardContent></Card></div>}
      </div></div></>;
}

function Projects({ open }) {
  const c = cap(), capOpen = allDone();
  const gaps = [...new Set(CAPSTONE.steps.flatMap((s, i) => (c.ans?.[i] === false ? s[2] : [])))];
  const Ticks = ({ p, kind, title }) => { const d = pj(p.id); return <div className="space-y-2"><Eyebrow>{title}</Eyebrow>{p[kind].map((x, i) => <div key={i} className="flex items-start gap-2 text-sm"><Checkbox id={p.id + kind + i} className="mt-0.5" checked={!!d[kind][i]} onCheckedChange={(v) => { d[kind][i] = !!v; commit(); }} /><label htmlFor={p.id + kind + i}>{x}</label></div>)}</div>; };
  return <><Head eyebrow="Real-world projects" title="Build things worth showing"><p className="text-muted-foreground">One project per level, then the capstone. A project passes on a completed checklist, run test cases, evidence, and Yes to at least 5 of the 6 check questions.</p></Head>
    <Accordion type="multiple" defaultValue={["P" + curLevel()]} className="space-y-3">{PROJECTS.map((p) => { const d = pj(p.id), o = levelOpen(p.level); return <AccordionItem key={p.id} value={p.id} disabled={!o} className="rounded-lg border bg-card px-4">
      <AccordionTrigger className="hover:no-underline"><span className="flex flex-wrap items-center gap-3 text-left"><b className="font-display text-[17px]">Level {p.level} · {p.title}</b><Pill tone={d.ok ? ST_TONE[4] : ST_TONE[0]}>{!o ? "Locked" : d.ok ? "Passed" : "Not passed"}</Pill></span></AccordionTrigger>
      <AccordionContent className="space-y-4 text-[15px]"><p>{p.problem}</p>
        <div className="grid gap-4 md:grid-cols-2"><div><Eyebrow>Deliverables</Eyebrow><ul className="list-disc pl-5 text-sm">{p.deliver.map((x) => <li key={x}>{x}</li>)}</ul></div><div><Eyebrow>Requirements and constraints</Eyebrow><ul className="list-disc pl-5 text-sm">{p.req.map((x) => <li key={x}>{x}</li>)}</ul></div></div>
        <div className="grid gap-4 md:grid-cols-2"><Ticks p={p} kind="check" title="Completion checklist" /><Ticks p={p} kind="tests" title="Test cases (tick only after you ran them)" /></div>
        <Field id={"ev-" + p.id} label="Evidence: links, file names, test log, results"><Textarea id={"ev-" + p.id} value={d.ev} onChange={(e) => { d.ev = e.target.value; commit(); }} /></Field>
        <Checklist rkey={"p:" + p.id} /><Result rkey={"p:" + p.id} advice="Fix the weak areas in the project itself, re-test, then resubmit." /></AccordionContent></AccordionItem>; })}</Accordion>
    <Card className={cn(!capOpen && "opacity-60")}><CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0"><CardTitle className="text-lg">{CAPSTONE.title}</CardTitle><Pill tone={c.ok ? ST_TONE[4] : ST_TONE[0]}>{c.ok ? "Passed" : capOpen ? "Not passed" : "Locked"}</Pill></CardHeader>
      <CardContent className="space-y-4">{!capOpen ? <p className="text-muted-foreground">Opens when all five levels are complete: every skill Mastered and every level project passed.</p> : <><p>{CAPSTONE.problem}</p><p className="text-[13px] text-muted-foreground">No solution is provided. Record what you did for each step.</p>
        {CAPSTONE.steps.map((s, i) => <Field key={i} id={"cap" + i} label={`${i + 1}. ${s[0]}`}><Textarea id={"cap" + i} value={c.steps[i] || ""} onChange={(e) => { c.steps[i] = e.target.value; commit(); }} /></Field>)}
        <Checklist rkey="cap" /><Result rkey="cap" advice={c.ok ? "" : "Practise only the modules below, then resubmit."} />
        {c.score != null && !c.ok && gaps.length > 0 && <div className="space-y-1"><Eyebrow>Skill gaps to practise</Eyebrow><div className="divide-y">{gaps.map((id) => <div key={id} className="flex items-center justify-between gap-2 py-1.5 text-sm"><span>{id} {byId(id).name}</span><Button size="sm" variant="outline" onClick={() => open(id)}>Practise</Button></div>)}</div></div>}</>}</CardContent></Card></>;
}

function Skills({ open }) {
  const [f, setF] = useState("all");
  const nextFor = (id) => ["Start with the demo", "Finish the guided exercise", "Take the independent challenge", "Submit the assessment with evidence", "Revisit to stay sharp"][statusOf(id)];
  const rows = ALL.filter((s) => f === "all" || String(statusOf(s.id)) === f);
  return <><div className="flex flex-wrap items-end justify-between gap-3"><Head eyebrow="Skills tracker" title={`${ALL.length} skills, tracked one by one`} /><div className="w-52"><Field id="filt" label="Filter by status"><Select value={f} onValueChange={setF}><SelectTrigger id="filt"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{STATUS.map((x, i) => <SelectItem key={x} value={String(i)}>{x}</SelectItem>)}</SelectContent></Select></Field></div></div>
    <Card><CardContent className="pt-4">{rows.length ? <Table className="min-w-[760px]"><TableHeader><TableRow>{["Skill", "Status", "Attempts", "Latest assessment", "Evidence", "Last practised", "Next action", ""].map((h) => <TableHead key={h} className="font-mono text-[11px] uppercase tracking-wider">{h}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{rows.map((s) => { const k = S.skills[s.id]; return <TableRow key={s.id}><TableCell><b>{s.id}</b> {s.name}</TableCell><TableCell><StatusPill id={s.id} /></TableCell><TableCell className="tabular-nums">{k ? k.g.n + k.c.n + k.a.n : 0}</TableCell><TableCell className="tabular-nums">{k && k.a.score != null ? `${st.scoreText(k.a)} ${k.a.ok ? "pass" : "fail"}` : "–"}</TableCell><TableCell className="max-w-[180px] text-[13px]">{k?.a.ev ? k.a.ev.slice(0, 60) + (k.a.ev.length > 60 ? "…" : "") : "–"}</TableCell><TableCell className="tabular-nums">{k?.last || "–"}</TableCell><TableCell className="text-[13px]">{nextFor(s.id)}</TableCell><TableCell><Button size="sm" variant="outline" disabled={!levelOpen(s.level)} onClick={() => open(s.id)}>Open</Button></TableCell></TableRow>; })}</TableBody></Table> : <p className="text-muted-foreground">No skills have this status yet.</p>}</CardContent></Card></>;
}

function Evidence() {
  const [edit, setEdit] = useState(null), [io, setIo] = useState(""), [msg, setMsg] = useState(null), [err, setErr] = useState(""), [conf, setConf] = useState("3");
  const form = useRef(null), ioRef = useRef(null), fileRef = useRef(null);
  const e = edit != null ? S.journal.find((j) => j.id === edit) || {} : {};
  useEffect(() => { setConf(String(e.conf || 3)); }, [edit]);
  const m = ALL.filter((s) => statusOf(s.id) === 4);
  const saveJ = (ev) => { ev.preventDefault(); const fd = new FormData(form.current), v = (x) => String(fd.get(x) || "").trim(); if (!v("learned") || !v("how")) return setErr("Fill in what you learned and how you practised it.");
    const rec = { learned: v("learned"), why: v("why"), how: v("how"), evidence: v("evidence"), conf: +conf, unclear: v("unclear"), next: v("next") };
    if (edit != null) { Object.assign(S.journal.find((j) => j.id === edit), rec); setEdit(null); } else { S.journal.unshift({ id: Date.now(), date: today(), ...rec }); log("Learning session logged: " + rec.learned); form.current.reset(); }
    setErr(""); commit(); };
  const doImport = async () => { const f = fileRef.current?.files[0]; const txt = f ? await f.text() : ioRef.current.value; if (st.importText(txt)) { setIo(""); setMsg(null); } else setMsg(["bad", "That is not a valid export from this workspace. Paste the full exported text."]); };
  const copy = async () => { try { await navigator.clipboard.writeText(ioRef.current.value); setMsg(["ok", "Copied."]); } catch (x) { ioRef.current.select(); setMsg(["info", "Text selected. Copy it with your keyboard."]); } };
  const F = ({ n, l, area }) => <Field id={"j-" + n} label={l}>{area ? <Textarea id={"j-" + n} name={n} defaultValue={e[n] || ""} /> : <Input id={"j-" + n} name={n} defaultValue={e[n] || ""} />}</Field>;
  return <><Head eyebrow="Progress and evidence" title="Your record of work" />
    {mastered() ? <div className="space-y-2 rounded-lg border-2 border-ok bg-ok-soft p-5"><h2 className="text-2xl font-bold">Claude Mastery Demonstrated</h2><p>Supported by {m.length} passed skill assessments, 5 level projects and the capstone ({st.scoreText(S.cap)}).</p></div>
      : <Note>Mastery status is awarded only when all {ALL.length} skills are Mastered, all 5 projects have passed and the capstone has passed. Currently: {m.length}/{ALL.length} skills, {PROJECTS.filter((p) => (S.projects[p.id] || {}).ok).length}/5 projects, capstone {S.cap.ok ? "passed" : "not passed"}.</Note>}
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-lg">{edit != null ? "Edit session" : "Log a learning session"}</CardTitle></CardHeader><CardContent><form ref={form} key={edit ?? "new"} onSubmit={saveJ} className="space-y-3">
        <F n="learned" l="What I learned" /><F n="why" l="Why it matters" /><F n="how" l="How I practised it" /><F n="evidence" l="Result or evidence" area />
        <Field id="j-conf" label="Confidence (1 to 5)"><Select value={conf} onValueChange={setConf}><SelectTrigger id="j-conf"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select></Field>
        <F n="unclear" l="What remains unclear" /><F n="next" l="Next action" />
        <p className="text-[13px] text-muted-foreground">Confidence is recorded for your own reflection. It never changes a skill's status.</p>{err && <Note tone="bad">{err}</Note>}
        <div className="flex gap-2"><Button type="submit">{edit != null ? "Save changes" : "Save session"}</Button>{edit != null && <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>}</div></form></CardContent></Card>
      <div className="min-w-0 space-y-4">
        <Card><CardHeader><CardTitle className="text-lg">Sessions</CardTitle></CardHeader><CardContent className="divide-y">{S.journal.length ? S.journal.map((j) => <div key={j.id} className="space-y-1 py-2.5"><div className="flex flex-wrap items-center justify-between gap-2"><b>{j.learned}</b><span className="flex items-center gap-2"><span className="text-[13px] text-muted-foreground">{j.date} · confidence {j.conf}/5</span><Button size="sm" variant="outline" onClick={() => setEdit(j.id)}>Edit</Button><Button size="sm" variant="outline" onClick={() => { S.journal = S.journal.filter((x) => x.id !== j.id); commit(); }}>Delete</Button></span></div><p className="text-[13px]">{j.how}{j.evidence ? " · " + j.evidence : ""}</p>{j.next && <p className="text-[13px] text-muted-foreground">Next: {j.next}</p>}</div>) : <p className="text-muted-foreground">No sessions logged yet. Use the form after each practice session.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Assessment evidence</CardTitle></CardHeader><CardContent className="space-y-2 text-[13px]">{m.length ? m.map((s) => <div key={s.id}><b>{s.id} {s.name}</b> · {st.scoreText(S.skills[s.id].a)}<br /><span className="text-muted-foreground">{S.skills[s.id].a.ev.slice(0, 140)}</span></div>) : <p className="text-muted-foreground">Evidence from passed assessments will be listed here.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Backup</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={async () => { setMsg(null); if (!(await st.exportFile())) setIo("export"); }}>Export records</Button><Button variant="outline" onClick={() => { setMsg(null); setIo("import"); }}>Import records</Button><Button variant="outline" onClick={() => st.loadSample()}>Load sample data</Button><Button variant="outline" onClick={() => setIo("reset")}>Reset all progress</Button></div>
          {(io === "export" || io === "import") && <><Field id="io" label={io === "export" ? "Your records (copy and keep this text)" : "Paste exported records, or choose a file"}><Textarea id="io" ref={ioRef} key={io} className="min-h-[140px] font-mono text-[13px]" defaultValue={io === "export" ? JSON.stringify(S) : ""} /></Field>{io === "import" ? <div className="flex flex-wrap items-center gap-2"><Input type="file" ref={fileRef} accept=".json,application/json" className="max-w-xs" aria-label="Records file" /><Button onClick={doImport}>Import</Button></div> : <Button variant="outline" onClick={copy}>Copy</Button>}{msg && <Note tone={msg[0]}>{msg[1]}</Note>}</>}
          {io === "reset" && <Note tone="bad">This deletes all progress and evidence.<Button size="sm" variant="outline" onClick={() => { st.resetAll(); setIo(""); }}>Yes, delete everything</Button><Button size="sm" variant="outline" onClick={() => setIo("")}>Cancel</Button></Note>}</CardContent></Card>
      </div></div></>;
}

function Scheduler({ open }) {
  return <><Head eyebrow="Explainer" title="Claude scheduled tasks"><p className="max-w-[68ch] pt-1">{SCHED.what}</p></Head>
    <Card><CardHeader><CardTitle className="text-lg">The basics</CardTitle></CardHeader><CardContent><Rows rows={SCHED.facts} /></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Create one</CardTitle></CardHeader><CardContent className="space-y-3"><ol className="list-decimal space-y-1.5 pl-5 text-sm">{SCHED.create.map((x) => <li key={x[0]}><b>{x[0]}.</b> {x[1]}</li>)}</ol><p className="text-[13px] text-muted-foreground">Menu names can differ slightly between the web, desktop and mobile apps.</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-lg">Manage it</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{SCHED.manage}</p><h3 className="text-[17px] font-bold">Good first tasks</h3><ul className="list-disc pl-5">{SCHED.ideas.map((x) => <li key={x}>{x}</li>)}</ul></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="text-lg">Writing the instructions</CardTitle><CardDescription>A scheduled prompt has no one to ask, so it needs more than a chat prompt.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Eyebrow>Weak</Eyebrow><Quote>{SCHED.weak}</Quote></div><div className="space-y-1.5"><Eyebrow>Stronger</Eyebrow><Quote>{SCHED.strong}</Quote></div></div><p><b>Why it works:</b> it fixes the time window, the output, the empty case and what Claude must not touch.</p></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-lg">Six rules for safe scheduling</CardTitle></CardHeader><CardContent><Rows rows={SCHED.rules} /></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-lg">Where this fits in your learning</CardTitle><CardDescription>Scheduling is automation, so it belongs with Level 3 (workflows) and Level 5 (automate and oversee). Build the workflow by hand first, then schedule it.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="divide-y border-y">{SCHED.skills.map((id) => { const s = byId(id), o = levelOpen(s.level); return <div key={id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"><span><b>{id}</b> {s.name}</span><span className="flex items-center gap-2"><StatusPill id={id} /><Button size="sm" variant="outline" disabled={!o} onClick={() => open(id)}>{o ? "Practise" : "Locked"}</Button></span></div>; })}</div>
      <p className="text-[13px] text-muted-foreground">Source: Anthropic's help article "Schedule recurring tasks in Claude Cowork", read on 11 October 2026. Features and plan availability change; check the Claude Help Center for the current details. This page explains the feature; it does not create scheduled tasks.</p></CardContent></Card></>;
}

function Connect({ open }) {
  const C = CONNECT, o = levelOpen(3);
  return <><Head eyebrow="Guides" title="Connect Claude to your tools"><p className="max-w-[68ch] pt-1 text-muted-foreground">How to give Claude access to the apps you already use, what it can then do, and what to watch. Checked against official pages on {C.checked}; menus change, so follow the source link if your screen looks different.</p></Head>
    <Card><CardHeader><CardTitle className="text-lg">How connecting works</CardTitle></CardHeader><CardContent><Rows rows={C.basics} /></CardContent></Card>
    <Accordion type="multiple" defaultValue={[C.tools[0].name]} className="space-y-3">{C.tools.map((t) => <AccordionItem key={t.name} value={t.name} className="rounded-lg border bg-card px-4">
      <AccordionTrigger className="text-left hover:no-underline"><span className="font-display text-[17px] font-bold">{t.name}</span></AccordionTrigger>
      <AccordionContent className="space-y-4 text-[15px]">
        <p><b>Who can use it:</b> {t.who}</p>
        <div className="grid gap-4 md:grid-cols-2"><div><Eyebrow>What Claude can do</Eyebrow><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{t.can.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><Eyebrow>Set it up</Eyebrow><ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">{t.steps.map((x) => <li key={x} className="break-words">{x}</li>)}</ol></div></div>
        <Note tone="warn"><b>Approval and safety:</b> {t.approval}</Note>
        <p className="text-sm"><b>Limits:</b> {t.limits}</p>
        <div className="space-y-1.5"><Eyebrow>Try it (example request)</Eyebrow><Quote>{t.practice}</Quote></div>
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex flex-wrap gap-x-4 gap-y-1 text-sm">{t.src.map((s) => <a key={s[1]} href={s[1]} target="_blank" rel="noreferrer" className="text-info underline underline-offset-2">{s[0]}</a>)}</span>
          <Button size="sm" variant="outline" disabled={!o} onClick={() => open(t.name.startsWith("Telegram") ? "3.9" : "3.8")}>{o ? `Practise ${t.name.startsWith("Telegram") ? "3.9" : "3.8"}` : "Unlocks at Level 3"}</Button></div>
      </AccordionContent></AccordionItem>)}</Accordion>
    <Card><CardHeader><CardTitle className="text-lg">General sources</CardTitle><CardDescription>Checked on {C.checked}. Each tool lists its own source above. The example requests are written for this workspace, not quoted from Anthropic.</CardDescription></CardHeader><CardContent><ul className="list-disc space-y-1 pl-5 text-sm">{C.sources.map((s) => <li key={s[1]}><a href={s[1]} target="_blank" rel="noreferrer" className="text-info underline underline-offset-2">{s[0]}</a></li>)}</ul></CardContent></Card></>;
}

function Features({ open, go }) {
  const F = FEATURES, A = ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-info underline underline-offset-2">{children}</a>;
  const Try = ({ id }) => { const s = byId(id), o = levelOpen(s.level); return <Button size="sm" variant="outline" disabled={!o} onClick={() => open(id)}>{o ? `Practise ${id}` : `${id} locked`}</Button>; };
  return <><Head eyebrow="Reference" title="Claude's models and features"><p className="max-w-[68ch] pt-1 text-muted-foreground">What each part of Claude does, how to start it and who has it. Every fact comes from Anthropic's own pages, checked on {F.checked}. Features change often, so follow the source link when something looks different in your app.</p></Head>
    <Card><CardHeader><CardTitle className="text-lg">Latest models</CardTitle></CardHeader><CardContent className="space-y-3"><div className="overflow-x-auto"><Table className="min-w-[640px]"><TableHeader><TableRow>{["Model", "Built for", "Speed", "API price / M tokens", "API name"].map((x) => <TableHead key={x} className="font-mono text-[11px] uppercase tracking-wider">{x}</TableHead>)}</TableRow></TableHeader><TableBody>{F.models.map((m) => <TableRow key={m[0]}><TableCell className="font-semibold">{m[0]}</TableCell><TableCell className="text-sm">{m[1]}</TableCell><TableCell>{m[2]}</TableCell><TableCell className="tabular-nums">{m[3]}</TableCell><TableCell className="font-mono text-xs">{m[4]}</TableCell></TableRow>)}</TableBody></Table></div>
      <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">{F.modelNotes.map((x) => <li key={x}>{x}</li>)}</ul>
      <Separator /><h3 className="text-[17px] font-bold">Model, effort and thinking</h3><Rows rows={F.settings} /><div><Try id="1.8" /></div></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">{F.tools.map((t) => <Card key={t.name} className="flex flex-col"><CardHeader className="pb-3"><CardTitle className="text-lg">{t.name}</CardTitle><CardDescription className="text-foreground">{t.what}</CardDescription></CardHeader><CardContent className="flex flex-1 flex-col gap-2 text-sm">
      <p><b>How to start:</b> {t.start}</p><p><b>Who has it:</b> {t.who}</p><p><b>Limits:</b> {t.limits}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2"><A href={t.src}>Source</A><Try id={t.skill} /></div></CardContent></Card>)}
      <Card className="flex flex-col"><CardHeader className="pb-3"><CardTitle className="text-lg">Scheduled tasks</CardTitle><CardDescription className="text-foreground">Work Claude runs for you on a schedule.</CardDescription></CardHeader><CardContent className="mt-auto"><p className="pb-3 text-sm">Explained on its own page, with six rules for scheduling safely.</p><Button size="sm" variant="outline" onClick={() => go("scheduler")}>Open Scheduler</Button></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="text-lg">Goal guide</CardTitle><CardDescription>The example requests are illustrations written for this workspace, not quotes from Anthropic.</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><Table className="min-w-[680px]"><TableHeader><TableRow>{["I want to", "How", "Example request", ""].map((x) => <TableHead key={x} className="font-mono text-[11px] uppercase tracking-wider">{x}</TableHead>)}</TableRow></TableHeader><TableBody>{F.goals.map((g) => <TableRow key={g[0]}><TableCell className="font-semibold">{g[0]}</TableCell><TableCell className="text-sm">{g[1]}</TableCell><TableCell className="font-mono text-[12px]">{g[2]}</TableCell><TableCell><Try id={g[3]} /></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-lg">Sources</CardTitle><CardDescription>Checked on {F.checked}. Feature sources are linked on each card above.</CardDescription></CardHeader><CardContent><ul className="list-disc space-y-1 pl-5 text-sm">{F.sources.map((s) => <li key={s[1]}><A href={s[1]}>{s[0]}</A></li>)}</ul></CardContent></Card></>;
}

function Readme({ go }) {
  return <><Head eyebrow="Readme" title="How this workspace works"><p className="max-w-[65ch] text-muted-foreground">Each skill moves through four stages, and only the last one counts as mastery. The sections below explain every tab.</p></Head>
    <Card><CardHeader><CardTitle className="text-lg">Always on screen</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><b>Next action strip.</b> The orange strip under the tabs names the single next thing to do and takes you there with Go.</p><p><b>Save indicator.</b> Top right. "Saved to your account" means progress follows you across devices; "Saved in this browser" means it lives only in this browser, so export a backup now and then.</p><p><b>Simulated versus live.</b> Yellow labels mark checks that read your prompt without running Claude. A green Live label marks a real Claude response.</p></CardContent></Card>
    {README.map((r) => <Card key={r[0]}><CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0"><div><CardTitle className="text-lg">{r[1]}</CardTitle><CardDescription>{r[2]}</CardDescription></div><Button size="sm" variant="outline" onClick={() => go(r[0])}>Open {r[1]}</Button></CardHeader><CardContent><Rows rows={r[3]} /></CardContent></Card>)}
    <Card><CardHeader><CardTitle className="text-lg">Mastery rules in one place</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>Practice passed = practising. Challenge passed = can apply it. Claude check passed = Mastered. A level is complete when all its skills are Mastered and its project has passed.</p><p>The Claude check uses six yes/no questions: {SKILL_RUBRIC.map((r) => r[0]).join(", ")}. {st.passRule("s:x")}</p></CardContent></Card></>;
}

function Account() {
  const [key, setKey] = useState(""), [msg, setMsg] = useState("");
  if (HOSTED) return <><Head eyebrow="Account" title="Your account and Claude API key" />
    <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Signed in</CardTitle></CardHeader><CardContent className="space-y-3"><p><b>{env.me?.name}</b></p><p className="text-[13px] text-muted-foreground">Progress is saved to this account on the server and follows you to any device where you log in.</p><Button variant="outline" onClick={() => st.logout()}>Log out</Button></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-lg">Claude API key</CardTitle></CardHeader><CardContent className="space-y-3"><Pill tone={env.hasKey ? ST_TONE[4] : ST_TONE[2]}>{env.hasKey ? "Key saved. Live features are on" : "No key. Live features are off"}</Pill><p className="text-sm">Add your own key to turn on <b>Run in Claude (live)</b> and <b>Claude's second opinion</b>. Everything else works without one.</p>
        <Field id="ak" label={env.hasKey ? "Replace key" : "API key"}><Input id="ak" type="password" autoComplete="off" placeholder="sk-ant-…" className="font-mono" value={key} onChange={(e) => setKey(e.target.value)} /></Field>{msg && <Note tone="bad">{msg}</Note>}
        <div className="flex gap-2"><Button onClick={async () => { try { await st.saveKey(key); setKey(""); setMsg(""); } catch (e) { setMsg(e.message); } }}>Save key</Button>{env.hasKey && <Button variant="outline" onClick={() => st.removeKey().catch(() => {})}>Remove key</Button>}</div></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="text-lg">How your key is handled</CardTitle></CardHeader><CardContent className="max-w-[70ch] space-y-2 text-sm"><p>Your key is sent once over an encrypted connection, stored encrypted on the server, and never sent back to any browser. It is used only to send your own prompts to Claude when you press a live button. Usage is charged to your Anthropic account. Live runs are limited to 40 per hour.</p><p>You can create a key in the Anthropic Console under API keys. Set a spending limit there, and remove the key here at any time.</p></CardContent></Card></>;
  const lv = { granted: ["Connected", 4], prompt: ["Not connected yet", 2], denied: ["Declined for this visit", 0], unavailable: ["Not available for this account", 0], unknown: [env.canLive ? "Available" : "Not available here", 2] }[env.liveState] || ["Unknown", 2];
  return <><Head eyebrow="Account" title="Sign-in and Claude access" />
    <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Who you are</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{env.me ? <>Signed in through Claude{env.me.name && <> as <b>{env.me.name}</b></>}.</> : "Not signed in to Claude."}</p><p className="text-[13px] text-muted-foreground">Sign-in is handled by Claude. This page never sees or stores a password. To switch person, sign in to Claude as someone else and reopen the page.</p><p><b>Progress is stored:</b> {env.cloud ? "in your Claude account, private to you, and in this browser" : "in this browser only"}.</p><Button variant="outline" onClick={() => st.enter(false)}>Show sign-in screen</Button></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-lg">Claude access for live features</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Pill tone={ST_TONE[lv[1]]}>{lv[0]}</Pill><p>Live runs and Claude's second opinion use your own Claude sign-in. Connecting takes the place of an API key.</p><div className="flex flex-wrap gap-2">{env.hasPerms && !["granted", "unavailable", "denied"].includes(env.liveState) && <Button onClick={() => st.connectClaude()}>Connect Claude</Button>}{env.hasPerms && <Button variant="outline" onClick={() => st.managePerms().catch(() => setMsg("Open the Permissions menu on this artifact to change access."))}>Manage permissions</Button>}</div>{msg && <Note>{msg}</Note>}{env.liveState === "denied" && <p className="text-[13px] text-muted-foreground">Reload the page to be asked again.</p>}</CardContent></Card></div>
    <Card><CardHeader><CardTitle className="text-lg">Why there is no API key field</CardTitle></CardHeader><CardContent className="max-w-[70ch] space-y-2 text-sm"><p>A key typed into a web page can be read by anyone with access to that browser or page, so this workspace does not accept one. This page is also not allowed to contact the Claude API directly, so a key would do nothing here. Everything a key would unlock already works through Connect Claude above.</p><p>A key only becomes useful if the workspace is hosted outside Claude on its own server, where the key is kept on the server and never sent to the browser.</p></CardContent></Card></>;
}

function Gate() {
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [busy, setBusy] = useState(false), [google, setGoogle] = useState(HOSTED ? null : false);
  const [msg, setMsg] = useState(() => { try { const m = new URLSearchParams(location.search).get("authError"); if (m) history.replaceState(null, "", location.pathname + location.hash); return m || ""; } catch (e) { return ""; } });
  useEffect(() => { if (HOSTED) fetch("/api/config").then((r) => r.json()).then((c) => setGoogle(!!c.google)).catch(() => setGoogle(false)); }, []);
  const go = async (kind) => { setBusy(true); try { await st.auth(kind, email, pw); } catch (e) { setMsg(e.message); } setBusy(false); };
  return <Card className="mx-auto mt-[8vh] w-full max-w-md"><CardHeader><Eyebrow>Sign in</Eyebrow><CardTitle className="text-2xl">Claude Mastery Workspace</CardTitle></CardHeader><CardContent className="space-y-4">
    {!env.idDone || (HOSTED && google === null) ? <p className="text-muted-foreground">{HOSTED ? "Loading…" : "Checking your Claude sign-in…"}</p> : HOSTED ? (google ? <div className="space-y-4">
      <p className="text-muted-foreground">Learn Claude by doing, across five levels. Sign in with Google to save your progress.</p>
      {msg && <Note tone="bad">{msg}</Note>}
      <Button asChild className="w-full"><a href="/auth/google"><svg viewBox="0 0 48 48" className="mr-2 h-4 w-4" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</a></Button>
      <p className="text-[13px] text-muted-foreground">We only receive your email address from Google, to keep your progress in your account.</p></div>
    : <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); go("login"); }}>
      <Note tone="warn">Google sign-in is not set up on this site yet, so email sign-in is shown instead.</Note>
      <Field id="au-email" label="Email"><Input id="au-email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field id="au-pw" label="Password"><Input id="au-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>{msg && <Note tone="bad">{msg}</Note>}
      <div className="flex gap-2"><Button type="submit" disabled={busy}>Log in</Button><Button type="button" variant="outline" disabled={busy} onClick={() => go("signup")}>Create account</Button></div></form>)
    : env.me ? <><Note tone="ok">Signed in through Claude{env.me.name && <> as <b>{env.me.name}</b></>}. Your progress is saved to your account and is private to you.</Note><Button onClick={() => st.enter(true)}>Enter workspace</Button></>
    : <><Note tone="warn">You are not signed in to Claude, or this page cannot see your sign-in.</Note><p className="text-sm">This workspace uses your Claude sign-in. It has no separate username or password. To keep progress across devices, sign in to Claude in this browser and reopen the page.</p><Button onClick={() => st.enter(true)}>Continue as guest</Button><p className="text-[13px] text-muted-foreground">As a guest, progress is kept only in this browser and live Claude features are off.</p></>}
  </CardContent></Card>;
}

export default function App() {
  st.useStore();
  const [tab, setTab] = useState(() => { const h = location.hash.slice(1); return TABS.some((t) => t[0] === h) ? h : "home"; });
  const [skill, setSkill] = useState("1.1"), [stage, setStage] = useState("demo");
  useEffect(() => { st.boot(); }, []);
  const go = (t) => { setTab(t); try { history.replaceState(null, "", "#" + t); } catch (e) {} window.scrollTo(0, 0); };
  const open = (id, sg) => { setSkill(id); setStage(sg || st.stageFor(id)); go("lab"); };
  if (!env.entered) return <div className="mx-auto max-w-[1120px] px-4 pb-14"><Gate /></div>;
  const n = st.nextAction();
  return <div className="mx-auto flex max-w-[1120px] flex-col gap-5 px-4 pb-14">
    <header className="sticky z-10 -mx-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b bg-background px-4 py-2.5" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <h1 className="text-xl font-bold">Claude Mastery</h1>
      <nav className="flex flex-wrap gap-1">{TABS.map((t) => <button key={t[0]} onClick={() => go(t[0])} aria-current={tab === t[0]} className={cn("rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring", tab === t[0] && "bg-foreground text-background")}>{t[1]}</button>)}</nav>
      <span className="font-mono text-xs text-muted-foreground md:ml-auto">{env.sync}</span>
    </header>
    {S.sample ? <Note tone="warn"><b>Sample data loaded.</b> These records are examples, not your progress.<Button size="sm" variant="outline" onClick={() => st.resetAll()}>Clear sample data</Button></Note>
      : !S.updated && <Note>New here? Level 1 is open. You can also load sample data to see a workspace in progress.<Button size="sm" variant="outline" onClick={() => st.loadSample()}>Load sample data</Button></Note>}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-l-4 border-primary bg-accent px-4 py-3"><div className="min-w-0 flex-1 basis-60"><Eyebrow>Next action</Eyebrow><b>{n.t}</b><br /><span className="text-[13px]">{n.d}</span></div><Button onClick={() => (n.skill ? open(n.skill) : go(n.tab))}>Go</Button></div>
    <main className="flex flex-col gap-5">
      {tab === "home" && <Home />}{tab === "path" && <Path open={open} go={go} />}{tab === "lab" && <Lab skill={skill} stage={stage} setStage={setStage} open={open} />}
      {tab === "projects" && <Projects open={open} />}{tab === "skills" && <Skills open={open} />}{tab === "evidence" && <Evidence />}
      {tab === "connect" && <Connect open={open} />}{tab === "features" && <Features open={open} go={go} />}{tab === "scheduler" && <Scheduler open={open} />}{tab === "readme" && <Readme go={go} />}{tab === "account" && <Account />}
    </main>
  </div>;
}
