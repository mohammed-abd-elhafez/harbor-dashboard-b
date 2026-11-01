import { useSettings } from '../data/queries';
import { mocksEnabled } from '../data/repository';
import type { SettingsDto } from '../domain/types';
import { Async, type LoadState } from '../ui/Async';
import { Button } from '../ui/Button';
import { PageTitle, TableSkeleton } from './PageTitle';

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="b-card b-card-g14" aria-label={title}>
      <h2 className="b-h2">{title}</h2>
      <dl className="b-dl">
        {rows.map(([k, v]) => (
          <div key={k} className="b-dl-row">
            <dt>{k}</dt>
            <dd className="b-mono">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const sections = (s: SettingsDto): { title: string; rows: [string, string][] }[] => [
  { title: 'Account', rows: [['Signed in as', s.user.email]] },
  { title: 'Store', rows: [['Name', s.store.name], ['Timezone', s.store.timezone]] },
  {
    title: 'Stock alerts',
    rows: [['Low at or below', `${s.stock.low} units`], ['Critical at or below', `${s.stock.critical} units`]],
  },
  { title: 'About', rows: [['Version', s.version], ['Data source', mocksEnabled() ? 'Demo data (mock API)' : 'Live API']] },
];

/** Read-only in v1: there are no write endpoints behind it yet. */
export function SettingsPage({ enabled, onSignOut }: { enabled: boolean; onSignOut: (() => void) | undefined }) {
  const { data, isError, refetch } = useSettings(enabled);
  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';

  return (
    <>
      <PageTitle slug="settings" title="Settings">
        {onSignOut && <Button onClick={onSignOut}>Sign out</Button>}
      </PageTitle>
      <Async state={state} onRetry={() => void refetch()} skeleton={<TableSkeleton rows={4} />}>
        <div className="b-settings-grid" data-testid="settings">
          {data && sections(data).map((s) => <Section key={s.title} {...s} />)}
        </div>
      </Async>
    </>
  );
}
