import { useState } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Editor } from '@/hooks/usePlannerData';
import { cn } from '@/lib/utils';

interface TeamViewProps {
  editors: Editor[];
  getEditorCapacity: (editorId: string) => number;
  getEditorJobCount: (editorId: string) => number;
  onAddEditor: (editor: Omit<Editor, 'id'>) => void;
  onUpdateEditor: (editorId: string, updates: Partial<Editor>) => void;
  onDeleteEditor: (editorId: string) => void;
  onReassignJobs: (fromEditorId: string, toEditorId: string) => void;
}

const TeamView = ({
  editors,
  getEditorCapacity,
  getEditorJobCount,
  onAddEditor,
  onUpdateEditor,
  onDeleteEditor,
  onReassignJobs,
}: TeamViewProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [reassignToEditorId, setReassignToEditorId] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [weeklyCapacity, setWeeklyCapacity] = useState('40');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddEditor({ name: name.trim(), weeklyCapacity: parseInt(weeklyCapacity) || 40 });
    setName('');
    setWeeklyCapacity('40');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditor || !name.trim()) return;
    onUpdateEditor(selectedEditor.id, { name: name.trim(), weeklyCapacity: parseInt(weeklyCapacity) || 40 });
    setIsEditModalOpen(false);
    setSelectedEditor(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedEditor) return;
    const jobCount = getEditorJobCount(selectedEditor.id);
    
    if (jobCount > 0 && reassignToEditorId) {
      onReassignJobs(selectedEditor.id, reassignToEditorId);
    }
    
    onDeleteEditor(selectedEditor.id);
    setIsDeleteModalOpen(false);
    setSelectedEditor(null);
    setReassignToEditorId('');
  };

  const openEditModal = (editor: Editor) => {
    setSelectedEditor(editor);
    setName(editor.name);
    setWeeklyCapacity(editor.weeklyCapacity.toString());
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (editor: Editor) => {
    setSelectedEditor(editor);
    setReassignToEditorId('');
    setIsDeleteModalOpen(true);
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity < 60) return 'bg-success';
    if (capacity < 85) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="bg-card rounded-xl border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Team Management</h2>
          <p className="text-[11px] text-muted-foreground">{editors.length} editors</p>
        </div>
        <Button 
          size="sm" 
          className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            setName('');
            setWeeklyCapacity('40');
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={14} />
          Add Editor
        </Button>
      </div>

      {/* Editor List */}
      <div className="divide-y divide-border/20">
        {editors.map((editor) => {
          const capacity = getEditorCapacity(editor.id);
          const jobCount = getEditorJobCount(editor.id);
          
          return (
            <div key={editor.id} className="px-4 py-3 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User size={18} className="text-muted-foreground" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">{editor.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {editor.weeklyCapacity}h/week
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {jobCount} job{jobCount !== 1 ? 's' : ''} assigned
                  </span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="w-24">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Capacity</span>
                  <span>{capacity}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn('h-full rounded-full transition-all', getCapacityColor(capacity))}
                    style={{ width: `${Math.min(capacity, 100)}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(editor)}
                  className="p-1.5 rounded hover:bg-secondary transition-colors"
                >
                  <Pencil size={14} className="text-muted-foreground" />
                </button>
                <button
                  onClick={() => openDeleteModal(editor)}
                  className="p-1.5 rounded hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={14} className="text-danger" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Editor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Editor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                className="h-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-sm">Weekly Capacity (hours)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="80"
                value={weeklyCapacity}
                onChange={(e) => setWeeklyCapacity(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-9">
                Cancel
              </Button>
              <Button type="submit" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                Add Editor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Editor Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Editor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                className="h-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity" className="text-sm">Weekly Capacity (hours)</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                max="80"
                value={weeklyCapacity}
                onChange={(e) => setWeeklyCapacity(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="h-9">
                Cancel
              </Button>
              <Button type="submit" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Editor Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Delete Editor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEditor && getEditorJobCount(selectedEditor.id) > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{selectedEditor.name}</span> has{' '}
                  <span className="font-medium text-foreground">{getEditorJobCount(selectedEditor.id)}</span> job(s) assigned.
                  Please select another editor to reassign these jobs to:
                </p>
                <Select value={reassignToEditorId} onValueChange={setReassignToEditorId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select editor" />
                  </SelectTrigger>
                  <SelectContent>
                    {editors.filter(e => e.id !== selectedEditor.id).map((editor) => (
                      <SelectItem key={editor.id} value={editor.id}>
                        {editor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{selectedEditor?.name}</span>?
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="h-9">
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={selectedEditor ? getEditorJobCount(selectedEditor.id) > 0 && !reassignToEditorId : true}
                className="h-9"
              >
                Delete Editor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamView;
