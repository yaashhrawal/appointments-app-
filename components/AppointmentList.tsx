'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAppointmentsFromCRM } from '@/lib/crm';

interface Appointment {
    id: string;
    patient_name: string;
    start_time: string;
    status: string;
    crm_appointment_id: string;
    source?: string;
}

export default function AppointmentList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            try {
                // 1. Fetch Local Appointments
                const { data: localData, error } = await supabase
                    .from('appointments')
                    .select(`
                    id, 
                    start_time, 
                    status, 
                    crm_appointment_id,
                    patients (name)
                `)
                    .order('start_time', { ascending: true });

                const localFormatted = (localData || []).map((apt: any) => ({
                    id: apt.id,
                    patient_name: apt.patients?.name || 'Unknown',
                    start_time: apt.start_time,
                    status: apt.status,
                    crm_appointment_id: apt.crm_appointment_id,
                    source: 'LOCAL'
                }));

                // 2. Fetch CRM Appointments
                const crmData = await fetchAppointmentsFromCRM();
                const crmFormatted = crmData.map(apt => ({
                    id: apt.id,
                    patient_name: 'CRM Patient', // Ideally join with CRM patients
                    start_time: `${apt.appointment_date}T${apt.appointment_time}`,
                    status: apt.status.toLowerCase(),
                    crm_appointment_id: apt.id,
                    source: 'CRM'
                }));

                // 3. Merge and Sort
                const merged = [...localFormatted, ...crmFormatted].sort((a, b) =>
                    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                );

                setAppointments(merged);

            } catch (err: any) {
                console.warn('Supabase Connection Issue:', err.message);

                // Mock data for display if connection fails
                setAppointments([
                    { id: '1', patient_name: 'John Doe (Demo)', start_time: new Date().toISOString(), status: 'scheduled', crm_appointment_id: 'CRM-101', source: 'LOCAL' },
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, []);

    if (loading) return <div className="text-slate-500 p-8 text-center animate-pulse">Loading appointments...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Upcoming Appointments</h3>
                    <p className="text-sm text-slate-500 mt-1">Syncing with <span className="font-medium text-indigo-600">Hospital CRM</span></p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">Live Sync Active</span>
                </div>
            </div>

            <ul className="divide-y divide-slate-100">
                {appointments.length === 0 ? (
                    <li className="p-8 text-center text-slate-500">
                        <div className="inline-block p-4 rounded-full bg-slate-50 mb-3">🗓️</div>
                        <p>No appointments scheduled for today.</p>
                    </li>
                ) : (
                    appointments.map((apt) => (
                        <li key={apt.id} className="group hover:bg-slate-50 transition-all duration-200">
                            <div className="px-6 py-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                                            {apt.patient_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                                {apt.patient_name}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                ID: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{apt.crm_appointment_id ? apt.crm_appointment_id.substring(0, 8) : 'PENDING'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(apt.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${apt.status === 'scheduled' || apt.status === 'confirmed'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                {apt.status.toUpperCase()}
                                            </span>
                                            {apt.source === 'CRM' && (
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wide">
                                                    External CRM
                                                </span>
                                            )}
                                        </div>
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
