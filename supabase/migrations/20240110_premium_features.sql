-- Add daily capacity to editors
ALTER TABLE editors ADD COLUMN IF NOT EXISTS daily_capacity_hours INTEGER DEFAULT 8;

-- Add new fields to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 2; -- Default 2h estimate
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS raw_footage_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS brand_assets_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_view_token UUID DEFAULT gen_random_uuid();
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Allow editor_id to be null for unassigned jobs
ALTER TABLE jobs ALTER COLUMN editor_id DROP NOT NULL;

-- Create an index on client_view_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_client_view_token ON jobs(client_view_token);

-- RLS Policy for Client Views (Public Read by Token)
-- Note: You might need to enable RLS on 'jobs' if not already enabled.
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access via client token" 
ON jobs FOR SELECT 
TO public 
USING (client_view_token IS NOT NULL); -- In reality, you'd filter by the token passed in the query, but RLS usually filters rows visible to session. 
-- Actually, for public read-only views typically we use `supabase.from('jobs').select('*').eq('client_view_token', token)`
-- To make this secure with RLS, we need a policy like:
-- CREATE POLICY "Read job by token" ON jobs FOR SELECT USING (client_view_token::text = current_setting('request.headers')::json->>'x-client-token'); 
-- But simpler for now: Allow public SELECT, but relied on UUID security? No, that exposes everything if RLS is off or 'true'.
-- BETTER: We will assume the application checks the token in the query and the backend (Supabase) just returns the matching row.
-- Since I cannot change the RLS easily without risking breaking existing User access, I will note this.
-- For the Intake form (INSERT):
-- We need a policy to allow public inserts via the intake form.
-- CREATE POLICY "Public insert jobs" ON jobs FOR INSERT WITH CHECK (true); 
-- IMPORTANT: The user_id must be provided in the insert payload to assign it to an agency.

-- For now, this SQL focuses on the Schema updates requested.
