# ⚡ NIAZI-MD Public MINI Bot

<div align="center">

[![NIAZI-MD Menu Image](https://user44863.na.imgto.link/public/20261013/c31e6b96cf6c7b73d7932779-17465.avif)](https://postimg.cc/WdqjqHyj)

[🖼️ Open the image you provided on Postimages](https://postimg.cc/WdqjqHyj)

# 𝙉𝙄𝘼𝙕𝙄〆𝙈𝘿

**Public multi-user WhatsApp pairing panel · Free beta test · Node.js**

[![🚀 DEPLOY ON RENDER](https://img.shields.io/badge/🚀_DEPLOY-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://dashboard.render.com/blueprint/new?repo=https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT)
[![🟣 DEPLOY ON HEROKU](https://img.shields.io/badge/🟣_DEPLOY-Heroku-79589F?style=for-the-badge&logo=heroku&logoColor=white)](https://heroku.com/deploy?template=https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT&ref=mini-public-beta)
[![🔗 PAIR BOT](https://img.shields.io/badge/🔗_PAIR-Bot-00C7D9?style=for-the-badge)](https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT/tree/mini-public-beta)
[![📢 JOIN CHANNEL](https://img.shields.io/badge/📢_JOIN_CHANNEL-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VbByXON8KMqcY2Ilj53s)
[![👑 CONNECT OWNER](https://img.shields.io/badge/👑_CONNECT_OWNER-Chat_Now-FF4D9D?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/923220225993)

</div>

## Public beta features

- Separate WhatsApp session folder for each phone number
- Public pairing-code panel with request throttling
- Commands: `.menu`, `.help`, `.commands`, `.ping`, `.alive`, `.status`, `.uptime`, `.time`, `.date`, `.owner`, `.creator`, `.mian`, `.channel`, `.joinchannel`, `.repo`, `.github`, `.jid`, `.groupinfo`, `.groupname`, `.members`, `.admins`, `.link`, `.whoami`, `.say <text>`, `.upper`, `.lower`, `.reverse`, `.count`, `.wordcount`, `.calc`, `.choose`, `.dice`, `.coin`, `.8ball`, `.joke`, `.fact`, `.love`, `.motivate`, `.quote`
- Session restore on restart when saved storage is available
- Free Render service configuration for initial testing

## Free test deploy

1. Open the Render deploy button above and choose the `mini-public-beta` branch.
2. The Heroku button is also included, but Heroku no longer provides free dynos; it may ask for a paid plan.
3. On the website, press **PAIR MY WHATSAPP** first; the number field then appears.
4. Review the service configuration and create the free web service.
5. Wait for the deploy to finish and open its `onrender.com` URL.
6. Press **PAIR MY WHATSAPP**, enter a number with country code (digits only, e.g. `923001234567`), then request the code.
7. On that phone, open WhatsApp → Linked devices → Link a device → Link with phone number, then enter the code.
8. Send `.ping` or `.menu` to the connected WhatsApp account to test commands.

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


## Provided image

The image link you shared is included and clickable above: [https://postimg.cc/WdqjqHyj](https://postimg.cc/WdqjqHyj). Postimages provides a separate direct-image URL; until that direct URL is available, the README uses the already-working NIAZI-MD banner as the preview and links it to your provided image page.
