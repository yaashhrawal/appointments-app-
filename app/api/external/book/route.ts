import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

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
        const { patient_name, patient_phone, doctor_crm_id, slot_time } = body;

        // 2. Validate Request
        if (!patient_name || !doctor_crm_id || !slot_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Create Appointment (Logic similar to BookingForm but server-side)

        // Find Doctor by CRM ID (Mock lookup)
        // const { data: doctor } = await supabase.from('doctors').eq('crm_id', doctor_crm_id).single();
        // For MVP demo, we assume doctor exists if CRM ID is provided or fetch from mock

        // Setup mock response for successful booking
        const appointmentId = `APT-EXT-${Math.floor(Math.random() * 100000)}`;

        // 4. Send Confirmation Notification (Mock)
        // We'd look up the doctor's phone here in a real scenario
        await sendNotification({
            to: '+0000000000', // Placeholder
            message: `[Seva-Connect] External Booking: ${patient_name} @ ${new Date(slot_time).toLocaleString()}`,
            type: 'whatsapp'
        });

        return NextResponse.json({
            success: true,
            appointment_id: appointmentId,
            message: 'Appointment scheduled via Seva-Connect'
        });

    } catch (error: any) {
        console.error('External Booking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
