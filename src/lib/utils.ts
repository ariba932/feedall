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

export function createSafeEventHandler<T extends { isTrusted: boolean }>(
  handler: ((event: T) => void) | undefined
): (event: T) => void {
  return (event: T) => {
    if (isTrustedEvent(event) && handler) {
      handler(event)
    }
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
