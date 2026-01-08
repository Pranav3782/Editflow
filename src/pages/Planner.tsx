import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  LayoutGrid,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import EditorRowDraggable from '@/components/EditorRowDraggable';
import PremiumModal from '@/components/PremiumModal';
import NewJobModal from '@/components/NewJobModal';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import TeamView from '@/components/TeamView';
import ThemeToggle from '@/components/ThemeToggle';
import { usePlannerData } from '@/hooks/usePlannerData';
import { useAuth } from '@/contexts/AuthContext';

type View = 'planner' | 'calendar' | 'team';

const Planner = () => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('planner');
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const {
    editors,
    addJob,
    moveJob,
    deleteJob,
    getEditorJobs,
    getEditorCapacity,
    goToPreviousWeek,
    goToNextWeek,
    goToWeek,
    getWeekDates,
    getWeekLabel,
    currentWeekJobCount,
    getJobCountForDate,
    addEditor,
    updateEditor,
    deleteEditor,
    reassignEditorJobs,
    getEditorJobCount,
  } = usePlannerData();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading planner...</div>;
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Parse destination: "editorId::dayIndex"
    const [newEditorId, newDayIndexStr] = destination.droppableId.split('::');
    const newDayIndex = parseInt(newDayIndexStr);

    moveJob(draggableId, newEditorId, newDayIndex, destination.index);
  };

  const handleDayClick = (date: Date) => {
    goToWeek(date);
    setCurrentView('planner');
  };

  const weekDates = getWeekDates();
  const dayLabels = weekDates.map(date => ({
    day: format(date, 'EEE'),
    date: format(date, 'd'),
  }));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border/50 bg-card flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="EditFlow logo" className="h-8 w-auto object-contain flex-shrink-0 rounded-xl" />
            <span className="font-semibold text-foreground">EditFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 py-2">
            Workspace
          </div>
          <button
            onClick={() => setCurrentView('planner')}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
              currentView === 'planner'
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <LayoutGrid size={16} />
            Weekly Planner
          </button>
          <button
            onClick={() => setCurrentView('team')}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
              currentView === 'team'
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Users size={16} />
            Team
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
              currentView === 'calendar'
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Calendar size={16} />
            Calendar
          </button>
        </nav>

        {/* Upgrade CTA */}
        <div className="p-3 border-t border-border/30">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-warning/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Unlock AI scheduling & advanced analytics
            </p>
            <Button size="sm" className="w-full h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
              Upgrade
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-12 border-b border-border/30 bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => navigate('/')}
              aria-label="Go back to home"
            >
              <ArrowLeft size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentView === 'planner' && (
              <Button
                size="sm"
                className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsNewJobModalOpen(true)}
              >
                <Plus size={14} />
                New Job
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-auto">
          {currentView === 'planner' && (
            <div className="bg-card rounded-xl border border-border/30 overflow-hidden max-w-6xl mx-auto">
              {/* Planner Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                  >
                    <ChevronLeft size={16} className="text-muted-foreground" />
                  </button>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{getWeekLabel()}</h2>
                    <p className="text-[11px] text-muted-foreground">{editors.length} editors · {currentWeekJobCount} jobs</p>
                  </div>
                  <button
                    onClick={goToNextWeek}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                  >
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Availability</span>
                    <Switch
                      checked={showHeatmap}
                      onCheckedChange={setShowHeatmap}
                      className="data-[state=checked]:bg-primary scale-90"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-7 text-xs border-border hover:bg-secondary"
                    onClick={() => setIsPremiumModalOpen(true)}
                  >
                    <Sparkles size={12} className="text-primary" />
                    AI Optimize
                    <span className="text-[9px] bg-gradient-to-r from-primary to-warning px-1 py-0.5 rounded text-primary-foreground font-medium flex items-center gap-0.5">
                      <Lock size={8} />
                      Pro
                    </span>
                  </Button>
                </div>
              </div>

              {/* Column Headers with actual dates */}
              <div className="grid gap-1 px-3 py-2 bg-secondary/5 border-b border-border/20"
                style={{ gridTemplateColumns: 'minmax(140px, 180px) repeat(7, 1fr)' }}>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Editor
                </div>
                {dayLabels.map((label, index) => (
                  <div key={index} className="text-center">
                    <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                      {label.day}
                    </div>
                    <div className="text-[10px] text-foreground font-medium">
                      {label.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Editor Rows with Drag & Drop */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="px-3 py-2 space-y-1">
                  {editors.map((editor) => (
                    <EditorRowDraggable
                      key={editor.id}
                      id={editor.id}
                      name={editor.name}
                      capacity={getEditorCapacity(editor.id)}
                      jobs={getEditorJobs(editor.id)}
                      showHeatmap={showHeatmap}
                      onDeleteJob={deleteJob}
                    />
                  ))}
                </div>
              </DragDropContext>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border/20 bg-secondary/5">
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    Open
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    Near capacity
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    Overloaded
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="w-full max-w-4xl mx-auto py-2">
              <MonthlyCalendar
                getJobCountForDate={getJobCountForDate}
                onDayClick={handleDayClick}
              />
            </div>
          )}


          {currentView === 'team' && (
            <TeamView
              editors={editors}
              getEditorCapacity={getEditorCapacity}
              getEditorJobCount={getEditorJobCount}
              onAddEditor={async (editor) => {
                try {
                  await addEditor(editor);
                } catch (error: any) {
                  if (error.message === 'PLAN_LIMIT_REACHED') {
                    setIsPremiumModalOpen(true);
                  }
                }
              }}
              onUpdateEditor={updateEditor}
              onDeleteEditor={deleteEditor}
              onReassignJobs={reassignEditorJobs}
            />
          )}
        </main>
      </div>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        editors={editors}
        onSubmit={addJob}
      />
    </div>
  );
};

export default Planner;
