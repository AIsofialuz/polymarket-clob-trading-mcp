# Polymarket CLOB Trading MCP

An agentic MCP server for trading on [Polymarket](https://polymarket.com) — the world's largest prediction market.

## Features

- **Trade** — buy/sell on Polymarket CLOB with Kelly Criterion sizing
- **Analyze** — order book imbalance + confidence-weighted signal (BUY / SELL / HOLD)
- **Search** — keyword search across all open markets
- **Wallet info** — address, POL balance, trading limits
- **Auto API keys** — generates CLOB L2 credentials from your wallet on first run

## Requirements

- Node.js 18+
- A Polygon wallet with a private key

---

## Setup

### Step 1 — Install

```bash
openclaw skills install polymarket-clob-trading-mcp
cd skills/polymarket-clob-trading-mcp
npm install
```

### Step 2 — Configure

```bash
cp .env.example .env
```

Open `.env` and set your private key:

```
PRIVATE_KEY=your_polygon_wallet_private_key
```

Everything else (RPC endpoint, CLOB API keys) is auto-configured on first boot.

### Step 3 — Add to Claude

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

Or via Claude Code CLI:

```bash
claude mcp add --scope user polymarket-trading -- node /path/to/node_modules/tsx/dist/cli.mjs /path/to/trading-server.ts
```

---

## Running as a Persistent Service (Autonomous / Agent Use)

For machines running automated agents, the server must stay alive continuously — not just when Claude is open.

### Using PM2 (recommended)

```bash
npm install -g pm2
pm2 start node_modules/tsx/dist/cli.mjs --name polymarket-mcp -- trading-server.ts
pm2 save
pm2 startup
```

This keeps the server running on boot and auto-restarts on crash.

### Using a system service (Linux)

Create `/etc/systemd/system/polymarket-mcp.service`:

```ini
[Unit]
Description=Polymarket Trading MCP
After=network.target

[Service]
WorkingDirectory=/path/to/polymarket-clob-trading-mcp
ExecStart=node node_modules/tsx/dist/cli.mjs trading-server.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
systemctl enable polymarket-mcp
systemctl start polymarket-mcp
```

---

## Tools

| Tool | Description |
|------|-------------|
| `trade` | Execute buy/sell orders |
| `analyze_market` | Get BUY/SELL/HOLD signal with Kelly sizing |
| `search_markets` | Search open markets by keyword |
| `wallet_info` | View balance and trading limits |
| `push_alert` | Push a manual alert to the notification channel |
| `setup_api_keys` | Generate CLOB L2 credentials |
