import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <AlertTriangle className="text-amber-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
            404 - Page Not Found
          </h1>

          <p className="text-gray-300 text-center mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm">
              Looking for something specific? Try checking the navigation menu or search for what you need.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
              rounded-lg transition duration-300 flex items-center justify-center"
            >
              <Home className="mr-2" size={18} />
              Return to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 
              rounded-lg transition duration-300 flex items-center justify-center"
            >
              <ArrowLeft className="mr-2" size={18} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;