import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Anon key is safe client-side — every table it can touch is behind RLS
// (see supabase/migrations/0001_init_schema.sql). The service-role key that
// bypasses RLS lives only in Edge Function secrets (P5), never here.
//
// EXPO_PUBLIC_* vars are inlined at build time by Metro — see .env.example.
// No Supabase project has been created for this app yet (that needs a human
// with browser access, see README), so `supabase` is null until one is
// configured. P1/P2 (local card state, sessions) work fine without it —
// only auth and sync (this phase onward) actually need a project. Callers
// must check `isSupabaseConfigured` before using `supabase` and fail
// gracefully (not crash the whole app) when it's false.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // RN has no URL bar; magic-link callback goes through expo-linking instead
      },
    })
  : null;
