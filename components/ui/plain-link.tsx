import type { AnchorHTMLAttributes } from 'react';

/**
 * Drop-in replacement for next/link using a plain <a> tag (full page reload).
 * Workaround for Vinext RSC prefetch bug in production Cloudflare Workers.
 * Swap back to `import Link from 'next/link'` once fixed.
 */
export default function PlainLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
