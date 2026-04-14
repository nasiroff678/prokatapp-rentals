import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzukllxhwrlfbunxxphh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dWtsbHhod3JsZmJ1bnh4cGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjg1MDksImV4cCI6MjA5MTc0NDUwOX0.eQeDwmveicvHdKohBLm1w9lfECSrswk3jE7Rmw5CS8I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
