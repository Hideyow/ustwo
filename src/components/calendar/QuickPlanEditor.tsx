import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EventFormSchema,
  type EventFormValues,
  type CalendarEvent,
  type Mood,
} from '@/types/schemas';
import { usePartner } from '@/context/partner-context';
import { formatDateLong } from '@/lib/date-helpers';
import { Upload, Check, X, Camera, CalendarDays, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface QuickPlanEditorProps {
  initialDateStr: string;
  editingEvent?: CalendarEvent | null;
  onSave: (values: EventFormValues & { photos?: { url: string; addedBy: string }[] }) => void;
  onCancelEdit?: () => void;
  onViewDetails?: () => void;
  hasExistingEvent?: boolean;
}

const MOOD_OPTIONS: { mood: Mood; label: string; emoji: string }[] = [
  { mood: 'romantic', label: 'Romantic', emoji: '🍰' },
  { mood: 'chill', label: 'Chill & Cozy', emoji: '☕' },
  { mood: 'fancy', label: 'Fancy Glam', emoji: '🥂' },
  { mood: 'adventure', label: 'Adventure', emoji: '🏔' },
];

export function QuickPlanEditor({
  initialDateStr,
  editingEvent,
  onSave,
  onCancelEdit,
  onViewDetails,
  hasExistingEvent,
}: QuickPlanEditorProps) {
  const { currentPartner } = usePartner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const isEditing = Boolean(editingEvent);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      title: '',
      date: initialDateStr,
      time: '19:30',
      category: 'date_night',
      mood: 'romantic',
      description: '',
    },
  });

  // When editingEvent changes or initialDate changes, reset form
  useEffect(() => {
    if (editingEvent) {
      reset({
        title: editingEvent.title,
        date: editingEvent.date,
        time: editingEvent.time ?? '19:30',
        category: editingEvent.category,
        mood: editingEvent.mood,
        description: editingEvent.description ?? '',
      });
      setPhotoPreviews(editingEvent.photos?.map((p) => p.url) ?? []);
    } else {
      reset({
        title: '',
        date: initialDateStr,
        time: '19:30',
        category: 'date_night',
        mood: 'romantic',
        description: '',
      });
      setPhotoPreviews([]);
    }
  }, [editingEvent, initialDateStr, reset]);

  // Handle local mock photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    Array.from(files).forEach((file) => {
      const fakeUrl = URL.createObjectURL(file);
      newUrls.push(fakeUrl);
    });

    setPhotoPreviews((prev) => [...prev, ...newUrls]);
    toast.success(`${files.length} photo(s) attached! 📷`);
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EventFormValues) => {
    const photos = photoPreviews.map((url) => ({
      url,
      addedBy: currentPartner.name,
    }));

    onSave({
      ...data,
      photos,
    });

    toast.success(
      isEditing ? 'Date updated! ✨' : 'Date saved to shared calendar! 💕',
    );

    if (!isEditing) {
      reset({
        title: '',
        date: initialDateStr,
        time: '19:30',
        category: 'date_night',
        mood: 'romantic',
        description: '',
      });
      setPhotoPreviews([]);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] border border-purple-50 flex flex-col justify-between">
      {/* Top Section */}
      <div className="flex flex-col gap-3">
        {/* Header: Date & Status */}
        <div className="flex items-center justify-between border-b border-purple-100/70 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#7c0fd0]">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1e1b2e] leading-tight">
                {isEditing ? 'Edit Plan' : formatDateLong(initialDateStr)}
              </h3>
              <span className="text-[10px] text-[#8c2bf8] font-medium">
                {isEditing ? 'Updating date details' : `Planning as ${currentPartner.name} ✨`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasExistingEvent && onViewDetails && !isEditing && (
              <button
                type="button"
                onClick={onViewDetails}
                className="text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                title="View existing event details"
              >
                <Eye className="w-3 h-3" />
                <span>Details</span>
              </button>
            )}

            {isEditing && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-purple-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form id="quick-plan-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
          {/* Row 1: When & Time */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#5a4f70]">When</label>
              <input
                {...register('date')}
                type="date"
                className="w-full h-8.5 px-2.5 rounded-xl bg-[#faf4ff] border border-purple-100 text-xs font-medium text-[#2d1b46] focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0]"
              />
              {errors.date && (
                <span className="text-[10px] text-rose-500 font-medium">
                  {errors.date.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#5a4f70]">Time</label>
              <input
                {...register('time')}
                type="time"
                className="w-full h-8.5 px-2.5 rounded-xl bg-[#faf4ff] border border-purple-100 text-xs font-medium text-[#2d1b46] focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0]"
              />
            </div>
          </div>

          {/* Row 2: Event Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#5a4f70]">Event Title</label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g. Candlelight Dinner"
              className="w-full h-8.5 px-3 rounded-xl bg-[#faf4ff] border border-purple-100 text-xs font-medium text-[#2d1b46] placeholder:text-gray-400 focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0]"
            />
            {errors.title && (
              <span className="text-[10px] text-rose-500 font-medium">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Row 3: Details & Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#5a4f70]">Details</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Add details, who brings what, or the vibe..."
              className="w-full px-3 py-1.5 rounded-xl bg-[#faf4ff] border border-purple-100 text-xs font-medium text-[#2d1b46] placeholder:text-gray-400 focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0] resize-none"
            />
          </div>

          {/* Row 4: Mood / Vibe (2x2 Grid, NO truncation) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#5a4f70]">Mood</label>
            <Controller
              control={control}
              name="mood"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {MOOD_OPTIONS.map((opt) => {
                    const isSelected = field.value === opt.mood;
                    return (
                      <button
                        key={opt.mood}
                        type="button"
                        onClick={() => field.onChange(opt.mood)}
                        className={`h-8 px-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#f4e8ff] border border-purple-300 text-[#6b21a8] font-bold shadow-2xs'
                            : 'bg-[#faf7fd] border border-purple-100/80 text-[#5a4e70] hover:bg-purple-50'
                        }`}
                      >
                        <span className="text-xs">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Row 5: Attach Photo */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-[#5a4e70] font-medium flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-500" />
              <span>Photo Memory</span>
            </span>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-full bg-[#f3e8ff] hover:bg-[#ede0fc] text-[#7c0fd0] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-purple-200/50"
            >
              <Upload className="w-3 h-3" />
              <span>Upload</span>
            </button>
          </div>

          {/* Photo Thumbnails */}
          {photoPreviews.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {photoPreviews.map((url, idx) => (
                <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-purple-200 shadow-2xs">
                  <img src={url} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/60 text-white flex items-center justify-center text-[9px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Bottom Action Button - Anchored cleanly at the bottom */}
      <div className="pt-3 border-t border-purple-100/70">
        <button
          type="submit"
          form="quick-plan-form"
          disabled={isSubmitting}
          className="w-full h-9 rounded-full bg-gradient-to-r from-[#7c0fd0] to-[#9333ea] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:scale-101 active:scale-99 transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Update Plan' : 'Save to Calendar'}</span>
        </button>
      </div>
    </div>
  );
}
