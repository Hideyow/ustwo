import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { PinnedNoteBanner } from '@/components/calendar/PinnedNoteBanner';
import { StatCards } from '@/components/calendar/StatCards';
import { CalendarControls, type FilterValue } from '@/components/calendar/CalendarControls';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { DateInspector } from '@/components/calendar/DateInspector';
import { QuickPlanEditor } from '@/components/calendar/QuickPlanEditor';
import type { CalendarEvent, EventFormValues } from '@/types/schemas';
import { toISODate } from '@/lib/date-helpers';
import { usePartner } from '@/context/partner-context';
import { toast } from 'sonner';

export function CalendarPage() {
  const { currentPartner } = usePartner();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters for shareable URL state
  const activeFilter = (searchParams.get('filter') as FilterValue) || 'all';
  const selectedDateStr = searchParams.get('date') || toISODate(new Date());

  // Month navigation: default to real current date
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isPlanningNew, setIsPlanningNew] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Queries & Mutations
  const { data: events = [] } = useEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  // All events for the selected date
  const selectedDateEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  const selectedEvent = selectedDateEvents[activeEventIndex] ?? selectedDateEvents[0] ?? null;

  // Handler for changing filter
  const handleFilterChange = (filter: FilterValue) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (filter === 'all') {
        next.delete('filter');
      } else {
        next.set('filter', filter);
      }
      return next;
    });
  };

  // Handler for selecting date
  const handleSelectDate = (dateStr: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('date', dateStr);
      return next;
    });
    setIsPlanningNew(false);
    setActiveEventIndex(0);
    // If editing a different event, clear edit mode
    if (editingEvent && editingEvent.date !== dateStr) {
      setEditingEvent(null);
    }
  };

  // Month switcher actions
  const handlePrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleAddSpecialDate = () => {
    setEditingEvent(null);
    setIsPlanningNew(true);
  };

  // Plan or save event
  const handleSavePlan = (
    values: EventFormValues & { photos?: { url: string; addedBy: string }[] },
  ) => {
    if (editingEvent) {
      if (editingEvent.createdBy && editingEvent.createdBy.toLowerCase() !== currentPartner.name.toLowerCase()) {
        toast.error(`Only ${editingEvent.createdBy} can edit this date!`);
        return;
      }
      updateMutation.mutate(
        {
          id: editingEvent.id,
          ...values,
          photos: values.photos ?? editingEvent.photos,
        },
        {
          onSuccess: () => {
            setEditingEvent(null);
            setIsPlanningNew(false);
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          ...values,
          favorite: false,
          confirmedBy: [currentPartner.name],
          tasks: [],
          photos: values.photos ?? [],
          createdBy: currentPartner.name,
        },
        {
          onSuccess: () => {
            setIsPlanningNew(false);
          },
        },
      );
    }
  };

  const handleConfirmDate = (event: CalendarEvent) => {
    const existing = event.confirmedBy || [];
    const isAlreadyConfirmed = existing.some(
      (name) => name.toLowerCase() === currentPartner.name.toLowerCase(),
    );
    if (!isAlreadyConfirmed) {
      const nextConfirmed = [...existing, currentPartner.name];
      updateMutation.mutate({
        id: event.id,
        confirmedBy: nextConfirmed,
      });
      toast.success(`Confirmed by ${currentPartner.name}! 💕`, {
        description: 'Both partners confirmed this special date!',
      });
    }
  };

  const handleToggleFavorite = (event: CalendarEvent) => {
    updateMutation.mutate({
      id: event.id,
      favorite: !event.favorite,
    });
    toast.success(
      !event.favorite ? 'Marked as favorite moment! 💖' : 'Removed from favorites',
    );
  };

  const handleDeleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    if (target?.createdBy && target.createdBy.toLowerCase() !== currentPartner.name.toLowerCase()) {
      toast.error(`Only ${target.createdBy} can delete this date!`);
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      {/* 1. Pinned Note Banner */}
      <PinnedNoteBanner />

      {/* 2. Stat Cards */}
      <StatCards events={events} currentDate={currentDate} />

      {/* 3. Unified Calendar Controls (Single Spacious Row: Month Navigator + Category Filter + Add Date) */}
      <CalendarControls
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onAddSpecialDate={handleAddSpecialDate}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        events={events}
      />

      {/* 5. Main 2-Column Section (Grid on left ~2/3, Aligned Unified Panel on right ~1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 w-full flex flex-col">
          <CalendarGrid
            currentDate={currentDate}
            selectedDateStr={selectedDateStr}
            onSelectDate={handleSelectDate}
            events={events}
            activeFilter={activeFilter}
          />
        </div>

        {/* Right Column: Height-Aligned Unified Panel */}
        <div className="lg:col-span-4 w-full flex flex-col h-full">
          {selectedEvent && !editingEvent && !isPlanningNew ? (
            <DateInspector
              event={selectedEvent}
              selectedDateStr={selectedDateStr}
              onEdit={(ev) => {
                setEditingEvent(ev);
                setIsPlanningNew(false);
              }}
              onDelete={handleDeleteEvent}
              onPlanNew={() => {
                setEditingEvent(null);
                setIsPlanningNew(true);
              }}
              onToggleFavorite={handleToggleFavorite}
              onConfirmDate={handleConfirmDate}
              totalEventsOnDate={selectedDateEvents.length}
              activeEventIndex={activeEventIndex}
              onPrevEvent={() => setActiveEventIndex((i) => Math.max(0, i - 1))}
              onNextEvent={() => setActiveEventIndex((i) => Math.min(selectedDateEvents.length - 1, i + 1))}
            />
          ) : (
            <QuickPlanEditor
              initialDateStr={selectedDateStr}
              editingEvent={editingEvent}
              onSave={handleSavePlan}
              onCancelEdit={() => {
                setEditingEvent(null);
                setIsPlanningNew(false);
              }}
              onViewDetails={
                selectedEvent
                  ? () => {
                      setEditingEvent(null);
                      setIsPlanningNew(false);
                    }
                  : undefined
              }
              hasExistingEvent={Boolean(selectedEvent)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
