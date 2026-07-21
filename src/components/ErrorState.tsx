import { type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
}

export function ErrorState({
  message = 'काहीतरी चूक झाली — पुन्हा प्रयत्न करा',
  onRetry,
  retryLabel = 'पुन्हा प्रयत्न करा',
  children,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]"
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-danger-500 mb-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
      </svg>
      <p className="text-body text-danger-600 font-primary mb-4">{message}</p>
      {children}
      {onRetry && (
        <Button variant="outline" size="md" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
