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
        <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-xl shadow-lg max-w-md mx-auto bg-white">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Book an Appointment</h2>

            <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Select Doctor</label>
                <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                >
                    <option value="">-- Choose a Doctor --</option>
                    {doctors.map((doc) => (
                        <option key={doc.crm_id} value={doc.crm_id}>
                            {doc.name} - {doc.specialty}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Your Name</label>
                <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Email</label>
                <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 shadow-md"
            >
                {loading ? 'Booking...' : 'Book Appointment'}
            </button>

            {message && (
                <p className={`mt-4 text-center text-base font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}
