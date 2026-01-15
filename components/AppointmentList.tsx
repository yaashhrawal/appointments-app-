'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Appointment {
    id: string;
    patient_name: string; // Joined or stored
    start_time: string;
    status: string;
    crm_appointment_id: string;
}

export default function AppointmentList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            try {
                // In a real app, you'd filter by the logged-in doctor's ID
                // Here we join with patients table to get names
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                    id, 
                    start_time, 
                    status, 
                    crm_appointment_id,
                    patients (name)
                `)
                    .order('start_time', { ascending: true });

                if (error) throw error;

                if (data) {
                    const formatted = data.map((apt: any) => ({
                        id: apt.id,
                        patient_name: apt.patients?.name || 'Unknown',
                        start_time: apt.start_time,
                        status: apt.status,
                        crm_appointment_id: apt.crm_appointment_id,
                    }));
                    setAppointments(formatted);
                }
            } catch (err) {
                console.error('Error fetching appointments:', err);
                // Mock data for display if connection fails
                setAppointments([
                    { id: '1', patient_name: 'John Doe', start_time: new Date().toISOString(), status: 'scheduled', crm_appointment_id: 'CRM-101' },
                    { id: '2', patient_name: 'Jane Smith', start_time: new Date(Date.now() + 86400000).toISOString(), status: 'scheduled', crm_appointment_id: 'CRM-102' },
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, []);

    if (loading) return <div className="text-gray-500">Loading appointments...</div>;

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Syncing with Hospital CRM</p>
            </div>
            <ul className="divide-y divide-gray-100">
                {appointments.length === 0 ? (
                    <li className="px-6 py-6 text-center text-gray-500">No appointments found.</li>
                ) : (
                    appointments.map((apt) => (
                        <li key={apt.id} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                            <div className="px-4 py-5 sm:px-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-lg font-semibold text-blue-700 truncate">
                                        {apt.patient_name}
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500 mb-1 sm:mb-0">
                                            <span className="font-medium mr-2">Id:</span> {apt.crm_appointment_id || 'Pending Sync'}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-600 sm:mt-0 font-medium">
                                        <p>
                                            {new Date(apt.start_time).toLocaleString(undefined, {
                                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
