import { cn } from '@/lib/utils';
import CapacityBar from './CapacityBar';
import DroppableCell from './DroppableCell';
import { Job } from '@/hooks/usePlannerData';

interface EditorRowDraggableProps {
  id: string;
  name: string;
  capacity: number;
  jobs: Job[];
  showHeatmap: boolean;
  onDeleteJob?: (jobId: string) => void;
}

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EditorRowDraggable = ({ id, name, capacity, jobs, showHeatmap, onDeleteJob }: EditorRowDraggableProps) => {
  const getHeatmapClass = (dayIndex: number) => {
    if (!showHeatmap) return '';
    
    const dayJobs = jobs.filter(job => job.scheduledDate === dayIndex);
    const totalHours = dayJobs.reduce((sum, job) => sum + job.estimatedHours, 0);
    
    if (totalHours === 0) return 'heatmap-open';
    if (totalHours >= 8) return 'heatmap-danger';
    if (totalHours >= 5) return 'heatmap-near';
    return 'heatmap-open';
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
        return (
          <DroppableCell
            key={`${id}-${dayIndex}`}
            editorId={id}
            dayIndex={dayIndex}
            jobs={dayJobs}
            heatmapClass={getHeatmapClass(dayIndex)}
            onDeleteJob={onDeleteJob}
          />
        );
      })}
    </div>
  );
};

export default EditorRowDraggable;
