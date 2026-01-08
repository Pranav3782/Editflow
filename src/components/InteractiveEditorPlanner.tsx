import { useState, useCallback, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewEditorRow from './PreviewEditorRow';
import PreviewJobCard, { Priority } from './PreviewJobCard';
import PremiumModal from './PremiumModal';

interface Job {
  id: string;
  title: string;
  client: string;
  hours: number;
  priority: Priority;
  dayIndex: number;
  editorId: string;
}

interface Editor {
  id: string;
  name: string;
  maxHours: number; // Weekly capacity in hours
}

const initialEditors: Editor[] = [
  { id: '1', name: 'Marcus Chen', maxHours: 40 },
  { id: '2', name: 'Sarah Kim', maxHours: 40 },
  { id: '3', name: 'David Miller', maxHours: 40 },
  { id: '4', name: 'Emma Rodriguez', maxHours: 40 },
];

const initialJobs: Job[] = [
  { id: 'j1', title: 'Brand Story - Nike Campaign', client: 'Nike Inc.', hours: 6, priority: 'high', dayIndex: 0, editorId: '1' },
  { id: 'j2', title: 'Product Launch Teaser', client: 'TechStart', hours: 4, priority: 'medium', dayIndex: 1, editorId: '1' },
  { id: 'j3', title: 'Social Media Reel', client: 'FoodieBox', hours: 2, priority: 'low', dayIndex: 3, editorId: '1' },
  { id: 'j4', title: 'Documentary Edit', client: 'GreenEarth', hours: 8, priority: 'high', dayIndex: 0, editorId: '2' },
  { id: 'j5', title: 'Wedding Highlights', client: 'Private', hours: 5, priority: 'medium', dayIndex: 4, editorId: '2' },
  { id: 'j6', title: 'Corporate Training Video', client: 'Acme Corp', hours: 6, priority: 'medium', dayIndex: 0, editorId: '3' },
  { id: 'j7', title: 'Event Recap Video', client: 'TechConf', hours: 4, priority: 'high', dayIndex: 1, editorId: '3' },
  { id: 'j8', title: 'Instagram Ad Series', client: 'BeautyBrand', hours: 3, priority: 'low', dayIndex: 2, editorId: '3' },
  { id: 'j9', title: 'YouTube Tutorial', client: 'LearnTech', hours: 5, priority: 'medium', dayIndex: 3, editorId: '3' },
  { id: 'j10', title: 'Music Video Draft', client: 'Indie Artist', hours: 8, priority: 'high', dayIndex: 2, editorId: '4' },
];

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const InteractiveEditorPlanner = () => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [editors] = useState<Editor[]>(initialEditors);
  const [showInteractiveHint, setShowInteractiveHint] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverState, setDragOverState] = useState<{ editorId: string; dayIndex: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const activeJob = useMemo(() => {
    if (!activeId) return null;
    return jobs.find(job => job.id === activeId) || null;
  }, [activeId, jobs]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const [editorId, dayIndex] = (over.id as string).split('-');
      if (editorId && dayIndex !== undefined) {
        setDragOverState({ editorId, dayIndex: parseInt(dayIndex) });
      }
    } else {
      setDragOverState(null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDragOverState(null);

    if (!over) return;

    const jobId = active.id as string;
    const [newEditorId, newDayIndex] = (over.id as string).split('-');

    if (newEditorId && newDayIndex !== undefined) {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId
            ? { ...job, editorId: newEditorId, dayIndex: parseInt(newDayIndex) }
            : job
        )
      );
    }
  }, []);

  const getEditorJobs = (editorId: string) => {
    return jobs.filter(job => job.editorId === editorId);
  };

  const getDragOverForEditor = (editorId: string) => {
    if (!dragOverState || dragOverState.editorId !== editorId) return {};
    return { [dragOverState.dayIndex]: true };
  };

  const getDraggedJobHours = () => {
    return activeJob?.hours || 0;
  };

  // Compute capacity percentage from actual jobs state
  const getEditorCapacity = useCallback((editorId: string) => {
    const editor = editors.find(e => e.id === editorId);
    if (!editor) return 0;
    const editorJobs = jobs.filter(job => job.editorId === editorId);
    const totalHours = editorJobs.reduce((sum, job) => sum + job.hours, 0);
    return Math.round((totalHours / editor.maxHours) * 100);
  }, [jobs, editors]);

  return (
    <div className="bg-card border border-border/50 overflow-hidden rounded-2xl shadow-strong">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-secondary/20 px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">Week of Jan 6–12, 2025</h3>
            <p className="text-xs text-muted-foreground mt-0.5">4 editors · {jobs.length} jobs scheduled</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Interactive Preview Indicator */}
          <motion.div 
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full cursor-pointer"
            onHoverStart={() => setShowInteractiveHint(true)}
            onHoverEnd={() => setShowInteractiveHint(false)}
            whileHover={{ scale: 1.05 }}
          >
            <MousePointer2 size={12} />
            <span>Interactive preview</span>
          </motion.div>

          {/* Heatmap Toggle */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Availability</span>
            <Switch
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* AI Button */}
          <Button
            variant="outline"
            className="gap-2 border-border hover:bg-secondary group"
            onClick={() => setIsPremiumModalOpen(true)}
          >
            <Sparkles size={16} className="text-primary group-hover:animate-pulse" />
            <span className="text-sm hidden sm:inline">Optimize</span>
            <span className="text-[10px] bg-gradient-to-r from-primary to-warning px-1.5 py-0.5 rounded-full text-primary-foreground font-medium flex items-center gap-1">
              <Lock size={10} />
              Pro
            </span>
          </Button>
        </div>
      </div>

      {/* Interactive Hint Tooltip */}
      <AnimatePresence>
        {showInteractiveHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-6 z-50 bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-lg"
          >
            Drag cards to try the planner!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Column Headers */}
      <div className="grid gap-2 bg-secondary/10 border-b border-border/30 px-6 py-3">
        <div className="grid grid-cols-6 xl:grid-cols-8 gap-2 w-full">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Editor
          </div>
          {weekdays.map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
              {day}
            </div>
          ))}
          <div className="hidden xl:block text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
            Sat
          </div>
          <div className="hidden xl:block text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
            Sun
          </div>
        </div>
      </div>

      {/* Editor Rows with Drag & Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3 px-6 py-4">
          {editors.map((editor) => (
            <PreviewEditorRow
              key={editor.id}
              editorId={editor.id}
              name={editor.name}
              capacity={getEditorCapacity(editor.id)}
              jobs={getEditorJobs(editor.id)}
              showHeatmap={showHeatmap}
              isDraggingOver={getDragOverForEditor(editor.id)}
              draggedJobHours={getDraggedJobHours()}
              activeId={activeId}
            />
          ))}
        </div>

        {/* Drag Overlay - renders above everything, follows cursor exactly */}
        <DragOverlay dropAnimation={null}>
          {activeJob && (
            <PreviewJobCard
              title={activeJob.title}
              client={activeJob.client}
              hours={activeJob.hours}
              priority={activeJob.priority}
              isOverlay
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Footer Stats */}
      <div className="border-t border-border/30 bg-secondary/10 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-foreground">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-xs text-muted-foreground">Near capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-xs text-muted-foreground">Overloaded</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Try dragging cards between editors and days
          </p>
        </div>
      </div>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
    </div>
  );
};

export default InteractiveEditorPlanner;
