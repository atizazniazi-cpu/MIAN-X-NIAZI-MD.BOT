# ⚡ NIAZI-MD Public MINI Bot

<div align="center">

# 𝙉𝙄𝘼𝙕𝙄〆𝙈𝘿

**Public multi-user WhatsApp pairing panel · Free beta test · Node.js**

[![🚀 DEPLOY MINI BOT](https://img.shields.io/badge/🚀_DEPLOY_MINI_BOT-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/deploy?repo=https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT/tree/mini-public-beta)
[![📢 JOIN CHANNEL](https://img.shields.io/badge/📢_JOIN_CHANNEL-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VbByXON8KMqcY2Ilj53s)
[![👑 CONNECT OWNER](https://img.shields.io/badge/👑_CONNECT_OWNER-Chat_Now-FF4D9D?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/923220225993)

</div>

## Public beta features

- Separate WhatsApp session folder for each phone number
- Public pairing-code panel with request throttling
- Starter commands: `.menu`, `.help`, `.commands`, `.ping`, `.alive`, `.status`, `.uptime`, `.time`, `.date`, `.owner`, `.creator`, `.mian`, `.channel`, `.joinchannel`, `.repo`, `.github`, `.jid`, `.groupinfo`, `.say <text>`, `.quote`
- Session restore on restart when saved storage is available
- Free Render service configuration for initial testing

## Free test deploy

1. Open the Render deploy button above and choose the `mini-public-beta` branch.
2. Review the service configuration and create the free web service.
3. Wait for the deploy to finish and open its `onrender.com` URL.
4. Enter a WhatsApp number with country code, e.g. digits only: `923001234567`.
5. On that phone, open WhatsApp → Linked devices → Link a device → Link with phone number, then enter the code.
6. Send `.ping` or `.menu` to the connected WhatsApp account to test commands.

## Free-hosting limitations

- This branch uses Render's free plan for testing and has **no persistent disk configured**. Sessions can be lost when the service sleeps, restarts, or redeploys. Do not use it for important accounts until persistence has been verified.
- The public beta is capped at `MAX_USERS=8` concurrent sessions by default; free hosting resources may not support the full limit. Reduce it if the service becomes unstable.
- Pairing requests are rate-limited, but a public pairing panel can still be abused. Monitor it and disable the service if suspicious traffic appears.
- Baileys is an unofficial WhatsApp Web client. WhatsApp changes may break it or restrict linked accounts; use at your own risk and do not use it for spam.
- Never share pairing codes or session files. This beta does not yet include a user login/account dashboard or a self-service session delete button.

## Environment variables

- `OWNER_NUMBER=923220225993`
- `MAX_USERS=8` (allowed range 1–30; free beta default is 8)
- `SESSION_DIR=sessions` (optional; use persistent storage path on a host that supports it)

## Local commands

- Build/install: `npm install`
- Start: `npm start`

## Status

Code has been committed to the `mini-public-beta` branch. Live WhatsApp pairing and message replies still need to be tested on the deployed host; do not treat the service as working until the pairing, reconnect, and `.ping` checks pass.
