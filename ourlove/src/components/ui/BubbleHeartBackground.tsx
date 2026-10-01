import React, { useMemo } from 'react';

interface HeartBubbleItem {
  id: number;
  left: number; // percentage (2% - 96%)
  size: number; // size in px (10 - 18px for cute & small)
  duration: number; // duration in seconds
  delay: number; // negative delay in seconds for immediate screen population
  drift: number; // horizontal drift in px (-24px to +24px)
  opacity: number; // 0.35 - 0.7
  type: 'filled-heart' | 'bubble-heart' | 'glass-bubble' | 'sparkle';
  color: 'pink' | 'rose' | 'purple' | 'lavender';
}

export function BubbleHeartBackground() {
  // Deterministic, evenly-spaced floating bubble hearts and sparkles across the screen
  const items: HeartBubbleItem[] = useMemo(() => {
    return [
      { id: 1, left: 3, size: 14, duration: 16, delay: -3, drift: 14, opacity: 0.55, type: 'filled-heart', color: 'pink' },
      { id: 2, left: 8, size: 12, duration: 20, delay: -13, drift: -12, opacity: 0.5, type: 'bubble-heart', color: 'purple' },
      { id: 3, left: 13, size: 10, duration: 15, delay: -7, drift: 10, opacity: 0.6, type: 'sparkle', color: 'pink' },
      { id: 4, left: 18, size: 16, duration: 22, delay: -18, drift: -16, opacity: 0.45, type: 'glass-bubble', color: 'rose' },
      { id: 5, left: 24, size: 13, duration: 17, delay: -5, drift: 15, opacity: 0.55, type: 'filled-heart', color: 'pink' },
      { id: 6, left: 29, size: 15, duration: 21, delay: -15, drift: -10, opacity: 0.5, type: 'bubble-heart', color: 'lavender' },
      { id: 7, left: 35, size: 11, duration: 18, delay: -9, drift: 12, opacity: 0.6, type: 'sparkle', color: 'rose' },
      { id: 8, left: 40, size: 14, duration: 23, delay: -21, drift: -18, opacity: 0.45, type: 'filled-heart', color: 'purple' },
      { id: 9, left: 46, size: 16, duration: 16, delay: -2, drift: 14, opacity: 0.5, type: 'glass-bubble', color: 'pink' },
      { id: 10, left: 51, size: 12, duration: 19, delay: -11, drift: -14, opacity: 0.55, type: 'bubble-heart', color: 'rose' },
      { id: 11, left: 57, size: 15, duration: 24, delay: -17, drift: 16, opacity: 0.45, type: 'filled-heart', color: 'lavender' },
      { id: 12, left: 62, size: 10, duration: 17, delay: -6, drift: -8, opacity: 0.65, type: 'sparkle', color: 'pink' },
      { id: 13, left: 67, size: 14, duration: 20, delay: -14, drift: 12, opacity: 0.5, type: 'glass-bubble', color: 'purple' },
      { id: 14, left: 73, size: 13, duration: 15, delay: -4, drift: -15, opacity: 0.55, type: 'filled-heart', color: 'pink' },
      { id: 15, left: 78, size: 15, duration: 22, delay: -19, drift: 14, opacity: 0.48, type: 'bubble-heart', color: 'rose' },
      { id: 16, left: 84, size: 11, duration: 18, delay: -8, drift: -12, opacity: 0.6, type: 'sparkle', color: 'lavender' },
      { id: 17, left: 89, size: 14, duration: 21, delay: -16, drift: 15, opacity: 0.5, type: 'filled-heart', color: 'pink' },
      { id: 18, left: 94, size: 16, duration: 19, delay: -10, drift: -10, opacity: 0.48, type: 'glass-bubble', color: 'rose' },
      { id: 19, left: 97, size: 12, duration: 23, delay: -1, drift: 8, opacity: 0.55, type: 'bubble-heart', color: 'purple' },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute top-0 will-change-transform animate-float-bubble"
          style={
            {
              left: `${item.left}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              '--drift-x': `${item.drift}px`,
              '--bubble-opacity': item.opacity,
            } as React.CSSProperties
          }
        >
          <div className="w-full h-full animate-bubble-wobble flex items-center justify-center">
            {/* Cute Filled Heart */}
            {item.type === 'filled-heart' && (
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full drop-shadow-[0_2px_4px_rgba(244,114,182,0.35)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={
                    item.color === 'pink'
                      ? '#f472b6'
                      : item.color === 'rose'
                      ? '#fb7185'
                      : item.color === 'purple'
                      ? '#c084fc'
                      : '#e879f9'
                  }
                  fillOpacity="0.75"
                />
                {/* Tiny top-left specular shine */}
                <ellipse cx="7.5" cy="7" rx="1.8" ry="1.2" fill="#ffffff" fillOpacity="0.7" transform="rotate(-30 7.5 7)" />
              </svg>
            )}

            {/* Soap Bubble Heart (Glossy outline + translucent gradient body) */}
            {item.type === 'bubble-heart' && (
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full drop-shadow-[0_2px_6px_rgba(236,72,153,0.3)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id={`grad-bh-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                    <stop offset="40%" stopColor="#f472b6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={`url(#grad-bh-${item.id})`}
                  stroke={item.color === 'purple' ? '#c084fc' : '#f472b6'}
                  strokeWidth="1"
                  strokeOpacity="0.8"
                />
                {/* Cute soap bubble glossy arc highlight */}
                <path
                  d="M6 7.5 C6.5 5 8.5 4.2 10.5 4.5"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeOpacity="0.9"
                />
                <circle cx="6" cy="9.5" r="0.8" fill="#ffffff" fillOpacity="0.9" />
              </svg>
            )}

            {/* Translucent Sphere Bubble with Mini Heart Inside */}
            {item.type === 'glass-bubble' && (
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full drop-shadow-[0_2px_5px_rgba(192,132,252,0.3)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id={`gb-grad-${item.id}`} x1="10%" y1="10%" x2="90%" y2="90%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#fbcfe8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* Bubble outer glass sphere */}
                <circle
                  cx="12"
                  cy="12"
                  r="10.5"
                  fill={`url(#gb-grad-${item.id})`}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.75"
                />
                {/* Inner floating sweet heart */}
                <path
                  d="M12 16.2l-.7-.64C8.8 13.2 7.2 11.7 7.2 9.9c0-1.5 1.1-2.6 2.6-2.6.9 0 1.7.4 2.2 1 .5-.6 1.3-1 2.2-1 1.5 0 2.6 1.1 2.6 2.6 0 1.8-1.6 3.3-4.1 5.66l-.7.64z"
                  fill={item.color === 'purple' ? '#a855f7' : '#ec4899'}
                  fillOpacity="0.7"
                />
                {/* Bubble reflection arc */}
                <path
                  d="M6 8 A6.5 6.5 0 0 1 12 5.5"
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeOpacity="0.9"
                />
              </svg>
            )}

            {/* Cute 4-Point Sparkle Star (✦ like the login screen!) */}
            {item.type === 'sparkle' && (
              <span
                className={`select-none text-xs font-bold ${
                  item.color === 'purple'
                    ? 'text-purple-400'
                    : item.color === 'rose'
                    ? 'text-rose-400'
                    : 'text-pink-400'
                } drop-shadow-[0_1px_3px_rgba(244,114,182,0.4)]`}
                style={{ fontSize: `${item.size}px`, lineHeight: 1 }}
              >
                ✦
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BubbleHeartBackground;
