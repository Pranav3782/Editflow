import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Job, Status, Priority } from "@/hooks/usePlannerData";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle2, AlertCircle, History, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface JobDetailsModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

interface StatusEvent {
    id: string;
    old_status: string;
    new_status: string;
    changed_at: string;
    changed_by: string; // ID
}

interface JobNote {
    id: string;
    content: string;
    created_at: string;
    created_by: string;
    author_name?: string; // Optional
}

const JobDetailsModal = ({ job, isOpen, onClose, isPro, onUpgrade }: JobDetailsModalProps) => {
    const [history, setHistory] = useState<StatusEvent[]>([]);
    const [notes, setNotes] = useState<JobNote[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        if (isOpen && job && isPro) {
            fetchHistory();
            fetchNotes();
        }
    }, [isOpen, job, isPro]);

    const fetchHistory = async () => {
        if (!job) return;
        setLoadingHistory(true);
        const { data } = await supabase
            .from('job_status_history')
            .select('*')
            .eq('job_id', job.id)
            .order('changed_at', { ascending: false });
        if (data) setHistory(data);
        setLoadingHistory(false);
    };

    const fetchNotes = async () => {
        if (!job) return;
        setLoadingNotes(true);
        // Join with profiles if we wanted author name, but for now simple
        const { data } = await supabase
            .from('job_notes')
            .select('*')
            .eq('job_id', job.id)
            .order('created_at', { ascending: false });
        if (data) setNotes(data);
        setLoadingNotes(false);
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !job) return;
        // Optimistic UI could be here, but let's just await
        const { error } = await supabase.from('job_notes').insert({
            job_id: job.id,
            content: newNote.trim(),
            // user_id supplied by auth/context usually, but via trigger or RLS defaults? 
            // Our migration didn't set default using auth.uid(), so we must send it if RLS allows or rely on backend.
            // Wait, `created_by` in schema.
            created_by: (await supabase.auth.getUser()).data.user?.id
        });

        if (!error) {
            setNewNote("");
            fetchNotes();
        }
    };

    if (!job) return null;

    const statusColors: Record<string, string> = {
        'queued': 'bg-slate-500',
        'in-progress': 'bg-blue-500',
        'review': 'bg-yellow-500',
        'revision': 'bg-orange-500',
        'approved': 'bg-green-500'
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border/50">
                    <VisuallyHidden>
                        <DialogDescription>
                            Detailed view of job {job.title} including time tracking, history and notes.
                        </DialogDescription>
                    </VisuallyHidden>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`${statusColors[job.status]} text-white border-none`}>
                                    {job.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">ID: {job.id.slice(0, 8)}</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
                            <p className="text-muted-foreground">{job.clientName}</p>
                        </div>
                        {/* Action Buttons (Edit, etc) could go here */}
                    </div>
                </div>

                {/* Content - Two Columns */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Main Details & Timeline */}
                    <ScrollArea className="flex-1 p-6 border-r border-border/50">
                        <div className="space-y-8">
                            {/* Time Tracking (Pro) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Time & Effort
                                    </h3>
                                    {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
                                </div>

                                {!isPro ? (
                                    <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 text-center space-y-2 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={onUpgrade}>
                                        <p className="text-sm font-medium">Unlock Time Tracking</p>
                                        <p className="text-xs text-muted-foreground">See actual hours vs estimated for every job.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-secondary/10 rounded border border-border/50">
                                            <span className="text-xs text-muted-foreground block mb-1">Estimated</span>
                                            <span className="text-lg font-mono font-medium">{job.estimatedHours}h</span>
                                        </div>
                                        <div className="p-3 bg-secondary/10 rounded border border-border/50">
                                            <span className="text-xs text-muted-foreground block mb-1">Actual</span>
                                            <span className={`text-lg font-mono font-medium ${job.actualHours && job.actualHours > job.estimatedHours ? 'text-red-500' : 'text-green-500'}`}>
                                                {job.actualHours ? `${job.actualHours}h` : '--'}
                                            </span>
                                        </div>
                                        {/* Timestamps */}
                                        {job.startedAt && (
                                            <p className="col-span-2 text-xs text-muted-foreground">
                                                Started: {format(new Date(job.startedAt), 'MMM d, h:mm a')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* Status History (Pro) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <History className="w-4 h-4" />
                                        History
                                    </h3>
                                    {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
                                </div>

                                {!isPro ? (
                                    <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 text-start space-y-1 opacity-70">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-2 h-2 rounded-full bg-border" />
                                            Job Created
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-2 h-2 rounded-full bg-border" />
                                            Status changed to In Progress
                                        </div>
                                        <Button variant="link" className="h-auto p-0 text-xs mt-2" onClick={onUpgrade}>Upgrade to see full history</Button>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-border/50 ml-2 space-y-6 pl-6 py-2">
                                        {history.map((event) => (
                                            <div key={event.id} className="relative">
                                                <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-secondary border border-border" />
                                                <p className="text-sm font-medium">
                                                    Changed to <span className="capitalize">{event.new_status}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(event.changed_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="relative">
                                            <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-secondary border border-border" />
                                            <p className="text-sm font-medium">Job Created</p>
                                            {/* We could use job.created_at if available or assume it's the end of history */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Right: Notes (Pro) */}
                    <div className="w-80 border-l border-border/50 bg-secondary/5 flex flex-col">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Notes</h3>
                            {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>

                        {!isPro ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Internal team notes are available on the Pro plan.</p>
                                <Button size="sm" onClick={onUpgrade}>Upgrade to Pro</Button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {notes.length === 0 && (
                                            <p className="text-xs text-muted-foreground text-center italic py-4">No notes yet.</p>
                                        )}
                                        {notes.map((note) => (
                                            <div key={note.id} className="bg-card p-3 rounded-lg border border-border/50 shadow-sm text-sm space-y-2">
                                                <p className="text-foreground/90">{note.content}</p>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{formatDistanceToNow(new Date(note.created_at))} ago</span>
                                                    {/* <span>{note.created_by}</span> Author? */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 border-t border-border/50 bg-card">
                                    <Textarea
                                        placeholder="Add a note..."
                                        className="min-h-[80px] mb-2 text-sm resize-none"
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={handleAddNote}>Post</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JobDetailsModal;
