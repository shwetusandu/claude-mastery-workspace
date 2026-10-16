// Claude Mastery Workspace: hosted server.
// Email + password accounts, per-user progress, per-user Claude API key (encrypted at rest, never sent to the browser).
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === "production" || !!process.env.RENDER;
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-5-5";
let SECRET = process.env.SECRET;
if (!SECRET) {
  if (PROD) { console.error("SECRET environment variable is required in production."); process.exit(1); }
  SECRET = crypto.randomBytes(32).toString("hex");
  console.warn("No SECRET set: using a temporary one. Sign-ins and saved API keys will not survive a restart.");
}
const G_ID = process.env.GOOGLE_CLIENT_ID || "", G_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const BASE_URL = (process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
const ENC_KEY = crypto.createHash("sha256").update(SECRET + ":apikey").digest();

/* ---------- storage: Postgres when DATABASE_URL is set, otherwise a JSON file ---------- */
let store;
if (process.env.DATABASE_URL) {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false } });
  pool.on("error", e => console.error("Database connection dropped:", e.message)); // idle disconnects must not crash the server
  const ready = pool.query("create table if not exists users (email text primary key, data jsonb not null)");
  store = {
    kind: "postgres",
    async get(email) { await ready; const r = await pool.query("select data from users where email=$1", [email]); return r.rows[0] ? r.rows[0].data : null; },
    async put(u) { await ready; await pool.query("insert into users(email,data) values($1,$2) on conflict(email) do update set data=excluded.data", [u.email, u]); },
    async create(u) { await ready; const r = await pool.query("insert into users(email,data) values($1,$2) on conflict do nothing", [u.email, u]); return r.rowCount === 1; }
  };
} else {
  const dir = process.env.DATA_DIR || path.join(__dirname, "data"), file = path.join(dir, "users.json");
  fs.mkdirSync(dir, { recursive: true });
  let users = {}; try { users = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) {}
  const flush = () => { fs.writeFileSync(file + ".tmp", JSON.stringify(users)); fs.renameSync(file + ".tmp", file); };
  store = {
    kind: "file",
    async get(email) { return users[email] || null; },
    async put(u) { users[u.email] = u; flush(); },
    async create(u) { if (users[u.email]) return false; users[u.email] = u; flush(); return true; }
  };
  if (PROD) console.warn("No DATABASE_URL: storing accounts in a local file. On hosts without a persistent disk this is erased on every restart.");
}

/* ---------- crypto helpers ---------- */
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString("hex");
const sign = v => crypto.createHmac("sha256", SECRET).update(v).digest("base64url");
function makeToken(email) { const body = Buffer.from(email).toString("base64url") + "." + (Date.now() + 30 * 864e5); return body + "." + sign(body); }
function readToken(t) {
  if (!t) return null; const i = t.lastIndexOf("."); if (i < 0) return null;
  const body = t.slice(0, i), sig = Buffer.from(t.slice(i + 1)), want = Buffer.from(sign(body));
  if (sig.length !== want.length || !crypto.timingSafeEqual(sig, want)) return null;
  const [e, exp] = body.split("."); if (+exp < Date.now()) return null;
  return Buffer.from(e, "base64url").toString();
}
function encrypt(text) { const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv); const ct = Buffer.concat([c.update(text, "utf8"), c.final()]); return { iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), ct: ct.toString("base64") }; }
function decrypt(k) { const d = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, Buffer.from(k.iv, "base64")); d.setAuthTag(Buffer.from(k.tag, "base64")); return Buffer.concat([d.update(Buffer.from(k.ct, "base64")), d.final()]).toString("utf8"); }

/* ---------- small helpers ---------- */
const hits = new Map();
function limited(key, max, windowMs) { const now = Date.now(), a = (hits.get(key) || []).filter(t => now - t < windowMs); if (a.length >= max) { hits.set(key, a); return true; } a.push(now); hits.set(key, a); return false; }
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some(t => now - t < 36e5)) hits.delete(k); }, 6e5).unref();
function send(res, code, obj, headers) { res.writeHead(code, Object.assign({ "content-type": "application/json", "cache-control": "no-store" }, headers)); res.end(JSON.stringify(obj)); }
function readBody(req) { return new Promise((ok, bad) => { let n = 0; const parts = []; req.on("data", c => { n += c.length; if (n > 1e6) { bad(Object.assign(new Error("too large"), { code: 413 })); req.destroy(); } else parts.push(c); }); req.on("end", () => { try { ok(parts.length ? JSON.parse(Buffer.concat(parts).toString()) : {}); } catch (e) { bad(Object.assign(new Error("bad json"), { code: 400 })); } }); req.on("error", bad); }); }
const cookie = (token, age) => `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${age}${PROD ? "; Secure" : ""}`;
const ip = req => (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
const SEC = { "x-content-type-options": "nosniff", "x-frame-options": "DENY", "referrer-policy": "no-referrer",
  "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'" };

async function api(req, res, url) {
  const m = req.method, p = url.pathname;
  if (m !== "GET" && !(req.headers["content-type"] || "").includes("application/json")) return send(res, 415, { error: "Send JSON." });
  const body = m === "GET" ? {} : await readBody(req);

  if (p === "/api/signup" || p === "/api/login") {
    if (m !== "POST") return send(res, 405, { error: "Use POST." });
    if (limited("auth:" + ip(req), 10, 15 * 6e4)) return send(res, 429, { error: "Too many attempts. Wait 15 minutes and try again." });
    const email = String(body.email || "").trim().toLowerCase(), pw = String(body.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return send(res, 400, { error: "Enter a valid email address." });
    if (p === "/api/signup") {
      if (pw.length < 8 || pw.length > 200) return send(res, 400, { error: "Password must be at least 8 characters." });
      const salt = crypto.randomBytes(16).toString("hex");
      const created = await store.create({ email, salt, hash: hashPw(pw, salt), key: null, state: "", updated: 0, created: Date.now() });
      if (!created) return send(res, 409, { error: "An account with this email already exists. Log in instead." });
      return send(res, 200, { email, hasKey: false }, { "set-cookie": cookie(makeToken(email), 2592000) });
    }
    const u = await store.get(email);
    if (u && !u.hash) return send(res, 401, { error: "This account uses Google sign-in. Choose Continue with Google." });
    const ok = u && crypto.timingSafeEqual(Buffer.from(hashPw(pw, u.salt)), Buffer.from(u.hash));
    if (!ok) return send(res, 401, { error: "Email or password is incorrect." });
    return send(res, 200, { email, hasKey: !!u.key }, { "set-cookie": cookie(makeToken(email), 2592000) });
  }
  if (p === "/api/config") return send(res, 200, { google: !!(G_ID && G_SECRET) });
  if (p === "/api/logout") return send(res, 200, { ok: true }, { "set-cookie": cookie("", 0) });

  const tok = (req.headers.cookie || "").split(/;\s*/).map(c => c.split("=")).find(c => c[0] === "session");
  const email = readToken(tok && tok.slice(1).join("="));
  const u = email && await store.get(email);
  if (!u) return send(res, 401, { error: "Not signed in." });

  if (p === "/api/me" && m === "GET") return send(res, 200, { email: u.email, hasKey: !!u.key });
  if (p === "/api/state" && m === "GET") return send(res, 200, { json: u.state || "", updated: u.updated || 0 });
  if (p === "/api/state" && m === "PUT") {
    if (typeof body.json !== "string" || body.json.length > 9e5) return send(res, 400, { error: "Progress data is missing or too large." });
    try { JSON.parse(body.json); } catch (e) { return send(res, 400, { error: "Progress data is not valid." }); }
    u.state = body.json; u.updated = Date.now(); await store.put(u); return send(res, 200, { ok: true });
  }
  if (p === "/api/key" && m === "PUT") {
    const k = String(body.key || "").trim();
    if (!/^sk-ant-[A-Za-z0-9_\-]{20,300}$/.test(k)) return send(res, 400, { error: "That does not look like a Claude API key. Keys start with sk-ant-." });
    u.key = encrypt(k); await store.put(u); return send(res, 200, { hasKey: true });
  }
  if (p === "/api/key" && m === "DELETE") { u.key = null; await store.put(u); return send(res, 200, { hasKey: false }); }
  if (p === "/api/claude" && m === "POST") {
    if (!u.key) return send(res, 400, { error: "Add your Claude API key on the Account tab first." });
    if (limited("ai:" + u.email, 40, 36e5)) return send(res, 429, { error: "Hourly limit of 40 live runs reached. Try again later." });
    const prompt = String(body.prompt || ""); if (!prompt.trim() || prompt.length > 20000) return send(res, 400, { error: "Prompt is empty or longer than 20,000 characters." });
    let key; try { key = decrypt(u.key); } catch (e) { return send(res, 400, { error: "Your saved key can no longer be read. Add it again on the Account tab." }); }
    let r, data;
    try {
      r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: 1500, messages: [{ role: "user", content: prompt }] }), signal: AbortSignal.timeout(60000) });
      data = await r.json();
    } catch (e) { return send(res, 502, { error: "Could not reach Claude. Try again." }); }
    if (!r.ok) return send(res, r.status === 401 ? 400 : 502, { error: r.status === 401 ? "Claude rejected your API key. Check it on the Account tab." : "Claude returned an error: " + ((data.error && data.error.message) || r.status) });
    return send(res, 200, { text: (data.content || []).filter(b => b.type === "text").map(b => b.text).join("") });
  }
  send(res, 404, { error: "Not found." });
}


/* ---------- Sign in with Google (OAuth 2.0 authorization code flow) ---------- */
const cookieGet = (req, name) => { const c = (req.headers.cookie || "").split(/;\s*/).find(x => x.startsWith(name + "=")); return c ? c.slice(name.length + 1) : ""; };
const redirectUri = req => (BASE_URL || `${PROD ? "https" : "http"}://${req.headers.host}`) + "/auth/google/callback";
function redirect(res, to, cookies) { res.writeHead(302, Object.assign({ location: to, "cache-control": "no-store" }, cookies ? { "set-cookie": cookies } : {})); res.end(); }
const back = (res, msg) => redirect(res, "/?authError=" + encodeURIComponent(msg), [`gstate=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${PROD ? "; Secure" : ""}`]);
async function googleAuth(req, res, url) {
  if (!G_ID || !G_SECRET) return back(res, "Google sign-in is not set up on this site.");
  if (url.pathname === "/auth/google") {
    const state = crypto.randomBytes(24).toString("base64url");
    const q = new URLSearchParams({ client_id: G_ID, redirect_uri: redirectUri(req), response_type: "code", scope: "openid email", state, prompt: "select_account" });
    return redirect(res, "https://accounts.google.com/o/oauth2/v2/auth?" + q, [`gstate=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${PROD ? "; Secure" : ""}`]);
  }
  const state = url.searchParams.get("state") || "", saved = cookieGet(req, "gstate");
  if (url.searchParams.get("error")) return back(res, "Google sign-in was cancelled.");
  if (!saved || state.length !== saved.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(saved))) return back(res, "Google sign-in expired. Try again.");
  if (limited("auth:" + ip(req), 10, 15 * 6e4)) return back(res, "Too many attempts. Wait 15 minutes and try again.");
  let tok;
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code: url.searchParams.get("code") || "", client_id: G_ID, client_secret: G_SECRET, redirect_uri: redirectUri(req), grant_type: "authorization_code" }), signal: AbortSignal.timeout(15000) });
    tok = await r.json(); if (!r.ok || !tok.id_token) throw new Error(tok.error || "no id_token");
  } catch (e) { console.error("Google token exchange failed:", e.message); return back(res, "Google sign-in failed. Try again."); }
  // The ID token came straight from Google's token endpoint over TLS, so its claims can be read without a separate signature check.
  let claims; try { claims = JSON.parse(Buffer.from(tok.id_token.split(".")[1], "base64url").toString()); } catch (e) { return back(res, "Google sign-in failed. Try again."); }
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(G_ID) || !/^(https:\/\/)?accounts\.google\.com$/.test(claims.iss || "") || (claims.exp || 0) * 1000 < Date.now()) return back(res, "Google sign-in could not be verified.");
  if (!claims.email || claims.email_verified !== true) return back(res, "Your Google account email is not verified.");
  const email = String(claims.email).toLowerCase();
  let u = await store.get(email);
  if (!u) { u = { email, salt: null, hash: null, google: claims.sub, key: null, state: "", updated: 0, created: Date.now() }; if (!(await store.create(u))) u = await store.get(email); }
  if (u.google && u.google !== claims.sub) return back(res, "This email is linked to a different Google account.");
  if (!u.google) { u.google = claims.sub; await store.put(u); }
  return redirect(res, "/", [cookie(makeToken(email), 2592000), `gstate=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${PROD ? "; Secure" : ""}`]);
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (url.pathname === "/auth/google" || url.pathname === "/auth/google/callback") return await googleAuth(req, res, url);
    if (url.pathname === "/healthz") return send(res, 200, { ok: true });
    const name = url.pathname === "/" ? "index.html" : path.basename(url.pathname);
    const f = path.join(__dirname, "public", name);
    if (!TYPES[path.extname(f)] || !fs.existsSync(f)) { res.writeHead(404, SEC); return res.end("Not found"); }
    res.writeHead(200, Object.assign({ "content-type": TYPES[path.extname(f)], "cache-control": "no-cache" }, SEC)); fs.createReadStream(f).pipe(res);
  } catch (e) { if (!res.headersSent) send(res, e.code === 413 || e.code === 400 ? e.code : 500, { error: e.code ? "Bad request." : "Server error." }); if (!e.code) console.error(e); }
}).listen(PORT, () => console.log(`Claude Mastery running on port ${PORT} (storage: ${store.kind})`));
