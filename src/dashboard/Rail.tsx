import * as Dialog from '@radix-ui/react-dialog';
import { useState, type MouseEvent } from 'react';
import { Icon, type IconName } from '../ui/Icon';

const NAV: { label: string; icon: IconName }[] = [
  { label: 'Overview', icon: 'home' },
  { label: 'Orders', icon: 'bag' },
  { label: 'Products', icon: 'box' },
  { label: 'Customers', icon: 'users' },
  { label: 'Analytics', icon: 'chart' },
];

// Spec 10.4: nav links are placeholders; the URL must not change.
const noNavigate = (e: MouseEvent) => e.preventDefault();

/**
 * >= 1024px: the 73px icon rail. Below that (spec 12, DERIVED) the same aside becomes a 56px top bar
 * with a menu button; the nav moves into a focus-trapped drawer.
 */
export function Rail({ initial }: { initial: string }) {
  const [open, setOpen] = useState(false);
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
              {NAV.map((item, i) => (
                <a
                  key={item.label}
                  href="#"
                  className="b-drawer-link"
                  aria-current={i === 0 ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                  }}
                >
                  <Icon name={item.icon} />
                  {item.label}
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
            key={item.label}
            href="#"
            className="b-nav-item"
            data-testid={`nav-item-${i}`}
            aria-label={item.label}
            aria-current={i === 0 ? 'page' : undefined}
            onClick={noNavigate}
          >
            <Icon name={item.icon} />
          </a>
        ))}
      </nav>
      <a href="#" className="b-nav-item b-settings" aria-label="Settings" onClick={noNavigate}>
        <Icon name="sliders" />
      </a>
    </aside>
  );
}
