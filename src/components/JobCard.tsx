import { cn } from '@/lib/utils';
import { Clock, User } from 'lucide-react';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'queued' | 'in-progress' | 'review';

interface JobCardProps {
  title: string;
  client: string;
  hours: number;
  priority: Priority;
  status: Status;
  compact?: boolean;
}

const JobCard = ({ title, client, hours, priority, status, compact = false }: JobCardProps) => {
  const priorityStyles = {
    low: 'border-l-success bg-success/5',
    medium: 'border-l-warning bg-warning/5',
    high: 'border-l-danger bg-danger/5',
  };

  const priorityBadgeStyles = {
    low: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning-foreground',
    high: 'bg-danger/10 text-danger',
  };

  const statusBadgeStyles = {
    'queued': 'bg-secondary text-muted-foreground',
    'in-progress': 'bg-accent/10 text-accent',
    'review': 'bg-primary/10 text-primary-foreground',
  };

  const statusLabels = {
    'queued': 'Queued',
    'in-progress': 'In Progress',
    'review': 'Review',
  };

  if (compact) {
    return (
      <div
        className={cn(
          'draggable-card rounded-md p-2 bg-card border border-border/50 border-l-2 shadow-sm',
          priorityStyles[priority]
        )}
      >
        <div className="space-y-1">
          <h4 className="font-medium text-xs text-foreground leading-tight line-clamp-1">
            {title}
          </h4>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={10} />
              <span className="text-[10px]">{hours}h</span>
            </div>
            <span
              className={cn(
                'text-[9px] font-medium px-1 py-0.5 rounded capitalize',
                priorityBadgeStyles[priority]
              )}
            >
              {priority}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'draggable-card rounded-lg p-3 bg-card border border-border/50 border-l-4 shadow-soft',
        priorityStyles[priority]
      )}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-foreground leading-tight line-clamp-2">
          {title}
        </h4>
        
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <User size={12} />
          <span className="text-xs truncate">{client}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={12} />
            <span className="text-xs">{hours}h</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize',
                priorityBadgeStyles[priority]
              )}
            >
              {priority}
            </span>
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                statusBadgeStyles[status]
              )}
            >
              {statusLabels[status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
