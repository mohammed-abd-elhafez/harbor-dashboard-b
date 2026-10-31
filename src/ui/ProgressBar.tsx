/** Decorative inventory bar; the value is always stated in text next to it (spec 11.6). */
export function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="b-track" aria-hidden="true">
      <div className="b-fill" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}
