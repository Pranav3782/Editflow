import { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Clock, Trash2, FileText } from 'lucide-react';
import { Priority, Status, Job } from '@/hooks/usePlannerData';
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
  notes?: string;
  rawFootageUrl?: string; // New
  brandAssetsUrl?: string; // New
  onDelete?: (id: string) => void;
  onUpdateJob?: (id: string, updates: Partial<Job>) => void;
  onClick?: () => void;
}

const DraggableJobCard = ({ id, index, title, clientName, hours, priority, status, notes, rawFootageUrl, brandAssetsUrl, onDelete, onUpdateJob, onClick }: DraggableJobCardProps) => {
  const [note, setNote] = useState(notes || '');
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  useEffect(() => {
    setNote(notes || '');
  }, [notes]);

  const priorityStyles = {
    low: 'border-l-success bg-success/5',
    medium: 'border-l-warning bg-warning/5',
    high: 'border-l-danger bg-danger/5',
  };

  const priorityBadgeStyles = {
    low: 'bg-success/10 text-success',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    high: 'bg-danger/10 text-danger',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
  };

  const handleNoteBlur = () => {
    if (note !== notes) {
      onUpdateJob?.(id, { notes: note });
    }
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
          onClick={onClick}
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

          {/* New: Status Indicator Dot if status != queued */}
          {status !== 'queued' && (
            <div className={cn(
              "absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full",
              status === 'in-progress' && "bg-blue-500",
              status === 'review' && "bg-yellow-500",
              status === 'revision' && "bg-orange-500",
              status === 'approved' && "bg-green-500"
            )} title={status.replace('-', ' ')} />
          )}

          {/* Notes Button */}
          <Popover
            open={isNoteOpen}
            onOpenChange={(open) => {
              if (!open && note !== notes) {
                onUpdateJob?.(id, { notes: note });
              }
              setIsNoteOpen(open);
            }}
          >
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute top-1 right-5 p-1 rounded transition-all",
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
                  onBlur={handleNoteBlur}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className="space-y-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="font-medium text-[10px] text-foreground leading-tight line-clamp-1 pr-8 cursor-default">
                    {title}
                  </h4>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">{title}</p>
                  <p className="text-[10px] text-muted-foreground">{clientName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center justify-between gap-1 mt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock size={9} />
                  <span className="text-[9px]">{hours}h</span>
                </div>
                {/* Assets Links */}
                <div className="flex items-center gap-1">
                  {rawFootageUrl && (
                    <a
                      href={rawFootageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="Raw Footage"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </a>
                  )}
                  {brandAssetsUrl && (
                    <a
                      href={brandAssetsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="Brand Assets"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                    </a>
                  )}
                </div>
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
