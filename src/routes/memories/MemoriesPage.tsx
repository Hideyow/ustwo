import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, Heart, Plus, Trash2, CalendarDays, Eye, Check, Upload, X } from 'lucide-react';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { usePartner } from '@/context/partner-context';
import { PinnedNoteBanner } from '@/components/calendar/PinnedNoteBanner';
import { toISODate, formatDateDisplay, formatDateLong } from '@/lib/date-helpers';
import { toast } from 'sonner';
import type { Mood } from '@/types/schemas';

const MOOD_OPTIONS: { mood: Mood; label: string; emoji: string }[] = [
  { mood: 'romantic', label: 'Romantic', emoji: '🍰' },
  { mood: 'chill', label: 'Chill & Cozy', emoji: '☕' },
  { mood: 'fancy', label: 'Fancy Glam', emoji: '🥂' },
  { mood: 'adventure', label: 'Adventure', emoji: '🏔' },
];

export function MemoriesPage() {
  const navigate = useNavigate();
  const { partner1, partner2, activePartner, daysTogether } = usePartner();
  const currentPartner = activePartner === 'partner1' ? partner1 : partner2;

  const { data: events = [] } = useEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [selectedMemory, setSelectedMemory] = useState<{
    eventId: string;
    title: string;
    date: string;
    time?: string;
    description?: string;
    mood: Mood;
    favorite: boolean;
    category: string;
    photoUrl: string;
    addedBy: string;
  } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for adding memory
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDate, setMemoryDate] = useState(() => toISODate(new Date()));
  const [memoryMood, setMemoryMood] = useState<Mood>('romantic');
  const [memoryNote, setMemoryNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{
    date?: boolean;
    title?: boolean;
    photo?: boolean;
    note?: boolean;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormComplete = Boolean(
    memoryDate &&
    memoryTitle.trim() &&
    photoPreview &&
    memoryNote.trim()
  );

  // Gather all photos with their parent event metadata
  const photoMemories = useMemo(() => {
    const list: {
      eventId: string;
      title: string;
      date: string;
      time?: string;
      description?: string;
      mood: Mood;
      favorite: boolean;
      category: string;
      photoUrl: string;
      addedBy: string;
    }[] = [];

    events.forEach((ev) => {
      if (ev.photos && ev.photos.length > 0) {
        ev.photos.forEach((p) => {
          list.push({
            eventId: ev.id,
            title: ev.title,
            date: ev.date,
            time: ev.time,
            description: ev.description,
            mood: ev.mood,
            favorite: Boolean(ev.favorite),
            category: ev.category,
            photoUrl: p.url,
            addedBy: p.addedBy || partner1.name,
          });
        });
      }
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [events]);

  const filteredMemories = useMemo(() => {
    if (activeFilter === 'favorites') {
      return photoMemories.filter((m) => m.favorite);
    }
    return photoMemories;
  }, [photoMemories, activeFilter]);

  const totalPhotosCount = photoMemories.length;
  const favoriteCount = events.filter((e) => e.favorite).length;

  // Handle image upload from user file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large', { description: 'Please choose an image under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
      setValidationErrors((prev) => ({ ...prev, photo: false }));
    };
    reader.readAsDataURL(file);
  };

  // Add sample demo photo for quick testing
  const handleAddSample = (sampleUrl: string, sampleTitle: string) => {
    setPhotoPreview(sampleUrl);
    setMemoryTitle(sampleTitle);
    setMemoryNote('A beautiful, heartwarming moment spent together.');
    setValidationErrors({});
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { date?: boolean; title?: boolean; photo?: boolean; note?: boolean } = {};
    if (!memoryDate) errors.date = true;
    if (!memoryTitle.trim()) errors.title = true;
    if (!photoPreview) errors.photo = true;
    if (!memoryNote.trim()) errors.note = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (errors.title) {
        toast.error('Please enter a memory title ✏️', { description: 'All details must be filled in first.' });
      } else if (errors.photo) {
        toast.error('Please upload a photo 📸', { description: 'A photo is required for your scrapbook memory.' });
      } else if (errors.note) {
        toast.error('Please write a sweet note or story 📝', { description: 'Tell the story behind this moment.' });
      } else if (errors.date) {
        toast.error('Please choose a date 🗓️', { description: 'Select when this moment occurred.' });
      }
      return;
    }

    setValidationErrors({});

    const photos = [{ url: photoPreview, addedBy: currentPartner.name }];

    createMutation.mutate(
      {
        title: memoryTitle.trim(),
        date: memoryDate,
        time: '19:00',
        category: 'date_night',
        mood: memoryMood,
        description: memoryNote.trim(),
        tasks: [],
        photos,
        favorite: true,
        confirmedBy: [currentPartner.name],
        createdBy: currentPartner.name,
      },
      {
        onSuccess: () => {
          setMemoryTitle('');
          setMemoryNote('');
          setPhotoPreview('');
          setValidationErrors({});
          if (fileInputRef.current) fileInputRef.current.value = '';
          toast.success('Cherished memory saved! 📸 💜', {
            description: 'Saved to your scrapbook & shared calendar.',
          });
        },
      }
    );
  };

  const handleToggleFavorite = (eventId: string, currentFav: boolean) => {
    updateMutation.mutate({
      id: eventId,
      favorite: !currentFav,
    });
    if (selectedMemory && selectedMemory.eventId === eventId) {
      setSelectedMemory((prev) => (prev ? { ...prev, favorite: !currentFav } : null));
    }
    toast.success(!currentFav ? 'Starred as favorite! 💖' : 'Removed from favorites');
  };

  const handleDeleteMemory = (eventId: string) => {
    if (selectedMemory?.addedBy && selectedMemory.addedBy.toLowerCase() !== currentPartner.name.toLowerCase()) {
      toast.error(`Only ${selectedMemory.addedBy} can delete this memory!`);
      return;
    }
    deleteMutation.mutate(eventId, {
      onSuccess: () => {
        if (selectedMemory?.eventId === eventId) {
          setSelectedMemory(null);
        }
      },
    });
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      {/* 1. Pinned Note Banner */}
      <PinnedNoteBanner />

      {/* 2. Top 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2.5">
        {/* Card 1: Photo Memories */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Camera className="w-5 h-5 text-[#7c0fd0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
              {totalPhotosCount} Photos
            </span>
            <span className="text-[11px] text-[#6e687e] font-medium">
              Cherished memories in scrapbook
            </span>
          </div>
        </div>

        {/* Card 2: Favorite Moments */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
            <Sparkles className="w-5 h-5 text-[#ec4899]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
              {favoriteCount} Favorites
            </span>
            <span className="text-[11px] text-[#6e687e] font-medium">
              Highlighted romantic milestones
            </span>
          </div>
        </div>

        {/* Card 3: Days of Smiles */}
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

      {/* 3. Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-white/70 backdrop-blur-xs rounded-2xl p-2 px-3 border border-purple-100/60 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100/70 flex items-center justify-center text-[#7c0fd0]">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#2d124d]">
            Our Cherished Memories
          </span>
          <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
            {filteredMemories.length} Snaps
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeFilter === 'all'
                ? 'bg-[#7c0fd0] text-white shadow-xs'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('favorites')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${activeFilter === 'favorites'
                ? 'bg-[#7c0fd0] text-white shadow-xs'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
          >
            <Heart className="w-3 h-3 fill-current" />
            Favorites
          </button>
        </div>
      </div>

      {/* 4. Main 2-Column Section (Grid on left ~2/3, Aligned Unified Panel on right ~1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch w-full">
        {/* Left Column: Polaroid Gallery / Scrapbook Grid */}
        <div className="md:col-span-7 lg:col-span-8 w-full flex flex-col min-w-0">
          <div className="w-full h-[560px] lg:h-[580px] bg-white rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] border border-purple-50 flex flex-col min-w-0">
            {filteredMemories.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center my-auto">
                {/* Cute Polaroid Mockup Frame */}
                <div className="relative mb-5 p-3 pb-8 bg-white border border-purple-100 rounded-xl shadow-md rotate-[-2deg] hover:rotate-0 transition-transform w-52 max-w-full">
                  <div className="w-full aspect-square rounded-lg bg-gradient-to-tr from-pink-50 via-purple-50 to-indigo-50 flex flex-col items-center justify-center border border-dashed border-purple-200">
                    <Camera className="w-10 h-10 text-purple-300 mb-2" />
                    <span className="text-[11px] font-semibold text-purple-400">Our First Snap</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-[#2a1742]">{partner1.name} ♥ {partner2.name}</span>
                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                  </div>
                  {/* Decorative Washi Tape */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-pink-200/60 rounded-xs border border-pink-300/40 shadow-2xs rotate-[-3deg]" />
                </div>

                <h3 className="text-lg font-bold text-[#1e1b2e] mb-1">
                  Our Scrapbook Awaits
                </h3>
                <p className="text-xs text-[#736a87] max-w-sm mb-5 leading-relaxed">
                  Upload a photo from your date nights or adventures to start filling our sanctuary with memories.
                </p>

                {/* Quick starter samples */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-[11px] text-purple-500 font-semibold">Try sample photo:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddSample('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80', 'Candlelight Dinner Date')}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200/60 transition-colors cursor-pointer"
                    >
                      Candlelight Dinner
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSample('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80', 'Sunset Walk Together')}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 transition-colors cursor-pointer"
                    >
                      Sunset Walk
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2.5 sm:pr-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {filteredMemories.map((m, idx) => {
                    const isSelected = selectedMemory?.photoUrl === m.photoUrl;
                    return (
                      <div
                        key={`${m.eventId}-${idx}`}
                        onClick={() => {
                          setSelectedMemory(m);
                          setIsAddingNew(false);
                        }}
                        className={`group relative p-2.5 pb-3 bg-white rounded-2xl transition-all flex flex-col justify-between cursor-pointer ${isSelected
                            ? 'ring-2 ring-[#7c0fd0] shadow-md -translate-y-0.5 border border-purple-300'
                            : 'border border-purple-100/80 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                          }`}
                      >
                        {/* Polaroid Photo with tape */}
                        <div className="relative overflow-hidden rounded-xl bg-purple-50 aspect-square mb-2">
                          <img
                            src={m.photoUrl}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            loading="lazy"
                          />
                          {/* Top Favorite Toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(m.eventId, m.favorite);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-xs shadow-xs text-pink-500 transition-transform active:scale-90 cursor-pointer"
                          >
                            <Heart className={`w-3.5 h-3.5 ${m.favorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                          </button>

                          {isSelected && (
                            <div className="absolute bottom-2 left-2 bg-[#7c0fd0] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Selected
                            </div>
                          )}
                        </div>

                        {/* Polaroid Caption Info */}
                        <div className="px-1 flex flex-col gap-0.5">
                          <h4 className="text-xs font-bold text-[#1e1b2e] line-clamp-1">
                            {m.title}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-[#736a87] font-medium">
                            <span>{formatDateDisplay(m.date)}</span>
                            <span className="capitalize text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded-xs font-semibold">
                              {m.mood}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unified Cute Panel (Matches DateInspector / QuickPlanEditor) */}
        <div className="md:col-span-5 lg:col-span-4 w-full flex flex-col min-w-0">
          {selectedMemory && !isAddingNew ? (
            /* Memory Inspector View */
            <div className="w-full h-[560px] lg:h-[580px] bg-white rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] border border-purple-50 flex flex-col justify-between min-w-0">
              {/* Top Details Section */}
              <div className="flex flex-col gap-3 overflow-hidden">
                {/* Header: Category Pill & Actions */}
                <div className="flex items-center justify-between border-b border-purple-100/70 pb-2.5 shrink-0">
                  <div className="px-3 py-1 rounded-full bg-[#fdf2f8] border border-pink-200 text-[#be185d] text-[11px] font-bold">
                    {selectedMemory.category === 'date_night'
                      ? 'Date Night 🍷'
                      : selectedMemory.category === 'milestone'
                        ? 'Milestone 💎'
                        : selectedMemory.category === 'trip'
                          ? 'Trip & Getaway ✈️'
                          : 'Special Moment 💕'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                      title="Add a new photo memory"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(selectedMemory.eventId, selectedMemory.favorite)}
                      className="w-7 h-7 rounded-full bg-[#fae8f4] flex items-center justify-center text-[#db2777] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title="Favorite memory"
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        className={`w-4 h-4 ${selectedMemory.favorite ? 'fill-[#db2777] text-[#db2777]' : 'text-[#db2777]'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Cute Polaroid Display */}
                <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-purple-50 border border-purple-100 shadow-2xs group shrink-0">
                  <img
                    src={selectedMemory.photoUrl}
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-pink-400 text-pink-400" />
                    <span>Added by {selectedMemory.addedBy}</span>
                  </div>
                </div>

                {/* Title & Date */}
                <div className="shrink-0">
                  <h2 className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight line-clamp-1">
                    {selectedMemory.title}
                  </h2>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#8c2bf8] mt-1">
                    <span>{formatDateLong(selectedMemory.date)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 font-semibold">
                      {MOOD_OPTIONS.find((m) => m.mood === selectedMemory.mood)?.emoji} {selectedMemory.mood}
                    </span>
                  </div>
                </div>

                {/* Sweet Note / Caption Story */}
                <div className="bg-[#faf4ff] rounded-xl p-3 border border-purple-100/70 text-xs text-[#4b3e65] leading-relaxed overflow-y-auto max-h-28">
                  <span className="text-[10px] font-bold text-[#7c0fd0] uppercase tracking-wider block mb-1">
                    Memory Note
                  </span>
                  <p className="italic">
                    "{selectedMemory.description || 'A timeless moment captured together in our love story.'}"
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-purple-100/70 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/calendar?date=${selectedMemory.date}`)}
                  className="flex-1 h-9 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-200/60"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>View in Calendar</span>
                </button>
                {(!selectedMemory.addedBy || selectedMemory.addedBy.toLowerCase() === currentPartner.name.toLowerCase()) ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMemory(selectedMemory.eventId)}
                    className="w-9 h-9 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer border border-rose-100"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] text-[#8c7fa0] font-medium px-2.5 py-1 rounded-full bg-purple-50/60 border border-purple-100/50">
                    Added by {selectedMemory.addedBy}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Add Photo Memory Form */
            <div className="w-full h-[560px] lg:h-[580px] bg-white rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] border border-purple-50 flex flex-col justify-between min-w-0">
              {/* Top Section */}
              <div className="flex flex-col gap-2.5 overflow-hidden">
                {/* Header: Date & Status */}
                <div className="flex items-center justify-between border-b border-purple-100/70 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center text-[#db2777]">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1e1b2e] leading-tight">Add Photo Memory</h3>
                      <span className="text-[10px] text-[#8c2bf8] font-medium">Capture a sweet moment 💕</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedMemory && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNew(false)}
                        className="text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                        title="View selected memory details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Details</span>
                      </button>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fdf2f8] border border-pink-200 text-[#be185d] text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-pink-500" />
                      <span>Scrapbook</span>
                    </span>
                  </div>
                </div>

                {/* Form Body */}
                <form id="memory-form" onSubmit={handleSaveMemory} className="flex flex-col gap-2.5">
                  {/* Row 1: When Date Picker */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-[#5a4f70]">
                        When <span className="text-rose-500">*</span>
                      </label>
                      {validationErrors.date && (
                        <span className="text-[10px] text-rose-500 font-semibold">Date required</span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={memoryDate}
                      onChange={(e) => {
                        setMemoryDate(e.target.value);
                        if (validationErrors.date) setValidationErrors((prev) => ({ ...prev, date: false }));
                      }}
                      className={`w-full h-8 px-2.5 rounded-xl text-xs font-medium text-[#2d1b46] focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0] transition-colors ${validationErrors.date
                          ? 'border-2 border-rose-400 bg-rose-50/30'
                          : 'bg-[#faf4ff] border border-purple-100'
                        }`}
                    />
                  </div>

                  {/* Row 2: Title */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-[#5a4f70]">
                        Memory Title <span className="text-rose-500">*</span>
                      </label>
                      {validationErrors.title && (
                        <span className="text-[10px] text-rose-500 font-semibold">Title required</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={memoryTitle}
                      onChange={(e) => {
                        setMemoryTitle(e.target.value);
                        if (validationErrors.title) setValidationErrors((prev) => ({ ...prev, title: false }));
                      }}
                      placeholder="e.g. Candlelight Dinner, Sunset Walk"
                      className={`w-full h-8 px-3 rounded-xl text-xs font-medium text-[#2d1b46] placeholder:text-gray-400 focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0] transition-colors ${validationErrors.title
                          ? 'border-2 border-rose-400 bg-rose-50/30'
                          : 'bg-[#faf4ff] border border-purple-100'
                        }`}
                    />
                  </div>

                  {/* Row 3: Mood Selector (2x2 Grid with Emojis) */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-semibold text-[#5a4f70]">Mood</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {MOOD_OPTIONS.map((opt) => {
                        const isSelected = memoryMood === opt.mood;
                        return (
                          <button
                            key={opt.mood}
                            type="button"
                            onClick={() => setMemoryMood(opt.mood)}
                            className={`h-7.5 px-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
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
                  </div>

                  {/* Row 4: Photo Upload Area */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-[#5a4f70] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-purple-500" />
                        <span>Photo Memory <span className="text-rose-500">*</span></span>
                      </label>
                      {photoPreview ? (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      ) : validationErrors.photo ? (
                        <span className="text-[10px] text-rose-500 font-semibold">Photo required</span>
                      ) : null}
                    </div>

                    {photoPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-purple-200 aspect-16/7 bg-[#faf4ff] flex items-center justify-center group shadow-2xs">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-dashed rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer transition-colors ${validationErrors.photo
                            ? 'border-2 border-rose-400 bg-rose-50/40 hover:bg-rose-50/60'
                            : 'border border-purple-200 hover:border-purple-400 bg-[#faf7fd] hover:bg-purple-50/50'
                          }`}
                      >
                        <Upload className={`w-4 h-4 mb-0.5 ${validationErrors.photo ? 'text-rose-500' : 'text-purple-400'}`} />
                        <span className={`text-[11px] font-semibold ${validationErrors.photo ? 'text-rose-600' : 'text-[#7c0fd0]'}`}>
                          {validationErrors.photo ? 'Please upload a photo' : 'Click to upload photo'}
                        </span>
                        <span className="text-[9px] text-[#736a87]">PNG, JPG up to 5MB</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Row 5: Sweet Note / Details */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-[#5a4f70]">
                        Sweet Note / Story <span className="text-rose-500">*</span>
                      </label>
                      {validationErrors.note && (
                        <span className="text-[10px] text-rose-500 font-semibold">Note required</span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={memoryNote}
                      onChange={(e) => {
                        setMemoryNote(e.target.value);
                        if (validationErrors.note) setValidationErrors((prev) => ({ ...prev, note: false }));
                      }}
                      placeholder="What made this moment unforgettable..."
                      className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium text-[#2d1b46] placeholder:text-gray-400 focus:outline-none focus:ring-1.5 focus:ring-[#7c0fd0] resize-none transition-colors ${validationErrors.note
                          ? 'border-2 border-rose-400 bg-rose-50/30'
                          : 'bg-[#faf4ff] border border-purple-100'
                        }`}
                    />
                  </div>
                </form>
              </div>

              {/* Bottom Submit Action */}
              <div className="pt-3 border-t border-purple-100/70 shrink-0">
                <button
                  type="submit"
                  form="memory-form"
                  disabled={createMutation.isPending}
                  className={`w-full h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 ${isFormComplete
                      ? 'bg-gradient-to-r from-[#7c0fd0] to-[#9333ea] hover:from-[#6a0cb5] hover:to-[#7e22ce] hover:scale-101 active:scale-99'
                      : 'bg-gradient-to-r from-[#7c0fd0] to-[#9333ea] hover:from-[#6a0cb5] hover:to-[#7e22ce] opacity-90'
                    }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {createMutation.isPending ? 'Saving...' : 'Save to Scrapbook 💕'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemoriesPage;
