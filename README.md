# NIAZI-MD WhatsApp Bot

A starter Node.js WhatsApp pairing panel for the NIAZI-MD project.

## Deploy

- Use a persistent Node.js host that supports long-running processes and WebSocket connections.
- Use Node.js 20 or newer.
- Install/start commands: `npm install` and `npm start`.
- Optional environment variable: `OWNER_NUMBER=923220225993`.
- Persistent storage is required for the `session/` directory. Never share session files.

## Pairing

Open the deployed site, enter your WhatsApp number with country code (digits only), then enter the generated code in WhatsApp under **Linked devices → Link a device → Link with phone number**.

Keep pairing codes and session credentials private. If WhatsApp logs out, remove the old session directory from persistent storage before pairing again.

## Included starter commands

- `.ping`
- `.menu`
- `.owner`
- `.channel`

This is a starter, not a complete restoration of a previous NIAZI-MD/IMMU-MD command collection. Existing commands require the original bot source or ZIP to be merged in. WhatsApp may change or restrict unofficial client connections; pairing is not guaranteed, and this code has not been live-tested against a WhatsApp account here.
