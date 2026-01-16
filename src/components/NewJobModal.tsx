import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Editor, Priority, Status } from '@/hooks/usePlannerData';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  editors: Editor[];
  onSubmit: (job: {
    title: string;
    clientName: string;
    editorId: string | null;
    scheduledDate: number;
    estimatedHours: number;
    priority: Priority;
    status: Status;
    notes?: string;

  }) => void;
}

const days = [
  { value: '0', label: 'Monday' },
  { value: '1', label: 'Tuesday' },
  { value: '2', label: 'Wednesday' },
  { value: '3', label: 'Thursday' },
  { value: '4', label: 'Friday' },
  { value: '5', label: 'Saturday' },
  { value: '6', label: 'Sunday' },
];

const NewJobModal = ({ isOpen, onClose, editors, onSubmit }: NewJobModalProps) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [editorId, setEditorId] = useState<string>('unassigned');
  const [scheduledDate, setScheduledDate] = useState('0');
  const [estimatedHours, setEstimatedHours] = useState('4');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('queued');
  const [notes, setNotes] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !clientName.trim()) return;

    onSubmit({
      title: title.trim(),
      clientName: clientName.trim(),
      editorId: editorId === 'unassigned' ? null : editorId,
      scheduledDate: parseInt(scheduledDate),
      estimatedHours: parseFloat(estimatedHours) || 4,
      priority,
      status,
      notes: notes.trim() || undefined,

    });

    // Reset form
    setTitle('');
    setClientName('');
    setEditorId('unassigned');
    setScheduledDate('0');
    setEstimatedHours('4');
    setPriority('medium');
    setStatus('queued');
    setNotes('');

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">Video Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Brand Story - Nike Campaign"
              className="h-9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-sm">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Nike Inc."
              className="h-9"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Assigned Editor</Label>
              <Select value={editorId} onValueChange={setEditorId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select editor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-muted-foreground italic">
                    Unassigned (Backlog)
                  </SelectItem>
                  {editors.map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      {editor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Scheduled Day</Label>
              <Select value={scheduledDate} onValueChange={setScheduledDate}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-sm">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>



          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or details..."
              className="text-sm min-h-[60px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
              Create Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobModal;
