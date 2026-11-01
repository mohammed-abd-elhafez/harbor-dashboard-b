import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { UnauthenticatedError } from '../data/api';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const qc: QueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
      // An expired session surfaces as a 401 on any data request: drop back to the sign-in screen.
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof UnauthenticatedError) qc.setQueryData(['session'], null);
        },
      }),
    });
    return qc;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
