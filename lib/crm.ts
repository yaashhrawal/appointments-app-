import { supabase } from './supabase';

export interface Doctor {
    id: string; // our app ID
    name: string;
    specialty: string;
    phone: string;
    crm_id: string; // CRM's doctor ID
}

export interface CRMAppointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    hospital_id: string;
}

const MOCK_DOCTORS: Doctor[] = [
    { id: 'uuid-1', name: 'Dr. Hemant Khajja', specialty: 'General Physician', phone: '+919876543210', crm_id: 'CRM-KH01' },
];

const HOSPITAL_ID = '550e8400-e29b-41d4-a716-446655440000'; // Bhilwara Hospital

export async function fetchDoctorsFromCRM(): Promise<Doctor[]> {
    try {
        // Fetch from Hospital-CRM 'doctors' table
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('hospital_id', HOSPITAL_ID)
            .eq('is_active', true);

        if (error || !data || data.length === 0) {
            console.warn('CRM Doctors fetch failed, using mock data', error);
            return MOCK_DOCTORS;
        }

        console.log('✅ Fetched doctors from CRM doctors table:', data.length);
        return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialization || d.department || 'General Physician',
            phone: '+1555000000',
            crm_id: d.id  // crm_id = doctors.id for appointments foreign key
        }));
    } catch (e) {
        console.warn('Fetch Doctors Error:', e);
        return MOCK_DOCTORS;
    }
}

export async function fetchAppointmentsFromCRM(): Promise<CRMAppointment[]> {
    try {
        const { data, error } = await supabase
            .from('future_appointments')
            .select('*')
            .order('appointment_date', { ascending: true })
            .limit(20);

        if (error) {
            // Table might not exist yet if user hasn't run the CRM SQL
            // or if it's named slightly differently
            console.warn('CRM Appointments fetch failed:', error.message);
            return [];
        }

        return data as CRMAppointment[];
    } catch (e) {
        console.error('Fetch CRM Appointments Error:', e);
        return [];
    }
}

export async function syncAppointmentToCRM(appointmentData: any): Promise<string> {
    // Placeholder for pushing back to CRM
    // For now, we simulate success
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `CRM-APT-${Math.floor(Math.random() * 10000)}`;
}
