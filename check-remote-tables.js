const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('Checking remote database tables...\n');
  
  const tables = ['user_streaks', 'daily_activities', 'activity_events'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkTables().then(() => process.exit(0));