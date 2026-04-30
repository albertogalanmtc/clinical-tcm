import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cezjuzscwjazgeklbpnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemp1enNjd2phemdla2xicG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MzU1NTIsImV4cCI6MjA5MjMxMTU1Mn0.JqjjjViJdAEVjK-0R43MNcCD0wVXxXxETGXELPEQPY8';

export const supabase = createClient(supabaseUrl, supabaseKey);
