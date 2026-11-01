import { useEffect, useRef, type ReactNode } from 'react';
import { ROUTE_TITLES, type RouteKey } from '../app/route';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { Rail } from './Rail';

interface Props {
  route: RouteKey;
  initial: string;
  busy: boolean;
  announcement: string;
  children: ReactNode;
}

/** Rail, skip link, live region and the `<main>` landmark shared by every page. */
export function Shell({ route, initial, busy, announcement, children }: Props) {
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Keep the tab title and keyboard position in step with the page the user navigated to.
  useEffect(() => {
    document.title = route === 'overview' ? 'Harbor Goods Admin' : `${ROUTE_TITLES[route]} · Harbor Goods`;
    if (first.current) first.current = false;
    else main.current?.focus();
  }, [route]);

  return (
    <div className="b-root" data-variant="dark-ops">
      {/* A hash link would change the route, so the skip link moves focus itself. */}
      <a
        href="#main"
        className="b-skip"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to main content
      </a>
      <div role="status"><VisuallyHidden>{announcement}</VisuallyHidden></div>
      <Rail initial={initial} route={route} />
      <main id="main" ref={main} tabIndex={-1} className="b-main" data-testid="main" aria-busy={busy}>
        {children}
      </main>
    </div>
  );
}
