import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePasscode } from '@/context/passcode-context';

export function PasscodeGuard() {
  const { isUnlocked } = usePasscode();
  const location = useLocation();

  if (!isUnlocked) {
    return <Navigate to="/lock" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
