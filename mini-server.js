require("dotenv").config();
const express = require("express");
const pino = require("pino");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "8kb" }));
const PORT = process.env.PORT || 3000;
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "923220225993").replace(/\D/g, "");
const CHANNEL_URL = "https://whatsapp.com/channel/0029VbByXON8KMqcY2Ilj53s";
const REPO_URL = "https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT";
const MENU_IMAGE = "https://user44863.na.imgto.link/public/20261013/c31e6b96cf6c7b73d7932779-17465.avif";
const SESSION_ROOT = path.resolve(process.env.SESSION_DIR || path.join(__dirname, "sessions"));
const MAX_USERS = Math.max(1, Math.min(30, Number(process.env.MAX_USERS || 8)));
const sessions = new Map();
const ipHits = new Map();
const numberCooldowns = new Map();
const qrRequests = new Map();
const startedAt = Date.now();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const NUMBER_COOLDOWN_MS = 3 * 60 * 1000;
const PAIR_TIMEOUT_MS = 10 * 60 * 1000;

fs.mkdirSync(SESSION_ROOT, { recursive: true });

function validNumber(value) {
  const number = String(value || "").replace(/\D/g, "");
  return number.length >= 10 && number.length <= 15 ? number : "";
}
function formatUptime(ms) {
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d ? d + "d" : "", h ? h + "h" : "", m ? m + "m" : "", sec + "s"].filter(Boolean).join(" ");
}
function checkRate(ip) {
  const now = Date.now();
  const recent = (ipHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  ipHits.set(ip, recent);
  return true;
}
function menuText() {
  return [
    "╭━━〔 ✦ N I A Z I - M D ✦ 〕━━╮",
    "│ ⚡ Public Mini WhatsApp Bot",
    "│ 👑 Creator: NIAZI",
    "╰━━━━━━━━━━━━━━━━━━━━╯",
    "",
    "╭──〔 FREE COMMANDS 〕",
    "│ • .menu — All commands",
    "│ • .ping — Speed check",
    "│ • .alive — Bot status",
    "│ • .uptime — Running time",
    "│ • .time — Pakistan time",
    "│ • .date — Date",
    "│ • .owner — Contact owner",
    "│ • .channel — Official channel",
    "│ • .repo — GitHub source",
    "│ • .jid — Chat ID",
    "│ • .groupinfo — Group details",
    "│ • .say <text> — Repeat text",
    "│ • .upper / .lower — Text case",
    "│ • .reverse — Reverse text",
    "│ • .count / .wordcount — Text count",
    "│ • .calc 2+2 — Basic calculator",
    "│ • .choose a | b — Random choice",
    "│ • .dice / .coin / .8ball — Games",
    "│ • .joke / .fact / .love — Fun",
    "│ • .motivate — Motivation",
    "│ • .whoami — Your sender ID",
    "│ • .groupname / .members / .admins — Group info",
    "│ • .link — Group invite link",
    "│ • .quote — Motivation",
    "╰━━━━━━━━━━━━━━━━━━━━╯",
    "",
    "📢 Channel: " + CHANNEL_URL,
    "👑 Owner: https://wa.me/" + OWNER_NUMBER,
    "💻 GitHub: " + REPO_URL,
    "",
    "MADE WITH ⚡ BY NIAZI-MD"
  ].join("\n");
}
function connectedCount() {
  let count = 0;
  for (const item of sessions.values()) if (item.status === "open") count++;
  return count;
}
function activeCount() { return sessions.size; }

function attachCommands(client, number, session) {
  client.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe || msg.key.remoteJid === "status@broadcast") continue;
      const jid = msg.key.remoteJid;
      const body = msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption || "";
      const raw = body.trim();
      const command = raw.toLowerCase().split(/\s+/)[0];
      const arg = raw.includes(" ") ? raw.slice(raw.indexOf(" ") + 1).trim() : "";
      try {
        if ([".ping", "ping"].includes(command)) {
          await client.sendMessage(jid, { text: "╭━━〔 NIAZI-MD MINI 〕━━╮\n│ 🟢 Pong! Bot online\n│ ⚡ Status: Connected\n╰━━━━━━━━━━━━━━━━╯" }, { quoted: msg });
        } else if ([".menu", "menu", ".help", "help", ".commands"].includes(command)) {
          await client.sendMessage(jid, { image: { url: MENU_IMAGE }, caption: menuText() }, { quoted: msg });
        } else if ([".alive", "alive", ".status"].includes(command)) {
          await client.sendMessage(jid, { text: "🟢 NIAZI-MD MINI is online\n📱 Connected account: " + number + "\n⏱️ Uptime: " + formatUptime(Date.now() - startedAt) + "\n📢 " + CHANNEL_URL }, { quoted: msg });
        } else if ([".uptime", "uptime"].includes(command)) {
          await client.sendMessage(jid, { text: "⏱️ NIAZI-MD uptime: " + formatUptime(Date.now() - startedAt) }, { quoted: msg });
        } else if ([".owner", "owner"].includes(command)) {
          await client.sendMessage(jid, { text: "👑 NIAZI-MD Owner\nhttps://wa.me/" + OWNER_NUMBER }, { quoted: msg });
        } else if ([".creator", "creator", ".mian"].includes(command)) {
          await client.sendMessage(jid, { text: "⚡ Created by NIAZI\nNIAZI-MD MINI\n" + REPO_URL }, { quoted: msg });
        } else if ([".channel", "channel", ".joinchannel"].includes(command)) {
          await client.sendMessage(jid, { text: "📢 Official NIAZI-MD WhatsApp Channel:\n" + CHANNEL_URL }, { quoted: msg });
        } else if ([".repo", "repo", ".github"].includes(command)) {
          await client.sendMessage(jid, { text: "💻 GitHub Repository:\n" + REPO_URL }, { quoted: msg });
        } else if ([".time", "time"].includes(command)) {
          await client.sendMessage(jid, { text: "🕒 Pakistan time: " + new Date().toLocaleTimeString("en-PK", { timeZone: "Asia/Karachi" }) }, { quoted: msg });
        } else if ([".date", "date"].includes(command)) {
          await client.sendMessage(jid, { text: "📅 Date: " + new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "full" }) }, { quoted: msg });
        } else if ([".jid", "jid"].includes(command)) {
          await client.sendMessage(jid, { text: "🆔 Chat ID:\n" + jid }, { quoted: msg });
        } else if ([".groupinfo", "groupinfo"].includes(command)) {
          if (!jid.endsWith("@g.us")) {
            await client.sendMessage(jid, { text: "This command works inside a group." }, { quoted: msg });
          } else {
            const meta = await client.groupMetadata(jid);
            await client.sendMessage(jid, { text: "╭━━〔 GROUP INFO 〕━━╮\n│ Name: " + meta.subject + "\n│ Members: " + meta.participants.length + "\n╰━━━━━━━━━━━━━━━━╯" }, { quoted: msg });
          }
        } else if ([".say", "say"].includes(command)) {
          await client.sendMessage(jid, { text: arg ? arg.slice(0, 1000) : "Usage: .say your message" }, { quoted: msg });
        } else if ([".upper", "upper"].includes(command)) {
          await client.sendMessage(jid, { text: arg ? arg.toUpperCase().slice(0, 2000) : "Usage: .upper your text" }, { quoted: msg });
        } else if ([".lower", "lower"].includes(command)) {
          await client.sendMessage(jid, { text: arg ? arg.toLowerCase().slice(0, 2000) : "Usage: .lower your text" }, { quoted: msg });
        } else if ([".reverse", "reverse"].includes(command)) {
          await client.sendMessage(jid, { text: arg ? Array.from(arg).reverse().join("").slice(0, 2000) : "Usage: .reverse your text" }, { quoted: msg });
        } else if ([".count", "count", ".wordcount"].includes(command)) {
          await client.sendMessage(jid, { text: "Characters: " + arg.length + "\nWords: " + (arg.trim() ? arg.trim().split(/\s+/).length : 0) }, { quoted: msg });
        } else if ([".calc", "calc"].includes(command)) {
          const m = arg.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/%])\s*(-?\d+(?:\.\d+)?)$/);
          if (!m) await client.sendMessage(jid, { text: "Usage: .calc 12 * 4 (one simple operation)" }, { quoted: msg });
          else {
            const a = Number(m[1]), b = Number(m[3]); let out;
            if (m[2] === "+") out = a + b; else if (m[2] === "-") out = a - b;
            else if (m[2] === "*") out = a * b; else if (m[2] === "/") out = b === 0 ? "Cannot divide by zero" : a / b;
            else out = b === 0 ? "Cannot divide by zero" : a % b;
            await client.sendMessage(jid, { text: "🧮 Answer: " + out }, { quoted: msg });
          }
        } else if ([".choose", "choose"].includes(command)) {
          const options = arg.split("|").map(x => x.trim()).filter(Boolean);
          await client.sendMessage(jid, { text: options.length >= 2 ? "🎯 I choose: " + options[Math.floor(Math.random() * options.length)] : "Usage: .choose tea | coffee" }, { quoted: msg });
        } else if ([".dice", "dice"].includes(command)) {
          await client.sendMessage(jid, { text: "🎲 You rolled: " + (1 + Math.floor(Math.random() * 6)) }, { quoted: msg });
        } else if ([".coin", "coin", ".flip"].includes(command)) {
          await client.sendMessage(jid, { text: "🪙 Coin toss: " + (Math.random() < 0.5 ? "Heads" : "Tails") }, { quoted: msg });
        } else if ([".8ball", "8ball"].includes(command)) {
          const answers = ["Yes, definitely ✨", "Maybe 🤔", "Ask again later 🔮", "Most likely 🌟", "Not now 🙃", "Absolutely! 💫"];
          await client.sendMessage(jid, { text: "🔮 " + (arg || "Your question") + "\n" + answers[Math.floor(Math.random() * answers.length)] }, { quoted: msg });
        } else if ([".joke", "joke"].includes(command)) {
          const jokes = ["Why did the phone need glasses? It lost its contacts. 📱", "Why do programmers prefer dark mode? Because light attracts bugs. 🐛", "I told my Wi-Fi a joke. It disconnected. 😂"];
          await client.sendMessage(jid, { text: jokes[Math.floor(Math.random() * jokes.length)] }, { quoted: msg });
        } else if ([".fact", "fact"].includes(command)) {
          const facts = ["Octopuses have three hearts. 🐙", "Honey can remain edible for a very long time when stored properly. 🍯", "A day on Venus is longer than its year. 🪐"];
          await client.sendMessage(jid, { text: "💡 " + facts[Math.floor(Math.random() * facts.length)] }, { quoted: msg });
        } else if ([".love", "love"].includes(command)) {
          await client.sendMessage(jid, { text: "💗 Love meter: " + Math.floor(Math.random() * 101) + "%\nFun only — respect and kindness matter most." }, { quoted: msg });
        } else if ([".motivate", "motivate"].includes(command)) {
          const lines = ["Keep going. Small steps become big results. 💪", "Your future is built by what you do today. ⚡", "Stay humble, learn daily, and never stop improving. 🌟"];
          await client.sendMessage(jid, { text: lines[Math.floor(Math.random() * lines.length)] }, { quoted: msg });
        } else if ([".whoami", "whoami"].includes(command)) {
          await client.sendMessage(jid, { text: "🆔 Your sender ID: " + (msg.key.participant || msg.key.remoteJid) }, { quoted: msg });
        } else if ([".groupname", "groupname", ".members", "members", ".admins", "admins", ".link", "link"].includes(command)) {
          if (!jid.endsWith("@g.us")) {
            await client.sendMessage(jid, { text: "This command works inside a group." }, { quoted: msg });
          } else {
            const meta = await client.groupMetadata(jid);
            if ([".groupname", "groupname"].includes(command)) await client.sendMessage(jid, { text: "👥 Group name: " + meta.subject }, { quoted: msg });
            else if ([".members", "members"].includes(command)) await client.sendMessage(jid, { text: "👥 Members: " + meta.participants.length }, { quoted: msg });
            else if ([".admins", "admins"].includes(command)) {
              const admins = meta.participants.filter(p => p.admin).map(p => "• " + p.id);
              await client.sendMessage(jid, { text: "🛡️ Group admins:\n" + (admins.join("\n") || "No admins found") }, { quoted: msg });
            } else {
              const invite = await client.groupInviteCode(jid);
              await client.sendMessage(jid, { text: "🔗 Group invite: https://chat.whatsapp.com/" + invite }, { quoted: msg });
            }
          }
        } else if ([".quote", "quote"].includes(command)) {
          const quotes = [
            "Consistency makes an ordinary person extraordinary. — NIAZI-MD",
            "Dream big, stay humble, keep building. — NIAZI",
            "Your hard work today builds your name tomorrow. — NIAZI-MD"
          ];
          await client.sendMessage(jid, { text: "❝ " + quotes[Math.floor(Math.random() * quotes.length)] + " ❞" }, { quoted: msg });
        }
      } catch (err) {
        console.warn("Command failed for a connected session:", err.message || err);
      }
    }
  });
}

async function startUserSession(number, wantPairingCode) {
  let session = sessions.get(number);
  if (session && session.starting) {
    if (wantPairingCode && session.pairingCode) return session;
    throw new Error("A pairing request for this number is already running. Wait a moment and try again.");
  }
  if (session && session.status === "open") {
    if (wantPairingCode) throw new Error("This number is already connected. Use WhatsApp Linked Devices to manage it.");
    return session;
  }
  if (session && session.socket && session.status !== "closed") {
    if (wantPairingCode && session.pairingCode) return session;
    if (wantPairingCode) throw new Error("Pairing is already in progress. Use the code already shown.");
    return session;
  }

  const sessionDir = path.join(SESSION_ROOT, number);
  fs.mkdirSync(sessionDir, { recursive: true });
  const auth = await useMultiFileAuthState(sessionDir);
  if (wantPairingCode && auth.state.creds.registered) {
    throw new Error("This number already has a saved session. If you logged out, wait for the session to clear or contact the owner.");
  }

  session = {
    number,
    dir: sessionDir,
    socket: null,
    status: "connecting",
    starting: true,
    pairingCode: "",
    registered: Boolean(auth.state.creds.registered),
    lastError: "",
    pairTimer: null
  };
  sessions.set(number, session);

  const client = makeWASocket({
    auth: auth.state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["NIAZI-MD MINI", "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });
  session.socket = client;
  client.ev.on("creds.update", async () => {
    session.registered = Boolean(auth.state.creds.registered);
    try { await auth.saveCreds(); } catch (err) { session.lastError = "Could not save session."; }
  });
  client.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection) session.status = connection;
    if (connection === "open") {
      session.registered = true;
      session.starting = false;
      if (session.pairTimer) clearTimeout(session.pairTimer);
      session.pairTimer = null;
      session.pairingCode = "";
      console.log("WhatsApp session connected:", number);
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      session.status = "closed";
      session.starting = false;
      if (session.pairTimer) clearTimeout(session.pairTimer);
      session.pairTimer = null;
      if (code === DisconnectReason.loggedOut) {
        sessions.delete(number);
        setTimeout(() => fs.rm(sessionDir, { recursive: true, force: true }, () => {}), 1500);
        console.log("WhatsApp session logged out:", number);
      } else if (sessions.has(number)) {
        setTimeout(() => {
          const current = sessions.get(number);
          if (current === session) {
            sessions.delete(number);
            startUserSession(number, false).catch(err => console.warn("Reconnect failed:", err.message || err));
          }
        }, 3000);
      }
    }
  });
  attachCommands(client, number, session);
  session.starting = false;

  if (wantPairingCode && !session.registered) {
    await new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(readyTimer);
        client.ev.off("connection.update", onReady);
        err ? reject(err) : resolve();
      };
      const readyTimer = setTimeout(() => finish(new Error("WhatsApp connection was not ready for pairing. Try again.")), 30000);
      const onReady = async (update) => {
        if (update.qr && !session.registered && !session.pairingRequested) {
          session.pairingRequested = true;
          try {
            const code = await client.requestPairingCode(number);
            session.pairingCode = String(code || "").match(/.{1,4}/g)?.join("-") || String(code || "");
            finish();
          } catch (err) { finish(err); }
        }
        if (update.connection === "close" && !session.pairingCode) {
          finish(new Error("WhatsApp disconnected before the pairing code was ready."));
        }
      };
      client.ev.on("connection.update", onReady);
    });
    session.pairTimer = setTimeout(() => {
      const current = sessions.get(number);
      if (current === session && !session.registered) {
        try { client.end(new Error("Pairing timed out")); } catch (_) {}
        sessions.delete(number);
        fs.rm(sessionDir, { recursive: true, force: true }, () => {});
      }
    }, PAIR_TIMEOUT_MS);
  }
  return session;
}

app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/api/status", (_req, res) => {
  res.json({
    app: "NIAZI-MD MINI",
    connection: "online",
    mode: "public-multi-user-beta",
    activeUsers: activeCount(),
    connectedUsers: connectedCount(),
    maxUsers: MAX_USERS,
    uptime: formatUptime(Date.now() - startedAt)
  });
});
app.get("/api/qr", async (req, res) => {
  const ip = String(req.ip || req.socket.remoteAddress || "unknown");
  if (!checkRate(ip)) return res.status(429).json({ error: "Too many requests. Wait 10 minutes and try again." });
  if (activeCount() >= MAX_USERS) return res.status(503).json({ error: "Free beta is at capacity right now. Try again later." });
  const token = "qr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  const sessionDir = path.join(SESSION_ROOT, token);
  fs.mkdirSync(sessionDir, { recursive: true });
  try {
    const auth = await useMultiFileAuthState(sessionDir);
    const session = { number: "QR login", dir: sessionDir, socket: null, status: "connecting", starting: true, pairingCode: "", registered: Boolean(auth.state.creds.registered), lastError: "", pairTimer: null, qr: "" };
    sessions.set(token, session);
    const client = makeWASocket({
      auth: auth.state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["NIAZI-MD MINI", "Chrome", "1.0.0"],
      markOnlineOnConnect: false,
      syncFullHistory: false
    });
    session.socket = client;
    client.ev.on("creds.update", async () => {
      session.registered = Boolean(auth.state.creds.registered);
      try { await auth.saveCreds(); } catch (_) {}
    });
    attachCommands(client, "QR login", session);
    const qrData = await new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        client.ev.off("connection.update", onUpdate);
        err ? reject(err) : resolve(value);
      };
      const timer = setTimeout(() => finish(new Error("QR took too long to generate. Try again.")), 25000);
      const onUpdate = async ({ qr, connection, lastDisconnect }) => {
        if (qr) {
          session.qr = qr;
          try { finish(null, await QRCode.toDataURL(qr, { width: 320, margin: 2, errorCorrectionLevel: "M" })); }
          catch (err) { finish(err); }
        }
        if (connection === "open") {
          session.status = "open";
          session.starting = false;
          session.registered = true;
          const actual = String(auth.state.creds.me?.id || "").split("@")[0].split(":")[0].replace(/\D/g, "");
          if (actual.length >= 10 && actual.length <= 15) {
            const target = path.join(SESSION_ROOT, actual);
            try {
              if (sessionDir !== target && !fs.existsSync(target)) { fs.renameSync(sessionDir, target); session.dir = target; }
              sessions.delete(token);
              session.number = actual;
              sessions.set(actual, session);
            } catch (_) {}
          }
        }
        if (connection === "close") finish(new Error(lastDisconnect?.error?.message || "WhatsApp closed before QR was ready."));
      };
      client.ev.on("connection.update", onUpdate);
    });
    res.json({ qr: qrData, expiresIn: 45, message: "WhatsApp > Linked devices > Link a device, then scan this QR." });
  } catch (err) {
    sessions.delete(token);
    fs.rm(sessionDir, { recursive: true, force: true }, () => {});
    res.status(500).json({ error: err.message || "Could not create QR code. Try again." });
  }
});

app.post("/api/pair", async (req, res) => {
  const ip = String(req.ip || req.socket.remoteAddress || "unknown");
  if (!checkRate(ip)) return res.status(429).json({ error: "Too many pairing requests. Wait 10 minutes and try again." });
  const number = validNumber(req.body?.number);
  if (!number) return res.status(400).json({ error: "Enter a valid WhatsApp number with country code, digits only." });
  const last = numberCooldowns.get(number) || 0;
  if (Date.now() - last < NUMBER_COOLDOWN_MS) {
    return res.status(429).json({ error: "This number recently requested a code. Wait 3 minutes before trying again." });
  }
  if (sessions.has(number)) {
    const existing = sessions.get(number);
    if (existing.pairingCode) return res.json({ code: existing.pairingCode, message: "Use this code in WhatsApp Linked Devices." });
    if (existing.status === "open") return res.status(409).json({ error: "This number is already connected to the mini bot." });
    return res.status(409).json({ error: "A session for this number is already starting. Please wait and check again." });
  }
  if (activeCount() >= MAX_USERS) return res.status(503).json({ error: "Free beta is at capacity right now. Try again later." });
  numberCooldowns.set(number, Date.now());
  try {
    const session = await startUserSession(number, true);
    if (!session.pairingCode) return res.status(500).json({ error: "Pairing code was not generated. Wait a moment and try again." });
    res.json({ code: session.pairingCode, message: "WhatsApp > Linked devices > Link with phone number" });
  } catch (err) {
    sessions.delete(number);
    res.status(500).json({ error: "Pairing failed. Check the number and try again later." });
    console.warn("Pairing failed:", err.message || err);
  }
});
app.get("/health", (_req, res) => res.json({ ok: true, app: "NIAZI-MD MINI" }));

app.listen(PORT, async () => {
  console.log("NIAZI-MD MINI public beta listening on port " + PORT);
  try {
    const dirs = fs.readdirSync(SESSION_ROOT, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of dirs.slice(0, MAX_USERS)) {
      const number = validNumber(dir.name);
      if (!number) continue;
      const creds = path.join(SESSION_ROOT, number, "creds.json");
      if (fs.existsSync(creds)) {
        startUserSession(number, false).catch(err => console.warn("Saved session restore failed:", err.message || err));
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
  } catch (err) {
    console.warn("Could not restore saved sessions:", err.message || err);
  }
});
