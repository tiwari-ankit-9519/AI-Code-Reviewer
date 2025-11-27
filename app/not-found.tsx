import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f9]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <span className="text-4xl font-bold text-blue-600">404</span>
        </div>
        <h2 className="text-2xl font-bold text-[#15192c] mb-2">
          Page Not Found
        </h2>
        <p className="text-[#6c7681] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
