
import { supabase } from "./client";

export async function enableRealtimeForTables() {
  // Enable realtime for the toil_submissions table
  const { error } = await supabase.rpc('supabase_functions.enable_realtime', {
    table_name: 'toil_submissions',
    schema_name: 'public'
  });
  
  if (error) {
    console.error("Error enabling realtime:", error);
  }
}

// Call this function when your app initializes
