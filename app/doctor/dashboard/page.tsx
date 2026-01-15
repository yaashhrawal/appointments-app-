import AppointmentList from '@/components/AppointmentList';
import Notifications from '@/components/Notifications';
import ApiKeyManager from '@/components/ApiKeyManager';

export default function DoctorDashboard() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage appointments, patient notifications, and integrations</p>
                    </div>
                    <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
                        <span>↻</span> Refresh Data
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <AppointmentList />
                        <ApiKeyManager />
                    </div>
                    <div className="space-y-8">
                        <Notifications />
                    </div>
                </div>
            </div>
        </div>
    );
}
