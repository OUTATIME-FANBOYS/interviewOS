import { createClient } from "@supabase/supabase-js";
import { CARDS } from "../data/cards";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local without dotenv
const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const url = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_STORAGE_SUPABASE_URL or NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const BATCH = 50;

async function main() {
  console.log(`Uploading ${CARDS.length} cards in batches of ${BATCH}…`);

  for (let i = 0; i < CARDS.length; i += BATCH) {
    const batch = CARDS.slice(i, i + BATCH);
    const { error } = await supabase
      .from("flashcards")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`✓ ${Math.min(i + BATCH, CARDS.length)} / ${CARDS.length}`);
  }

  console.log("Done.");
}

main();
