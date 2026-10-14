# ⚡ NIAZI-MD WhatsApp Bot

A NIAZI-branded WhatsApp pairing panel and Node.js bot starter.

## Included

- Premium mobile-friendly RGB/neon pairing website with the supplied NIAZI-MD image
- Pairing code form and status endpoint
- Join Channel, Connect Owner, GitHub and Render deployment links
- Best-effort attempt to follow the configured WhatsApp Channel after the WhatsApp connection opens
- Commands: `.menu`, `.help`, `.commands`, `.ping`, `.alive`, `.status`, `.uptime`, `.time`, `.date`, `.owner`, `.creator`, `.mian`, `.channel`, `.joinchannel`, `.repo`, `.github`, `.jid`, `.groupinfo`, `.say <text>`, `.quote`

## Links

- WhatsApp Channel: https://whatsapp.com/channel/0029VbByXON8KMqcY2Ilj53s
- Owner: https://wa.me/923220225993
- GitHub: https://github.com/atizazniazi-cpu/MIAN-X-NIAZI-MD.BOT

## Deploy

Use the **Deploy Bot** button on the website or create a Render Blueprint from this repository. The included `render.yaml` configures a persistent session disk; a paid Render plan may be required for persistent disks.

- Node.js 20+
- Build command: `npm install`
- Start command: `npm start`
- Optional environment variable: `OWNER_NUMBER=923220225993`
- Keep the `session/` directory on persistent storage. Never publish or share its credentials.

After deployment, open the service URL and enter the WhatsApp number with country code. Then, on WhatsApp, go to **Linked devices → Link a device → Link with phone number** and enter the code.

## Important notes

This is a starter command set, not a restoration of every command from an older bot. The older bot source/ZIP or its full command list has not been provided in this repository, so those commands cannot be safely recreated yet. More commands can be merged when that source is available.

Auto-following the channel is best-effort and depends on the current Baileys/WhatsApp support; the Join Channel link is always available if automatic following is not accepted. Pairing and deployment have not been live-tested with a WhatsApp account here. Unofficial WhatsApp clients can stop working when WhatsApp changes its service.
