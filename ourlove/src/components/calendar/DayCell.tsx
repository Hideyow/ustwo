import type { CalendarEvent } from '@/types/schemas';
import { cn } from '@/lib/utils';
import { toISODate } from '@/lib/date-helpers';
import { EventChip } from './EventChip';
import { Heart } from 'lucide-react';

interface DayCellProps {
  date: Date;
  currentMonth: number;
  isSelected: boolean;
  isTodayDate: boolean;
  events: CalendarEvent[];
  activeFilter: string;
  onSelect: (dateStr: string) => void;
}

export function DayCell({
  date,
  currentMonth,
  isSelected,
  isTodayDate,
  events,
  activeFilter,
  onSelect,
}: DayCellProps) {
  const dateStr = toISODate(date);
  const dayNum = date.getDate();
  const isCurrentMonth = date.getMonth() === currentMonth;
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Milestone event check
  const milestoneEvent = events.find((e) => e.category === 'milestone');
  const isMilestone = Boolean(milestoneEvent);

  // Check multi-day event spanning
  const isMultiDayStart = events.some((e) => e.endDate && e.date === dateStr);

  const handleClick = () => {
    onSelect(dateStr);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(dateStr);
    }
  };

  return (
    <div
      role="gridcell"
      tabIndex={isCurrentMonth ? 0 : -1}
      aria-selected={isSelected}
      aria-label={`${date.toDateString()}, ${events.length} events`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative min-h-[60px] sm:min-h-[68px] lg:min-h-[74px] p-1.5 flex flex-col justify-between transition-all duration-150 border-r border-b border-purple-50/80 cursor-pointer select-none text-left',
        // Weekend tint
        isWeekend ? 'bg-[#fcf8fc]/60' : 'bg-white',
        // Adjacent month styling
        !isCurrentMonth && 'opacity-35 bg-purple-50/20',
        // Selected day styling (matches 18th in screenshot)
        isSelected &&
          'bg-[#faf0ff] ring-2 ring-[#9333ea] ring-inset z-10 shadow-xs rounded-xl',
        // Hover
        'hover:bg-[#fcf5ff]',
      )}
    >
      {/* Top Header of Day Cell: Number & Badges */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        {/* Date number */}
        {isTodayDate ? (
          // TODAY badge matching Oct 27 in screenshot
          <div className="flex items-center gap-1 bg-[#d946ef] text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-xs">
            <span>{dayNum}</span>
            <span className="text-[8px] tracking-wide">TODAY</span>
          </div>
        ) : isSelected ? (
          // Selected badge matching Oct 18 in screenshot
          <div className="w-5 h-5 rounded-full bg-[#7c0fd0] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
            {dayNum}
          </div>
        ) : isMilestone ? (
          // Milestone badge matching Oct 14 in screenshot
          <div className="w-5 h-5 rounded-full bg-[#6d28d9] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
            {dayNum}
          </div>
        ) : (
          <span
            className={cn(
              'text-[11px] font-semibold px-1 py-0.5 rounded-md transition-colors',
              isWeekend ? 'text-[#be185d]' : 'text-[#4c425e]',
              !isCurrentMonth && 'text-gray-400',
            )}
          >
            {dayNum}
          </span>
        )}

        {/* Milestone heart badge on top right of cell */}
        {isMilestone && (
          <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-[#ec4899]">
            <Heart className="w-3 h-3 fill-[#ec4899]" />
          </div>
        )}

        {/* Multi-day pill */}
        {isMultiDayStart && (
          <div className="bg-[#ede4ff] text-[#6b21a8] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            Multi-Day
          </div>
        )}
      </div>

      {/* Events stack — max 1 visible, then +N badge */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
        {events.slice(0, 1).map((event) => {
          const matchesFilter =
            activeFilter === 'all' || event.category === activeFilter;
          return (
            <EventChip
              key={event.id}
              event={event}
              isMilestoneCell={isMilestone}
              dimmed={!matchesFilter}
            />
          );
        })}
        {events.length > 1 && (
          <div className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full text-center whitespace-nowrap">
            +{events.length - 1} more
          </div>
        )}
      </div>

      {/* Tiny subtle hover indicator dot */}
      <div className="h-1 w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
      </div>
    </div>
  );
}
