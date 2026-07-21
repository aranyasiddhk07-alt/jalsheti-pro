import { type ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  message: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  children?: ReactNode;
}

export function EmptyState({ icon = 'field', message, ctaLabel, onCtaClick, children }: EmptyStateProps) {
  const iconPaths: Record<string, string> = {
    field: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
    water: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z',
    history: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z',
    wallet: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9z',
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-secondary-300 mb-4">
        <path d={iconPaths[icon] || iconPaths.field} fill="currentColor" />
      </svg>
      <p className="text-body text-secondary-500 font-primary mb-6 max-w-xs">{message}</p>
      {children}
      {ctaLabel && onCtaClick && (
        <Button variant="primary" size="md" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
