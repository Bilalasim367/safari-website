import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-8xl font-bold text-charcoal mb-4">404</h1>
          <div className="w-24 h-1 bg-gold mx-auto mb-8"></div>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            Page Not Found
          </h2>
          <p className="text-charcoal/70 text-lg mb-8 max-w-md mx-auto">
            The page you&apos;re looking for has been moved, deleted, or never existed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="btn-primary"
            >
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="btn-outline"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}