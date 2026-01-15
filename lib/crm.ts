// lib/crm.ts

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    crm_id: string;
}

const MOCK_DOCTORS: Doctor[] = [
    { id: 'uuid-1', name: 'Dr. Alice Smith', specialty: 'Cardiology', phone: '+15550101', crm_id: 'CRM-001' },
    { id: 'uuid-2', name: 'Dr. Bob Jones', specialty: 'Dermatology', phone: '+15550102', crm_id: 'CRM-002' },
    { id: 'uuid-3', name: 'Dr. Carol White', specialty: 'Pediatrics', phone: '+15550103', crm_id: 'CRM-003' },
];

export async function fetchDoctorsFromCRM(): Promise<Doctor[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_DOCTORS;
}

export async function syncAppointmentToCRM(appointmentData: any): Promise<string> {
    // Simulate sending data to CRM and getting an ID back
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `CRM-APT-${Math.floor(Math.random() * 10000)}`;
}
