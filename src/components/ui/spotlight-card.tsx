import { cn } from '@/lib/utils';

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  // Kept for API compatibility; the flat design no longer renders a spotlight.
  spotlightColor?: string;
};

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 transition-colors hover:border-white/20',
        className,
      )}
    >
      <div className="relative h-full">{children}</div>
    </div>
  );
}
