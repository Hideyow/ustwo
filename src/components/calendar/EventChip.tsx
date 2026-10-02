import type { CalendarEvent } from '@/types/schemas';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/date-helpers';
import { usePartner } from '@/context/partner-context';

interface EventChipProps {
  event: CalendarEvent;
  isMilestoneCell?: boolean;
  dimmed?: boolean;
}

export function EventChip({ event, isMilestoneCell, dimmed }: EventChipProps) {
  const { partner1, partner2 } = usePartner();

  // Anniv & Motmot special layout
  if (
    event.category === 'anniversary' ||
    event.category === 'motmot' ||
    isMilestoneCell
  ) {
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

  // Random Date with details (time, confirmations)
  if (event.category === 'random_date') {
    return (
      <div
        className={cn(
          'w-full bg-[#fdf2f8] border border-pink-200/70 p-1.5 rounded-xl text-left shadow-2xs flex flex-col gap-1 transition-opacity',
          dimmed ? 'opacity-40' : 'opacity-100',
        )}
      >
        <div className="flex items-center gap-1.5">
          {/* Small thumbnail when photos exist */}
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
            {event.confirmedBy.map((p) => {
              const isP1 = p.toLowerCase() === partner1.name.toLowerCase();
              const partner = isP1 ? partner1 : partner2;
              return (
                <span
                  key={p}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-2xs"
                  style={{ backgroundColor: partner.color }}
                  title={`Confirmed by ${partner.name}`}
                >
                  {partner.initial || p[0]}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Gala and Others
  const getBadgeStyle = () => {
    switch (event.category) {
      case 'gala':
        return 'bg-amber-50 text-amber-900 border-amber-200';
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
    if (event.category === 'gala') return '✨';
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