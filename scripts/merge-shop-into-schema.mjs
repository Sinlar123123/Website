import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const schemaPath = path.join(root, "supabase/schema.sql");
const migPath = path.join(root, "supabase/migrations/2026-04-18_shop_items_expansion_60.sql");

const schema = fs.readFileSync(schemaPath, "utf8");
const mig = fs.readFileSync(migPath, "utf8").trim();

const anchor = "on conflict (slug) do nothing;";
const idx = schema.indexOf(anchor);
if (idx < 0) {
  console.error("items anchor not found");
  process.exit(1);
}

const restStart = schema.indexOf("\n\ninsert into public.achievements", idx);
if (restStart < 0) {
  console.error("achievements insert not found after items");
  process.exit(1);
}

if (schema.includes("hat_cotton_cap")) {
  console.log("schema.sql already contains expanded shop; skip");
  process.exit(0);
}

const before = schema.slice(0, idx + anchor.length);
const after = schema.slice(restStart);

const merged = `${before}\n\n${mig}${after}`;
fs.writeFileSync(schemaPath, merged, "utf8");
console.log("Merged shop migration into schema.sql");
