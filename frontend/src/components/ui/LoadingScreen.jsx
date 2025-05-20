import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingScreen;