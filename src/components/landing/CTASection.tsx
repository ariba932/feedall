import Link from 'next/link';
import Image from 'next/image';

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-3xl p-12 md:p-20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              Join our community of donors and help us create a world where no food goes to waste
              and no one goes hungry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/donate"
                className="bg-white hover:bg-gray-100 text-primary font-bold py-4 px-8 rounded-lg transition-all duration-300 text-center"
              >
                Start Donating
              </Link>
              <Link
                href="/register"
                className="bg-accent hover:bg-accent-dark text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-center"
              >
                Register Now
              </Link>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary-light rounded-full opacity-20"></div>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent rounded-full opacity-20"></div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-8">Trusted by leading organizations</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grayscale hover:grayscale-0 transition-all duration-300">
                <div className="relative h-12 w-full">
                  <Image
                    src={`/images/partner-${i}.png`}
                    alt={`Partner ${i}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
