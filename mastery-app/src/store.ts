// @ts-nocheck
// State, mastery rules and persistence. Works in two modes: inside Claude (artifact) and on your own host (window.__HOSTED__).
import { useSyncExternalStore } from "react";
import { LEVELS, PROJECTS, CAPSTONE, CHECKS, SKILL_RUBRIC, ALL, README } from "./curriculum";

export const STATUS = ["Not Started", "Learning", "Practising", "Assessment Pending", "Mastered"];
export const KEY = "claude-mastery-v1";
export const HOSTED = typeof window !== "undefined" && !!window.__HOSTED__;
export const byId = (id) => ALL.find((s) => s.id === id);
export const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ v: 1, updated: 0, sample: false, skills: {}, projects: {}, cap: {}, journal: [], activity: [] });

export let S = blank();
export const env = { me: null, idDone: false, entered: false, hasKey: false, sync: "Loading saved progress…", liveState: "unknown", canLive: false, toAccount: !HOSTED };
let ver = 0; const subs = new Set();
export const bump = () => { ver++; subs.forEach((f) => f()); };
export const useStore = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => ver);

export const sk = (id) => S.skills[id] || (S.skills[id] = { demo: false, g: { n: 0, ok: false, text: "" }, c: { n: 0, ok: false, text: "" }, a: { n: 0, ok: false, score: null, ev: "", sc: {}, crit: {} }, hist: [], last: "", notes: "" });
export const pj = (id) => S.projects[id] || (S.projects[id] = { check: {}, tests: {}, ev: "", sc: {}, crit: {}, score: null, ok: false, n: 0 });
export const cap = () => { const c = S.cap; c.steps = c.steps || {}; c.sc = c.sc || {}; c.crit = c.crit || {}; return c; };
export const statusOf = (id) => { const k = S.skills[id]; if (!k) return 0; if (k.a.ok) return 4; if (k.c.ok) return 3; if (k.g.ok) return 2; return k.demo || k.g.n || k.c.n ? 1 : 0; };
export const levelDone = (n) => LEVELS[n - 1].skills.every((s) => statusOf(s[0]) === 4) && !!(S.projects["P" + n] || {}).ok;
export const levelOpen = (n) => n === 1 || levelDone(n - 1);
export const allDone = () => LEVELS.every((l) => levelDone(l.n));
export const mastered = () => !!S.cap.ok && allDone();
export const curLevel = () => { for (const l of LEVELS) if (!levelDone(l.n)) return l.n; return 5; };
export const stageFor = (id) => ["demo", "guided", "challenge", "assess", "assess"][statusOf(id)];
export function log(msg) { S.activity.unshift({ t: Date.now(), msg }); S.activity = S.activity.slice(0, 40); }

export function nextAction() {
  if (mastered()) return { t: "Claude Mastery Demonstrated", d: "Review your evidence or revisit any skill.", tab: "evidence" };
  for (const l of LEVELS) {
    if (!levelOpen(l.n)) break;
    for (const s of l.skills) { const st = statusOf(s[0]); if (st < 4) {
      const what = ["watch the demo and try the guided exercise", "finish the guided exercise", "complete the independent challenge", "pass the assessment"][st];
      return { t: `${s[0]} ${s[1]}`, d: `${st} of 4 stages done, so this skill is not Mastered yet. Next: ${what}.`, tab: "lab", skill: s[0] }; } }
    if (!(S.projects["P" + l.n] || {}).ok) return { t: `Level ${l.n} project: ${PROJECTS[l.n - 1].title}`, d: "Build it, test it, submit evidence.", tab: "projects" };
  }
  return { t: CAPSTONE.title, d: "Solve the capstone independently.", tab: "projects" };
}

export function runChecks(text, keys, minWords) {
  const t = text.toLowerCase(), words = (text.trim().match(/\S+/g) || []).length;
  const res = keys.map((k) => ({ label: CHECKS[k][1], pass: CHECKS[k][0].test(t), fix: CHECKS[k][2] }));
  res.push({ label: `At least ${minWords} words of real instruction`, pass: words >= minWords, fix: `You wrote ${words} words. Add the detail Claude needs.` });
  return res;
}
export const target = (key) => (key === "cap" ? cap() : key[0] === "s" ? sk(key.slice(2)).a : pj(key.slice(2)));
export const critsFor = (key) => (key === "cap" ? CAPSTONE.steps.map((s) => [s[0], s[1]]) : SKILL_RUBRIC);
export function grade(key) {
  const a = target(key), cs = critsFor(key); a.msg = "";
  const score = cs.reduce((t, c, i) => t + (+a.sc[i] || 0), 0), crit = Object.values(a.crit || {}).some(Boolean); let block = "";
  if (key === "cap") { if (CAPSTONE.steps.some((s, i) => (a.steps[i] || "").trim().length < 40)) block = "Every step needs a written record of at least 40 characters."; }
  else {
    if ((a.ev || "").trim().length < 30) block = "Add evidence first (at least 30 characters describing or containing the real output).";
    if (key[0] === "p") { const p = PROJECTS.find((x) => x.id === key.slice(2)); if (!p.check.every((_, i) => a.check[i]) || !p.tests.every((_, i) => a.tests[i])) block = "Complete every checklist item and test case before submitting."; }
  }
  a.n = (a.n || 0) + 1; a.score = score; a.ok = !block && score >= 80 && !crit; a.msg = block;
  const name = key === "cap" ? "Capstone" : key[0] === "s" ? key.slice(2) + " " + byId(key.slice(2)).name : PROJECTS.find((x) => x.id === key.slice(2)).title;
  if (key[0] === "s") { const k = sk(key.slice(2)); k.last = today(); k.hist.unshift({ d: today(), what: "Assessment " + score + "/100", ok: a.ok }); }
  log(`${name}: assessment ${score}/100, ${a.ok ? "passed" : "not passed"}`); commit();
}

/* ---------- persistence ---------- */
let docRef = null, dl = null, sampleFn = null, perms = null, saveT = null, writing = false, dirty = false;
const setSync = (t) => { env.sync = t; };
async function api(method, url, body) {
  const r = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "Request failed"), { status: r.status });
  return d;
}
export function commit() {
  S.updated = Date.now();
  if (!HOSTED) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  dirty = true; clearTimeout(saveT); saveT = setTimeout(push, 1200);
  setSync(HOSTED ? (env.me ? "Saving…" : "Not signed in") : docRef ? "Saving…" : "Saved in this browser"); bump();
}
async function push() {
  if (writing || !dirty) return;
  if (HOSTED) {
    if (!env.me) return; writing = true; dirty = false;
    try { await api("PUT", "/api/state", { json: JSON.stringify(S) }); setSync("Saved to your account"); }
    catch (e) { dirty = true; setSync(e.status === 401 ? "Signed out. Log in again to save." : "Not saved yet (connection problem). Will retry."); if (e.status !== 401) { clearTimeout(saveT); saveT = setTimeout(push, 8000); } writing = false; bump(); return; }
  } else {
    if (!docRef) return; writing = true; dirty = false;
    try { await docRef.set({ json: JSON.stringify(S), updated: S.updated }); setSync("Saved to your account"); } catch (e) { setSync("Saved in this browser (account save failed)"); }
  }
  writing = false; bump(); if (dirty) push();
}
function adopt(json) { try { const o = JSON.parse(json); if (o && o.v === 1 && typeof o.skills === "object") { S = Object.assign(blank(), o); return true; } } catch (e) {} return false; }
function setLive() { env.canLive = HOSTED ? env.hasKey : !!sampleFn; }

export async function boot() {
  if (HOSTED) { fixReadmeForHost(); return bootHosted(); }
  try { const j = localStorage.getItem(KEY); if (j) adopt(j); env.entered = localStorage.getItem(KEY + "-in") === "1"; } catch (e) {}
  setSync("Saved in this browser"); bump();
  const use = window.claude && window.claude.use; if (!use) { env.idDone = true; bump(); return; }
  use("downloads").then((d) => { dl = d; }).catch(() => {});
  use("sample").then((s) => { sampleFn = s; setLive(); bump(); }).catch(() => {});
  use("permissions").then(async (p) => { perms = p; if (p) { env.liveState = await p.state("sample"); env.hasPerms = true; bump(); } }).catch(() => {});
  try {
    const [d, u] = await Promise.all([use("db"), use("user")]);
    if (u) { try { const m = await u.me(); if (m && m.id) env.me = { name: m.name || "", id: m.id }; } catch (e) {} }
    env.idDone = true; bump();
    if (!d || !u) return; const id = await u.id(); if (!id) return;
    docRef = d.collection("data/users/" + id).doc("mastery");
    const snap = await docRef.get(); const r = snap.exists ? snap.data() : null;
    if (r && r.json && (r.updated || 0) > (S.updated || 0)) { if (adopt(r.json)) { try { localStorage.setItem(KEY, r.json); } catch (e) {} } }
    else if (S.updated) { dirty = true; push(); }
    env.cloud = true; setSync("Saved to your account");
  } catch (e) { setSync("Saved in this browser"); }
  env.idDone = true; bump();
}
async function hostedIn(r) {
  env.me = { name: r.email, id: r.email }; env.hasKey = r.hasKey; setLive();
  const st = await api("GET", "/api/state"); S = blank(); if (st.json) adopt(st.json);
  env.cloud = true; env.idDone = true; env.entered = true; setSync("Saved to your account"); bump();
}
async function bootHosted() { bump(); try { await hostedIn(await api("GET", "/api/me")); } catch (e) { env.idDone = true; env.entered = false; bump(); } }
export const auth = async (kind, email, password) => hostedIn(await api("POST", "/api/" + kind, { email, password }));
export async function logout() { clearTimeout(saveT); if (dirty) await push(); try { await api("POST", "/api/logout", {}); } catch (e) {} env.me = null; env.hasKey = false; env.entered = false; env.cloud = false; S = blank(); setLive(); bump(); }
export async function saveKey(key) { const r = await api("PUT", "/api/key", { key }); env.hasKey = r.hasKey; setLive(); bump(); }
export async function removeKey() { await api("DELETE", "/api/key", {}); env.hasKey = false; setLive(); bump(); }
export function enter(v) { env.entered = v; try { v ? localStorage.setItem(KEY + "-in", "1") : localStorage.removeItem(KEY + "-in"); } catch (e) {} bump(); }
export async function connectClaude() { if (!perms) return; const r = await perms.request(["sample"]); env.liveState = r.sample || env.liveState; if (env.liveState === "granted" && !sampleFn) sampleFn = await window.claude.use("sample"); setLive(); bump(); }
export async function managePerms() { await perms.manage(); env.liveState = await perms.state("sample"); bump(); }

export async function live(q) {
  if (HOSTED) return (await api("POST", "/api/claude", { prompt: q })).text;
  const r = await sampleFn(q, { modelTier: "quick", cache: false }); return r.text || "(empty response)";
}
export async function liveJson(q) {
  if (HOSTED) { const t = await live(q); const m = t.match(/[\[{][\s\S]*[\]}]/); return JSON.parse(m ? m[0] : t); }
  return sampleFn.json(q, { modelTier: "default", cache: false });
}
export async function exportFile() {
  const data = JSON.stringify(S, null, 1), filename = "claude-mastery-" + today() + ".json";
  if (HOSTED) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = filename; a.click(); return true; }
  if (dl) { try { await dl.save({ filename, data }); return true; } catch (e) {} } return false;
}
export function importText(txt) { if (!adopt(txt)) return false; log("Records imported"); commit(); return true; }
export function resetAll() { S = blank(); commit(); S.updated = 0; if (!HOSTED) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} } bump(); }
export function loadSample() {
  const o = blank(); o.sample = true; const d = today();
  const full = (id, score) => { const s = byId(id); o.skills[id] = { demo: true, g: { n: 2, ok: true, text: s.strong }, c: { n: 1, ok: true, text: s.sol }, a: { n: 1, ok: true, score, ev: "Sample: ran the prompt on last week's team notes; output pasted in my notes file.", sc: { 0: 25, 1: 16, 2: 15, 3: 12, 4: 8, 5: score - 76 }, crit: {} }, hist: [{ d, what: "Assessment " + score + "/100", ok: true }, { d, what: "Challenge attempt 1", ok: true }, { d, what: "Guided attempt 2", ok: true }, { d, what: "Guided attempt 1", ok: false }], last: d, notes: "" }; };
  full("1.1", 88); full("1.2", 84); full("1.3", 91);
  const s = byId("1.4"); o.skills["1.4"] = { demo: true, g: { n: 1, ok: true, text: s.strong }, c: { n: 2, ok: false, text: "Rewrite it but shorter." }, a: { n: 0, ok: false, score: null, ev: "", sc: {}, crit: {} }, hist: [{ d, what: "Challenge attempt 2", ok: false }, { d, what: "Guided attempt 1", ok: true }], last: d, notes: "Sample note: I forget to say what to keep." };
  o.journal = [{ id: 2, date: d, learned: "Examples beat adjectives", why: "House style is hard to describe but easy to show", how: "Rewrote FAQ prompt with one sample answer", evidence: "10 FAQ answers matched the style on first run", conf: 4, unclear: "How many examples is too many", next: "Skill 1.4 challenge" }, { id: 1, date: d, learned: "Always name the audience", why: "Output changed completely for leadership vs engineers", how: "Ran the same prompt for two audiences", evidence: "Two status updates saved", conf: 3, unclear: "", next: "Skill 1.2" }];
  o.activity = [{ t: Date.now(), msg: "1.4 Improve weak responses: challenge attempted (sample)" }, { t: Date.now(), msg: "1.3 Use examples and constraints: assessment 91/100, passed (sample)" }, { t: Date.now(), msg: "1.2 Provide context and clear instructions: assessment 84/100, passed (sample)" }];
  S = o; commit();
}
function fixReadmeForHost() {
  const set = (tab, label, text) => { const r = README.find((x) => x[0] === tab); const row = r && r[3].find((x) => x[0] === label); if (row) row[1] = text; };
  set("lab", "Run in Claude (live)", "Shown once you add a Claude API key on the Account tab. It sends the prompt in the editor to Claude and displays the real response under a Live label. Usage is charged to your own key.");
  set("lab", "Claude's second opinion (live)", "Shown once you add a Claude API key. Claude reads your prompt and evidence and suggests an answer and a reason for each question. It is a suggestion: it cannot rerun your prompt or check facts it was not shown, so you confirm or change each answer before submitting.");
  const a = README.find((x) => x[0] === "account");
  if (a) { a[2] = "Your login and your Claude API key."; a[3] = [["Sign-in screen", "Sign in with your Google account. The site receives only your email address. Email and password sign-in appears only if Google sign-in has not been set up on the site."], ["Log out", "Ends your session on this device. Your progress stays saved."], ["Claude API key", "Optional. Adding your own key turns on the live features. It is stored encrypted on the server and never shown again. Remove it at any time."]]; }
}
