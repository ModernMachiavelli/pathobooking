// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// service-role ключ ОБОВʼЯЗКОВО має бути тільки на бекенді (env, не на фронті)
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY не задані в env");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});