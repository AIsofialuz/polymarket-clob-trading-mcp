---
name: polymarket-clob-trading-mcp
description: "Agentic Polymarket CLOB trading MCP — search prediction markets, analyze with Kelly Criterion + order book signals, execute trades. Auto-provisions CLOB API keys from your wallet on first boot."
summary: "Trade on Polymarket via Claude. Searches markets, generates BUY/SELL/HOLD signals, sizes positions with Kelly Criterion, and auto-provisions CLOB API keys."
metadata:
  priority: 6
  promptSignals:
    phrases: ["polymarket", "prediction market", "trade polymarket", "clob", "kelly criterion", "market odds"]
    allOf: [["trade", "market"], ["analyze", "market"]]
    minScore: 6
---

# Polymarket Agentic Trading MCP

A Model Context Protocol server that lets Claude trade on [Polymarket](https://polymarket.com) prediction markets.

## Features

- **Search markets** — keyword search across all open Polymarket markets
- **Analyze markets** — order book imbalance + Kelly Criterion → BUY / SELL / HOLD signal with position sizing
- **Execute trades** — buy/sell via Polymarket CLOB v2 with L2 auth
- **Auto-provision** — CLOB API keys are derived from your wallet automatically on first boot

## Setup

### 1. Install

```bash
openclaw skills install polymarket-clob-trading-mcp
cd skills/polymarket-clob-trading-mcp
npm install
```

### 2. Configure `.env`

```bash
cp .env.example .env
```

Edit `.env` and set your `PRIVATE_KEY`. Everything else (RPC, CLOB API keys) is auto-configured on first boot.

### 3. Add to Claude Code

```bash
claude mcp add --scope user polymarket-trading -- node /path/to/skills/polymarket-clob-trading-mcp/node_modules/tsx/dist/cli.mjs /path/to/skills/polymarket-clob-trading-mcp/trading-server.ts
```

## Tools

| Tool | Description |
|------|-------------|
| `search_markets` | Search open markets by keyword |
| `analyze_market` | ML signal (BUY/SELL/HOLD) + Kelly position size |
| `trade` | Execute a buy or sell order |
| `wallet_info` | Wallet address, balance, and trading limits |
| `push_alert` | Push a manual alert to the configured notification channel |
| `setup_api_keys` | Manually generate CLOB API keys |

## Prediction Engine

1. **Order book imbalance** — nudges probability estimate from bid/ask depth ratio
2. **Confidence score** — built from depth balance, spread tightness, 24h volume
3. **Kelly Criterion** — quarter-Kelly position sizing scaled by confidence
4. **Risk score** — penalises low liquidity, wide spreads, low confidence

## Requirements

- Node.js ≥ 18
- A Polygon wallet private key with USDC for trading
