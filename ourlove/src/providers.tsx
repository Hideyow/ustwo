import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PartnerProvider } from '@/context/partner-context';
import { PasscodeProvider } from '@/context/passcode-context';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PartnerProvider>
          <PasscodeProvider>
            <BrowserRouter>
              {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="light"
              toastOptions={{
                style: {
                  borderRadius: '1.25rem',
                  border: '1px solid #f3e8ff',
                  boxShadow: '0 4px 20px rgba(124, 15, 208, 0.08)',
                },
              }}
            />
          </BrowserRouter>
        </PasscodeProvider>
      </PartnerProvider>
    </AuthProvider>
  </QueryClientProvider>
);
}
