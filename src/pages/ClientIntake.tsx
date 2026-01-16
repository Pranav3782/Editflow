import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ClientIntake() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        clientName: '',
        description: '',
        deadline: '',
        estimatedHours: '4',
        rawFootageUrl: '',
        brandAssetsUrl: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            toast.error("Invalid intake link (missing agency ID)");
            return;
        }

        try {
            setLoading(true);

            const jobData = {
                user_id: userId,
                title: formData.title,
                client_name: formData.clientName,
                status: 'queued',
                priority: 'medium',
                editor_id: null, // Unassigned
                scheduled_date: 0, // Default to Monday or logic placeholder
                week_start: new Date().toISOString().split('T')[0], // Assign to current week? Or backlog doesn't care?
                // Backlog jobs might check week_start, but unassigned usually ignores date. 
                // We'll set it to current week Monday just in case.
                estimated_hours: parseFloat(formData.estimatedHours) || 4,
                notes: formData.description,
                // Premium fields
                raw_footage_url: formData.rawFootageUrl,
                brand_assets_url: formData.brandAssetsUrl,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            };

            const { error } = await supabase.from('jobs').insert(jobData);

            if (error) {
                console.error("Intake Error", error);
                throw error;
            }

            setSuccess(true);
            toast.success("Request submitted successfully!");
        } catch (error: any) {
            toast.error(`Submission failed: ${error.message || "Please contact the agency directly."}`);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
                <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-lg border border-border text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h2 className="text-2xl font-bold">Request Received</h2>
                    <p className="text-muted-foreground">
                        Your video request has been submitted to the team queue. We'll be in touch soon!
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Submit Another Request
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-xl shadow-lg border border-border p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">New Video Request</h1>
                        <p className="text-muted-foreground">Fill out the details below to submit a new editing task.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="clientName">Your Name / Company</Label>
                                    <Input
                                        id="clientName"
                                        required
                                        placeholder="e.g. Acme Corp"
                                        value={formData.clientName}
                                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Video Title</Label>
                                <Input
                                    id="title"
                                    required
                                    placeholder="e.g. Q3 Marketing Reel"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="footage">Raw Footage Link</Label>
                                <Input
                                    id="footage"
                                    placeholder="Dropbox / Google Drive / Frame.io link"
                                    value={formData.rawFootageUrl}
                                    onChange={e => setFormData({ ...formData, rawFootageUrl: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assets">Brand Assets Link (Optional)</Label>
                                <Input
                                    id="assets"
                                    placeholder="Link to logos, fonts, branding..."
                                    value={formData.brandAssetsUrl}
                                    onChange={e => setFormData({ ...formData, brandAssetsUrl: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Brief / Description</Label>
                                <Textarea
                                    id="description"
                                    required
                                    placeholder="Describe what you need..."
                                    className="min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hours">Estimated Complexity (Hours)</Label>
                                <Input
                                    id="hours"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="4"
                                    value={formData.estimatedHours}
                                    onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                                />
                                <p className="text-[11px] text-muted-foreground">Best estimate helps us schedule faster.</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
