import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Job } from '@/hooks/usePlannerData';
import DraggableJobCard from './DraggableJobCard';

interface DroppableCellProps {
  editorId: string;
  dayIndex: number;
  jobs: Job[];
  heatmapClass: string;
  infoText?: string;
  onDeleteJob?: (jobId: string) => void;
  onUpdateJob: (jobId: string, updates: Partial<Job>) => void;
  onJobClick?: (jobId: string) => void;
}

const DroppableCell = ({ editorId, dayIndex, jobs, heatmapClass, infoText, onDeleteJob, onUpdateJob, onJobClick }: DroppableCellProps) => {
  const droppableId = `${editorId}::${dayIndex}`;

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'rounded-lg p-1.5 min-h-[90px] transition-colors duration-200 flex flex-col',
            heatmapClass,
            'border border-transparent',
            snapshot.isDraggingOver && 'border-primary/50 bg-primary/5'
          )}
        >
          <div className="space-y-1.5 mb-auto">
            {jobs.sort((a, b) => a.order - b.order).map((job, index) => (
              <DraggableJobCard
                key={job.id}
                id={job.id}
                index={index}
                title={job.title}
                clientName={job.clientName}
                hours={job.estimatedHours}
                priority={job.priority}
                status={job.status}
                notes={job.notes}
                rawFootageUrl={job.rawFootageUrl}
                brandAssetsUrl={job.brandAssetsUrl}
                onDelete={onDeleteJob}
                onUpdateJob={onUpdateJob}
                onClick={() => onJobClick?.(job.id)}
              />
            ))}
            {provided.placeholder}
          </div>
          {infoText && (
            <div className="text-[9px] text-muted-foreground text-center mt-1 font-medium bg-background/50 rounded py-0.5">
              {infoText}
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default DroppableCell;
