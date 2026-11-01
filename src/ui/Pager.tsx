import { int } from '../domain/format';
import type { Pagination } from '../domain/types';
import { Button } from './Button';

interface Props {
  pagination: Pagination | undefined;
  noun: string;
  onPageChange: (page: number) => void;
}

export function Pager({ pagination, noun, onPageChange }: Props) {
  const { shown, total, page, pages } = pagination ?? { shown: 0, total: 0, page: 1, pages: 1 };
  return (
    <div className="b-foot">
      <span className="b-mono13 b-muted">
        {pagination ? `${shown} of ${int(total)} ${noun} · page ${page} / ${pages}` : ' '}
      </span>
      <div className="b-foot-btns">
        <Button disabled={!pagination || page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        <Button disabled={!pagination || page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
