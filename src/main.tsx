
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { enableRealtimeForTables } from './integrations/supabase/enableRealtime.ts'

// Enable realtime updates
enableRealtimeForTables().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
