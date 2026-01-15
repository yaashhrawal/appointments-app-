import Link from 'next/link';
import { Home, Calendar, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Seva-Sangrah
                        </Link>
                    </div>

                    <div className="hidden sm:flex space-x-8">
                        <Link href="/" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors">
                            <Home className="w-4 h-4" /> Home
                        </Link>
                        <Link href="/book" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors">
                            <Calendar className="w-4 h-4" /> Book Appt
                        </Link>
                        <Link href="/doctor/dashboard" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Doctor
                        </Link>
                    </div>

                    <div className="sm:hidden">
                        {/* Mobile menu button could go here, for now keeping it simple */}
                        <Link href="/book" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Book
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
