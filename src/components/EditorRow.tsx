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

interface EditorRowProps {
  name: string;
  avatar: string;
  capacity: number;
  jobs: Job[];
  showHeatmap: boolean;
  isPreview?: boolean;
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const EditorRow = ({ name, avatar, capacity, jobs, showHeatmap, isPreview = true }: EditorRowProps) => {
  const getHeatmapClass = (dayIndex: number) => {
    if (!showHeatmap) return '';
    
    const dayJobs = jobs.filter(job => job.dayIndex === dayIndex);
    const totalHours = dayJobs.reduce((sum, job) => sum + job.hours, 0);
    
    if (totalHours === 0) return 'heatmap-open';
    if (totalHours >= 8) return 'heatmap-danger';
    if (totalHours >= 5) return 'heatmap-near';
    return 'heatmap-open';
  };

  // Filter jobs for weekend (only show on xl screens)
  const saturdayJobs = jobs.filter(job => job.dayIndex === 5);
  const sundayJobs = jobs.filter(job => job.dayIndex === 6);

  return (
    <div className="grid grid-cols-6 xl:grid-cols-8 gap-2 min-h-[100px]">
      {/* Editor Info */}
      <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-card"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">{name}</h4>
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Capacity</span>
              <span>{capacity}%</span>
            </div>
            <CapacityBar percentage={capacity} showHeatmap={showHeatmap} />
          </div>
        </div>
      </div>

      {/* Weekday Cells - Always visible */}
      {weekdays.map((day, dayIndex) => {
        const dayJobs = jobs.filter(job => job.dayIndex === dayIndex);
        return (
          <div
            key={day}
            className={cn(
              'rounded-lg p-2 min-h-[100px] transition-colors duration-300',
              getHeatmapClass(dayIndex),
              'border border-transparent hover:border-border/50'
            )}
          >
            <div className="space-y-2">
              {dayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.title}
                  client={job.client}
                  hours={job.hours}
                  priority={job.priority}
                  status={job.status}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Weekend Cells - Only visible on xl screens for preview mode */}
      <div
        className={cn(
          'hidden xl:block rounded-lg p-2 min-h-[100px] transition-colors duration-300',
          getHeatmapClass(5),
          'border border-transparent hover:border-border/50'
        )}
      >
        <div className="space-y-2">
          {saturdayJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              client={job.client}
              hours={job.hours}
              priority={job.priority}
              status={job.status}
            />
          ))}
        </div>
      </div>
      <div
        className={cn(
          'hidden xl:block rounded-lg p-2 min-h-[100px] transition-colors duration-300',
          getHeatmapClass(6),
          'border border-transparent hover:border-border/50'
        )}
      >
        <div className="space-y-2">
          {sundayJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              client={job.client}
              hours={job.hours}
              priority={job.priority}
              status={job.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorRow;
