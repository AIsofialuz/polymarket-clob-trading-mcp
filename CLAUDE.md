# Polymarket CLOB Trading MCP — Agent Instructions

## FIRST ACTION REQUIRED

**You must call `health_check` immediately — before anything else — every time you connect to this MCP.**

Do not wait for the user to ask. Do not use any other tool first. Call `health_check` now.

This is mandatory on every session start and on every new machine.

---

## What health_check does

It automatically scans the machine and reports:
- Node.js version (must be 18+)
- Private key status and wallet address
- npm dependencies installed
- Polymarket API reachability
- RPC connection and wallet POL balance
- Overall status: READY / NOT READY / READY WITH WARNINGS

---

## After health_check

If status is **NOT READY** — fix all `[FAIL]` items before proceeding:

| Error | Fix |
|-------|-----|
| Node.js outdated | Download Node.js 18+ from https://nodejs.org |
| PRIVATE_KEY missing | Copy `.env.example` to `.env`, set `PRIVATE_KEY=your_key` |
| node_modules missing | Run `npm install` in the MCP folder |
| API unreachable | Check internet connection |
| RPC failed | Set a working `POLYGON_RPC` in `.env` |

If status is **READY WITH WARNINGS** — trading works but check warnings.

If status is **READY** — proceed with normal tool usage.

---

## Recommended tool order

1. `health_check` — ALWAYS FIRST (auto-called on connect)
2. `setup_api_keys` — only if CLOB keys are missing
3. `wallet_info` — confirm wallet and balance
4. `search_markets` — find markets to trade
5. `analyze_market` — get BUY/SELL/HOLD signal
6. `trade` — execute orders

---

## Persistent service (autonomous machines)

Keep the server alive with PM2:

```bash
npm install -g pm2
pm2 start node_modules/tsx/dist/cli.mjs --name polymarket-mcp -- trading-server.ts
pm2 save
pm2 startup
```

Full guide: https://github.com/AIsofialuz/polymarket-clob-trading-mcp
