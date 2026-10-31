import type { OverviewDto, RangeKey } from '../domain/types';

export interface DashboardRepository {
  getOverview(range: RangeKey): Promise<OverviewDto>;
}

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`${what} is not implemented`);
    this.name = 'NotImplementedError';
  }
}

/** Production stub (Q6: the real API shape is not defined yet). */
export class HttpRepository implements DashboardRepository {
  getOverview(): Promise<OverviewDto> {
    return Promise.reject(new NotImplementedError('HttpRepository.getOverview'));
  }
}

/** Talks to /api/overview, which MSW answers with the spec fixtures. */
export class MockApiRepository implements DashboardRepository {
  async getOverview(range: RangeKey): Promise<OverviewDto> {
    const res = await fetch(`/api/overview?range=${encodeURIComponent(range)}`);
    if (!res.ok) throw new Error(`Overview request failed with ${res.status}`);
    return (await res.json()) as OverviewDto;
  }
}

export const mocksEnabled = (): boolean => import.meta.env.VITE_USE_MOCKS !== 'false';

export const createRepository = (): DashboardRepository => (mocksEnabled() ? new MockApiRepository() : new HttpRepository());
