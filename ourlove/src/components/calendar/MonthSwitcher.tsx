import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { getMonthName, getSeasonalChip } from '@/lib/date-helpers';

interface MonthSwitcherProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddSpecialDate: () => void;
}

export function MonthSwitcher({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onAddSpecialDate,
}: MonthSwitcherProps) {
  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();
  const seasonalText = getSeasonalChip(currentDate.getMonth());

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2">
      {/* Month Navigator + Seasonal Pill */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Month Selector Pill */}
        <div className="inline-flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-purple-100 shadow-xs">
          <button
            onClick={onPrevMonth}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#6e687e] hover:text-[#7c0fd0] hover:bg-purple-50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-sm sm:text-base font-bold text-[#7c0fd0] select-none min-w-[120px] text-center">
            {monthName} {year}
          </span>

          <button
            onClick={onNextMonth}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#6e687e] hover:text-[#7c0fd0] hover:bg-purple-50 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Seasonal Chip */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#fcf0f7] border border-pink-100 text-[11px] font-semibold text-[#b83280] shadow-2xs">
          {seasonalText}
        </div>
      </div>

      {/* Add Special Date Button */}
      <button
        onClick={onAddSpecialDate}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#7c0fd0] to-[#9333ea] text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer self-stretch sm:self-auto justify-center"
      >
        <Heart className="w-3 h-3 fill-white" />
        <span>+ Add Special Date</span>
      </button>
    </div>
  );
}
