import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL! ||
  "https://tiycjwbyljajfegrufkm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
  "sb_publishable_PjfUVK4NThp_vjw1kCXVCw_sZEITNGi";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
    parseToNumber: true,
  },
} as any);
