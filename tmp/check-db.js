import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicates() {
  console.log("🔍 Checking for duplicate profiles...");
  
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id");

  if (error) {
    console.error("❌ Error fetching profiles:", error.message);
    return;
  }

  const counts = {};
  profiles.forEach(p => {
    counts[p.user_id] = (counts[p.user_id] || 0) + 1;
  });

  const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);

  if (duplicates.length > 0) {
    console.log("⚠️ Found duplicate profiles:");
    duplicates.forEach(([id, count]) => {
      console.log(`User ID: ${id} has ${count} profiles.`);
    });
  } else {
    console.log("✅ No duplicate profiles found.");
  }
}

checkDuplicates();
