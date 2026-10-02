import { useState, useEffect } from 'react';
import { Heart, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePartner } from '@/context/partner-context';

const PINNED_NOTE_KEY = 'ustwo_pinned_note';

export function PinnedNoteBanner() {
  const { activePartner, partner1, partner2 } = usePartner();
  const author = activePartner === 'partner1' ? partner2.name : partner1.name;

  const [noteText, setNoteText] = useState<string>(() => {
    return (
      localStorage.getItem(PINNED_NOTE_KEY) ||
      "Can't wait to spend time together! Thinking of you always ✨"
    );
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(noteText);

  // Cross-tab sync: update note when another tab edits it
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PINNED_NOTE_KEY && e.newValue) {
        setNoteText(e.newValue);
        setDraft(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleHeartbeat = () => {
    toast.success(`Heartbeat sent to ${author}! 💓`, {
      description: `${author} just felt your loving buzz on their screen.`,
      icon: '💜',
    });
  };

  const handleSave = () => {
    if (!draft.trim()) return;
    localStorage.setItem(PINNED_NOTE_KEY, draft.trim());
    setNoteText(draft.trim());
    setIsEditing(false);
    toast.success('Love note updated! 💕');
  };

  const handleCancel = () => {
    setDraft(noteText);
    setIsEditing(false);
  };

  return (
    <div className="w-full bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-pink-50/70 backdrop-blur-xs border border-pink-100/70 rounded-full px-4 py-1.5 flex items-center justify-between gap-3 mb-2.5 shadow-2xs transition-all">
      {/* Left: Sweet love note */}
      <div className="flex items-center gap-2 text-xs flex-1 min-w-0">
        <div className="w-5 h-5 rounded-full bg-pink-100/90 flex items-center justify-center shrink-0">
          <Heart className="w-2.5 h-2.5 text-[#ec4899] fill-[#ec4899]" />
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1 max-w-md">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 px-3 py-1 text-xs bg-white rounded-full border border-pink-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 text-pink-600 hover:text-pink-800 transition-colors cursor-pointer"
              title="Save note"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="group flex items-center gap-2 min-w-0 truncate">
            <span className="font-bold text-[#831843] shrink-0 text-xs">{author}:</span>
            <span className="text-[#644a6b] truncate italic text-xs">&ldquo;{noteText}&rdquo;</span>
            <button
              onClick={() => {
                setDraft(noteText);
                setIsEditing(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-pink-400 hover:text-pink-600 transition-opacity cursor-pointer shrink-0"
              title="Edit note"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Heartbeat action button */}
      <button
        onClick={handleHeartbeat}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-pink-50/80 border border-pink-200/80 text-[11px] font-semibold text-[#be185d] shadow-2xs hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
      >
        <Heart className="w-3 h-3 text-[#ec4899] fill-[#ec4899] animate-pulse" />
        <span>Send Heartbeat</span>
      </button>
    </div>
  );
}
