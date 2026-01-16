import { cn } from '@/lib/utils';
import CapacityBar from './CapacityBar';
import DroppableCell from './DroppableCell';
import { Job } from '@/hooks/usePlannerData';

interface EditorRowDraggableProps {
  id: string;
  name: string;
  capacity: number;
  dailyCapacity?: number;
  jobs: Job[];
  showHeatmap: boolean;
  onDeleteJob?: (jobId: string) => void;
  onUpdateJob: (jobId: string, updates: Partial<Job>) => void;
  onJobClick?: (jobId: string) => void;
}

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EditorRowDraggable = ({ id, name, capacity, dailyCapacity, jobs, showHeatmap, onDeleteJob, onUpdateJob, onJobClick }: EditorRowDraggableProps) => {
  const dailyCap = dailyCapacity || 8;

  const getHeatmapClass = (totalHours: number) => {
    if (!showHeatmap) return '';
    if (totalHours === 0) return 'heatmap-open';
    if (totalHours > dailyCap) return 'heatmap-danger';
    if (totalHours >= (dailyCap * 0.8)) return 'heatmap-near';
    return 'heatmap-open';
  };

  const getInfoText = (totalHours: number) => {
    if (!showHeatmap && totalHours === 0) return undefined;
    const remaining = dailyCap - totalHours;
    if (remaining < 0) return `${Math.abs(remaining)}h over`;
    if (remaining === 0) return 'Full';
    return `${remaining}h left`;
  };

  return (
    <div className="grid gap-2 min-h-[90px]" style={{ gridTemplateColumns: 'minmax(180px, 1fr) repeat(7, 1fr)' }}>
      {/* Editor Info */}
      <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">{name}</h4>
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Capacity</span>
              <span>{capacity}%</span>
            </div>
            <CapacityBar percentage={capacity} showHeatmap={showHeatmap} />
          </div>
        </div>
      </div>

      {/* Day Cells - Always show all 7 days */}
      {allDays.map((day, dayIndex) => {
        const dayJobs = jobs.filter(job => job.scheduledDate === dayIndex);
        const totalHours = dayJobs.reduce((sum, job) => sum + job.estimatedHours, 0);

        return (
          <DroppableCell
            key={`${id}-${dayIndex}`}
            editorId={id}
            dayIndex={dayIndex}
            jobs={dayJobs}
            heatmapClass={getHeatmapClass(totalHours)}
            infoText={showHeatmap ? getInfoText(totalHours) : undefined}
            onDeleteJob={onDeleteJob}
            onUpdateJob={onUpdateJob}
            onJobClick={onJobClick}
          />
        );
      })}
    </div>
  );
};

export default EditorRowDraggable;
