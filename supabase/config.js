import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vggmhzlletnowcufkwws.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZ21oemxsZXRub3djdWZrd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAwODQwNDIsImV4cCI6MjAyNTY2MDA0Mn0.Cil4NfqOtWZFUCmCF2ioqRgRZQBNkMj-BLEwymbQYXM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})