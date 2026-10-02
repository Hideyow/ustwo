import { useState } from 'react';
import type { CalendarEvent } from '@/types/schemas';
import { MOOD_INFO } from '@/types/schemas';
import { formatDateLong, formatTime } from '@/lib/date-helpers';
import { usePartner } from '@/context/partner-context';
import { Heart, Edit3, Trash2, Camera, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog';

interface DateInspectorProps {
  event: CalendarEvent;
  selectedDateStr: string;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onPlanNew: (dateStr: string) => void;
  onToggleFavorite?: (event: CalendarEvent) => void;
  onConfirmDate?: (event: CalendarEvent) => void;
  totalEventsOnDate?: number;
  activeEventIndex?: number;
  onPrevEvent?: () => void;
  onNextEvent?: () => void;
}

export function DateInspector({
  event,
  selectedDateStr,
  onEdit,
  onDelete,
  onPlanNew,
  onToggleFavorite,
  onConfirmDate,
  totalEventsOnDate = 1,
  activeEventIndex = 0,
  onPrevEvent,
  onNextEvent,
}: DateInspectorProps) {
  const { partner1, partner2, coupleLabel, currentPartner } = usePartner();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const categoryLabel =
    event.category === 'date_night'
      ? 'Date Night 🍷'
      : event.category === 'milestone'
        ? 'Milestone 💎'
        : event.category === 'trip'
          ? 'Trip & Getaway ✈️'
          : event.category === 'anniversary'
            ? 'Anniversary 💍'
            : event.category === 'surprise'
              ? 'Special Surprise 🎁'
              : 'Little Moment ☕';

  const hasPhotos = event.photos && event.photos.length > 0;
  const photoUrls = hasPhotos
    ? event.photos.map((p) => p.url)
    : [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    ];
  const photoAddedBy = hasPhotos ? event.photos[0].addedBy : partner2.name;
  const photoCount = hasPhotos ? event.photos.length : 0;

  const moodInfo = MOOD_INFO[event.mood];

  const hasMultipleEvents = totalEventsOnDate > 1;

  return (
    <>
      <div className="w-full h-full bg-white rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] border border-purple-50 flex flex-col justify-between">
        {/* Top Details Section */}
        <div className="flex flex-col gap-3">
          {/* Multi-Event Navigation Bar (only when multiple events on same date) */}
          {hasMultipleEvents && (
            <div className="flex items-center justify-between bg-purple-50/60 rounded-xl px-3 py-1.5 border border-purple-100/60">
              <button
                onClick={onPrevEvent}
                disabled={activeEventIndex === 0}
                className="p-1 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous event"
              >
                <ChevronLeft className="w-4 h-4 text-purple-700" />
              </button>
              <span className="text-[11px] font-bold text-purple-700">
                {activeEventIndex + 1} / {totalEventsOnDate} events
              </span>
              <button
                onClick={onNextEvent}
                disabled={activeEventIndex === totalEventsOnDate - 1}
                className="p-1 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next event"
              >
                <ChevronRight className="w-4 h-4 text-purple-700" />
              </button>
            </div>
          )}

          {/* Top Bar: Category Pill & Favorite */}
          <div className="flex items-center justify-between border-b border-purple-100/70 pb-2.5">
            <div className="px-3 py-1 rounded-full bg-[#fdf2f8] border border-pink-200 text-[#be185d] text-[11px] font-bold">
              {categoryLabel}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPlanNew(selectedDateStr)}
                className="text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                title="Add another plan on this date"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>

              <button
                onClick={() => onToggleFavorite?.(event)}
                className="w-7 h-7 rounded-full bg-[#fae8f4] flex items-center justify-center text-[#db2777] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="Favorite moment"
                aria-label="Toggle favorite"
              >
                <Heart
                  className={`w-4 h-4 ${event.favorite ? 'fill-[#db2777] text-[#db2777]' : 'text-[#db2777]'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Title & Date/Time */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
              {event.title}
            </h2>
            <div className="text-xs font-semibold text-[#8c2bf8] mt-0.5">
              {formatDateLong(event.date)}
              {event.time && ` • ${formatTime(event.time)}`}
            </div>
            {event.createdBy && (
              <div className="text-[11px] font-medium text-[#7c0fd0] mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Planned by <strong className="font-bold">{event.createdBy}</strong></span>
              </div>
            )}
          </div>

          {/* Photo Memory Card (if photos exist) */}
          {photoCount > 0 && (
            <div
              onClick={() => setPhotoViewerOpen(true)}
              className="group relative w-full h-32 rounded-xl overflow-hidden cursor-pointer shadow-inner border border-purple-100 transition-all hover:shadow-md"
            >
              <img
                src={photoUrls[0]}
                alt="Date memory photo"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#a21caf] text-[9px] font-bold shadow-xs">
                Cherished ✨
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[11px]">
                <span className="flex items-center gap-1 font-medium drop-shadow-xs">
                  <Camera className="w-3 h-3" />
                  <span>{photoCount} photo{photoCount !== 1 ? 's' : ''} added by {photoAddedBy}</span>
                </span>
                <span className="text-[9px] text-gray-200 group-hover:underline">
                  View gallery →
                </span>
              </div>
            </div>
          )}

          {/* Blueprint / Notes */}
          {event.description && (
            <div className="bg-[#faf5ff] rounded-xl p-3 border border-purple-100 flex flex-col gap-1">
              <span className="text-[9px] font-bold text-[#7c0fd0] tracking-wider uppercase">
                DATE BLUEPRINT
              </span>
              <p className="text-xs text-[#423b52] leading-relaxed">
                {event.description}
              </p>

              {event.tasks && event.tasks.length > 0 && (
                <div className="pt-1.5 mt-0.5 border-t border-purple-100/60 flex flex-col gap-1">
                  {event.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#5a4f70]">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span className="font-semibold text-purple-900 capitalize">
                        {task.assignee}:
                      </span>
                      <span>{task.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mood & Confirmed By */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="px-2.5 py-1 rounded-full bg-[#fdf2f8] border border-pink-100 text-[#9d174d] text-[11px] font-semibold flex items-center gap-1">
              <span>Mood: {moodInfo.label}</span>
              <span>{moodInfo.emoji}</span>
            </div>

            <div className="flex items-center gap-2">
              {event.confirmedBy && event.confirmedBy.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-[#796e8d]">Confirmed by</span>
                  <div className="flex items-center -space-x-1.5">
                    {event.confirmedBy.map((name) => {
                      const isP1 = name.toLowerCase() === partner1.name.toLowerCase();
                      return (
                        <div
                          key={name}
                          className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-2xs"
                          style={{ backgroundColor: isP1 ? partner1.color : partner2.color }}
                          title={`Confirmed by ${name}`}
                        >
                          {isP1 ? partner1.initial : partner2.initial}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick confirm button if not yet confirmed by current active partner */}
              {!event.confirmedBy?.some((n) => n.toLowerCase() === currentPartner.name.toLowerCase()) && onConfirmDate && (
                <button
                  onClick={() => onConfirmDate(event)}
                  className="px-2.5 py-0.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10px] font-bold border border-pink-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  title={`Confirm this date as ${currentPartner.name}`}
                >
                  <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500" />
                  <span>Confirm 💕</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions - Aligned cleanly at the bottom */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-purple-100/70">
          <button
            onClick={() => onEdit(event)}
            className="h-8.5 rounded-full bg-[#f3e8ff] hover:bg-[#ede0fc] text-[#7c0fd0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-200/50"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Date</span>
          </button>

          <button
            onClick={() => setDeleteOpen(true)}
            className="h-8.5 rounded-full bg-[#fee2e2]/60 hover:bg-[#fee2e2] text-[#dc2626] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200/50"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this special date? 💔</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{event.title}&rdquo; from your shared calendar?
              This will remove the event for both {coupleLabel}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-end gap-3 mt-4">
            <AlertDialogCancel>Keep it 💕</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(event.id);
                setDeleteOpen(false);
              }}
            >
              Yes, delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photo Viewer Modal */}
      {photoViewerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPhotoViewerOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.42),0_10px_35px_rgba(0,0,0,0.22)] border border-purple-200/90 ring-1 ring-black/10 flex flex-col animate-fade-in">
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-purple-100/60 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-[#1e1b2e]">
                  Memory Gallery ({currentPhotoIndex + 1} of {photoUrls.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoViewerOpen(false)}
                className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                title="Close gallery"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-80 sm:h-96 w-full flex items-center justify-center p-4 overflow-hidden">
              {/* Full blurred photo background filling the frame */}
              <img
                src={photoUrls[currentPhotoIndex]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-125 opacity-75 pointer-events-none"
              />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />

              {/* Main crisp photo */}
              <img
                src={photoUrls[currentPhotoIndex]}
                alt="Selected memory"
                className="relative z-10 max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {photoUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) =>
                        prev === 0 ? photoUrls.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-purple-700 shadow-md border border-purple-100/70 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) =>
                        prev === photoUrls.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-purple-700 shadow-md border border-purple-100/70 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="px-5 py-3 bg-[#faf5ff] border-t border-purple-100/60 flex items-center justify-between text-xs text-[#523d70]">
              <span className="font-medium">{event.title} • Captured with tender love 💕</span>
              <span className="font-semibold text-purple-700 bg-purple-100/60 px-2.5 py-0.5 rounded-full">
                Added by {photoAddedBy} ✨
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
