import { useEffect, useState } from 'react';
import type { OrderRow } from '../domain/types';

const MAX_ROWS = 5;

/**
 * Prepends orders pushed over Server-Sent Events to the initial list. EventSource reconnects by itself
 * and resends Last-Event-ID, so missed events are replayed by the server.
 */
export function useLiveOrders(initial: readonly OrderRow[] | undefined, enabled: boolean): readonly OrderRow[] | undefined {
  const [pushed, setPushed] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource('/api/orders/stream');
    source.addEventListener('order', (e) => {
      const order = JSON.parse((e as MessageEvent<string>).data) as OrderRow;
      setPushed((prev) => [order, ...prev.filter((o) => o.id !== order.id)].slice(0, MAX_ROWS));
    });
    return () => source.close();
  }, [enabled]);

  if (!initial || pushed.length === 0) return initial;
  const seen = new Set(pushed.map((o) => o.id));
  return [...pushed, ...initial.filter((o) => !seen.has(o.id))].slice(0, MAX_ROWS);
}
