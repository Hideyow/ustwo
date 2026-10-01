import { useMemo, useRef } from 'react';
import type { CalendarEvent } from '@/types/schemas';
import { DayCell } from './DayCell';
import { getCalendarDays, toISODate, isSameDay } from '@/lib/date-helpers';

interface CalendarGridProps {
  currentDate: Date;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  events: CalendarEvent[];
  activeFilter: string;
}

const WEEK_DAYS = [
  { short: 'Mon', isWeekend: false },
  { short: 'Tue', isWeekend: false },
  { short: 'Wed', isWeekend: false },
  { short: 'Thu', isWeekend: false },
  { short: 'Fri', isWeekend: false },
  { short: 'Sat', isWeekend: true },
  { short: 'Sun', isWeekend: true },
];

export function CalendarGrid({
  currentDate,
  selectedDateStr,
  onSelectDate,
  events,
  activeFilter,
}: CalendarGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate 42 calendar cells
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Today reference: real current date
  const todayReference = useMemo(() => new Date(), []);

  // Group events by ISO date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  // Keyboard navigation across grid
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;

    e.preventDefault();
    const currentSelected = new Date(selectedDateStr + 'T00:00:00');
    const newDate = new Date(currentSelected);

    if (e.key === 'ArrowLeft') newDate.setDate(newDate.getDate() - 1);
    if (e.key === 'ArrowRight') newDate.setDate(newDate.getDate() + 1);
    if (e.key === 'ArrowUp') newDate.setDate(newDate.getDate() - 7);
    if (e.key === 'ArrowDown') newDate.setDate(newDate.getDate() + 7);

    onSelectDate(toISODate(newDate));
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl p-3.5 sm:p-4 shadow-[var(--shadow-card)] border border-purple-50 flex flex-col justify-between gap-2.5">
      {/* 7-day Calendar Grid Container */}
      <div
        ref={gridRef}
        role="grid"
        aria-label="Monthly shared calendar"
        onKeyDown={handleKeyDown}
        className="w-full border border-purple-100/80 rounded-2xl overflow-hidden focus:outline-none"
      >
        {/* Header: Mon - Sun */}
        <div
          role="row"
          className="grid grid-cols-7 border-b border-purple-100 bg-[#fbf7fe] text-center"
        >
          {WEEK_DAYS.map((day) => (
            <div
              key={day.short}
              role="columnheader"
              className={`py-1.5 text-[11px] font-bold select-none ${
                day.isWeekend ? 'text-[#be185d] bg-pink-50/40' : 'text-[#5d5173]'
              }`}
            >
              {day.short}
            </div>
          ))}
        </div>

        {/* Days Matrix (6 rows x 7 columns) */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayDate) => {
            const dateStr = toISODate(dayDate);
            const isSelected = dateStr === selectedDateStr;
            const isToday = isSameDay(dayDate, todayReference);
            const dayEvents = eventsByDate.get(dateStr) ?? [];

            return (
              <DayCell
                key={dateStr}
                date={dayDate}
                currentMonth={currentDate.getMonth()}
                isSelected={isSelected}
                isTodayDate={isToday}
                events={dayEvents}
                activeFilter={activeFilter}
                onSelect={onSelectDate}
              />
            );
          })}
        </div>
      </div>

      {/* Legend & Hint matching screenshot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#706484] px-1 pt-0.5">
        {/* Legend dots */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#6d28d9]" />
            <span>Milestones</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
            <span>Date Nights</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span>Getaways</span>
          </div>
        </div>

        {/* Italic hint on right */}
        <div className="italic text-[#8c2bf8] flex items-center gap-1 font-medium">
          <span>Click any date cell to view memories or edit plans</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  );
}
