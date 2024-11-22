import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function isTrustedEvent<T extends { isTrusted: boolean }>(event: T): boolean {
  return event.isTrusted === true
}

type EventHandler<T> = (event: T) => void;

export function createSafeEventHandler<T>(handler: EventHandler<T>): EventHandler<T> {
  return (event: T) => {
    try {
      handler(event);
    } catch (error) {
      console.error('Event handler error:', error);
    }
  };
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
