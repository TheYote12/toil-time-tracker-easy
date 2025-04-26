
import { supabase } from "./client";

export async function enableRealtimeForTables() {
  // Enable realtime for toil_submissions by setting replica identity
  await supabase.rpc('alter_table_replica_identity', {
    table_name: 'toil_submissions',
    replica_identity: 'FULL'
  });
  
  console.log("Realtime enabled for toil_submissions");
}
