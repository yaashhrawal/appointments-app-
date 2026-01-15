import AppointmentList from '@/components/AppointmentList';
import Notifications from '@/components/Notifications';

export default function DoctorDashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                    <button className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 sm:py-2 rounded-lg text-base sm:text-sm font-medium hover:bg-indigo-700 active:scale-95 transition shadow-sm">
                        Refresh Sync
                    </button>
                </div>

                <Notifications />
                <AppointmentList />
            </div>
        </div>
    );
}
