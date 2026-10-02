import { useState, useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Heart, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePartner } from '@/context/partner-context';
import { supabase } from '@/lib/supabase';

const PINNED_NOTE_KEY = 'ustwo_pinned_note';
const DEFAULT_NOTE_TEXT = "Can't wait to spend time together! Thinking of you always ✨";
const HEARTBEAT_COOLDOWN_MS = 2000;

type PinnedNote = { text: string; author: string };
type HeartbeatPayload = { from: string; to: string };

// Parse stored value. Supports the old format (plain string) too.
function parseNote(raw: string | null): PinnedNote {
  if (!raw) return { text: DEFAULT_NOTE_TEXT, author: '' };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.text === 'string') {
      return { text: parsed.text, author: parsed.author ?? '' };
    }
  } catch {
    /* old plain-text format */
  }
  return { text: raw, author: '' };
}

export function PinnedNoteBanner() {
  const { activePartner, partner1, partner2 } = usePartner();

  // Who is using the app right now (saved with the note, sent as heartbeat sender)
  const currentName = activePartner === 'partner1' ? partner1.name : partner2.name;
  // Who receives the heartbeat
  const recipient = activePartner === 'partner1' ? partner2.name : partner1.name;

  const [note, setNote] = useState<PinnedNote>(() =>
    parseNote(localStorage.getItem(PINNED_NOTE_KEY)),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);
  const [isBuzzing, setIsBuzzing] = useState(false);

  const heartbeatChannelRef = useRef<RealtimeChannel | null>(null);
  const isChannelReadyRef = useRef(false);
  const lastSentRef = useRef(0);

  // Cross-tab sync for the love note: update note when another tab edits it
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ustwo_pinned_note_channel');
        bc.onmessage = (e) => {
          if (e.data?.type === 'NOTE_UPDATED' && e.data?.text) {
            setNote({ text: e.data.text, author: e.data.author ?? '' });
            setDraft(e.data.text);
          }
        };
      }
    } catch { /* ignore */ }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === PINNED_NOTE_KEY && e.newValue) {
        const next = parseNote(e.newValue);
        setNote(next);
        setDraft(next.text);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  // Real-time heartbeat channel (works across devices)
  useEffect(() => {
    isChannelReadyRef.current = false;

    const channel = supabase
      .channel('ustwo-heartbeat', { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'heartbeat' }, ({ payload }) => {
        const { from, to } = payload as HeartbeatPayload;
        // Only react if this heartbeat is meant for the partner using this screen
        if (to !== currentName || from === currentName) return;

        toast(`${from} is thinking of you 💓`, {
          description: 'You just felt a loving buzz!',
          icon: '💜',
        });
        navigator.vibrate?.([120, 80, 120]);
        setIsBuzzing(true);
        setTimeout(() => setIsBuzzing(false), 1800);
      })
      .subscribe((status) => {
        isChannelReadyRef.current = status === 'SUBSCRIBED';
      });

    heartbeatChannelRef.current = channel;

    return () => {
      isChannelReadyRef.current = false;
      heartbeatChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [currentName]);

  const handleHeartbeat = async () => {
    const now = Date.now();
    if (now - lastSentRef.current < HEARTBEAT_COOLDOWN_MS) return;

    const channel = heartbeatChannelRef.current;
    if (!channel || !isChannelReadyRef.current) {
      toast.error('Not connected yet, try again in a moment 🥺');
      return;
    }

    lastSentRef.current = now;
    const payload: HeartbeatPayload = { from: currentName, to: recipient };
    const result = await channel.send({ type: 'broadcast', event: 'heartbeat', payload });

    if (result === 'ok') {
      toast.success(`Heartbeat sent to ${recipient}! 💓`, { icon: '💜' });
    } else {
      toast.error('Heartbeat could not be sent. Check your connection.');
    }
  };

  const handleSave = () => {
    if (!draft.trim()) return;
    const next: PinnedNote = { text: draft.trim(), author: currentName };
    localStorage.setItem(PINNED_NOTE_KEY, JSON.stringify(next));
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ustwo_pinned_note_channel');
        bc.postMessage({ type: 'NOTE_UPDATED', text: next.text, author: next.author });
        bc.close();
      }
    } catch { /* ignore */ }
    setNote(next);
    setIsEditing(false);
    toast.success('Love note updated! 💕');
  };

  const handleCancel = () => {
    setDraft(note.text);
    setIsEditing(false);
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-pink-50/70 backdrop-blur-xs border border-pink-100/70 rounded-full px-4 py-1.5 flex items-center justify-between gap-3 mb-2.5 shadow-2xs transition-all ${isBuzzing ? 'ring-2 ring-pink-300/70 scale-[1.01]' : ''
        }`}
    >
      {/* Left: Sweet love note */}
      <div className="flex items-center gap-2 text-xs flex-1 min-w-0">
        <div
          className={`w-5 h-5 rounded-full bg-pink-100/90 flex items-center justify-center shrink-0 ${isBuzzing ? 'animate-ping' : ''
            }`}
        >
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
            <span className="font-bold text-[#831843] shrink-0 text-xs">
              {note.author || 'Love note'}:
            </span>
            <span className="text-[#644a6b] truncate italic text-xs">&ldquo;{note.text}&rdquo;</span>
            <button
              onClick={() => {
                setDraft(note.text);
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