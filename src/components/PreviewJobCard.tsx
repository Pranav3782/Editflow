import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type Priority = 'low' | 'medium' | 'high';

interface PreviewJobCardProps {
  title: string;
  client: string;
  hours: number;
  priority: Priority;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const PreviewJobCard = forwardRef<HTMLDivElement, PreviewJobCardProps>(
  ({ title, client, hours, priority, isDragging = false, isOverlay = false }, ref) => {
    const [isClicked, setIsClicked] = useState(false);

    const priorityStyles = {
      low: 'border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
      medium: 'border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
      high: 'border-l-rose-400 bg-rose-50/50 dark:bg-rose-950/20',
    };

    const priorityBadgeStyles = {
      low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    };

    const handleClick = () => {
      if (!isDragging && !isOverlay) {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 150);
      }
    };

    const cardContent = (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          'cursor-grab active:cursor-grabbing rounded-lg p-2.5 bg-card border border-border/50 border-l-[3px] select-none',
          priorityStyles[priority],
          isDragging && 'opacity-40',
          isOverlay && 'shadow-2xl ring-2 ring-primary/30 rotate-2 cursor-grabbing',
          isClicked && 'scale-[0.97]',
          !isDragging && !isOverlay && 'hover:scale-[1.02] hover:shadow-md hover:-translate-y-0.5 transition-transform duration-150'
        )}
        style={isOverlay ? { 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: 'rotate(2deg) scale(1.02)',
        } : undefined}
      >
        <div className="space-y-1.5">
          <h4 className="font-medium text-xs text-foreground leading-tight line-clamp-2">
            {title}
          </h4>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={10} />
              <span className="text-[10px]">{hours}h</span>
            </div>
            <span
              className={cn(
                'text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize',
                priorityBadgeStyles[priority]
              )}
            >
              {priority}
            </span>
          </div>
        </div>
      </div>
    );

    // Skip tooltip for overlay card
    if (isOverlay) {
      return cardContent;
    }

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-card border border-border shadow-lg p-3 max-w-[200px]"
          >
            <div className="space-y-2">
              <p className="font-medium text-sm text-foreground">{title}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User size={12} />
                <span className="text-xs">{client}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={12} />
                <span className="text-xs">{hours} hours estimated</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

PreviewJobCard.displayName = 'PreviewJobCard';

export default PreviewJobCard;
