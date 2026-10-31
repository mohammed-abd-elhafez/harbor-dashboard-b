import type { OrderStatus } from '../domain/types';

// Marker shape differs per status on purpose, so colour is never the only signal (spec 9.8 / 11.7).
const MARKERS: Record<OrderStatus, { label: string; color: string; radius: string }> = {
  paid: { label: 'Paid', color: 'var(--pos)', radius: '999px' },
  pending: { label: 'Pending', color: 'var(--accent)', radius: '2px' },
  shipped: { label: 'Shipped', color: 'var(--info)', radius: '999px' },
  refunded: { label: 'Refunded', color: 'var(--neg)', radius: '2px' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const m = MARKERS[status];
  return (
    <span className="b-status">
      <span className="b-marker" style={{ background: m.color, borderRadius: m.radius }} aria-hidden="true" />
      {m.label}
    </span>
  );
}
