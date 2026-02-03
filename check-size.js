
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://medomhdyqctvabdfsbmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZG9taGR5cWN0dmFiZGZzYm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjkwOTksImV4cCI6MjA4NTIwNTA5OX0.NIwtlJfg2flwO7R_Hv4vJMhV7oWoZwk85tD9akFBrzM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDataSize() {
    console.log("Checking row size...");
    try {
        const { data, error } = await supabase
            .from('campaign_winners')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error:", error);
        } else if (data && data.length > 0) {
            const row = data[0];
            console.log("Keys:", Object.keys(row));
            const json = JSON.stringify(row);
            console.log("Approx row size (bytes):", json.length);
            if (json.length > 5000) {
                console.warn("WARNING: Row size is large!");
            } else {
                console.log("Row size looks healthy/small.");
            }
        } else {
            console.log("No data found to check.");
        }

    } catch (err) {
        console.error("System Error:", err);
    }
}

checkDataSize();
