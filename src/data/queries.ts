import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RangeKey } from '../domain/types';
import type { OrderStatus } from '../domain/types';
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

export function useOrdersList(range: RangeKey, page: number, status: OrderStatus | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['orders-list', range, page, status ?? 'all'],
    queryFn: () => repository.listOrders({ range, page, limit: 10, status }),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useProducts(range: RangeKey, enabled: boolean) {
  return useQuery({ queryKey: ['products', range], queryFn: () => repository.getProducts(range), placeholderData: keepPreviousData, enabled });
}

export function useCustomers(page: number, enabled: boolean) {
  return useQuery({ queryKey: ['customers', page], queryFn: () => repository.getCustomers(page, 10), placeholderData: keepPreviousData, enabled });
}

export function useAnalytics(range: RangeKey, enabled: boolean) {
  return useQuery({ queryKey: ['analytics', range], queryFn: () => repository.getAnalytics(range), placeholderData: keepPreviousData, enabled });
}

export function useSettings(enabled: boolean) {
  return useQuery({ queryKey: ['settings'], queryFn: () => repository.getSettings(), enabled });
}
