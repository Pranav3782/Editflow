import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Job, Status, Priority } from '@/hooks/usePlannerData';
import DraggableJobCard from './DraggableJobCard';
import { Lock, AlignLeft } from 'lucide-react';
import { Button } from './ui/button';

interface BacklogSidebarProps {
    jobs: Job[];
    isOpen: boolean;
    isPro: boolean;
    onToggle: () => void;
    onUpgrade: () => void;
    onDeleteJob: (id: string) => void;
    onUpdateJob: (id: string, updates: Partial<Job>) => void;
}

const BacklogSidebar = ({ jobs, isOpen, isPro, onToggle, onUpgrade, onDeleteJob, onUpdateJob }: BacklogSidebarProps) => {
    return (
        <div
            className={cn(
                "border-l border-border/50 bg-card transition-all duration-300 flex flex-col",
                isOpen ? "w-72" : "w-10"
            )}
        >
            <div className="flex items-center justify-between p-3 border-b border-border/50 h-12">
                {isOpen ? (
                    <div className="flex items-center gap-2">
                        <AlignLeft size={16} className="text-muted-foreground" />
                        <span className="font-semibold text-sm">Unassigned</span>
                        <span className="bg-secondary/50 text-[10px] px-1.5 py-0.5 rounded-full text-muted-foreground font-mono">
                            {jobs.length}
                        </span>
                    </div>
                ) : (
                    <AlignLeft size={16} className="text-muted-foreground mx-auto" />
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
                    {isOpen ? "→" : "←"}
                </Button>
            </div>

            {isOpen && (
                <div className="flex-1 overflow-hidden">
                    {!isPro ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-secondary/5">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium">Pro Feature</h3>
                                <p className="text-xs text-muted-foreground">Upgrade to access the unassigned jobs backlog.</p>
                            </div>
                            <Button size="sm" onClick={onUpgrade}>Upgrade to Pro</Button>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto p-3">
                            <Droppable droppableId="backlog">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                            "min-h-[200px] rounded-lg border-2 border-dashed border-border/50 p-2 space-y-2 transition-colors",
                                            snapshot.isDraggingOver ? "bg-secondary/20 border-primary/20" : "bg-transparent"
                                        )}
                                    >
                                        {jobs.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground text-xs italic">
                                                No unassigned jobs. Drag jobs here to backlog them.
                                            </div>
                                        )}
                                        {jobs.map((job, index) => (
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
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BacklogSidebar;
