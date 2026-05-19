#!/usr/bin/env node
import fs   from "fs";
import path from "path";
import { createInterface } from "readline";
import { fileURLToPath }   from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── ANSI colours ─────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
};
const OK   = `${C.green}✔ OK   ${C.reset}`;
const FAIL = `${C.red}✘ FAIL ${C.reset}`;
const WARN = `${C.yellow}⚠ WARN ${C.reset}`;

const bar  = () => process.stdout.write(`${C.cyan}${"═".repeat(60)}${C.reset}\n`);
const line = (msg = "") => process.stdout.write(`${msg}\n`);
const step = (n, label) => { line(); bar(); line(`${C.bold}  Step ${n} — ${label}${C.reset}`); bar(); };

async function ask(prompt) {
  if (!process.stdin.isTTY) return "";
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, a => { rl.close(); resolve(a.trim()); }));
}

async function spin(label, fn) {
  const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r  ${C.cyan}${frames[i++ % frames.length]}${C.reset}  ${label}...   `);
  }, 80);
  try {
    const result = await fn();
    clearInterval(timer);
    process.stdout.write(`\r  ${OK} ${result}\n`);
    return { ok: true, result };
  } catch (e) {
    clearInterval(timer);
    process.stdout.write(`\r  ${FAIL} ${label}: ${e.message}\n`);
    return { ok: false, error: e.message };
  }
}

// ── Main ──────────────────────────────────────────────────────
line();
bar();
line(`${C.bold}${C.cyan}  POLYMARKET CLOB TRADING MCP — SETUP${C.reset}`);
line(`${C.dim}  Checking your machine... this takes a few seconds${C.reset}`);
bar();

let issues = 0;

// ── Step 1: Node.js ───────────────────────────────────────────
step(1, "Node.js version");
const nodeVer = parseInt(process.versions.node.split(".")[0]);
if (nodeVer >= 18) {
  line(`  ${OK} Node.js ${process.versions.node}`);
} else {
  line(`  ${FAIL} Node.js ${process.versions.node} — version 18+ required`);
  line(`  ${C.yellow}  → Download from: https://nodejs.org${C.reset}`);
  issues++;
}

// ── Step 2: .env & private key ────────────────────────────────
step(2, "Wallet configuration");
const envPath     = path.join(__dirname, ".env");
const examplePath = path.join(__dirname, ".env.example");

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  line(`  ${OK} Created .env from .env.example`);
} else if (fs.existsSync(envPath)) {
  line(`  ${OK} .env file found`);
} else {
  line(`  ${FAIL} .env file missing and no .env.example to copy from`);
  issues++;
}

let envContent  = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const keyMatch  = envContent.match(/^PRIVATE_KEY=(.*)$/m);
const savedKey  = keyMatch ? keyMatch[1].trim() : "";
const hasKey    = savedKey.length >= 64 && savedKey !== "your_polygon_wallet_private_key_here";

if (!hasKey) {
  line(`  ${WARN} PRIVATE_KEY not set`);
  if (process.stdin.isTTY) {
    const entered = await ask(`\n  ${C.cyan}  Paste your Polygon wallet private key:${C.reset} `);
    if (entered && entered.length >= 64) {
      envContent = envContent.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${entered}`);
      fs.writeFileSync(envPath, envContent, "utf8");
      line(`  ${OK} PRIVATE_KEY saved to .env`);
    } else {
      line(`  ${WARN} Skipped — edit .env manually and set PRIVATE_KEY before trading`);
      issues++;
    }
  } else {
    line(`  ${C.yellow}  → Open .env and set: PRIVATE_KEY=your_polygon_wallet_private_key${C.reset}`);
    issues++;
  }
} else {
  line(`  ${OK} PRIVATE_KEY is set`);
}

// ── Step 3: Dependencies ──────────────────────────────────────
step(3, "Dependencies");
const nmExists = fs.existsSync(path.join(__dirname, "node_modules", "@modelcontextprotocol"));
if (nmExists) {
  line(`  ${OK} node_modules installed`);
} else {
  line(`  ${FAIL} Dependencies missing`);
  line(`  ${C.yellow}  → Run: npm install${C.reset}`);
  issues++;
}

// ── Step 4: Polymarket API ────────────────────────────────────
step(4, "Polymarket API connectivity");
await spin("Connecting to Polymarket", async () => {
  const r = await fetch("https://gamma-api.polymarket.com/markets?limit=1&closed=false", {
    signal: AbortSignal.timeout(8_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return "Polymarket API reachable";
}).then(r => { if (!r.ok) issues++; });

// ── Step 5: Polygon RPC ───────────────────────────────────────
step(5, "Polygon RPC connection");
const rpcMatch = envContent.match(/^POLYGON_RPC=(.+)$/m);
const rpcUrl   = rpcMatch ? rpcMatch[1].trim() : "https://polygon-bor-rpc.publicnode.com";
await spin(`RPC: ${rpcUrl}`, async () => {
  const r = await fetch(rpcUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    signal:  AbortSignal.timeout(8_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data  = await r.json();
  const block = parseInt(data.result, 16);
  return `Connected — latest block #${block.toLocaleString()}`;
}).then(r => { if (!r.ok) issues++; });

// ── Summary ───────────────────────────────────────────────────
line(); bar();
if (issues === 0) {
  line(`${C.bold}${C.green}  ✓ All checks passed — ready to trade!${C.reset}`);
  line();
  line(`${C.dim}  Start server:${C.reset}`);
  line(`  node node_modules/tsx/dist/cli.mjs trading-server.ts`);
  line();
  line(`${C.dim}  Keep alive with PM2:${C.reset}`);
  line(`  pm2 start node_modules/tsx/dist/cli.mjs --name polymarket-mcp -- trading-server.ts`);
} else {
  line(`${C.bold}${C.red}  ✘ ${issues} issue(s) need fixing before you can trade.${C.reset}`);
  line(`${C.dim}  Fix items marked ${FAIL}above, then run: npm run setup${C.reset}`);
}
bar(); line();
