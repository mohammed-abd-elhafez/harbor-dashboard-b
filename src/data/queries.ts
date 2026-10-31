import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RangeKey } from '../domain/types';
import { createRepository } from './repository';

const repository = createRepository();

export function useOverview(range: RangeKey) {
  return useQuery({
    queryKey: ['overview', range],
    queryFn: () => repository.getOverview(range),
    placeholderData: keepPreviousData,
  });
}
