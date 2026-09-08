import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const NAMESPACE_ID = "0a3a91e8fa63462eae8cf3f2e77e8a22";
const WRANGLER = "npx wrangler@3.114.17";

console.log("Listing KV keys...");
const raw = execSync(`${WRANGLER} kv key list --namespace-id=${NAMESPACE_ID}`, {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 50
});

const allKeys = JSON.parse(raw).map((k) => k.name);
const contentKeys = allKeys.filter((k) => k.startsWith("content:"));

console.log(`Found ${allKeys.length} total keys, ${contentKeys.length} start with "content:".`);

if (contentKeys.length === 0) {
  console.log("Nothing to delete.");
  process.exit(0);
}

writeFileSync("/tmp/content-keys.json", JSON.stringify(contentKeys));
console.log("Deleting stale content overrides so the live site falls back to the current code defaults...");
execSync(`${WRANGLER} kv bulk delete --namespace-id=${NAMESPACE_ID} /tmp/content-keys.json --force`, {
  stdio: "inherit"
});
console.log(`Done. Deleted ${contentKeys.length} stale content override(s).`);
