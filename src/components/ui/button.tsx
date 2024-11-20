import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn, createSafeEventHandler } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, children, disabled, onClick, ...props }, ref) => {
    const handleClick = createSafeEventHandler((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading && !disabled && onClick) {
        onClick(event);
      }
    });

    const baseStyles = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
      }
    )

    const variantStyles = {
      primary: 'bg-primary-light dark:bg-primary text-white hover:bg-primary dark:hover:bg-primary-dark focus:ring-primary',
      secondary: 'bg-accent-light dark:bg-accent text-white hover:bg-accent dark:hover:bg-accent-dark focus:ring-accent',
      outline: 'border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-primary',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          loading && 'opacity-50 cursor-wait',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        type="button"
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
