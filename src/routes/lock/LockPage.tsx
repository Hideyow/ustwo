import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePasscode } from '@/context/passcode-context';
import { usePartner } from '@/context/partner-context';
import { toast } from 'sonner';
import { Eye, EyeOff, Heart, Key, RefreshCw } from 'lucide-react';
import { BubbleHeartBackground } from '@/components/ui/BubbleHeartBackground';

const LockSchema = z.object({
  passcode: z
    .string()
    .min(1, 'Please enter passcode')
    .length(4, 'Passcode must be 4 numbers')
    .regex(/^\d{4}$/, 'Passcode must be 4 numbers only'),
});

type LockFormData = z.infer<typeof LockSchema>;

export function LockPage() {
  const { unlock, isUnlocked } = usePasscode();
  const { partner1, partner2, activePartner, switchPartner } = usePartner();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isUnlocked) {
      navigate('/calendar', { replace: true });
    }
  }, [isUnlocked, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LockFormData>({
    resolver: zodResolver(LockSchema),
    defaultValues: { passcode: '' },
  });

  const passcodeValue = watch('passcode');
  const codeLength = passcodeValue?.length ?? 0;

  const currentPartner = activePartner === 'partner1' ? partner1 : partner2;
  const otherPartner = activePartner === 'partner1' ? partner2 : partner1;

  const onSubmit = (data: LockFormData) => {
    const success = unlock(data.passcode.trim());
    if (success) {
      toast.success('Welcome back, sweethearts! 💜', {
        description: 'Opening your private sanctuary...',
      });
      const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/calendar';
      navigate(destination, { replace: true });
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      toast.error('Passcode not recognized 🥺', {
        description: 'Hint: Try anniversary date or "1234"!',
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#fcf3f8] via-[#faf5ff] to-[#f9ecf5]">
      {/* Background Soft Blobs & Floating Bubble Hearts */}
      <BubbleHeartBackground />
      <div className="absolute top-1/4 left-1/5 w-72 h-72 bg-purple-200/35 rounded-full blur-3xl pointer-events-none animate-blob" />
      <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-sm flex flex-col items-center gap-4 z-10 animate-fade-in">
        {/* Main Minimalist Lock Card */}
        <div
          className={`w-full bg-white/95 rounded-[2.25rem] shadow-xl border border-purple-100/70 p-7 sm:p-8 flex flex-col items-center transition-all ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Overlapping Avatars */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="flex items-center -space-x-2.5">
              {/* Partner 1 avatar */}
              <div
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm select-none overflow-hidden"
                style={{ backgroundColor: partner1.avatar ? undefined : partner1.color }}
              >
                {partner1.avatar ? (
                  <img src={partner1.avatar} alt={partner1.name} className="w-full h-full object-cover" />
                ) : (
                  partner1.initial
                )}
              </div>
              {/* Heart badge between them */}
              <div className="z-10 w-6 h-6 rounded-full bg-[#fdf2f8] border-2 border-white shadow-2xs flex items-center justify-center -mx-1">
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              </div>
              {/* Partner 2 avatar */}
              <div
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm select-none overflow-hidden"
                style={{ backgroundColor: partner2.avatar ? undefined : partner2.color }}
              >
                {partner2.avatar ? (
                  <img src={partner2.avatar} alt={partner2.name} className="w-full h-full object-cover" />
                ) : (
                  partner2.initial
                )}
              </div>
            </div>
          </div>

          {/* Minimalist Heading */}
          <h1 className="text-lg font-bold text-[#1e1b2e] text-center tracking-tight mb-1">
            UsTwo Sanctuary
          </h1>
          <p className="text-xs text-[#736a87] text-center mb-5">
            Enter passcode to unlock
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center gap-3.5">
            {/* 4 Dot Progress Indicators */}
            <div className="flex items-center justify-center gap-2.5 mb-0.5">
              {[0, 1, 2, 3].map((dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    codeLength > dotIndex
                      ? 'bg-[#7c0fd0] scale-115 shadow-xs'
                      : 'bg-purple-100/90 border border-purple-200'
                  }`}
                />
              ))}
            </div>

            {/* Input: Symmetrically Padded (pl-12 pr-12) for Exact 100% Mathematical Centering */}
            <div className="relative w-full">
              <input
                {...register('passcode')}
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]*"
                placeholder="••••"
                autoFocus
                onChange={(e) => {
                  const numeric = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setValue('passcode', numeric, { shouldValidate: true });
                }}
                className="w-full h-12 pl-12 pr-12 rounded-2xl bg-[#faf4ff] border border-purple-100 text-center text-base font-semibold text-[#2a1742] placeholder:text-[#b3a8c9] focus:outline-none focus:ring-2 focus:ring-[#7c0fd0] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b829e] hover:text-[#7c0fd0] transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errors.passcode && (
              <span className="text-xs text-rose-500 font-medium -mt-1">
                {errors.passcode.message}
              </span>
            )}

            {/* Primary Unlock Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-1 rounded-full bg-gradient-to-r from-[#7c0fd0] to-[#9333ea] hover:from-[#6d0cb8] hover:to-[#7e22ce] text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Unlock Space</span>
            </button>
          </form>

          {/* Quiet Hint Button */}
          <button
            type="button"
            onClick={() => {
              toast.info('Passcode Hint 🔑', {
                description: 'Default passcode is 1234 or your anniversary date!',
              });
            }}
            className="text-[11px] text-[#8e85a3] hover:text-[#7c0fd0] transition-colors mt-3.5 cursor-pointer"
          >
            Need a hint?
          </button>
        </div>

        {/* Quiet Partner Switcher Link Below Card */}
        <button
          type="button"
          onClick={() => {
            switchPartner();
            toast.info(`Active partner set to: ${otherPartner.name} ✨`);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-[#7c7194] hover:text-[#7c0fd0] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Switch Partner ({currentPartner.name})</span>
        </button>
      </div>
    </div>
  );
}

export default LockPage;
