import { useState, useRef } from 'react';
import { usePartner } from '@/context/partner-context';
import { usePasscode } from '@/context/passcode-context';
import { Camera, Check, KeyRound, Lock, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SettingsPage() {
  const { partner1, partner2, updatePartner } = usePartner();
  const { changePasscode, lock } = usePasscode();
  const navigate = useNavigate();

  const [name1, setName1] = useState(partner1.name);
  const [name2, setName2] = useState(partner2.name);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (which: 'partner1' | 'partner2', file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      updatePartner(which, { avatar: e.target?.result as string });
      toast.success('Profile picture updated! 💕');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNames = () => {
    const t1 = name1.trim(), t2 = name2.trim();
    if (!t1 || !t2) { toast.error('Names cannot be empty'); return; }
    updatePartner('partner1', { name: t1 });
    updatePartner('partner2', { name: t2 });
    toast.success('Names updated! 💜');
  };

  const handleChangePasscode = () => {
    if (!currentPass || currentPass.length !== 4) { toast.error('Enter your current 4-digit passcode'); return; }
    if (!/^\d{4}$/.test(newPass)) { toast.error('New passcode must be exactly 4 digits'); return; }
    if (newPass !== confirmPass) { toast.error('Passcodes don\'t match'); return; }
    if (changePasscode(currentPass, newPass)) {
      toast.success('Passcode updated! 🔐');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } else {
      toast.error('Current passcode is incorrect');
    }
  };

  const handleLockSanctuary = () => {
    lock();
    toast.success('Sanctuary locked 🔐');
    navigate('/lock');
  };

  const passInputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-purple-100/80 text-sm text-[#4a3860] font-medium bg-white focus:outline-none focus:border-purple-300 transition-all placeholder:text-[#c4b8d4]';
  const handlePassInput = (e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 4); };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-purple-100/80 text-sm text-[#4a3860] font-medium bg-white focus:outline-none focus:border-purple-300 transition-all placeholder:text-[#c4b8d4]';

  return (
    <div className="flex flex-col w-full animate-fade-in max-w-2xl mx-auto">
      <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-purple-50">
        {/* Profile Pictures */}
        <div className="flex items-center justify-center gap-10 py-6 mb-2">
          {[
            { partner: partner1, which: 'partner1' as const, ref: fileRef1, borderColor: 'border-purple-200 hover:border-purple-300' },
            { partner: partner2, which: 'partner2' as const, ref: fileRef2, borderColor: 'border-pink-200 hover:border-pink-300' },
          ].map(({ partner, which, ref, borderColor }) => (
            <div key={which} className="flex flex-col items-center gap-2">
              <button
                onClick={() => ref.current?.click()}
                className={`group relative w-28 h-28 rounded-full overflow-hidden border-[2.5px] ${borderColor} shadow-sm transition-all cursor-pointer`}
              >
                {partner.avatar ? (
                  <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: partner.color }}>
                    {partner.initial}
                  </div>
                )}
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[#7c3aed]" />
                </div>
              </button>
              <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(which, f); }} />
            </div>
          ))}
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input type="text" value={name1} onChange={(e) => setName1(e.target.value)} className={inputClass} placeholder={partner1.name} />
          <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} className={inputClass} placeholder={partner2.name} />
        </div>
        <button onClick={handleSaveNames} className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-500 text-xs font-semibold hover:bg-purple-50/60 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer mb-5">
          <Check className="w-3.5 h-3.5" />
          Save Names
        </button>

        {/* Divider */}
        <div className="w-full h-px bg-purple-100/50 mb-5" />

        {/* Passcode */}
        <div className="space-y-2.5 mb-3">
          <input type="password" inputMode="numeric" maxLength={4} pattern="[0-9]*" value={currentPass} onChange={(e) => setCurrentPass(e.target.value.replace(/\D/g, '').slice(0, 4))} onInput={handlePassInput} placeholder="Current passcode" className={passInputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input type="password" inputMode="numeric" maxLength={4} pattern="[0-9]*" value={newPass} onChange={(e) => setNewPass(e.target.value.replace(/\D/g, '').slice(0, 4))} onInput={handlePassInput} placeholder="New passcode" className={passInputClass} />
            <input type="password" inputMode="numeric" maxLength={4} pattern="[0-9]*" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value.replace(/\D/g, '').slice(0, 4))} onInput={handlePassInput} placeholder="Confirm passcode" className={passInputClass} />
          </div>
        </div>
        <button onClick={handleChangePasscode} className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-500 text-xs font-semibold hover:bg-purple-50/60 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer mb-5">
          <KeyRound className="w-3.5 h-3.5" />
          Update Passcode
        </button>

        {/* Divider */}
        <div className="w-full h-px bg-purple-100/50 mb-5" />

        {/* Supabase Cloud Sync Status */}
        {isSupabaseConfigured && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[#4a3860] font-medium flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-purple-500" />
                Supabase Cloud Sync
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
          </div>
        )}

        {/* Lock Sanctuary */}
        <button
          onClick={handleLockSanctuary}
          className="w-full py-2.5 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100/80 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium text-xs border border-purple-200/60"
        >
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          Lock Sanctuary
        </button>
      </div>
    </div>
  );
}
