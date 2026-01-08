import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Clock, Trash2, FileText } from 'lucide-react';
import { Priority, Status } from '@/hooks/usePlannerData';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface DraggableJobCardProps {
  id: string;
  index: number;
  title: string;
  clientName: string;
  hours: number;
  priority: Priority;
  status: Status;
  onDelete?: (id: string) => void;
}

// Local state for job notes (persists during session only)
const jobNotesStore: Record<string, string> = {};

const DraggableJobCard = ({ id, index, title, clientName, hours, priority, status, onDelete }: DraggableJobCardProps) => {
  const [note, setNote] = useState(jobNotesStore[id] || '');
  const [isNoteOpen, setIsNoteOpen] = useState(false);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    jobNotesStore[id] = value;
  };

  const hasNote = note.trim().length > 0;

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group rounded-md p-2 bg-card border border-border/50 border-l-2 shadow-sm cursor-grab active:cursor-grabbing transition-shadow relative',
            priorityStyles[priority],
            snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
          )}
        >
          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-danger/10 transition-all"
            >
              <Trash2 size={10} className="text-danger" />
            </button>
          )}

          {/* Notes Button */}
          <Popover open={isNoteOpen} onOpenChange={setIsNoteOpen}>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute top-1 right-6 p-1 rounded transition-all",
                  hasNote 
                    ? "opacity-100 text-primary" 
                    : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText size={10} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-56 p-2" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Job Notes</p>
                <Textarea
                  placeholder="Add notes..."
                  value={note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className="space-y-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="font-medium text-[10px] text-foreground leading-tight line-clamp-1 pr-10 cursor-default">
                    {title}
                  </h4>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock size={9} />
                <span className="text-[9px]">{hours}h</span>
              </div>
              <span
                className={cn(
                  'text-[8px] font-medium px-1 py-0.5 rounded capitalize',
                  priorityBadgeStyles[priority]
                )}
              >
                {priority}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableJobCard;
