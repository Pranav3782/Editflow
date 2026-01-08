import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Job } from '@/hooks/usePlannerData';
import DraggableJobCard from './DraggableJobCard';

interface DroppableCellProps {
  editorId: string;
  dayIndex: number;
  jobs: Job[];
  heatmapClass: string;
  onDeleteJob?: (jobId: string) => void;
}

const DroppableCell = ({ editorId, dayIndex, jobs, heatmapClass, onDeleteJob }: DroppableCellProps) => {
  const droppableId = `${editorId}::${dayIndex}`;

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'rounded-lg p-1.5 min-h-[90px] transition-colors duration-200',
            heatmapClass,
            'border border-transparent',
            snapshot.isDraggingOver && 'border-primary/50 bg-primary/5'
          )}
        >
          <div className="space-y-1.5">
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
                onDelete={onDeleteJob}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default DroppableCell;
