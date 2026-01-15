import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
        Welcome to <br className="sm:hidden" /> Modern Care Hospital
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-lg mx-auto">
        Seamlessly book your appointments and manage your health with our new patient portal.
      </p>

      <div className="space-y-6 w-full max-w-xs sm:max-w-none">
        <Link
          href="/book"
          className="block sm:inline-block w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg active:scale-95"
        >
          Book an Appointment
        </Link>

        <div className="block mt-6">
          <Link href="/doctor/dashboard" className="text-blue-600 font-medium hover:text-blue-800 underline underline-offset-4 p-2">
            Doctor Login (Dashboard)
          </Link>
        </div>
      </div>
    </div>
  );
}
