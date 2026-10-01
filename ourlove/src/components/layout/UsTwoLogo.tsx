import { cn } from '@/lib/utils';

export function UsTwoLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* Icon: Rounded soft lavender square with glossy heart */}
      <div className="relative w-11 h-11 rounded-2xl bg-[#f2e6ff] flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-purple-100">
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-[#8b2cf5] drop-shadow-xs"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          {/* Heart glossy shine circle */}
          <circle cx="16.5" cy="7.5" r="2" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {/* Wordmark and tagline */}
      <div className="flex flex-col">
        <div className="flex items-baseline leading-none font-bold text-2xl tracking-tight">
          <span className="text-[#3b1262]">Us</span>
          <span className="text-[#8c2bf8]">Two</span>
        </div>
        <span className="text-xs font-semibold text-[#8c2bf8] flex items-center gap-1 mt-0.5">
          our little space <span className="text-xs">✦</span>
        </span>
      </div>
    </div>
  );
}
