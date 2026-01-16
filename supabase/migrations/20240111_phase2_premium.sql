-- Phase 2 Premium Features Migration

-- 1. Time Tracking Fields
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS actual_hours NUMERIC; -- Float for partial hours

-- 2. Job Status History
CREATE TABLE IF NOT EXISTS job_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id) -- Optional: track who changed it
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_job_status_history_job_id ON job_status_history(job_id);

-- 3. Job Notes (Contextual)
CREATE TABLE IF NOT EXISTS job_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id), -- To show author
    -- We can fetch the author's name from profiles if needed, or store it here for simplicity
    -- Let's rely on joining/fetching profile or just storing the ID
    author_name TEXT -- Optional snapshot of name to avoid join complexity if profile deleted? No, standard is join.
    -- But strict efficient join:
);

-- Index for notes
CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON job_notes(job_id);

-- 4. Trigger for Status History (Optional but good practice)
-- We'll handle it in the application layer for now to stick to the plan: "Calculated client-side or via Supabase views"
-- Actually, the requirement says "Track how work progresses". Doing it via trigger ensures no miss.
-- But RLS issues might arise if we use triggers with auth.uid(). 
-- We will stick to Application Layer writes for history to control the "Pro" gating easier.
-- If we put it in a trigger, Free users might generate history which we don't want to store if they are not Pro?
-- No, data integrity is better. But "Prevent free users from... Writing notes". 
-- It says "Maintain a status_history". It doesn't explicitly say forbid free history, but "Pro Only" feature.
-- We will allow the table to exist, and maybe just not show it to Free users?
-- Or strictly gate writes.
-- Let's implement writes in the Frontend `updateJob` function gated by `planType === 'pro'`.

-- RLS Policies
-- Enable RLS on new tables
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;

-- Policies for job_status_history
-- Allow users to read history for jobs they own (via redundancy or join)
-- Ideally jobs has user_id.
-- Let's assume standard policy: Users can access data linked to their user_id or organization.
-- Since complexity of joins in RLS can be perf heavy, we often just allow authenticated if they have base access.
-- Using a simple generic policy for now, similar to what likely exists for `jobs`.
-- Assuming `jobs` has `user_id`.
CREATE POLICY "Users can manage history of own jobs" ON job_status_history
    USING (job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid()))
    WITH CHECK (job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid()));

-- Policies for job_notes
CREATE POLICY "Users can manage notes of own jobs" ON job_notes
    USING (job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid()))
    WITH CHECK (job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid()));
