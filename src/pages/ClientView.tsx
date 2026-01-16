import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Job, Status } from '@/hooks/usePlannerData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface JobWithEditor extends Job {
    editorName?: string;
}

export default function ClientView() {
    const { token } = useParams();
    const [job, setJob] = useState<JobWithEditor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;

        const fetchJob = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*, editors(name)')
                    .eq('client_view_token', token)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Job not found");

                setJob({
                    id: data.id,
                    title: data.title,
                    clientName: data.client_name,
                    editorId: data.editor_id,
                    scheduledDate: data.scheduled_date,
                    weekStart: data.week_start,
                    estimatedHours: data.estimated_hours,
                    priority: data.priority,
                    status: data.status,
                    order: data.order,
                    notes: data.notes,
                    deadline: data.deadline,
                    // We can attach editor name loosely
                    // @ts-ignore
                    editorName: data.editors?.name
                });
            } catch (err: any) {
                console.error("Error fetching job", err);
                setError("Could not load job details. The link may be invalid.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">{error || "Job not found"}</p>
                </div>
            </div>
        );
    }

    const statusColors: Record<Status, string> = {
        'queued': 'bg-slate-500',
        'in-progress': 'bg-blue-500',
        'review': 'bg-yellow-500',
        'revision': 'bg-orange-500',
        'approved': 'bg-green-500'
    };

    const statusLabels: Record<Status, string> = {
        'queued': 'In Queue',
        'in-progress': 'In Progress',
        'review': 'Ready for Review',
        'revision': 'Revisions Needed',
        'approved': 'Approved'
    };

    return (
        <div className="min-h-screen bg-secondary/30 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Film className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">EditFlow</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <p className="text-muted-foreground">Project Status Tracker</p>
                </div>

                {/* Status Card */}
                <Card className="mb-8 border-none shadow-lg overflow-hidden">
                    <div className={`h-2 w-full ${statusColors[job.status] || 'bg-slate-500'}`} />
                    <CardContent className="p-8 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-medium mb-4 ${statusColors[job.status] || 'bg-slate-500'}`}>
                            {statusLabels[job.status] || job.status}
                        </span>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            {job.status === 'approved'
                                ? "This project has been approved and completed."
                                : job.status === 'review'
                                    ? "The latest version is ready for you to review."
                                    : "Our team is working on your video."}
                        </p>
                    </CardContent>
                </Card>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>Deadline</span>
                                </div>
                                <span className="font-medium text-sm">
                                    {job.deadline ? format(new Date(job.deadline), 'MMM d, yyyy') : 'No deadline'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span>Editor</span>
                                </div>
                                <span className="font-medium text-sm">
                                    {/* @ts-ignore */ job.editorName || 'Unassigned'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {job.notes || "No additional notes."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
