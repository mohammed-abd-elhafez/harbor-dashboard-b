export class UnauthenticatedError extends Error {
  constructor() {
    super('Sign in required');
    this.name = 'UnauthenticatedError';
  }
}

/** Same-origin fetch (the dev server proxies /api; production serves both behind one domain). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  if (res.status === 401) throw new UnauthenticatedError();
  if (!res.ok) throw new Error(`Request to ${path} failed with ${res.status}`);
  return res;
}
