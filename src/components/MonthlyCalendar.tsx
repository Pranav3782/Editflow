import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { cn } from '@/lib/utils';

interface MonthlyCalendarProps {
  getJobCountForDate: (date: Date) => number;
  onDayClick: (date: Date) => void;
}

const MonthlyCalendar = ({ getJobCountForDate, onDayClick }: MonthlyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-card rounded-xl border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={16} className="text-muted-foreground" />
        </button>
        <h2 className="text-sm font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-secondary transition-colors"
        >
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Week Headers */}
      <div className="grid grid-cols-7 border-b border-border/20 bg-secondary/5">
        {weekDays.map((day) => (
          <div key={day} className="px-2 py-1 text-center">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const jobCount = getJobCountForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={index}
              onClick={() => onDayClick(day)}
              className={cn(
                'h-24 p-1 border-b border-r border-border/10 transition-colors hover:bg-secondary/50',
                !isCurrentMonth && 'opacity-40',
                isCurrentDay && 'bg-primary/5'
              )}
            >
              <div className="h-full flex flex-col items-center justify-start pt-1">
                <span className={cn(
                  'text-[10px] font-medium',
                  isCurrentDay ? 'text-primary' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                {jobCount > 0 && (
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: Math.min(jobCount, 3) }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary/60" />
                    ))}
                    {jobCount > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{jobCount - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-border/20 bg-secondary/5">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-primary/60" />
            <span>Job scheduled</span>
          </div>
          <span className="text-border">·</span>
          <span>Click a day to view that week</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
