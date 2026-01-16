import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePlannerData, Editor } from "@/hooks/usePlannerData";
import { Lock, TrendingUp, TrendingDown, Clock, MoveRight, Award, Zap } from "lucide-react";
import { Button } from "./ui/button";

interface PerformanceInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isPro: boolean;
    onUpgrade: () => void;
    editors: Editor[];
    // we'll fetch stats from jobs in here or pass them
}

const PerformanceInsightsModal = ({ isOpen, onClose, isPro, onUpgrade }: PerformanceInsightsModalProps) => {
    const { editors, getEditorJobs } = usePlannerData();

    // Basic Analytics Calculation (Client Side as requested)
    const calculateStats = () => {
        let totalJobs = 0;
        let totalCompleted = 0;
        let totalActualHours = 0;
        let totalEstimatedHours = 0;

        const editorStats = editors.map(editor => {
            const jobs = getEditorJobs(editor.id);
            const completedJobs = jobs.filter(j => j.status === 'approved' || j.status === 'review'); // Assuming review counts towards 'doneness' for velocity? Or strictly approved.
            // Let's stick to Approved for "Completed" stats
            const approvedJobs = jobs.filter(j => j.status === 'approved');

            const actualH = approvedJobs.reduce((sum, j) => sum + (j.actualHours || 0), 0);
            const estH = approvedJobs.reduce((sum, j) => sum + j.estimatedHours, 0);

            if (approvedJobs.length > 0) {
                totalJobs += jobs.length;
                totalCompleted += approvedJobs.length;
                totalActualHours += actualH;
                totalEstimatedHours += estH;
            }

            return {
                ...editor,
                completedCount: approvedJobs.length,
                actualHours: actualH,
                estimatedHours: estH,
                avgTimePerJob: approvedJobs.length ? (actualH / approvedJobs.length).toFixed(1) : 0,
                velocity: approvedJobs.length ? (estH / actualH).toFixed(2) : 0 // > 1 means faster than est
            };
        });

        const fastest = [...editorStats].sort((a, b) => Number(b.velocity) - Number(a.velocity))[0];
        const slowest = [...editorStats].sort((a, b) => Number(a.velocity) - Number(b.velocity))[0];

        return { editorStats, totalActualHours, totalEstimatedHours, fastest, slowest };
    };

    const stats = calculateStats();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <VisuallyHidden>
                        <DialogDescription>
                            Overview of team performance comparisons, efficiency metrics and speed.
                        </DialogDescription>
                    </VisuallyHidden>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Performance Insights</DialogTitle>
                            <p className="text-sm text-muted-foreground">Team velocity & efficiency metrics</p>
                        </div>
                    </div>
                    {!isPro && <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>

                {!isPro ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center border-2 border-dashed border-border/50 rounded-xl bg-secondary/5 m-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h3 className="text-lg font-semibold">Unlock Team Insights</h3>
                            <p className="text-muted-foreground">
                                Pro users get access to editor performance tracking, estimated vs actual hours comparison, and team velocity metrics.
                            </p>
                        </div>
                        <Button onClick={onUpgrade} className="mt-4">Upgrade to Pro</Button>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-6">
                        {/* Top Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Total Actual vs Est.
                                </h4>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-foreground">
                                        {stats.totalActualHours.toFixed(1)}h
                                    </span>
                                    <span className="text-sm text-muted-foreground mb-1">
                                        / {stats.totalEstimatedHours.toFixed(1)}h
                                    </span>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${stats.totalActualHours > stats.totalEstimatedHours ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(100, (stats.totalActualHours / (stats.totalEstimatedHours || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Top Performer
                                </h4>
                                {stats.fastest ? (
                                    <div>
                                        <div className="text-xl font-bold">{stats.fastest.name}</div>
                                        <p className="text-xs text-green-500 font-medium mt-1">
                                            {(Number(stats.fastest.velocity) * 100).toFixed(0)}% Efficiency
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic">No data</span>
                                )}
                            </div>

                            <div className="p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Jobs Completed
                                </h4>
                                <div className="text-2xl font-bold">
                                    {stats.editorStats.reduce((acc, curr) => acc + curr.completedCount, 0)}
                                </div>
                            </div>
                        </div>

                        {/* Editor Table */}
                        <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
                            <div className="bg-secondary/30 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Editor Performance</h3>
                            </div>
                            <div className="divide-y divide-border/50">
                                {stats.editorStats.map((editor) => (
                                    <div key={editor.id} className="p-4 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                                {editor.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{editor.name}</div>
                                                <div className="text-xs text-muted-foreground">{editor.completedCount} jobs completed</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 text-sm">
                                            <div className="text-right">
                                                <div className="font-mono">{editor.avgTimePerJob}h</div>
                                                <div className="text-[10px] text-muted-foreground">Avg Time</div>
                                            </div>
                                            <div className="text-right w-20">
                                                <div className={`font-mono font-medium ${Number(editor.velocity) >= 1 ? 'text-green-500' : 'text-amber-500'}`}>
                                                    {(Number(editor.velocity) * 100).toFixed(0)}%
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">Efficiency</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stats.editorStats.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No editor data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PerformanceInsightsModal;
