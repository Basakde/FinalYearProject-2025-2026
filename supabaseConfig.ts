// supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jkrjesfxpnjqwywunvoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprcmplc2Z4cG5qcXd5d3Vudm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzczMTMsImV4cCI6MjA3NTY1MzMxM30.XmsHHwEiYADTTE5XlIf7Aw5uAAzqybmQWlA95odbdE4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
