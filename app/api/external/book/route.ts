import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { syncAppointmentToCRM } from '@/lib/crmIntegration';

export async function POST(request: Request) {
    try {
        // 1. Authenticate with API Key
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 });
        }

        // Check if key exists and is active (Mock check for demo as we might not have real DB)
        // In real app: await supabase.from('api_keys').select('*').eq('key', apiKey).single();
        const isValid = apiKey.startsWith('sk_seva_');

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
        }

        const body = await request.json();
        const { patient_name, patient_phone, patient_email, doctor_crm_id, slot_time } = body;

        // 2. Validate Request
        if (!patient_name || !doctor_crm_id || !slot_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Create or find patient
        let patient;
        if (patient_phone) {
            const { data: existingPatient } = await supabase
                .from('patients')
                .select('*')
                .eq('phone', patient_phone)
                .single();

            if (existingPatient) {
                patient = existingPatient;
            }
        }

        if (!patient) {
            const { data: newPatient, error: patientError } = await supabase
                .from('patients')
                .insert([{
                    name: patient_name,
                    phone: patient_phone || null,
                    email: patient_email || null
                }])
                .select()
                .single();

            if (patientError) throw patientError;
            patient = newPatient;
        }

        // 4. Find Doctor by CRM ID
        const { data: doctor } = await supabase
            .from('doctors')
            .select('*')
            .eq('crm_id', doctor_crm_id)
            .single();

        if (!doctor) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
        }

        // 5. Create Appointment
        const appointmentStartTime = new Date(slot_time).toISOString();
        const appointmentEndTime = new Date(new Date(slot_time).getTime() + 30 * 60000).toISOString();

        const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert([{
                doctor_id: doctor.id,
                patient_id: patient.id,
                start_time: appointmentStartTime,
                end_time: appointmentEndTime,
                status: 'scheduled'
            }])
            .select()
            .single();

        if (appointmentError) throw appointmentError;

        // 6. Sync with Hospital-CRM
        let crmAppointmentId = 'SYNC_FAILED';
        try {
            crmAppointmentId = await syncAppointmentToCRM({
                patient: patient,
                doctor: doctor,
                startTime: appointmentStartTime,
                endTime: appointmentEndTime,
                status: 'scheduled'
            });

            // Update local appointment with CRM ID
            if (crmAppointmentId !== 'SYNC_FAILED') {
                await supabase
                    .from('appointments')
                    .update({ crm_appointment_id: crmAppointmentId })
                    .eq('id', appointment.id);
            }
        } catch (crmError: any) {
            console.error('❌ External API CRM Sync Failed:', crmError);
            // Continue with response
        }

        // 7. Send Confirmation Notification
        if (doctor.phone) {
            try {
                await sendNotification({
                    to: doctor.phone,
                    message: `[Seva-Connect] External Booking: ${patient_name} @ ${new Date(slot_time).toLocaleString()}`,
                    type: 'whatsapp'
                });
            } catch (notifyError) {
                console.error('Notification failed:', notifyError);
            }
        }

        return NextResponse.json({
            success: true,
            appointment_id: appointment.id,
            crm_appointment_id: crmAppointmentId,
            crm_synced: crmAppointmentId !== 'SYNC_FAILED',
            message: 'Appointment scheduled via Seva-Connect'
        });

    } catch (error: any) {
        console.error('External Booking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
