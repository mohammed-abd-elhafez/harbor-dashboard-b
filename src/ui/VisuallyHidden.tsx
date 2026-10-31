import type { ReactNode } from 'react';

/** Content for assistive tech only (spec 5.2 `.sr-only`). */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
