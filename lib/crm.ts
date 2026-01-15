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
    { id: 'uuid-1', name: 'Dr. Hrmant Khajja', specialty: 'General Physician', phone: '+919876543210', crm_id: 'CRM-KH01' },
];

export async function fetchDoctorsFromCRM(): Promise<Doctor[]> {
    try {
        // Fetch from CRM's 'doctors' table if it exists
        const { data, error } = await supabase
            .from('doctors')
            .select('*');

        if (error || !data) {
            console.warn('CRM Doctors fetch failed, using internal dict or defaults', error);
            // Fallback to mock if table missing (or using different schema)
            return MOCK_DOCTORS;
        }

        return data.map((d: any) => ({
            id: d.id, // Or map to a new ID if needed
            name: d.name,
            specialty: d.specialization || d.specialty || 'General',
            phone: '+1555000000', // CRM schema might not have phone exposed or different col
            crm_id: d.id
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
