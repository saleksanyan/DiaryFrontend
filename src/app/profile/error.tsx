'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Dashboard Error
        </h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}