import { RANGES } from '../domain/range';
import type { RangeKey } from '../domain/types';

export function RangeGroup({ range, onRangeChange }: { range: RangeKey; onRangeChange: (range: RangeKey) => void }) {
  return (
    <div role="group" aria-label="Time range" className="b-range">
      {RANGES.map((r) => (
        <button key={r} type="button" className="b-range-btn" aria-pressed={r === range} onClick={() => onRangeChange(r)}>
          {r}
        </button>
      ))}
    </div>
  );
}
