import type { CalendarEvent } from '@/types/schemas';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/date-helpers';

interface EventChipProps {
  event: CalendarEvent;
  isMilestoneCell?: boolean;
  dimmed?: boolean;
}

export function EventChip({ event, isMilestoneCell, dimmed }: EventChipProps) {
  // Milestone special layout (used in cell 14)
  if (event.category === 'milestone' || isMilestoneCell) {
    return (
      <div
        className={cn(
          'w-full bg-[#6d28d9] text-white p-2 rounded-xl text-left shadow-xs flex flex-col justify-between transition-opacity',
          dimmed ? 'opacity-40' : 'opacity-100',
        )}
      >
        <span className="font-bold text-[11px] leading-tight line-clamp-1">
          {event.title}
        </span>
        <span className="text-[10px] text-purple-200 line-clamp-1 mt-0.5">
          Our sacred memory
        </span>
      </div>
    );
  }

  // Multi-day trip (e.g., Cabin Getaway 22-23)
  if (event.category === 'trip') {
    return (
      <div
        className={cn(
          'w-full bg-[#f3e8ff] border border-purple-200 text-[#581c87] p-1.5 rounded-xl text-left shadow-2xs flex flex-col gap-0.5 transition-opacity',
          dimmed ? 'opacity-40' : 'opacity-100',
        )}
      >
        <div className="flex items-center gap-1">
          <span className="text-xs">🏕️</span>
          <span className="font-semibold text-[11px] truncate">
            {event.title}
          </span>
        </div>
        {event.description && (
          <span className="text-[9px] text-[#7e22ce] truncate hidden sm:block">
            {event.description}
          </span>
        )}
      </div>
    );
  }

  // Date Night with details (e.g., Oct 18 Italian Pasta Night or Oct 27 Pottery)
  if (event.category === 'date_night') {
    return (
      <div
        className={cn(
          'w-full bg-[#fdf2f8] border border-pink-200/70 p-1.5 rounded-xl text-left shadow-2xs flex flex-col gap-1 transition-opacity',
          dimmed ? 'opacity-40' : 'opacity-100',
        )}
      >
        <div className="flex items-center gap-1.5">
          {/* Small thumbnail for pasta night */}
          {event.photos && event.photos.length > 0 ? (
            <div className="w-5 h-5 rounded-md bg-amber-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px]">
              🍝
            </div>
          ) : (
            <span className="text-xs shrink-0">🍷</span>
          )}
          <span className="font-semibold text-[11px] text-[#831843] truncate">
            {event.title}
          </span>
        </div>

        {event.time && (
          <span className="text-[10px] text-[#9d174d] font-medium pl-1">
            {event.date === '2024-10-27' ? 'Tonight • ' : ''}
            {formatTime(event.time)}
          </span>
        )}

        {/* Small partner initials if available */}
        {event.confirmedBy && event.confirmedBy.length > 0 && (
          <div className="flex items-center -space-x-1 pt-0.5 pl-1">
            {event.confirmedBy.map((p) => (
              <span
                key={p}
                className={cn(
                  'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase',
                  p.toLowerCase().startsWith('a') ? 'bg-purple-600' : 'bg-pink-600',
                )}
              >
                {p[0]}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Little Moments, Surprises, Anniversaries
  const getBadgeStyle = () => {
    switch (event.category) {
      case 'surprise':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'anniversary':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      default:
        return 'bg-purple-50 text-purple-800 border-purple-100';
    }
  };

  const getEmoji = () => {
    if (event.title.toLowerCase().includes('coffee')) return '☕';
    if (event.title.toLowerCase().includes('cinema')) return '🎬';
    if (event.title.toLowerCase().includes('farm')) return '🌽';
    if (event.title.toLowerCase().includes('halloween')) return '🎃';
    if (event.title.toLowerCase().includes('star')) return '✨';
    if (event.category === 'surprise') return '🎁';
    if (event.category === 'anniversary') return '💍';
    return '💜';
  };

  return (
    <div
      className={cn(
        'w-full px-1.5 py-1 rounded-lg border text-left text-[11px] font-medium flex items-center gap-1 shadow-2xs truncate transition-opacity',
        getBadgeStyle(),
        dimmed ? 'opacity-40' : 'opacity-100',
      )}
    >
      <span className="text-[10px] shrink-0">{getEmoji()}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
}
