/**
 * Phase 0 — create the `conversations` Cosmos container (idempotent). Mirrors the copilot's
 * scripts/init-db.mjs conventions incl. D-012 commit safety (prints endpoint + database, requires
 * --yes) and the D-023 serverless fallback (the shared account is serverless → autoscale unsupported).
 *
 *   node scripts/init-conversations.mjs                 # dry-run (print target + plan)
 *   node scripts/init-conversations.mjs --commit --yes  # create the container
 *
 * pk /sessionId · defaultTtl:-1 (per-item TTL hook, retention NOT enabled yet — TODO(Q-BIZ-10)).
 * NEVER touches existing containers (users/authTokens/savedIdeas/enquiries).
 * Dev: set COSMOS_DATABASE_NAME=copilot-dev (same account the copilot reader uses in dev). Prod: run
 * against the production database before deploying the site build that writes conversations.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUTOSCALE_MAX_RU = 1000;

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (process.env[k] === undefined || process.env[k] === "") process.env[k] = v;
    }
  }
}

function getClient() {
  const connStr = process.env.COSMOS_CONNECTION_STRING;
  if (connStr) return new CosmosClient(connStr);
  const endpoint = process.env.COSMOS_ENDPOINT;
  if (!endpoint) { console.error("❌  Set COSMOS_CONNECTION_STRING or COSMOS_ENDPOINT."); process.exit(1); }
  return new CosmosClient({ endpoint, aadCredentials: new DefaultAzureCredential() });
}

function endpointLabel() {
  const cs = process.env.COSMOS_CONNECTION_STRING;
  if (cs) { const m = cs.match(/AccountEndpoint=([^;]+)/i); return m ? m[1] : "(connection-string account)"; }
  return process.env.COSMOS_ENDPOINT || "(unknown)";
}

async function confirmCommit(database) {
  const argv = process.argv.slice(2);
  console.log("\n⚠️   COMMIT MODE — will create the `conversations` container in Cosmos:");
  console.log(`     endpoint: ${endpointLabel()}`);
  console.log(`     database: ${database}`);
  if (argv.includes("--yes")) { console.log("     (--yes supplied — proceeding)\n"); return true; }
  if (!process.stdin.isTTY) { console.error("\n❌  Refusing to commit non-interactively without --yes.\n"); return false; }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await new Promise((r) => rl.question("     Type the database name to confirm: ", r));
  rl.close();
  const ok = ans.trim() === database;
  console.log(ok ? "     confirmed\n" : "     mismatch — aborting\n");
  return ok;
}

async function main() {
  loadEnv();
  const argv = process.argv.slice(2);
  const commit = argv.includes("--commit");
  const database = process.env.COSMOS_DATABASE_NAME;
  if (!database) { console.error("❌  COSMOS_DATABASE_NAME is not set."); process.exit(1); }

  console.log(`🗄️   init-conversations → database "${database}" @ ${endpointLabel()}`);
  console.log(`     container: conversations (pk /sessionId, defaultTtl -1, autoscale max ${AUTOSCALE_MAX_RU} RU with serverless fallback)`);

  if (!commit) {
    console.log("\n(dry-run — no writes. Re-run with --commit --yes to create.)\n");
    return;
  }
  if (!(await confirmCommit(database))) process.exit(1);

  const db = getClient().database(database);
  const base = { id: "conversations", partitionKey: { paths: ["/sessionId"] }, defaultTtl: -1 };
  try {
    await db.containers.createIfNotExists({ ...base, maxThroughput: AUTOSCALE_MAX_RU });
    console.log("✅  container 'conversations' ensured (autoscale)");
  } catch (e) {
    if (/serverless/i.test(e.message || "")) {
      await db.containers.createIfNotExists(base);
      console.log("✅  container 'conversations' ensured (serverless — no throughput)");
    } else {
      throw e;
    }
  }
  console.log("\n✅  init-conversations complete. Existing containers untouched.\n");
}

main().catch((e) => { console.error("❌", e.message || e); process.exit(1); });
