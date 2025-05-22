import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <FiAlertCircle className="h-16 w-16 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
