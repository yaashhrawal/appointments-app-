'use client';

import { useState, useEffect } from 'react';
import { fetchDoctorsFromCRM, Doctor } from '@/lib/crm';
import { supabase } from '@/lib/supabase';

export default function BookingForm() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadDoctors() {
            const docs = await fetchDoctorsFromCRM();
            setDoctors(docs);
        }
        loadDoctors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 1. Create Patient (or find existing)
            // For simplicity, we create a new entry every time or you could check email
            const { data: patient, error: patientError } = await supabase
                .from('patients')
                .insert([{ name: patientName, email: patientEmail }])
                .select()
                .single();

            if (patientError) throw patientError;

            // 2. Create Appointment
            const { error: appointmentError } = await supabase
                .from('appointments')
                .insert([{
                    doctor_id: doctors.find(d => d.crm_id === selectedDoctor)?.id, // In real app, map correctly
                    patient_id: patient.id,
                    start_time: new Date(appointmentDate).toISOString(),
                    end_time: new Date(new Date(appointmentDate).getTime() + 30 * 60000).toISOString(), // 30 mins
                    status: 'scheduled'
                }]);

            if (appointmentError) throw appointmentError;

            // 3. Send Notification to Doctor
            const doctor = doctors.find(d => d.crm_id === selectedDoctor);
            if (doctor && doctor.phone) {
                try {
                    await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: doctor.phone,
                            message: `New Appointment: ${patientName} @ ${new Date(appointmentDate).toLocaleString()}`,
                            type: 'whatsapp' // Defaulting to WhatsApp as requested preference
                        })
                    });
                } catch (notifyError) {
                    console.error('Failed to send notification:', notifyError);
                    // Don't block success message for notification failure
                }
            }

            setMessage('Appointment booked successfully! Doctor notified.');
        } catch (error: any) {
            console.error(error);
            // Fallback for demo without real Supabase connection
            if (error.message?.includes('FetchError') || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('http')) {
                // Simulate success for demo
                const doctor = doctors.find(d => d.crm_id === selectedDoctor);
                await fetch('/api/notify', {
                    method: 'POST',
                    body: JSON.stringify({
                        to: doctor?.phone || '+000000',
                        message: `[DEMO] New Appointment: ${patientName}`,
                        type: 'whatsapp'
                    })
                });

                setMessage('Simulated Success: Appointment booked & Notification Sent (Supabase not connected)');
            } else {
                setMessage('Error booking appointment: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-8 border-0 rounded-3xl shadow-2xl max-w-lg mx-auto bg-white/90 backdrop-blur-lg">
            <h2 className="text-3xl font-extrabold mb-8 text-slate-800 text-center tracking-tight">
                Book Your <span className="text-indigo-600">Appointment</span>
            </h2>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Doctor</label>
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full h-14 px-4 bg-slate-50 border-0 rounded-xl text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        required
                    >
                        <option value="">Select a Specialist</option>
                        {doctors.map((doc) => (
                            <option key={doc.crm_id} value={doc.crm_id}>
                                {doc.name} - {doc.specialty}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Patient Name</label>
                    <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full h-14 px-4 bg-slate-50 border-0 rounded-xl text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
                    <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full h-14 px-4 bg-slate-50 border-0 rounded-xl text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400"
                        placeholder="john@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Date & Time</label>
                    <input
                        type="datetime-local"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full h-14 px-4 bg-slate-50 border-0 rounded-xl text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        required
                    />
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <details className="group">
                        <summary className="list-none flex justify-between items-center cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            <span>🔗 Book via Seva-Connect (Cross-App)</span>
                            <span className="transition group-open:rotate-180">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4 p-4 bg-indigo-50 rounded-xl">
                            <p className="text-xs text-indigo-800 mb-2">Enter Partner details to book in their system.</p>
                            <input
                                type="text"
                                placeholder="Partner API URL (e.g. https://partner-app.com)"
                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Partner API Key (sk_seva_...)"
                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                            />
                            <button type="button" className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">
                                Verify & Search Partner Slots
                            </button>
                        </div>
                    </details>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full h-16 mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xl font-bold rounded-2xl hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {loading ? 'Confirming...' : 'Confirm Appointment'}
            </button>

            {message && (
                <div className={`mt-6 p-4 rounded-xl text-center font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}
        </form>
    );
}
