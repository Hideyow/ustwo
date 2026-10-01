import { Routes, Route, Navigate } from 'react-router-dom';
import { usePasscode } from '@/context/passcode-context';
import { LockPage } from '@/routes/lock/LockPage';
import { AppShell } from '@/components/layout/AppShell';
import { PasscodeGuard } from '@/components/layout/PasscodeGuard';
import { CalendarPage } from '@/routes/calendar/CalendarPage';
import { MemoriesPage } from '@/routes/memories/MemoriesPage';
import { IdeasPage } from '@/routes/ideas/IdeasPage';
import { SettingsPage } from '@/routes/settings/SettingsPage';

function RootRedirect() {
  const { isUnlocked } = usePasscode();
  return <Navigate to={isUnlocked ? '/calendar' : '/lock'} replace />;
}

export function App() {
  return (
    <Routes>
      {/* Public lock route */}
      <Route path="/lock" element={<LockPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Protected routes wrapped in AppShell and PasscodeGuard */}
      <Route element={<PasscodeGuard />}>
        <Route element={<AppShell />}>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
