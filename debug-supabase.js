
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://medomhdyqctvabdfsbmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZG9taGR5cWN0dmFiZGZzYm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjkwOTksImV4cCI6MjA4NTIwNTA5OX0.NIwtlJfg2flwO7R_Hv4vJMhV7oWoZwk85tD9akFBrzM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugWinners() {
    console.log("Testing SELECT from campaign_winners...");
    try {
        // Try selecting just one row, simple query
        const { data, error } = await supabase
            .from('campaign_winners')
            .select('*')
            .limit(1);

        if (error) {
            console.error("SELECT Error:", JSON.stringify(error, null, 2));
        } else {
            console.log("SELECT Success! Data:", data);
        }

    } catch (err) {
        console.error("System Error during select:", err);
    }
}

debugWinners();
