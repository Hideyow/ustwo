import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UsTwoLogo } from './UsTwoLogo';
import { usePartner } from '@/context/partner-context';
import { usePasscode } from '@/context/passcode-context';
import { Heart, Settings, Sparkles, Camera, CalendarHeart, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { BubbleHeartBackground } from '@/components/ui/BubbleHeartBackground';

export function AppShell() {
  const { partner1, partner2, activePartner, setActivePartner, coupleLabel } = usePartner();
  const { lock } = usePasscode();
  const navigate = useNavigate();

  const handleQuickLock = () => {
    lock();
    toast.success('Sanctuary locked 🔐');
    navigate('/lock');
  };

  const navLinks = [
    { to: '/memories', label: 'Our Memories', icon: Camera },
    { to: '/calendar', label: 'Shared Calendar', icon: CalendarHeart },
    { to: '/ideas', label: 'Date Ideas & Wishlist', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Soft Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-pink-200/35 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="fixed -bottom-40 left-1/4 w-[32rem] h-[32rem] bg-violet-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" style={{ animationDelay: '4s' }} />

      {/* Cute Small Floating Bubble Hearts Background */}
      <BubbleHeartBackground />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full glass border-b border-purple-100/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <NavLink to="/calendar" className="hover:opacity-90 transition-opacity">
              <UsTwoLogo />
            </NavLink>
          </div>

          {/* Center: Main Navigation Tabs (Minimalist Cute Icons) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  aria-label={link.label}
                  className={({ isActive }) =>
                    `group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#7c0fd0] text-white shadow-sm scale-105'
                        : 'text-[#6e6184] hover:text-[#7c0fd0] hover:bg-purple-100/60 active:scale-95'
                    }`
                  }
                >
                  <Icon className="w-[19px] h-[19px]" strokeWidth={2} />
                  {/* Minimalist cute tooltip */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2a1742] text-white text-[10px] font-semibold tracking-wide whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
                    {link.label}
                  </span>
                </NavLink>
              );
            })}

            <div className="w-[1px] h-5 bg-purple-200/60 mx-1" />

            <NavLink
              to="/settings"
              aria-label="Settings"
              className={({ isActive }) =>
                `group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#7c0fd0] text-white shadow-sm scale-105'
                    : 'text-[#6e6184] hover:text-[#7c0fd0] hover:bg-purple-100/60 active:scale-95'
                }`
              }
            >
              <Settings className="w-[19px] h-[19px]" strokeWidth={2} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2a1742] text-white text-[10px] font-semibold tracking-wide whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
                Settings
              </span>
            </NavLink>

            <button
              onClick={handleQuickLock}
              aria-label="Lock Sanctuary"
              title="Lock Sanctuary"
              className="group relative w-10 h-10 rounded-full flex items-center justify-center text-[#6e6184] hover:text-[#7c0fd0] hover:bg-purple-100/60 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Lock className="w-[18px] h-[18px]" strokeWidth={2} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2a1742] text-white text-[10px] font-semibold tracking-wide whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
                Lock
              </span>
            </button>
          </nav>

          {/* Right: Interactive Partner Account Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Account Pill & Quick Switcher */}
            <div
              className="flex items-center p-1 bg-white/90 border border-purple-200/80 rounded-full shadow-2xs transition-all"
              title="Click on either partner to switch account"
            >
              {/* Partner 1 (Lawrence) Button */}
              <button
                onClick={() => {
                  if (activePartner !== 'partner1') {
                    setActivePartner('partner1');
                    toast.success(`Switched account to ${partner1.name}! 💜`, {
                      description: `Now posting and viewing as ${partner1.name}`,
                    });
                  }
                }}
                title={`Active account: ${partner1.name}. Click to switch.`}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activePartner === 'partner1'
                    ? 'bg-purple-100/90 text-[#581c87] shadow-xs ring-1 ring-purple-400 font-bold'
                    : 'text-[#8573a0] hover:text-[#581c87] hover:bg-purple-50/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold overflow-hidden shadow-2xs shrink-0 transition-transform ${
                    activePartner === 'partner1' ? 'ring-2 ring-purple-600 scale-105' : ''
                  }`}
                  style={{ backgroundColor: partner1.avatar ? undefined : partner1.color }}
                >
                  {partner1.avatar ? (
                    <img src={partner1.avatar} alt={partner1.name} className="w-full h-full object-cover" />
                  ) : (
                    partner1.initial
                  )}
                </div>
                <span className="hidden sm:inline font-bold">{partner1.name}</span>
                {activePartner === 'partner1' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 animate-pulse" />
                )}
              </button>

              {/* Center Heart Divider */}
              <div className="px-1 text-pink-400">
                <Heart className="w-3 h-3 fill-pink-500 text-pink-500 animate-pulse-heart shrink-0" />
              </div>

              {/* Partner 2 (Marga) Button */}
              <button
                onClick={() => {
                  if (activePartner !== 'partner2') {
                    setActivePartner('partner2');
                    toast.success(`Switched account to ${partner2.name}! 💕`, {
                      description: `Now posting and viewing as ${partner2.name}`,
                    });
                  }
                }}
                title={`Active account: ${partner2.name}. Click to switch.`}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activePartner === 'partner2'
                    ? 'bg-pink-100/90 text-[#be185d] shadow-xs ring-1 ring-pink-400 font-bold'
                    : 'text-[#8573a0] hover:text-[#be185d] hover:bg-pink-50/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold overflow-hidden shadow-2xs shrink-0 transition-transform ${
                    activePartner === 'partner2' ? 'ring-2 ring-pink-500 scale-105' : ''
                  }`}
                  style={{ backgroundColor: partner2.avatar ? undefined : partner2.color }}
                >
                  {partner2.avatar ? (
                    <img src={partner2.avatar} alt={partner2.name} className="w-full h-full object-cover" />
                  ) : (
                    partner2.initial
                  )}
                </div>
                <span className="hidden sm:inline font-bold">{partner2.name}</span>
                {activePartner === 'partner2' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden justify-center items-center py-2 px-4 border-t border-purple-100/50 bg-white/70 backdrop-blur-xs">
          <nav
            aria-label="Mobile Navigation"
            className="flex items-center gap-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  aria-label={link.label}
                  className={({ isActive }) =>
                    `relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#7c0fd0] text-white shadow-xs scale-105'
                        : 'text-[#6e6184] hover:text-[#7c0fd0] hover:bg-purple-100/60 active:scale-95'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </NavLink>
              );
            })}

            <div className="w-[1px] h-4 bg-purple-200/60 mx-1" />

            <NavLink
              to="/settings"
              aria-label="Settings"
              className={({ isActive }) =>
                `relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#7c0fd0] text-white shadow-xs scale-105'
                    : 'text-[#6e6184] hover:text-[#7c0fd0] hover:bg-purple-100/60 active:scale-95'
                }`
              }
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
            </NavLink>

            <button
              onClick={handleQuickLock}
              aria-label="Lock Sanctuary"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#6e6184] hover:text-[#7c0fd0] hover:bg-purple-100/60 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Lock className="w-4 h-4" strokeWidth={2} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <Outlet />
      </main>

      {/* Footer matching design */}
      <footer className="w-full mt-auto py-4 sm:py-5 border-t border-purple-100/60 bg-white/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#796d8e]">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#ec4899] fill-[#ec4899]" />
            <span>UsTwo — Handcrafted with tender care for {coupleLabel}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => toast('Scrapbook memories 📸', { description: 'Full gallery mode coming soon!' })}
              className="hover:text-[#7c0fd0] transition-colors"
            >
              Scrapbook
            </button>
            <button
              onClick={() => toast('Upcoming Dates 🗓️', { description: 'Synced with your calendar' })}
              className="hover:text-[#7c0fd0] transition-colors"
            >
              Upcoming Dates
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
