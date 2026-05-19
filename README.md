# Polymarket CLOB Trading MCP

An agentic MCP server for trading on [Polymarket](https://polymarket.com) — the world's largest prediction market.

> **Full install guide also available at:** https://github.com/AIsofialuz/polymarket-clob-trading-mcp

---

## Features

- **Trade** — buy/sell on Polymarket CLOB with Kelly Criterion sizing
- **Analyze** — order book imbalance + confidence-weighted signal (BUY / SELL / HOLD)
- **Search** — keyword search across all open markets
- **Wallet info** — address, POL balance, trading limits
- **Auto API keys** — generates CLOB L2 credentials from your wallet on first run
- **Health check** — scans your machine and verifies everything is correctly set up

---

## Requirements

- Node.js 18+
- A Polygon wallet private key (with USDC for trading)

---

## Installation

### Step 1 — Install the skill

```bash
openclaw skills install polymarket-clob-trading-mcp
cd skills/polymarket-clob-trading-mcp
npm install
```

### Step 2 — Configure your wallet

```bash
cp .env.example .env
```

Open `.env` and set your private key:

```
PRIVATE_KEY=your_polygon_wallet_private_key_here
```

Everything else (RPC endpoint, CLOB API keys) is auto-configured on first boot.

### Step 3 — Add to Claude

**Option A — Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "polymarket-trading": {
      "command": "node",
      "args": ["node_modules/tsx/dist/cli.mjs", "trading-server.ts"],
      "cwd": "/path/to/skills/polymarket-clob-trading-mcp"
    }
  }
}
```

**Option B — Claude Code CLI:**

```bash
claude mcp add --scope user polymarket-trading -- node /path/to/skills/polymarket-clob-trading-mcp/node_modules/tsx/dist/cli.mjs /path/to/skills/polymarket-clob-trading-mcp/trading-server.ts
```

### Step 4 — Run health_check

On every new machine, ask Claude to run the `health_check` tool first:

> "Run health_check on the polymarket trading MCP"

It will scan your machine and report:
- Node.js version
- Private key status and wallet address
- npm dependencies
- Polymarket API connectivity
- RPC connection and wallet balance

If anything is wrong it tells you exactly how to fix it.

---

## Running as a Persistent Service

For autonomous machines that must run 24/7 without Claude being open.

### PM2 (recommended — works on Windows, Mac, Linux)

```bash
npm install -g pm2
pm2 start node_modules/tsx/dist/cli.mjs --name polymarket-mcp -- trading-server.ts
pm2 save
pm2 startup
```

This keeps the server alive on boot and auto-restarts on crash.

### systemd (Linux only)

Create `/etc/systemd/system/polymarket-mcp.service`:

```ini
[Unit]
Description=Polymarket CLOB Trading MCP
After=network.target

[Service]
WorkingDirectory=/path/to/skills/polymarket-clob-trading-mcp
ExecStart=node node_modules/tsx/dist/cli.mjs trading-server.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
systemctl enable polymarket-mcp
systemctl start polymarket-mcp
```

---

## Tools

| Tool | Description |
|------|-------------|
| `health_check` | Scan machine — verify Node.js, wallet key, dependencies, API connectivity |
| `trade` | Execute a buy or sell order |
| `analyze_market` | BUY/SELL/HOLD signal with Kelly Criterion position sizing |
| `search_markets` | Search open markets by keyword |
| `wallet_info` | Wallet address, POL balance, and trading limits |
| `push_alert` | Push a manual alert to the notification channel |
| `setup_api_keys` | Generate Polymarket CLOB L2 API credentials |

> **Always run `health_check` first on any new machine.**

---

## Recommended Tool Order (fresh machine)

1. `health_check` — verify everything works
2. `setup_api_keys` — only if CLOB keys are missing
3. `wallet_info` — confirm wallet and balance
4. `search_markets` — find markets
5. `analyze_market` — get signal before trading
6. `trade` — execute orders

---

## Prediction Engine

1. **Order book imbalance** — nudges probability estimate from bid/ask depth ratio
2. **Confidence score** — built from depth balance, spread tightness, 24h volume
3. **Kelly Criterion** — quarter-Kelly position sizing scaled by confidence
4. **Risk score** — penalises low liquidity, wide spreads, low confidence

---

## Troubleshooting

**`PRIVATE_KEY missing or invalid`**
Run `health_check` — it will pinpoint the issue. Make sure `.env` exists and has your real private key.

**`CLOB API keys not found`**
Run `setup_api_keys` — keys are auto-generated from your wallet and saved to `.env`.

**`node_modules missing`**
Run `npm install` inside the skill folder.

**Server not connecting to Claude**
Verify the `cwd` path in your MCP config points to the correct install folder.

**PM2 not starting on boot**
Run `pm2 startup`, follow the command it outputs, then run `pm2 save`.

**Still stuck?**
Full guide always available at: https://github.com/AIsofialuz/polymarket-clob-trading-mcp
