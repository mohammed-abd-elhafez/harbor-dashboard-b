import type { ReactNode } from 'react';

export interface Column<T> {
  label: string;
  right?: boolean;
  mono?: boolean;
  muted?: boolean;
  cell: (row: T) => ReactNode;
}

interface Props<T> {
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  testId?: string;
}

/** Semantic table with the Dark Ops row styling; scrolls sideways inside its own focusable region. */
export function DataTable<T>({ caption, columns, rows, rowKey, testId }: Props<T>) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll the table (axe scrollable-region-focusable)
    <div className="b-table-wrap" role="region" aria-label={`${caption} table`} tabIndex={0}>
      <table className="b-table" data-testid={testId}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label} scope="col" className={`b-th${c.right ? ' b-right' : ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.label} className={`b-td${c.right ? ' b-right' : ''}${c.mono ? ' b-mono' : ''}${c.muted ? ' b-muted' : ''}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
