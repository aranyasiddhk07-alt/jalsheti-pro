import { type ReactNode } from 'react';
import clsx from 'clsx';

interface HeaderProps {
  title: string;
  subtitle?: string;
  unreadCount?: number;
  isOnline?: boolean;
  onNotificationClick?: () => void;
  rightSlot?: ReactNode;
}

export function Header({ title, subtitle, unreadCount = 0, isOnline = true, onNotificationClick, rightSlot }: HeaderProps) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-20 bg-primary-700 text-white px-4 py-3 shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-heading font-primary font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-label text-primary-100 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {rightSlot}
          <button
            onClick={onNotificationClick}
            aria-label="अधिसूचना"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-primary-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                aria-label={`${unreadCount} नवीन अधिसूचना`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <span
            className={clsx(
              'inline-block w-2.5 h-2.5 rounded-full',
              isOnline ? 'bg-green-400' : 'bg-danger-500',
            )}
            aria-label={isOnline ? 'ऑनलाइन' : 'ऑफलाइन'}
          />
        </div>
      </div>
    </header>
  );
}
