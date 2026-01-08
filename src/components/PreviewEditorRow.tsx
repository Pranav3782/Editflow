import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PreviewCapacityBar from './PreviewCapacityBar';
import PreviewJobCard, { Priority } from './PreviewJobCard';

interface Job {
  id: string;
  title: string;
  client: string;
  hours: number;
  priority: Priority;
  dayIndex: number;
}

interface PreviewEditorRowProps {
  editorId: string;
  name: string;
  capacity: number;
  jobs: Job[];
  showHeatmap: boolean;
  isDraggingOver?: { [key: number]: boolean };
  draggedJobHours?: number;
  activeId?: string | null;
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const SortableJobCard = ({ job, activeId }: { job: Job; activeId?: string | null }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PreviewJobCard
        title={job.title}
        client={job.client}
        hours={job.hours}
        priority={job.priority}
        isDragging={activeId === job.id}
      />
    </div>
  );
};

const DroppableCell = ({ 
  id, 
  children, 
  className,
  showHeatmap,
  totalHours,
  isActive,
}: { 
  id: string; 
  children: React.ReactNode;
  className?: string;
  showHeatmap: boolean;
  totalHours: number;
  isActive: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getHeatmapClass = () => {
    if (!showHeatmap) return '';
    if (totalHours === 0) return 'bg-emerald-50/30 dark:bg-emerald-950/10';
    if (totalHours >= 8) return 'bg-rose-50/50 dark:bg-rose-950/20';
    if (totalHours >= 5) return 'bg-amber-50/50 dark:bg-amber-950/20';
    return 'bg-emerald-50/30 dark:bg-emerald-950/10';
  };

  const getGlowClass = () => {
    if (!isActive) return '';
    if (totalHours >= 8) return 'ring-2 ring-rose-300/50 dark:ring-rose-500/30';
    if (totalHours >= 5) return 'ring-2 ring-amber-300/50 dark:ring-amber-500/30';
    return 'ring-2 ring-emerald-300/50 dark:ring-emerald-500/30';
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg p-2 min-h-[100px] border border-transparent',
        getHeatmapClass(),
        getGlowClass(),
        'hover:border-border/50',
        isOver && 'border-primary/30 bg-primary/5 scale-[1.02]',
        isActive && 'transition-all duration-150',
        className
      )}
    >
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

const PreviewEditorRow = ({ 
  editorId, 
  name, 
  capacity, 
  jobs, 
  showHeatmap,
  isDraggingOver = {},
  draggedJobHours = 0,
  activeId,
}: PreviewEditorRowProps) => {
  
  const calculateDayLoad = (dayIndex: number) => {
    const dayJobs = jobs.filter(job => job.dayIndex === dayIndex);
    const baseHours = dayJobs.reduce((sum, job) => sum + job.hours, 0);
    const extraHours = isDraggingOver[dayIndex] ? draggedJobHours : 0;
    return baseHours + extraHours;
  };

  // Preview animation: show what capacity would be if dragged job lands here
  const getAnimatedCapacity = () => {
    const anyDragOver = Object.values(isDraggingOver).some(v => v);
    if (anyDragOver) {
      // Add ~2.5% per hour dragged (40h = 100%, so 1h ≈ 2.5%)
      return Math.min(capacity + Math.round(draggedJobHours * 2.5), 100);
    }
    return capacity;
  };

  const isAnyDragging = activeId != null;

  return (
    <div className="grid grid-cols-6 xl:grid-cols-8 gap-2 min-h-[100px]">
      {/* Editor Info */}
      <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">{name}</h4>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Capacity</span>
              <span
                className={cn(
                  isAnyDragging && 'text-primary font-medium'
                )}
              >
                {Math.round(getAnimatedCapacity())}%
              </span>
            </div>
            <PreviewCapacityBar 
              percentage={getAnimatedCapacity()} 
              isAnimating={isAnyDragging}
            />
          </div>
        </div>
      </div>

      {/* Weekday Cells */}
      {weekdays.map((day, dayIndex) => {
        const dayJobs = jobs.filter(job => job.dayIndex === dayIndex);
        const totalHours = calculateDayLoad(dayIndex);
        
        return (
          <DroppableCell
            key={`${editorId}-${dayIndex}`}
            id={`${editorId}-${dayIndex}`}
            showHeatmap={showHeatmap}
            totalHours={totalHours}
            isActive={isDraggingOver[dayIndex] || false}
          >
            {dayJobs.map((job) => (
              <SortableJobCard 
                key={job.id} 
                job={job} 
                activeId={activeId}
              />
            ))}
          </DroppableCell>
        );
      })}

      {/* Weekend Cells */}
      <DroppableCell
        id={`${editorId}-5`}
        className="hidden xl:block"
        showHeatmap={showHeatmap}
        totalHours={calculateDayLoad(5)}
        isActive={isDraggingOver[5] || false}
      >
        {jobs.filter(job => job.dayIndex === 5).map((job) => (
          <SortableJobCard 
            key={job.id} 
            job={job} 
            activeId={activeId}
          />
        ))}
      </DroppableCell>

      <DroppableCell
        id={`${editorId}-6`}
        className="hidden xl:block"
        showHeatmap={showHeatmap}
        totalHours={calculateDayLoad(6)}
        isActive={isDraggingOver[6] || false}
      >
        {jobs.filter(job => job.dayIndex === 6).map((job) => (
          <SortableJobCard 
            key={job.id} 
            job={job} 
            activeId={activeId}
          />
        ))}
      </DroppableCell>
    </div>
  );
};

export default PreviewEditorRow;
