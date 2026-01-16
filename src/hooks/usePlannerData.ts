
import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, addWeeks, format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'queued' | 'in-progress' | 'review' | 'revision' | 'approved';

export interface Job {
  id: string; // UUID from DB
  title: string;
  clientName: string;
  editorId: string | null; // UUID, can be null for backlog
  scheduledDate: number; // dayIndex 0-6 (Mon-Sun)
  weekStart: string; // ISO date string for the week's start (Monday)
  estimatedHours: number;
  priority: Priority;
  status: Status;
  order: number;
  notes?: string;
  // Premium fields
  rawFootageUrl?: string;
  brandAssetsUrl?: string;
  clientViewToken?: string;
  deadline?: string;
  // Phase 2 Fields
  startedAt?: string;
  completedAt?: string;
  actualHours?: number;
}

export interface Editor {
  id: string; // UUID
  name: string;
  weeklyCapacity: number;
  dailyCapacityHours: number; // New field
}

export const usePlannerData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });

  const [editors, setEditors] = useState<Editor[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [planType, setPlanType] = useState<'free' | 'pro'>('free'); // Default to free
  const currentWeekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

  // Fetch Data
  const fetchData = useCallback(async () => {
    if (!user) {
      setEditors([]);
      setJobs([]);
      setPlanType('free');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch Profile Plan
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setPlanType(profileData.plan_type as 'free' | 'pro');
      }

      // Fetch Editors
      const { data: editorsData, error: editorsError } = await supabase
        .from('editors')
        .select('*')
        .order('created_at', { ascending: true });

      if (editorsError) throw editorsError;

      const formattedEditors: Editor[] = editorsData.map((e: any) => ({
        id: e.id,
        name: e.name,
        weeklyCapacity: e.weekly_capacity,
        dailyCapacityHours: e.daily_capacity_hours || 8, // Default 8 if missing
      }));
      setEditors(formattedEditors);

      // Parallel Fetch Strategy
      // 1. Fetch ALL jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // 2. Fetch ALL notes for these jobs (if table exists)
      let notesMap: Record<string, string> = {};
      try {
        const { data: notesData, error: notesError } = await supabase
          .from('job_notes')
          .select('job_id, content');

        if (!notesError && notesData) {
          notesData.forEach((n: any) => {
            notesMap[n.job_id] = n.content;
          });
        }
      } catch (e) {
        console.warn("Could not fetch from job_notes table", e);
      }

      // 3. Merge data
      const formattedJobs: Job[] = jobsData.map((j: any) => ({
        id: j.id,
        title: j.title,
        clientName: j.client_name,
        editorId: j.editor_id, // can be null
        scheduledDate: j.scheduled_date,
        weekStart: j.week_start,
        estimatedHours: j.estimated_hours || 0,
        priority: j.priority,
        status: j.status,
        order: j.order,
        notes: notesMap[j.id] || j.notes || '',
        rawFootageUrl: j.raw_footage_url,
        brandAssetsUrl: j.brand_assets_url,
        clientViewToken: j.client_view_token,
        deadline: j.deadline,
        startedAt: j.started_at,
        completedAt: j.completed_at,
        actualHours: j.actual_hours,
      }));

      setJobs(formattedJobs);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load planner data');
    } finally {
      setLoading(false);
    }
  }, [user, currentWeekStartStr]);

  // AI Optimization Logic
  const optimizeWeekSchedule = useCallback(async () => {
    if (planType !== 'pro' || editors.length < 2) return;

    const updates: { id: string; editor_id: string }[] = [];
    const newJobs = [...jobs];
    let movesCount = 0;

    // Process each day of the week independently
    for (let day = 0; day < 7; day++) {
      // 1. Get jobs for this day
      const dayJobs = newJobs.filter(j => j.scheduledDate === day && j.weekStart === currentWeekStartStr);
      if (dayJobs.length === 0) continue;

      // 2. Calculate Load per Editor
      const editorLoads: Record<string, number> = {};
      editors.forEach(e => editorLoads[e.id] = 0);

      dayJobs.forEach(j => {
        if (editorLoads[j.editorId] !== undefined) {
          editorLoads[j.editorId] += j.estimatedHours;
        }
      });

      // 3. Determine imbalances
      const totalHours = Object.values(editorLoads).reduce((a, b) => a + b, 0);
      const avgHours = totalHours / editors.length;
      const threshold = 1.0; // Don't move if difference is small (1 hour)

      // 4. Greedy Balancing
      // Sort editors by load
      let sortedEditors = [...editors].sort((a, b) => editorLoads[b.id] - editorLoads[a.id]); // Descending

      let maxIter = 20; // Safety break
      while (maxIter-- > 0) {
        sortedEditors.sort((a, b) => editorLoads[b.id] - editorLoads[a.id]);
        const overloaded = sortedEditors[0];
        const underloaded = sortedEditors[sortedEditors.length - 1];

        if ((editorLoads[overloaded.id] - editorLoads[underloaded.id]) <= threshold) {
          break; // Balanced enough
        }

        // Find a suitable job to move
        // Logic: Find the smallest job from Overloaded that fits into Underloaded without making Underloaded > Average + Threshold
        // Or just simply move the smallest job if it helps convergence
        const candidates = dayJobs.filter(j => j.editorId === overloaded.id).sort((a, b) => a.estimatedHours - b.estimatedHours);

        let moved = false;
        for (const job of candidates) {
          // Check if moving this job flips the balance too aggressively?
          // Actually, as long as (NewUnderload < OldOverload) it is an improvement usually.
          // Simple heuristic: If (Underload + Job) < Overload, do it. 
          if ((editorLoads[underloaded.id] + job.estimatedHours) < editorLoads[overloaded.id]) {
            // Move Job
            job.editorId = underloaded.id;
            editorLoads[overloaded.id] -= job.estimatedHours;
            editorLoads[underloaded.id] += job.estimatedHours;

            updates.push({ id: job.id, editor_id: underloaded.id });
            movesCount++;
            moved = true;
            break; // Re-sort and re-evaluate
          }
        }

        if (!moved) break; // No valid moves found
      }
    }

    if (movesCount > 0) {
      // Optimistic Update
      setJobs(newJobs);
      toast.info(`AI Optimization: Rebalanced ${movesCount} tasks across the team.`);

      // Persist to DB
      for (const update of updates) {
        const { error } = await supabase
          .from('jobs')
          .update({ editor_id: update.editor_id })
          .eq('id', update.id);
        if (error) console.error("Failed to save optimization move", error);
      }
    } else {
      toast.info("Schedule is already balanced!");
    }

  }, [jobs, editors, currentWeekStartStr, planType]);

  useEffect(() => {
    fetchData();
  }, [user]);

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  const goToWeek = useCallback((date: Date) => {
    setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  // Helper getters
  const getWeekDates = useCallback(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getWeekLabel = useCallback(() => {
    const endOfWeekDate = addDays(currentWeekStart, 6);
    const startMonth = format(currentWeekStart, 'MMM');
    const endMonth = format(endOfWeekDate, 'MMM');
    const startDay = format(currentWeekStart, 'd');
    const endDay = format(endOfWeekDate, 'd');
    const year = format(currentWeekStart, 'yyyy');

    if (startMonth === endMonth) {
      return `Week of ${startMonth} ${startDay}–${endDay}, ${year}`;
    }
    return `Week of ${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  }, [currentWeekStart]);

  // Mutations
  const addJob = useCallback(async (job: Omit<Job, 'id' | 'order' | 'weekStart'>) => {
    if (!user) return;
    try {
      const newJobOrder = jobs.filter(j =>
        j.editorId === job.editorId &&
        j.scheduledDate === job.scheduledDate &&
        j.weekStart === currentWeekStartStr
      ).length;

      const dbJob = {
        user_id: user.id,
        editor_id: job.editorId,
        title: job.title,
        client_name: job.clientName,
        scheduled_date: job.scheduledDate,
        week_start: currentWeekStartStr,
        estimated_hours: job.estimatedHours,
        priority: job.priority,
        status: job.status,
        order: newJobOrder,
        raw_footage_url: job.rawFootageUrl,
        brand_assets_url: job.brandAssetsUrl,
        deadline: job.deadline,
      };

      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert(dbJob)
        .select()
        .single();

      if (jobError) throw jobError;

      // Try adding note to table
      if (job.notes) {
        try {
          const { error: noteError } = await supabase
            .from('job_notes')
            .insert({
              job_id: jobData.id,
              user_id: user.id,
              content: job.notes
            });
          if (noteError) throw noteError;
        } catch (noteErr) {
          console.warn("Note table save failed, trying column fallback...", noteErr);
          // Fallback to updating column if table save failed
          await supabase.from('jobs').update({ notes: job.notes }).eq('id', jobData.id);
        }
      }

      const newJob: Job = {
        id: jobData.id,
        title: jobData.title,
        clientName: jobData.client_name,
        editorId: jobData.editor_id,
        scheduledDate: jobData.scheduled_date,
        weekStart: jobData.week_start,
        estimatedHours: jobData.estimated_hours,
        priority: jobData.priority,
        status: jobData.status,
        order: jobData.order,
        notes: job.notes || '',
        rawFootageUrl: job.rawFootageUrl,
        brandAssetsUrl: job.brandAssetsUrl,
        deadline: job.deadline,
      };

      setJobs(prev => [...prev, newJob]);
      toast.success('Job created');
      return newJob;
    } catch (error: any) {
      console.error('Error adding job:', error);
      toast.error(`Failed to create job: ${error.message || 'Unknown error'}`);
    }
  }, [jobs, currentWeekStartStr, user]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      // Optimistic update
      setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, ...updates } : job
      ));

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.clientName) dbUpdates.client_name = updates.clientName;
      if (updates.editorId) dbUpdates.editor_id = updates.editorId;
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.order !== undefined) dbUpdates.order = updates.order;
      if (updates.weekStart) dbUpdates.week_start = updates.weekStart;
      if (updates.rawFootageUrl !== undefined) dbUpdates.raw_footage_url = updates.rawFootageUrl;
      if (updates.brandAssetsUrl !== undefined) dbUpdates.brand_assets_url = updates.brandAssetsUrl;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

      // Phase 2: Time Tracking Logic
      if (updates.status) {
        const now = new Date().toISOString();
        const currentJob = jobs.find(j => j.id === jobId);

        // Transition to In Progress -> Set startedAt
        if (updates.status === 'in-progress') {
          if (currentJob && !currentJob.startedAt) {
            dbUpdates.started_at = now;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, startedAt: now, status: updates.status! } : j));
          }
        }

        // Transition to Review or Approved -> Set completedAt and Actual Hours
        if ((updates.status === 'review' || updates.status === 'approved' || updates.status === 'revision') && currentJob) {
          // Only finalize if moving from In Progress or Queued (not just shuffling between Review/Approved)
          // Or just always update finished time if it's the latest?
          // Requirement: "When job status changes to Review or Approved: Set completed_at"
          // Let's set it.
          dbUpdates.completed_at = now;

          // Calculate actual_hours
          // Rule: completed_at - started_at
          // If started_at is missing, maybe assume job creation time? No, that's bad.
          // If missing, use estimated or 0? 
          // Better: If startedAt exists, calc diff.
          const startT = currentJob.startedAt ? new Date(currentJob.startedAt).getTime() : 0;
          if (startT > 0) {
            const endT = new Date(now).getTime();
            const diffHours = Math.max(0, (endT - startT) / (1000 * 60 * 60)); // hours
            // Round to 1 decimal
            const actual = Math.round(diffHours * 10) / 10;
            dbUpdates.actual_hours = actual;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, completedAt: now, actualHours: actual, status: updates.status! } : j));
          } else {
            // Just Set Completed At
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, completedAt: now, status: updates.status! } : j));
          }
        }
      }

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('jobs')
          .update(dbUpdates)
          .eq('id', jobId);
        if (error) throw error;
      }

      // Phase 2: Status History Recording (Fire and Forget)
      if (updates.status) {
        const currentJob = jobs.find(j => j.id === jobId);
        supabase.from('job_status_history').insert({
          job_id: jobId,
          old_status: currentJob?.status,
          new_status: updates.status,
          changed_by: user?.id
        }).then(({ error }) => {
          if (error) console.error("Failed to log status history", error);
        });
      }

      // Handle Note Updates
      if (updates.notes !== undefined) {
        try {
          const { data: existingNote } = await supabase
            .from('job_notes')
            .select('id')
            .eq('job_id', jobId)
            .single();

          if (existingNote) {
            await supabase
              .from('job_notes')
              .update({ content: updates.notes, updated_at: new Date().toISOString() })
              .eq('job_id', jobId);
          } else {
            const { error: insertError } = await supabase
              .from('job_notes')
              .insert({
                job_id: jobId,
                user_id: user?.id,
                content: updates.notes
              });
            if (insertError) throw insertError;
          }
        } catch (noteErr) {
          console.warn("Note table update failed, trying column fallback...", noteErr);
          // Fallback to column
          const { error: colError } = await supabase
            .from('jobs')
            .update({ notes: updates.notes })
            .eq('id', jobId);

          if (colError) {
            console.error("Column fallback also failed", colError);
            toast.error("Failed to save note. Please run the provided SQL migration script.");
          }
        }
      }

    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(`Failed to update job: ${error.message || 'Unknown error'}`);
      fetchData(); // Revert on error
    }
  }, [fetchData, user]);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      // Cascade delete handles notes, just delete job
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      toast.success('Job deleted');
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(`Failed to delete job: ${error.message || 'Unknown error'}`);
      fetchData();
    }
  }, [fetchData]);

  const moveJob = useCallback(async (jobId: string, newEditorId: string | null, newDayIndex: number, newOrder: number) => {
    // Optimistic update logic
    setJobs(prev => {
      const jobIndex = prev.findIndex(j => j.id === jobId);
      if (jobIndex === -1) return prev;

      const job = prev[jobIndex];
      const wasInSameCell = job.editorId === newEditorId && job.scheduledDate === newDayIndex;

      // Update the moved job
      const updatedJobs = prev.map(j => {
        if (j.id === jobId) {
          return { ...j, editorId: newEditorId, scheduledDate: newDayIndex, order: newOrder };
        }
        // Reorder
        if (j.editorId === newEditorId && j.scheduledDate === newDayIndex && j.weekStart === job.weekStart && j.id !== jobId) {
          if (wasInSameCell) {
            const oldOrder = job.order;
            if (newOrder > oldOrder && j.order > oldOrder && j.order <= newOrder) {
              return { ...j, order: j.order - 1 };
            }
            if (newOrder < oldOrder && j.order >= newOrder && j.order < oldOrder) {
              return { ...j, order: j.order + 1 };
            }
          } else {
            if (j.order >= newOrder) {
              return { ...j, order: j.order + 1 };
            }
          }
        }
        return j;
      });

      (async () => {
        try {
          await supabase.from('jobs').update({
            editor_id: newEditorId, // can be null
            scheduled_date: newDayIndex,
            "order": newOrder
          }).eq('id', jobId);
        } catch (e) {
          console.error("Move job failed", e);
        }
      })();

      return updatedJobs;
    });
  }, []);

  // Editor CRUD & LIMITS
  const addEditor = useCallback(async (editor: Omit<Editor, 'id'>) => {
    if (!user) return;
    try {
      let planType = 'free';
      try {
        const { data: profile } = await supabase.from('profiles').select('plan_type').single();
        if (profile) planType = profile.plan_type;
      } catch (e) { }

      const limit = planType === 'pro' ? 10 : 2;

      if (editors.length >= limit) {
        throw new Error('PLAN_LIMIT_REACHED');
      }

      const dbEditor = {
        user_id: user.id,
        name: editor.name,
        weekly_capacity: editor.weeklyCapacity,
        daily_capacity_hours: editor.dailyCapacityHours || 8
      };

      const { data, error } = await supabase.from('editors').insert(dbEditor).select().single();
      if (error) throw error;

      const newEditor: Editor = {
        id: data.id,
        name: data.name,
        weeklyCapacity: data.weekly_capacity,
        dailyCapacityHours: data.daily_capacity_hours || 8
      };

      setEditors(prev => [...prev, newEditor]);
      toast.success('Editor added');
      return newEditor;
    } catch (error: any) {
      if (error.message === 'PLAN_LIMIT_REACHED') {
        throw error;
      }
      console.error('Error adding editor:', error);
      toast.error(error.message || 'Failed to add editor');
      throw error;
    }
  }, [editors, user]);

  const updateEditor = useCallback(async (editorId: string, updates: Partial<Editor>) => {
    setEditors(prev => prev.map(editor =>
      editor.id === editorId ? { ...editor, ...updates } : editor
    ));

    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.weeklyCapacity) dbUpdates.weekly_capacity = updates.weeklyCapacity;
      if (updates.dailyCapacityHours) dbUpdates.daily_capacity_hours = updates.dailyCapacityHours;

      await supabase.from('editors').update(dbUpdates).eq('id', editorId);
    } catch (e) {
      console.error("Update editor failed", e);
      fetchData();
    }
  }, [fetchData]);

  const deleteEditor = useCallback(async (editorId: string) => {
    setEditors(prev => prev.filter(editor => editor.id !== editorId));
    try {
      await supabase.from('editors').delete().eq('id', editorId);
      toast.success('Editor deleted');
    } catch (e) {
      console.error("Delete editor failed", e);
      fetchData();
    }
  }, [fetchData]);

  const reassignEditorJobs = useCallback(async (fromEditorId: string, toEditorId: string) => {
    setJobs(prev => prev.map(job =>
      job.editorId === fromEditorId ? { ...job, editorId: toEditorId } : job
    ));

    try {
      await supabase.from('jobs').update({ editor_id: toEditorId }).eq('editor_id', fromEditorId);
    } catch (e) {
      console.error("Reassign failed", e);
      fetchData();
    }
  }, [fetchData]);

  // Read-only helpers
  const getEditorJobCount = useCallback((editorId: string) => {
    return jobs.filter(job => job.editorId === editorId).length;
  }, [jobs]);

  const getEditorJobs = useCallback((editorId: string) => {
    return jobs
      .filter(job => job.editorId === editorId && job.weekStart === currentWeekStartStr)
      .sort((a, b) => a.order - b.order);
  }, [jobs, currentWeekStartStr]);

  const getUnassignedJobs = useCallback(() => {
    return jobs.filter(job => job.editorId === null);
  }, [jobs]);

  const getEditorCapacity = useCallback((editorId: string) => {
    const editorJobs = jobs.filter(job => job.editorId === editorId && job.weekStart === currentWeekStartStr);
    const totalHours = editorJobs.reduce((sum, job) => sum + job.estimatedHours, 0);
    const editor = editors.find(e => e.id === editorId);
    const weeklyCapacity = editor?.weeklyCapacity || 40;
    return Math.min(100, Math.round((totalHours / weeklyCapacity) * 100));
  }, [jobs, editors, currentWeekStartStr]);

  const getEditorDailyCapacity = useCallback((editorId: string, dateIndex: number) => {
    const editor = editors.find(e => e.id === editorId);
    if (!editor) return { used: 0, total: 8, remaining: 8 };

    const dailyJobs = jobs.filter(j =>
      j.editorId === editorId &&
      j.scheduledDate === dateIndex &&
      j.weekStart === currentWeekStartStr
    );

    const used = dailyJobs.reduce((acc, job) => acc + (job.estimatedHours || 0), 0);
    const total = editor.dailyCapacityHours || 8;

    return {
      used,
      total,
      remaining: Math.max(0, total - used),
      isOverCapacity: used > total
    };
  }, [jobs, editors, currentWeekStartStr]);

  const getJobsForMonth = useCallback((year: number, month: number) => {
    return jobs.filter(job => {
      const weekStart = new Date(job.weekStart);
      const jobDate = addDays(weekStart, job.scheduledDate);
      return jobDate.getFullYear() === year && jobDate.getMonth() === month;
    });
  }, [jobs]);

  const getJobCountForDate = useCallback((date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const dayIndex = (date.getDay() + 6) % 7;
    return jobs.filter(job => job.weekStart === weekStartStr && job.scheduledDate === dayIndex).length;
  }, [jobs]);

  const currentWeekJobCount = jobs.filter(job => job.weekStart === currentWeekStartStr).length;

  return {
    editors,
    jobs,
    currentWeekStart,
    currentWeekStartStr,
    currentWeekJobCount,
    loading,
    goToPreviousWeek,
    goToNextWeek,
    goToWeek,
    getWeekDates,
    getWeekLabel,
    addJob,
    updateJob,
    moveJob,
    deleteJob,
    addEditor,
    updateEditor,
    deleteEditor,
    reassignEditorJobs,
    getEditorJobCount,
    getEditorJobs,
    getEditorCapacity,
    getEditorDailyCapacity,
    getUnassignedJobs,
    getJobsForMonth,
    getJobCountForDate,
    planType,
    optimizeWeekSchedule,
  };
};
