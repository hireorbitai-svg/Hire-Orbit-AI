
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "backend/.env") });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTokens() {
  const { data, error } = await supabase
    .from("password_resets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching tokens:", error);
    return;
  }

  console.log("Latest tokens in DB:");
  data.forEach(t => {
    console.log(`Email: ${t.email}`);
    console.log(`Created: ${t.created_at}`);
    console.log(`Expires: ${t.expires_at}`);
    console.log(`Current Time (UTC): ${new Date().toISOString()}`);
    console.log(`Is Expired: ${new Date(t.expires_at) < new Date()}`);
    console.log("---");
  });
}

checkTokens();
