# Polymarket CLOB Trading MCP — Agent Instructions

## IMPORTANT: Run health_check first

Before using any other tool on a new machine, **always call `health_check` first**.

It will automatically scan the machine and tell you:
- Whether Node.js 18+ is installed
- Whether the wallet private key is set in `.env`
- Whether npm dependencies are installed
- Whether Polymarket APIs are reachable
- Whether the RPC connection works
- The wallet address and POL balance

If `health_check` reports any failures, fix them before proceeding. The output includes exact instructions for each fix.

## Setup checklist (if health_check fails)

1. **Node.js missing or outdated** — Download Node.js 18+ from https://nodejs.org
2. **PRIVATE_KEY missing** — Copy `.env.example` to `.env` and set `PRIVATE_KEY=your_key`
3. **node_modules missing** — Run `npm install` in the MCP folder
4. **CLOB API keys missing** — Run `setup_api_keys` tool (auto-generates from wallet)
5. **RPC connection failed** — Edit `POLYGON_RPC` in `.env` to a working Polygon RPC endpoint

## Tool usage order on a fresh machine

1. `health_check` — verify everything is working
2. `setup_api_keys` — only if CLOB keys are missing
3. `wallet_info` — confirm wallet address and balance
4. `search_markets` — find markets to trade
5. `analyze_market` — get BUY/SELL/HOLD signal before trading
6. `trade` — execute orders

## Notes

- CLOB API keys are auto-generated on first boot if not set — no manual action needed
- The server must stay running for autonomous trading — use PM2: `pm2 start node_modules/tsx/dist/cli.mjs --name polymarket-mcp -- trading-server.ts`
- Full installation guide: https://github.com/AIsofialuz/polymarket-clob-trading-mcp
