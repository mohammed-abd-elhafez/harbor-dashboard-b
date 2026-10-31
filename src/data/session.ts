import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, UnauthenticatedError } from './api';

export interface SessionUser {
  id: number;
  email: string;
}

/** `null` means signed out. Any other failure (network, 5xx) is surfaced as an error. */
export function useSession(enabled: boolean) {
  return useQuery({
    queryKey: ['session'],
    enabled,
    retry: false,
    queryFn: async (): Promise<SessionUser | null> => {
      try {
        return (await (await apiFetch('/api/auth/me')).json()) as SessionUser;
      } catch (e) {
        if (e instanceof UnauthenticatedError) return null;
        throw e;
      }
    },
  });
}

export function useSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.status === 401) throw new Error('Invalid email or password');
      if (res.status === 429) throw new Error('Too many attempts. Try again later.');
      if (!res.ok) throw new Error('Could not sign in. Try again.');
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    },
    onSuccess: () => {
      qc.clear();
      qc.setQueryData(['session'], null);
    },
  });
}
