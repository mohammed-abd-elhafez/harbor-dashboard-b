import type { ReactNode } from 'react';

/** Header used by every page except the overview (which has its own with search and live status). */
export function PageTitle({ slug, title, children }: { slug: string; title: string; children?: ReactNode }) {
  return (
    <header className="b-header">
      <div className="b-titles">
        <span className="b-crumb">{`harbor-goods / ${slug}`}</span>
        <h1 className="b-h1">{title}</h1>
      </div>
      {children && <div className="b-actions">{children}</div>}
    </header>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ height: 38, margin: '4px 0', background: 'var(--bg-raised)', borderRadius: 6 }} />
      ))}
    </div>
  );
}
