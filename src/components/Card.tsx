import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  elevation?: 'flat' | 'shadow' | 'raised';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const elevationClasses = {
  flat: 'bg-surface-card',
  shadow: 'bg-surface-card shadow-md',
  raised: 'bg-surface-card shadow-lg',
};

export function Card({ children, padding = 'md', elevation = 'shadow', className, ...props }: CardProps) {
  return (
    <div
      role="region"
      className={clsx('rounded-xl transition-shadow', paddingClasses[padding], elevationClasses[elevation], className)}
      {...props}
    >
      {children}
    </div>
  );
}
