import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Filter, ChevronDown, Check, X } from 'lucide-react';
import { getMonthName, getSeasonalChip } from '@/lib/date-helpers';
import type { Category, CalendarEvent } from '@/types/schemas';

export type FilterValue = 'all' | Category;

interface CalendarControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddSpecialDate: () => void;
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  events: CalendarEvent[];
}

interface FilterOption {
  id: FilterValue;
  label: string;
  color: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Moments', color: '#7c0fd0' },
  { id: 'date_night', label: 'Date Nights', color: '#ec4899' },
  { id: 'trip', label: 'Trips & Getaways', color: '#8b5cf6' },
  { id: 'anniversary', label: 'Anniversaries', color: '#6d28d9' },
  { id: 'little_moment', label: 'Little Moments', color: '#f59e0b' },
  { id: 'surprise', label: 'Special Surprises', color: '#f43f5e' },
];

export function CalendarControls({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onAddSpecialDate,
  activeFilter,
  onFilterChange,
  events,
}: CalendarControlsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();
  const seasonalText = getSeasonalChip(currentDate.getMonth());

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCount = (id: FilterValue) => {
    if (id === 'all') return events.length;
    return events.filter((e) => e.category === id).length;
  };

  const activeOption = FILTER_OPTIONS.find((opt) => opt.id === activeFilter) ?? FILTER_OPTIONS[0];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
      {/* Left: Month Navigator & Subtle Season Tag */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-purple-100 shadow-xs">
          <button
            onClick={onPrevMonth}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#6e687e] hover:text-[#7c0fd0] hover:bg-purple-50 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-sm sm:text-base font-bold text-[#7c0fd0] select-none min-w-[120px] text-center">
            {monthName} {year}
          </span>

          <button
            onClick={onNextMonth}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#6e687e] hover:text-[#7c0fd0] hover:bg-purple-50 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-xs font-medium text-[#9d5c8e] hidden md:inline">
          • {seasonalText} ✨
        </span>
      </div>

      {/* Right: Clean Category Filter Dropdown & Add Date Button */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        {/* Category Filter Dropdown (Replaces the crowded row of 6 pills) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              activeFilter !== 'all'
                ? 'bg-purple-50 border-purple-300 text-[#7c0fd0]'
                : 'bg-white border-purple-100 text-[#5a4e70] hover:text-[#7c0fd0] hover:border-purple-200'
            }`}
          >
            <Filter className="w-3 h-3 text-[#7c0fd0]" />
            <span>{activeOption.label}</span>
            {activeFilter !== 'all' && (
              <span className="text-[10px] font-bold bg-[#7c0fd0] text-white px-1.5 py-0.2 rounded-full">
                {getCount(activeFilter)}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Clear filter button if active */}
          {activeFilter !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] hover:bg-purple-800 transition-colors"
              title="Clear filter"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white/98 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-purple-100 z-50 animate-fade-in flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1">
                Filter by Category
              </span>

              {FILTER_OPTIONS.map((opt) => {
                const isSelected = activeFilter === opt.id;
                const count = getCount(opt.id);

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onFilterChange(opt.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 text-[#7c0fd0] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span>{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">({count})</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Special Date Button */}
        <button
          onClick={onAddSpecialDate}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#7c0fd0] to-[#9333ea] text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          <Heart className="w-3 h-3 fill-white" />
          <span>Add Date</span>
        </button>
      </div>
    </div>
  );
}
