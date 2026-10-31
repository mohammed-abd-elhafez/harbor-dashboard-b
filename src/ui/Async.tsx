import type { ReactNode } from 'react';
import { Button } from './Button';

export type LoadState = 'loading' | 'error' | 'ready';

/** Static placeholder block (spec 10.2): no shimmer, fixed size so nothing shifts. */
export function Skeleton({ width = '100%', height, style }: { width?: number | string; height: number | string; style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={{ width, height, background: 'var(--bg-raised)', borderRadius: 6, ...style }} />;
}

export function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-muted)' }}>
      <span>Couldn&apos;t load this section</span>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}

interface AsyncProps {
  state: LoadState;
  onRetry: () => void;
  skeleton: ReactNode;
  children: ReactNode;
}

export function Async({ state, onRetry, skeleton, children }: AsyncProps) {
  if (state === 'error') return <SectionError onRetry={onRetry} />;
  if (state === 'loading') return <>{skeleton}</>;
  return <>{children}</>;
}
