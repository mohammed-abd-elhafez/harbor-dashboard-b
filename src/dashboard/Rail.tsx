import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { ROUTE_TITLES, routeHref, type RouteKey } from '../app/route';
import { Icon, type IconName } from '../ui/Icon';

const NAV: { route: RouteKey; icon: IconName }[] = [
  { route: 'overview', icon: 'home' },
  { route: 'orders', icon: 'bag' },
  { route: 'products', icon: 'box' },
  { route: 'customers', icon: 'users' },
  { route: 'analytics', icon: 'chart' },
];

/**
 * >= 1024px: the 73px icon rail. Below that (spec 12, DERIVED) the same aside becomes a 56px top bar
 * with a menu button; the nav moves into a focus-trapped drawer.
 */
export function Rail({ initial, route }: { initial: string; route: RouteKey }) {
  const [open, setOpen] = useState(false);
  const current = (r: RouteKey) => (r === route ? ('page' as const) : undefined);
  return (
    <aside className="b-rail" data-testid="rail">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button type="button" className="b-menu-btn" aria-label="Open navigation">
            <Icon name="menu" />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="b-drawer-overlay" />
          <Dialog.Content className="b-drawer" data-variant="dark-ops" aria-describedby={undefined}>
            <Dialog.Title className="b-drawer-title">Navigation</Dialog.Title>
            <nav aria-label="Main menu" className="b-drawer-nav">
              {[...NAV, { route: 'settings' as const, icon: 'sliders' as const }].map((item) => (
                <a
                  key={item.route}
                  href={routeHref(item.route)}
                  className="b-drawer-link"
                  aria-current={current(item.route)}
                  onClick={() => setOpen(false)}
                >
                  <Icon name={item.icon} />
                  {ROUTE_TITLES[item.route]}
                </a>
              ))}
            </nav>
            <Dialog.Close asChild>
              <button type="button" className="b-btn">Close</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="b-logo" aria-hidden="true">{initial}</div>
      <nav aria-label="Main" className="b-nav">
        {NAV.map((item, i) => (
          <a
            key={item.route}
            href={routeHref(item.route)}
            className="b-nav-item"
            data-testid={`nav-item-${i}`}
            aria-label={ROUTE_TITLES[item.route]}
            aria-current={current(item.route)}
          >
            <Icon name={item.icon} />
          </a>
        ))}
      </nav>
      <a
        href={routeHref('settings')}
        className="b-nav-item b-settings"
        aria-label="Settings"
        aria-current={current('settings')}
      >
        <Icon name="sliders" />
      </a>
    </aside>
  );
}
