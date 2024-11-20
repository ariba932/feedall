import Image from 'next/image';

export default function ImpactSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                <div className="absolute inset-0">
                  <Image
                    src="/images/impact.jpg"
                    alt="Community Impact"
                    className="object-cover"
                    fill
                    priority
                  />
                </div>
              </div>
              {/* Impact Card */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Food Waste Reduced</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">120 Tons</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Making a Real Difference in Communities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Through our platform, we&apos;ve helped connect thousands of donors with local communities,
              reducing food waste and fighting hunger together.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full mt-1">
                  <svg className="w-6 h-6 text-primary dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Transparent Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Track your donations from pickup to delivery, ensuring they reach those in need.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full mt-1">
                  <svg className="w-6 h-6 text-primary dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Verified Recipients</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Partner with verified local organizations to ensure your donations make the maximum impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
