import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import EditorRow from './EditorRow';
import PremiumModal from './PremiumModal';
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';
import avatar4 from '@/assets/avatar-4.jpg';

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface EditorPlannerProps {
  isPreview?: boolean;
}

const editorsData = [
  {
    id: '1',
    name: 'Marcus Chen',
    avatar: avatar1,
    capacity: 85,
    jobs: [
      { id: 'j1', title: 'Brand Story - Nike Campaign', client: 'Nike Inc.', hours: 6, priority: 'high' as const, status: 'in-progress' as const, dayIndex: 0 },
      { id: 'j2', title: 'Product Launch Teaser', client: 'TechStart', hours: 4, priority: 'medium' as const, status: 'queued' as const, dayIndex: 1 },
      { id: 'j3', title: 'Social Media Reel', client: 'FoodieBox', hours: 2, priority: 'low' as const, status: 'queued' as const, dayIndex: 3 },
    ],
  },
  {
    id: '2',
    name: 'Sarah Kim',
    avatar: avatar2,
    capacity: 45,
    jobs: [
      { id: 'j4', title: 'Documentary Edit', client: 'GreenEarth', hours: 8, priority: 'high' as const, status: 'in-progress' as const, dayIndex: 0 },
      { id: 'j5', title: 'Wedding Highlights', client: 'Private', hours: 5, priority: 'medium' as const, status: 'review' as const, dayIndex: 4 },
    ],
  },
  {
    id: '3',
    name: 'David Miller',
    avatar: avatar3,
    capacity: 95,
    jobs: [
      { id: 'j6', title: 'Corporate Training Video', client: 'Acme Corp', hours: 6, priority: 'medium' as const, status: 'in-progress' as const, dayIndex: 0 },
      { id: 'j7', title: 'Event Recap Video', client: 'TechConf', hours: 4, priority: 'high' as const, status: 'queued' as const, dayIndex: 1 },
      { id: 'j8', title: 'Instagram Ad Series', client: 'BeautyBrand', hours: 3, priority: 'low' as const, status: 'queued' as const, dayIndex: 2 },
      { id: 'j9', title: 'YouTube Tutorial', client: 'LearnTech', hours: 5, priority: 'medium' as const, status: 'queued' as const, dayIndex: 3 },
    ],
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    avatar: avatar4,
    capacity: 30,
    jobs: [
      { id: 'j10', title: 'Music Video Draft', client: 'Indie Artist', hours: 8, priority: 'high' as const, status: 'review' as const, dayIndex: 2 },
    ],
  },
];

const EditorPlanner = ({ isPreview = true }: EditorPlannerProps) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // For preview mode on landing page: show weekdays only on small screens
  const days = isPreview ? allDays : allDays;

  return (
    <div className={`bg-card border border-border/50 overflow-hidden ${isPreview ? 'rounded-2xl shadow-strong' : 'rounded-xl shadow-sm'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-border/50 bg-secondary/20 ${isPreview ? 'px-6 py-4' : 'px-4 py-3'}`}>
        <div className="flex items-center gap-4">
          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="text-center">
            <h3 className={`font-semibold text-foreground ${isPreview ? '' : 'text-sm'}`}>Week of Jan 6–12, 2025</h3>
            <p className="text-xs text-muted-foreground mt-0.5">4 editors · 12 jobs scheduled</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Preview Mode Indicator */}
          {isPreview && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
              <Eye size={12} />
              Preview
            </div>
          )}

          {/* Heatmap Toggle */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Projected Availability</span>
            <Switch
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* AI Button */}
          <Button
            variant="outline"
            className="gap-2 border-border hover:bg-secondary group"
            onClick={() => setIsPremiumModalOpen(true)}
          >
            <Sparkles size={16} className="text-primary group-hover:animate-pulse-soft" />
            <span className="text-sm hidden sm:inline">Optimize Workload</span>
            <span className="text-[10px] bg-gradient-to-r from-primary to-warning px-1.5 py-0.5 rounded-full text-primary-foreground font-medium flex items-center gap-1">
              <Lock size={10} />
              Premium
            </span>
          </Button>
        </div>
      </div>

      {/* Column Headers - Responsive for preview mode */}
      <div className={`grid gap-2 bg-secondary/10 border-b border-border/30 ${isPreview ? 'px-6 py-3' : 'px-4 py-2'}`}
           style={{ gridTemplateColumns: isPreview ? undefined : 'minmax(180px, 1fr) repeat(7, 1fr)' }}>
        {isPreview ? (
          <>
            {/* Preview mode: hide weekend on smaller screens */}
            <div className="grid grid-cols-6 xl:grid-cols-8 gap-2 w-full">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Editor
              </div>
              {weekdays.map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                  {day}
                </div>
              ))}
              {/* Weekend columns - only visible on xl screens */}
              <div className="hidden xl:block text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                Sat
              </div>
              <div className="hidden xl:block text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                Sun
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Editor
            </div>
            {allDays.map((day) => (
              <div key={day} className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                {day}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Editor Rows */}
      <div className={`space-y-3 ${isPreview ? 'px-6 py-4' : 'px-4 py-3 space-y-2'}`}>
        {editorsData.map((editor) => (
          <EditorRow
            key={editor.id}
            name={editor.name}
            avatar={editor.avatar}
            capacity={editor.capacity}
            jobs={editor.jobs}
            showHeatmap={showHeatmap}
            isPreview={isPreview}
          />
        ))}
      </div>

      {/* Footer Stats */}
      <div className={`border-t border-border/30 bg-secondary/10 ${isPreview ? 'px-6 py-4' : 'px-4 py-3'}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">Near capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-xs text-muted-foreground">Overloaded</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Drag cards to reassign jobs between editors and days
          </p>
        </div>
      </div>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
    </div>
  );
};

export default EditorPlanner;
