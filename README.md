# ⚡ NIAZI-MD WhatsApp Bot

<div align="center">

# 𝙉𝙄𝘼𝙕𝙄〆𝙈𝘿

**RGB WhatsApp Pairing Panel · Node.js Bot · Mobile Friendly**

[![🚀 DEPLOY BOT ON RENDER](https://img.shields.io/badge/🚀_DEPLOY_BOT-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/deploy?repo=https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT)
[![📲 PAIR BOT PANEL SOURCE](https://img.shields.io/badge/📲_PAIR_BOT-Open_Panel_Source-00D9FF?style=for-the-badge&logo=whatsapp&logoColor=black)](https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT/blob/main/public/index.html)
[![💬 JOIN CHANNEL](https://img.shields.io/badge/💬_JOIN_CHANNEL-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VbByXON8KMqcY2Ilj53s)
[![👑 CONNECT OWNER](https://img.shields.io/badge/👑_CONNECT_OWNER-Chat_Now-FF4D9D?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/923220225993)
[![📦 SOURCE CODE](https://img.shields.io/badge/📦_SOURCE_CODE-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT)

</div>

> **Pair button note:** The Pair Bot button above opens the pairing panel's source file, not a live deployed service. After deploying, open your Render service URL to use the actual pairing form. A live Pair Bot button cannot be linked until the service URL exists.

## Included

- Premium mobile-friendly RGB/neon pairing website with the supplied NIAZI-MD image
- Pairing code form and status endpoint
- Join Channel, Connect Owner, GitHub and Render deployment links
- Best-effort attempt to follow the configured WhatsApp Channel after the WhatsApp connection opens
- Commands: `.menu`, `.help`, `.commands`, `.ping`, `.alive`, `.status`, `.uptime`, `.time`, `.date`, `.owner`, `.creator`, `.mian`, `.channel`, `.joinchannel`, `.repo`, `.github`, `.jid`, `.groupinfo`, `.say <text>`, `.quote`

## Deploy and pair

1. Tap **DEPLOY BOT ON RENDER** above.
2. Sign in to Render and create the service from this repository.
3. Wait for Render to finish deploying, then open the service's `onrender.com` URL.
4. Enter your WhatsApp number with country code in the pairing panel.
5. In WhatsApp, go to **Linked devices → Link a device → Link with phone number** and enter the code.

### Runtime settings

- Node.js 20+
- Build command: `npm install`
- Start command: `npm start`
- Optional environment variable: `OWNER_NUMBER=923220225993`
- Keep the `session/` directory on persistent storage. A paid Render plan may be required for a persistent disk.

## Important notes

This is a starter command set, not a restoration of every command from an older bot. The older bot source/ZIP or its full command list has not been provided in this repository, so those commands cannot be safely recreated yet. More commands can be merged when that source is available.

Auto-following the channel is best-effort and depends on current Baileys/WhatsApp support; the Join Channel button remains available if automatic following is not accepted. Pairing and deployment have not been live-tested with a WhatsApp account here. Unofficial WhatsApp clients can stop working when WhatsApp changes its service.
