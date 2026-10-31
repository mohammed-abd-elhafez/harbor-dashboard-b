import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RangeKey } from '../domain/types';
import { createRepository } from './repository';

const repository = createRepository();

export function useOverview(range: RangeKey, enabled = true) {
  return useQuery({
    queryKey: ['overview', range],
    queryFn: () => repository.getOverview(range),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Only used from page 2 on; page 1 is already part of the overview payload. */
export function useOrdersPage(range: RangeKey, page: number, enabled: boolean) {
  return useQuery({
    queryKey: ['orders', range, page],
    queryFn: () => repository.getOrders(range, page, 5),
    placeholderData: keepPreviousData,
    enabled: enabled && page > 1,
  });
}
