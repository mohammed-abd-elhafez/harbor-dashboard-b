import type { ButtonHTMLAttributes } from 'react';

/** Secondary outline button (Prev / Next). Height is fixed at 44 by the stylesheet. */
export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`b-btn ${className}`.trim()} {...props} />;
}
