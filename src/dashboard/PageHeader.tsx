import { RANGES } from '../domain/range';
import type { RangeKey } from '../domain/types';
import { Icon } from '../ui/Icon';

interface Props {
  updatedAt: string;
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
}

export function PageHeader({ updatedAt, range, onRangeChange }: Props) {
  return (
    <header className="b-header" data-testid="page-header">
      <div className="b-titles">
        <span className="b-crumb">harbor-goods / overview</span>
        <h1 className="b-h1">Store performance</h1>
      </div>
      <div className="b-actions">
        <span className="b-live">
          <span className="b-live-dot" aria-hidden="true" />
          {`Live · updated ${updatedAt}`}
        </span>
        <div role="group" aria-label="Time range" className="b-range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className="b-range-btn"
              aria-pressed={r === range}
              onClick={() => onRangeChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="b-search">
          <Icon name="search" size={18} />
          {/* TODO(search): v1 has no results behaviour and no global Ctrl K handler (spec 10.4). */}
          <input type="search" className="b-search-input" aria-label="Search or run a command" placeholder={'Search or jump to…'} />
          <kbd className="b-kbd">Ctrl K</kbd>
        </div>
      </div>
    </header>
  );
}
