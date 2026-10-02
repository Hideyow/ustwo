import { useState, useMemo, useEffect } from 'react';
import { Sparkles, CheckCircle2, Circle, Heart, CalendarPlus, Trash2, Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { usePartner } from '@/context/partner-context';
import { useCreateEvent } from '@/hooks/useEvents';
import { PinnedNoteBanner } from '@/components/calendar/PinnedNoteBanner';
import { toISODate } from '@/lib/date-helpers';
import type { Mood } from '@/types/schemas';

const STORAGE_KEY = 'ustwo_date_ideas';

interface IdeaItem {
  id: string;
  title: string;
  category: Mood;
  completed: boolean;
  proposedBy: string;
  notes?: string;
}

const DEFAULT_SAMPLE_IDEAS: IdeaItem[] = [
  { id: '1', title: 'Stargazing with warm blankets & hot cocoa', category: 'romantic', completed: false, proposedBy: 'Lawrence', notes: 'Find a quiet hill outside city lights' },
  { id: '2', title: 'Cook authentic homemade pasta from scratch', category: 'chill', completed: true, proposedBy: 'Marga', notes: 'With fresh basil and candle lights' },
  { id: '3', title: 'Sunrise picnic by the lake with croissants', category: 'adventure', completed: false, proposedBy: 'Lawrence', notes: 'Wake up at 5:30am to catch the morning glow' },
];

function loadIdeas(): IdeaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as IdeaItem[];
  } catch { /* ignore */ }
  return DEFAULT_SAMPLE_IDEAS;
}

const IDEAS_BROADCAST_CHANNEL = 'ustwo_ideas_channel';

function saveIdeas(ideas: IdeaItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(IDEAS_BROADCAST_CHANNEL);
      bc.postMessage({ type: 'IDEAS_UPDATED' });
      bc.close();
    }
  } catch { /* ignore */ }
}

const MOODS: { id: Mood; label: string }[] = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'chill', label: 'Chill & Cozy' },
  { id: 'fancy', label: 'Fancy Glam' },
  { id: 'adventure', label: 'Adventure' },
];

export function IdeasPage() {
  const { partner1, partner2, currentPartner, daysTogether } = usePartner();

  const [ideas, setIdeas] = useState<IdeaItem[]>(loadIdeas);
  const [activeFilter, setActiveFilter] = useState<'all' | 'uncompleted' | 'completed' | Mood>('all');

  // Form states for adding new idea
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Mood>('romantic');
  const [newNotes, setNewNotes] = useState('');

  // Cross-tab sync: re-read ideas when another tab writes to localStorage or broadcasts
  useEffect(() => {
    const refresh = () => setIdeas(loadIdeas());

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(IDEAS_BROADCAST_CHANNEL);
        bc.onmessage = (e) => {
          if (e.data?.type === 'IDEAS_UPDATED') {
            refresh();
          }
        };
      }
    } catch { /* ignore */ }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const createEventMutation = useCreateEvent();

  const completedCount = useMemo(() => ideas.filter((i) => i.completed).length, [ideas]);

  const filteredIdeas = useMemo(() => {
    if (activeFilter === 'completed') return ideas.filter((i) => i.completed);
    if (activeFilter === 'uncompleted') return ideas.filter((i) => !i.completed);
    if (activeFilter !== 'all') return ideas.filter((i) => i.category === activeFilter);
    return ideas;
  }, [ideas, activeFilter]);

  const toggleComplete = (id: string) => {
    setIdeas((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      saveIdeas(updated);
      return updated;
    });
    toast.success('Wishlist updated! 💕');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a date idea title');
      return;
    }

    const newItem: IdeaItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      // Always the logged-in partner; cannot be set to the other partner
      proposedBy: currentPartner.name,
      notes: newNotes.trim(),
    };

    const updated = [newItem, ...ideas];
    setIdeas(updated);
    saveIdeas(updated);

    setNewTitle('');
    setNewNotes('');
    toast.success('Dream date added to wishlist! 💡', {
      description: 'Ready to turn into reality.',
    });
  };

  const handleDelete = (id: string) => {
    const target = ideas.find((item) => item.id === id);
    if (target?.proposedBy && target.proposedBy.toLowerCase() !== currentPartner.name.toLowerCase()) {
      toast.error(`Only ${target.proposedBy} can delete this idea!`);
      return;
    }
    const updated = ideas.filter((item) => item.id !== id);
    setIdeas(updated);
    saveIdeas(updated);
    toast.success('Idea removed');
  };

  // Convert an idea directly to an upcoming calendar date!
  const handleScheduleToCalendar = (idea: IdeaItem) => {
    createEventMutation.mutate(
      {
        title: idea.title,
        date: toISODate(new Date()),
        time: '19:30',
        category: 'random_date',
        mood: idea.category,
        description: idea.notes || `Scheduled from couple wishlist (proposed by ${idea.proposedBy})`,
        tasks: [],
        photos: [],
        favorite: false,
        confirmedBy: [partner1.name, partner2.name],
      },
      {
        onSuccess: () => {
          toast.success('Scheduled to Calendar! 🗓️ 💜', {
            description: `"${idea.title}" added to your shared dates.`,
          });
        },
      }
    );
  };

  const handleQuickAddInspiration = (title: string, category: Mood) => {
    const newItem: IdeaItem = {
      id: String(Date.now()),
      title,
      category,
      completed: false,
      proposedBy: currentPartner.name,
    };
    const updated = [newItem, ...ideas];
    setIdeas(updated);
    saveIdeas(updated);
    toast.success(`Added "${title}" to your wishlist! ✨`);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      {/* 1. Pinned Note Banner */}
      <PinnedNoteBanner />

      {/* 2. Top 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2.5">
        {/* Card 1: Bucket List Count */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Sparkles className="w-5 h-5 text-[#7c0fd0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
              {ideas.length} Dream Dates
            </span>
            <span className="text-[11px] text-[#6e687e] font-medium">
              Bucket list adventures together
            </span>
          </div>
        </div>

        {/* Card 2: Cherished Count */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[var(--shadow-soft)] border border-purple-50 flex items-center gap-3 hover:shadow-[var(--shadow-card)] transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
            <CheckCircle2 className="w-5 h-5 text-[#ec4899]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#1e1b2e] leading-tight">
              {completedCount} Cherished
            </span>
            <span className="text-[11px] text-[#6e687e] font-medium">
              Dreams made into memories
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
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#2d124d]">
            Our Date Wishlist
          </span>
          <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
            {completedCount}/{ideas.length} Done
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
            onClick={() => setActiveFilter('uncompleted')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeFilter === 'uncompleted'
                ? 'bg-[#7c0fd0] text-white shadow-xs'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
          >
            Unfinished
          </button>
        </div>
      </div>

      {/* 4. Main 2-Column Section (Grid on left ~2/3, Aligned Unified Form on right ~1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Ideas List */}
        <div className="lg:col-span-8 w-full flex flex-col">
          <div className="bg-white/95 rounded-[2rem] p-5 shadow-xs border border-purple-50 flex flex-col h-full justify-between">
            {filteredIdeas.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center my-auto">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-[#1e1b2e] mb-1">
                  Your Wishlist is Clear
                </h3>
                <p className="text-xs text-[#736a87] max-w-sm mb-6 leading-relaxed">
                  No date ideas found in this category. Add a dream date using the planner on the right, or pick one below!
                </p>

                {/* Quick Inspiration Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                  <button
                    onClick={() => handleQuickAddInspiration('Sunset picnic with homemade treats', 'romantic')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Sunset picnic
                  </button>
                  <button
                    onClick={() => handleQuickAddInspiration('Bookstore date & cute coffee tasting', 'chill')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Bookstore & coffee
                  </button>
                  <button
                    onClick={() => handleQuickAddInspiration('Weekend road trip to scenic lookout', 'adventure')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Scenic road trip
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredIdeas.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${item.completed
                        ? 'bg-purple-50/30 border-purple-100/50 opacity-75'
                        : 'bg-[#fdfaff] border-purple-100/80 hover:border-purple-200 hover:shadow-xs'
                      }`}
                  >
                    {/* Left: Checkmark & Title Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        className="text-purple-600 hover:text-purple-800 transition-colors shrink-0 cursor-pointer"
                        title={item.completed ? 'Mark uncherished' : 'Mark as cherished'}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-purple-600 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-purple-300 hover:text-purple-500" />
                        )}
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs font-bold leading-snug line-clamp-1 ${item.completed ? 'line-through text-gray-400' : 'text-[#1e1b2e]'
                            }`}
                        >
                          {item.title}
                        </span>
                        {item.notes && (
                          <span className="text-[11px] text-[#736a87] font-medium line-clamp-1">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Badges & Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Mood / Category Tag */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-700 capitalize">
                        {item.category}
                      </span>

                      {/* Proposed By Pill */}
                      <span className="text-[10px] text-[#6e687e] bg-white border border-purple-100 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                        By {item.proposedBy}
                      </span>

                      {/* Schedule Button */}
                      <button
                        type="button"
                        onClick={() => handleScheduleToCalendar(item)}
                        className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-100/70 transition-colors cursor-pointer"
                        title="Add to calendar date"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </button>

                      {/* Delete Button - only for author */}
                      {(!item.proposedBy || item.proposedBy.toLowerCase() === currentPartner.name.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove idea"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unified Add Idea Form (Height-Aligned with left card) */}
        <div className="lg:col-span-4 w-full flex flex-col h-full">
          <div className="bg-white/95 rounded-[2rem] p-5 shadow-xs border border-purple-50 flex flex-col justify-between h-full">
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1e1b2e]">New Date Idea</h3>
                  <p className="text-[10px] text-[#736a87]">Dream up our next adventure</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                {/* Idea Title */}
                <div>
                  <label className="text-[10px] font-semibold text-[#6e687e] uppercase tracking-wider block mb-1">
                    Date Idea Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Stargazing at the observatory..."
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-100/70 focus:outline-none focus:border-purple-300 placeholder:text-gray-400"
                  />
                </div>

                {/* Mood Selector (2x2 Grid matching QuickPlanEditor!) */}
                <div>
                  <label className="text-[10px] font-semibold text-[#6e687e] uppercase tracking-wider block mb-1">
                    Vibe & Mood
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MOODS.map((m) => {
                      const isSelected = newCategory === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setNewCategory(m.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center cursor-pointer ${isSelected
                              ? 'bg-purple-100/80 border-purple-400 text-purple-900 shadow-2xs font-bold'
                              : 'bg-purple-50/30 border-purple-100/60 text-[#6e687e] hover:bg-purple-50/60'
                            }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Proposed By (locked to the active partner) */}
                <div>
                  <label className="text-[10px] font-semibold text-[#6e687e] uppercase tracking-wider flex items-center gap-1 mb-1">
                    Proposed By
                    <Lock className="w-2.5 h-2.5" />
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[partner1, partner2].map((p, index) => {
                      const isMe = p.name.toLowerCase() === currentPartner.name.toLowerCase();
                      const activeStyle =
                        index === 0
                          ? 'bg-purple-100/80 border-purple-400 text-purple-900 shadow-2xs'
                          : 'bg-pink-100/80 border-pink-400 text-pink-900 shadow-2xs';
                      return (
                        <div
                          key={p.name}
                          aria-disabled={!isMe}
                          title={isMe ? undefined : `Only ${p.name} can propose as ${p.name}`}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold border text-center select-none ${isMe
                              ? activeStyle
                              : 'bg-purple-50/20 border-purple-100/40 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                          {p.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details / Notes */}
                <div>
                  <label className="text-[10px] font-semibold text-[#6e687e] uppercase tracking-wider block mb-1">
                    Notes & Details
                  </label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Add details, who brings what, or the vibe..."
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-100/70 focus:outline-none focus:border-purple-300 resize-none placeholder:text-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-1 py-2.5 px-4 rounded-xl bg-[#7c0fd0] hover:bg-[#6a0db3] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Wishlist</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdeasPage;