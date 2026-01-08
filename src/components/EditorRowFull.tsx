import { cn } from '@/lib/utils';
import CapacityBar from './CapacityBar';
import JobCard, { Priority, Status } from './JobCard';

interface Job {
  id: string;
  title: string;
  client: string;
  hours: number;
  priority: Priority;
  status: Status;
  dayIndex: number;
}

interface EditorRowFullProps {
  name: string;
  avatar: string;
  capacity: number;
  jobs: Job[];
  showHeatmap: boolean;
}

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EditorRowFull = ({ name, avatar, capacity, jobs, showHeatmap }: EditorRowFullProps) => {
  const getHeatmapClass = (dayIndex: number) => {
    if (!showHeatmap) return '';
    
    const dayJobs = jobs.filter(job => job.dayIndex === dayIndex);
    const totalHours = dayJobs.reduce((sum, job) => sum + job.hours, 0);
    
    if (totalHours === 0) return 'heatmap-open';
    if (totalHours >= 8) return 'heatmap-danger';
    if (totalHours >= 5) return 'heatmap-near';
    return 'heatmap-open';
  };

  return (
    <div className="grid gap-2 min-h-[90px]" style={{ gridTemplateColumns: 'minmax(180px, 1fr) repeat(7, 1fr)' }}>
      {/* Editor Info */}
      <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
        <img
          src={avatar}
          alt={name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-card"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">{name}</h4>
          <div className="mt-1 space-y-0.5">
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
        const dayJobs = jobs.filter(job => job.dayIndex === dayIndex);
        return (
          <div
            key={day}
            className={cn(
              'rounded-lg p-1.5 min-h-[90px] transition-colors duration-300',
              getHeatmapClass(dayIndex),
              'border border-transparent hover:border-border/50'
            )}
          >
            <div className="space-y-1.5">
              {dayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.title}
                  client={job.client}
                  hours={job.hours}
                  priority={job.priority}
                  status={job.status}
                  compact
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EditorRowFull;
