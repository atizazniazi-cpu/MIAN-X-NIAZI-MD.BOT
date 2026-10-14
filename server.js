require("dotenv").config();
const express = require("express");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "923220225993").replace(/\D/g, "");
const CHANNEL_URL = "https://whatsapp.com/channel/0029VbByXON8KMqcY2Ilj53s";
const MENU_IMAGE = "https://user44863.na.imgto.link/public/20261013/c31e6b96cf6c7b73d7932779-17465.avif";
const REPO_URL = "https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT";
const CHANNEL_INVITE = "0029VbByXON8KMqcY2Ilj53s";
const startedAt = Date.now();
let channelFollowAttempted = false;
let sock;
let starting = false;
let connectionStatus = "disconnected";
let lastError = "";
let isRegistered = false;

const menuText = () => [
  "╭━━〔 ✦ N I A Z I - M D ✦ 〕━━╮",
  "│ ⚡ Premium WhatsApp Assistant",
  "│ 👑 Creator: NIAZI",
  "╰━━━━━━━━━━━━━━━━━━━━╯",
  "",
  "╭──〔 GENERAL COMMANDS 〕",
  "│ • .menu — All commands",
  "│ • .ping — Speed check",
  "│ • .alive — Bot status",
  "│ • .uptime — Running time",
  "│ • .time — Current time",
  "│ • .date — Current date",
  "│ • .owner — Contact owner",
  "│ • .creator — Creator details",
  "│ • .channel — Join channel",
  "│ • .repo — GitHub repository",
  "│ • .jid — Chat ID",
  "│ • .groupinfo — Group details",
  "│ • .say <text> — Repeat text",
  "│ • .quote — NIAZI-MD quote",
  "╰━━━━━━━━━━━━━━━━━━━━╯",
  "",
  "╭──〔 QUICK LINKS 〕",
  "│ 📢 Channel: " + CHANNEL_URL,
  "│ 👑 Owner: https://wa.me/" + OWNER_NUMBER,
  "│ 💻 GitHub: " + REPO_URL,
  "╰━━━━━━━━━━━━━━━━━━━━╯",
  "",
  "MADE WITH ⚡ BY NIAZI-MD"
].join("\n");

async function tryFollowChannel(client) {
  if (channelFollowAttempted) return;
  channelFollowAttempted = true;
  try {
    if (typeof client.newsletterMetadata === "function" && typeof client.newsletterFollow === "function") {
      const metadata = await client.newsletterMetadata("invite", CHANNEL_INVITE);
      if (metadata && metadata.id) await client.newsletterFollow(metadata.id);
    }
  } catch (err) {
    lastError = "Auto-follow channel was not confirmed: " + (err.message || String(err));
    console.warn(lastError);
  }
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d ? d + "d" : "", h ? h + "h" : "", m ? m + "m" : "", sec + "s"].filter(Boolean).join(" ");
}

async function startBot() {
  if (starting || (sock && connectionStatus === "open")) return sock;
  starting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "session"));
    isRegistered = Boolean(state.creds.registered);
    sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["NIAZI-MD", "Chrome", "1.0.0"]
    });
    sock.ev.on("creds.update", async () => { isRegistered = Boolean(state.creds.registered); await saveCreds(); });
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection) connectionStatus = connection;
      if (connection === "open") { lastError = ""; await tryFollowChannel(sock); }
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        connectionStatus = "disconnected";
        sock = undefined;
        channelFollowAttempted = false;
        if (code !== DisconnectReason.loggedOut) {
          setTimeout(() => startBot().catch(err => { lastError = err.message; }), 3000);
        } else {
          lastError = "WhatsApp logged out. Remove the session folder and pair again.";
        }
      }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === "status@broadcast") continue;
        const jid = msg.key.remoteJid;
        const body = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption || "";
        const raw = body.trim();
        const command = raw.toLowerCase().split(/\s+/)[0];
        try {
          const arg = raw.slice(raw.indexOf(" ") + 1).trim();
          if ([".ping", "ping"].includes(command)) {
            await sock.sendMessage(jid, { text: "╭━━〔 NIAZI-MD 〕━━╮\n│ 🟢 Pong! Bot online\n│ ⚡ Status: Connected\n╰━━━━━━━━━━━━━━╯" }, { quoted: msg });
          } else if ([".menu", "menu", ".help", "help", ".commands"].includes(command)) {
            await sock.sendMessage(jid, { image: { url: MENU_IMAGE }, caption: menuText() }, { quoted: msg });
          } else if ([".alive", "alive", ".status"].includes(command)) {
            await sock.sendMessage(jid, { text: "╭━━〔 NIAZI-MD STATUS 〕━━╮\n│ 🟢 Bot: Online\n│ 🔗 WhatsApp: " + connectionStatus + "\n│ ⏱️ Uptime: " + formatUptime(Date.now() - startedAt) + "\n│ 👑 Creator: NIAZI\n╰━━━━━━━━━━━━━━━━━━╯\n\n📢 Join Channel: " + CHANNEL_URL }, { quoted: msg });
          } else if ([".uptime", "uptime"].includes(command)) {
            await sock.sendMessage(jid, { text: "⏱️ NIAZI-MD uptime: " + formatUptime(Date.now() - startedAt) }, { quoted: msg });
          } else if ([".owner", "owner"].includes(command)) {
            await sock.sendMessage(jid, { text: "╭━━〔 CONNECT OWNER 〕━━╮\n👑 NIAZI-MD Owner\nhttps://wa.me/" + OWNER_NUMBER + "\n╰━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg });
          } else if ([".creator", "creator", ".mian"].includes(command)) {
            await sock.sendMessage(jid, { text: "⚡ Created with pride by NIAZI.\nBot: NIAZI-MD\nGitHub: " + REPO_URL }, { quoted: msg });
          } else if ([".channel", "channel", ".joinchannel"].includes(command)) {
            await sock.sendMessage(jid, { text: "📢 Follow the official NIAZI-MD WhatsApp Channel:\n" + CHANNEL_URL }, { quoted: msg });
          } else if ([".repo", "repo", ".github"].includes(command)) {
            await sock.sendMessage(jid, { text: "💻 NIAZI-MD GitHub Repository:\n" + REPO_URL }, { quoted: msg });
          } else if ([".time", "time"].includes(command)) {
            await sock.sendMessage(jid, { text: "🕒 Current server time: " + new Date().toLocaleTimeString("en-PK", { timeZone: process.env.TIME_ZONE || "Asia/Karachi" }) }, { quoted: msg });
          } else if ([".date", "date"].includes(command)) {
            await sock.sendMessage(jid, { text: "📅 Date: " + new Date().toLocaleDateString("en-PK", { timeZone: process.env.TIME_ZONE || "Asia/Karachi", dateStyle: "full" }) }, { quoted: msg });
          } else if ([".jid", "jid"].includes(command)) {
            await sock.sendMessage(jid, { text: "🆔 Chat JID:\n" + jid }, { quoted: msg });
          } else if ([".groupinfo", "groupinfo"].includes(command)) {
            if (!jid.endsWith("@g.us")) await sock.sendMessage(jid, { text: "This command works inside a group." }, { quoted: msg });
            else { const meta = await sock.groupMetadata(jid); await sock.sendMessage(jid, { text: "╭━━〔 GROUP INFO 〕━━╮\n│ Name: " + meta.subject + "\n│ Members: " + meta.participants.length + "\n│ Group ID: " + jid + "\n╰━━━━━━━━━━━━━━━━╯" }, { quoted: msg }); }
          } else if ([".say", "say"].includes(command)) {
            if (!arg) await sock.sendMessage(jid, { text: "Usage: .say your message" }, { quoted: msg });
            else await sock.sendMessage(jid, { text: arg.slice(0, 1500) }, { quoted: msg });
          } else if ([".quote", "quote"].includes(command)) {
            const quotes = ["Consistency makes an ordinary person extraordinary. — NIAZI-MD", "Dream big, stay humble, keep building. — NIAZI", "Your hard work today builds your name tomorrow. — NIAZI-MD"];
            await sock.sendMessage(jid, { text: "❝ " + quotes[Math.floor(Math.random() * quotes.length)] + " ❞" }, { quoted: msg });
          }
        } catch (err) {
          lastError = err.message;
        }
      }
    });
    return sock;
  } finally {
    starting = false;
  }
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/status", (_req, res) => {
  res.json({ app: "NIAZI-MD", connection: connectionStatus, lastError: lastError || undefined });
});

app.post("/api/pair", async (req, res) => {
  const number = String(req.body?.number || "").replace(/\D/g, "");
  if (number.length < 10 || number.length > 15) return res.status(400).json({ error: "Enter a valid phone number with country code." });
  try {
    const client = await startBot();
    if (isRegistered) return res.status(409).json({ error: "A WhatsApp session is already registered on this server." });
    await new Promise(resolve => setTimeout(resolve, 1200));
    const code = await client.requestPairingCode(number);
    res.json({ code: code?.match(/.{1,4}/g)?.join("-") || code });
  } catch (err) {
    lastError = err.message || String(err);
    res.status(500).json({ error: "Pairing failed: " + lastError });
  }
});

app.listen(PORT, () => {
  console.log("NIAZI-MD panel listening on " + PORT);
  if (fs.existsSync(path.join(__dirname, "session", "creds.json"))) {
    startBot().catch(err => { lastError = err.message || String(err); });
  }
});const menuText = () => [
  "╭━━〔 ✦ N I A Z I - M D ✦ 〕━━╮",
  "│ ⚡ Premium WhatsApp Assistant",
  "│ 👑 Creator: NIAZI",
  "╰━━━━━━━━━━━━━━━━━━━━╯",
  "",
  "╭──〔 GENERAL COMMANDS 〕",
  "│ • .menu — All commands",
  "│ • .ping — Speed check",
  "│ • .alive — Bot status",
  "│ • .uptime — Running time",
  "│ • .time — Current time",
  "│ • .date — Current date",
  "│ • .owner — Contact owner",
  "│ • .creator — Creator details",
  "│ • .channel — Join channel",
  "│ • .repo — GitHub repository",
  "│ • .jid — Chat ID",
  "│ • .groupinfo — Group details",
  "│ • .say <text> — Repeat text",
  "│ • .quote — NIAZI-MD quote",
  "╰━━━━━━━━━━━━━━━━━━━━╯",
  "",
  "╭──〔 QUICK LINKS 〕",
  "│ 📢 Channel: " + CHANNEL_URL,
  "│ 👑 Owner: https://wa.me/" + OWNER_NUMBER,
  "│ 💻 GitHub: " + REPO_URL,
  "╰━━━━━━━━━━━━━━━━━━━━╯",
  "",
  "MADE WITH ⚡ BY NIAZI-MD"
].join("\n");

async function tryFollowChannel(client) {
  if (channelFollowAttempted) return;
  channelFollowAttempted = true;
  try {
    if (typeof client.newsletterMetadata === "function" && typeof client.newsletterFollow === "function") {
      const metadata = await client.newsletterMetadata("invite", CHANNEL_INVITE);
      if (metadata && metadata.id) await client.newsletterFollow(metadata.id);
    }
  } catch (err) {
    lastError = "Auto-follow channel was not confirmed: " + (err.message || String(err));
    console.warn(lastError);
  }
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [d ? d + "d" : "", h ? h + "h" : "", m ? m + "m" : "", sec + "s"].filter(Boolean).join(" ");
}

async function startBot() {
  if (starting || (sock && connectionStatus === "open")) return sock;
  starting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "session"));
    isRegistered = Boolean(state.creds.registered);
    sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["NIAZI-MD", "Chrome", "1.0.0"]
    });
    sock.ev.on("creds.update", async () => { isRegistered = Boolean(state.creds.registered); await saveCreds(); });
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection) connectionStatus = connection;
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        connectionStatus = "disconnected";
        sock = undefined;
        if (code !== DisconnectReason.loggedOut) {
          setTimeout(() => startBot().catch(err => { lastError = err.message; }), 3000);
        } else {
          lastError = "WhatsApp logged out. Remove the session folder and pair again.";
        }
      }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === "status@broadcast") continue;
        const jid = msg.key.remoteJid;
        const body = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption || "";
        const command = body.trim().toLowerCase();
        try {
          if (command === ".ping" || command === "ping") {
            await sock.sendMessage(jid, { text: "Pong! 🟢 NIAZI-MD is online." }, { quoted: msg });
          } else if (command === ".menu" || command === "menu") {
            await sock.sendMessage(jid, {
              image: { url: MENU_IMAGE },
              caption: "╭━━〔 NIAZI-MD 〕━━╮\n│ • .ping — Check bot status\n│ • .menu — Show commands\n│ • .owner — Contact owner\n│ • .channel — Join our channel\n╰━━━━━━━━━━━━━━╯\n\nMade by NIAZI-MD"
            }, { quoted: msg });
          } else if (command === ".owner" || command === "owner") {
            await sock.sendMessage(jid, { text: "Connect Owner: https://wa.me/" + OWNER_NUMBER });
          } else if (command === ".channel" || command === "channel") {
            await sock.sendMessage(jid, { text: "Follow the NIAZI-MD channel:\n" + CHANNEL_URL });
          }
        } catch (err) {
          lastError = err.message;
        }
      }
    });
    return sock;
  } finally {
    starting = false;
  }
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NIAZI-MD Pairing</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#07090d;color:#f3f6fb;font-family:Arial,sans-serif;display:grid;place-items:center;padding:18px}
.card{width:min(100%,440px);background:#10151d;border:1px solid #253243;border-radius:20px;padding:24px;box-shadow:0 0 35px #00e5ff14}
img{width:100%;max-height:180px;object-fit:cover;border-radius:14px}h1{letter-spacing:2px;color:#00e5ff;text-align:center;margin-bottom:6px}p{text-align:center;color:#b6c2d1;line-height:1.5}
input,button{width:100%;padding:14px;border-radius:10px;font-size:16px;margin-top:10px}input{background:#080c12;color:white;border:1px solid #334155}button{border:0;background:#00d5e8;color:#001015;font-weight:bold}
.links{display:flex;gap:10px;margin-top:12px}.links a{flex:1;text-align:center;padding:12px 6px;border-radius:10px;background:#1d2938;color:#f3f6fb;text-decoration:none;font-size:14px}
#result{word-break:break-word;color:#6fffd2;font-weight:bold;text-align:center;margin-top:15px}
small{display:block;color:#93a4b8;text-align:center;margin-top:16px}
</style></head><body><main class="card"><img src="${MENU_IMAGE}" alt="NIAZI-MD"><h1>NIAZI-MD</h1><p>WhatsApp Pairing Panel<br>Enter your WhatsApp number with country code.</p>
<form id="form"><input id="number" inputmode="numeric" placeholder="e.g. 923001234567" required><button id="submit" type="submit">GENERATE PAIRING CODE</button></form>
<div id="result" role="status"></div><div class="links"><a href="${CHANNEL_URL}" target="_blank" rel="noreferrer">Join Channel</a><a href="https://wa.me/${OWNER_NUMBER}" target="_blank" rel="noreferrer">Connect Owner</a></div>
<small>Keep your pairing code private. Never share it with anyone.</small></main>
<script>
document.getElementById('form').addEventListener('submit',async e=>{e.preventDefault();const n=document.getElementById('number').value.replace(/\\D/g,'');const b=document.getElementById('submit');const r=document.getElementById('result');if(n.length<10||n.length>15){r.textContent='Enter a valid number with country code.';return}b.disabled=true;b.textContent='CONNECTING...';r.textContent='Requesting code from WhatsApp…';try{const x=await fetch('/api/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number:n})});const d=await x.json();r.textContent=d.code?'Your pairing code: '+d.code:(d.error||'Could not generate code. Try again.')}catch(_){r.textContent='Server error. Please try again.'}finally{b.disabled=false;b.textContent='GENERATE PAIRING CODE'}});
</script></body></html>`);
});

app.get("/api/status", (_req, res) => {
  res.json({ app: "NIAZI-MD", connection: connectionStatus, lastError: lastError || undefined });
});

app.post("/api/pair", async (req, res) => {
  const number = String(req.body?.number || "").replace(/\D/g, "");
  if (number.length < 10 || number.length > 15) return res.status(400).json({ error: "Enter a valid phone number with country code." });
  try {
    const client = await startBot();
    if (isRegistered) return res.status(409).json({ error: "A WhatsApp session is already registered on this server." });
    await new Promise(resolve => setTimeout(resolve, 1200));
    const code = await client.requestPairingCode(number);
    res.json({ code: code?.match(/.{1,4}/g)?.join("-") || code });
  } catch (err) {
    lastError = err.message || String(err);
    res.status(500).json({ error: "Pairing failed: " + lastError });
  }
});

app.listen(PORT, () => {
  console.log("NIAZI-MD panel listening on " + PORT);
  if (fs.existsSync(path.join(__dirname, "session", "creds.json"))) {
    startBot().catch(err => { lastError = err.message || String(err); });
  }
});
