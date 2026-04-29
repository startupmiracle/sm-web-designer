import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://sdgmzizibetwhecuaist.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InNkZ216aXppYmV0d2hlY3VhaXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjUwNDEsImV4cCI6MjA3OTUwMTA0MX0.gJJJqdZLzb9c59hJOK9kfqtjUPkd6-Wikt7Fle3bXYg";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
