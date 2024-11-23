'use client';


export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            For questions and support, please email:{' '}
            <a
              href="mailto:code@tevcng.com"
              className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
            >
              code@tevcng.com
            </a>
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            or visit{' '}
            <a
              href="https://tevcng.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
            >
              Tevc Concepts Limited
            </a>
          </p>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <p className="text-gray-500 dark:text-gray-400">
              Built with{' '}
              <span role="img" aria-label="heart" className="text-red-500">
                ❤️
              </span>{' '}
              for making food donation transparent and efficient.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
