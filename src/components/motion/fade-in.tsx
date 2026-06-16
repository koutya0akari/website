// Minimal, lightweight wrappers.
// The site uses a flat, animation-free design, so these render their children
// directly (no framer-motion). The API is kept so existing call sites work.

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
};

export function FadeIn({ children, className }: FadeInProps) {
  return <div className={className}>{children}</div>;
}

export function FadeInStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  faster?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function FadeInItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
