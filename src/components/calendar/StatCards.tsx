import { useMemo } from 'react';
import type { CalendarEvent } from '@/types/schemas';
import { usePartner } from '@/context/partner-context';
import { Calendar, Sparkles, Heart } from 'lucide-react';
import { getMonthName } from '@/lib/date-helpers';

interface StatCardsProps {
  events: CalendarEvent[];
  currentDate: Date;
}

export function StatCards({ events, currentDate }: StatCardsProps) {
  const { partner1, partner2, daysTogether } = usePartner();

  // Moments this month
  const monthMomentsCount = useMemo(() => {
    const yearStr = String(currentDate.getFullYear());
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${yearStr}-${monthStr}`;
    return events.filter((e) => e.date.startsWith(prefix)).length;
  }, [events, currentDate]);

  // Next upcoming special event (from real current date)
  const upcomingInfo = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcoming = events
      .filter((e) => new Date(e.date + 'T00:00:00') >= todayMidnight)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    if (upcoming) {
      const target = new Date(upcoming.date + 'T00:00:00');
      const diffDays = Math.ceil(
        (target.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        badge: diffDays === 0 ? 'Today! ✨' : `In ${diffDays} Day${diffDays === 1 ? '' : 's'}`,
        desc: upcoming.title,
      };
    }

    return {
      badge: 'Next Date',
      desc: 'No plans yet — plan a sweet date night! 💕',
    };
  }, [events]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2.5">
      {/* Card 1: Moments Count */}
      <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
          <Calendar className="w-5 h-5 text-[#7c0fd0]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
            {monthMomentsCount} Moments
          </span>
          <span className="text-[11px] text-[#6e687e] font-medium">
            Shared adventures this {getMonthName(currentDate.getMonth())}
          </span>
        </div>
      </div>

      {/* Card 2: Upcoming Adventure */}
      <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
          <Sparkles className="w-5 h-5 text-[#ec4899]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
            {upcomingInfo.badge}
          </span>
          <span className="text-[11px] text-[#6e687e] font-medium line-clamp-1">
            {upcomingInfo.desc}
          </span>
        </div>
      </div>

      {/* Card 3: Days Together */}
      <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center justify-between gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
            <Heart className="w-5 h-5 text-[#7c3aed] fill-[#7c3aed]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
              {daysTogether} Days
            </span>
            <span className="text-[11px] text-[#6e687e] font-medium">
              Our love story continues
            </span>
          </div>
        </div>

        {/* Partner badges */}
        <div className="flex items-center -space-x-1.5 shrink-0">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-xs"
            style={{ backgroundColor: partner1.color }}
          >
            {partner1.initial}
          </div>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-xs"
            style={{ backgroundColor: partner2.color }}
          >
            {partner2.initial}
          </div>
        </div>
      </div>
    </div>
  );
}
