import type { Category, CalendarEvent } from '@/types/schemas';
import { Pill } from '@/components/ui/Pill';

export type FilterValue = 'all' | Category;

interface FilterTabsProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  events: CalendarEvent[];
}

interface FilterItem {
  id: FilterValue;
  label: string;
  emoji: string;
}

const FILTER_ITEMS: FilterItem[] = [
  { id: 'all', label: 'All', emoji: '' },
  { id: 'date_night', label: 'Date Nights', emoji: '🍷' },
  { id: 'trip', label: 'Trips & Getaways', emoji: '✈️' },
  { id: 'anniversary', label: 'Anniversaries', emoji: '💍' },
  { id: 'little_moment', label: 'Little Moments', emoji: '☕' },
  { id: 'surprise', label: 'Special Surprises', emoji: '🎁' },
];

export function FilterTabs({ activeFilter, onFilterChange, events }: FilterTabsProps) {
  const getCount = (id: FilterValue) => {
    if (id === 'all') return events.length;
    return events.filter((e) => e.category === id).length;
  };

  return (
    <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-0.5 mb-2.5 no-scrollbar">
      {FILTER_ITEMS.map((item) => {
        const count = getCount(item.id);
        const isActive = activeFilter === item.id;
        const displayText = item.emoji
          ? `${item.label} ${item.emoji}`
          : `${item.label} (${count})`;

        return (
          <Pill
            key={item.id}
            active={isActive}
            size="md"
            onClick={() => onFilterChange(item.id)}
            className="whitespace-nowrap shrink-0 font-medium"
          >
            {displayText}
          </Pill>
        );
      })}
    </div>
  );
}
