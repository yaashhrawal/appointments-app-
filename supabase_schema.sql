-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Doctors Table
create table doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  specialty text,
  email text unique,
  phone text,
  crm_id text,
  created_at timestamp with time zone default now()
);

-- Patients Table
create table patients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  crm_id text,
  created_at timestamp with time zone default now()
);

-- Appointments Table
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid references doctors(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  crm_appointment_id text,
  created_at timestamp with time zone default now()
);

-- Notifications Table
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid references doctors(id) on delete cascade,
  message text not null,
  type text check (type in ('sms', 'whatsapp')) default 'sms',
  read_status boolean default false,
  created_at timestamp with time zone default now()
);

-- Seed Data for Doctors
insert into doctors (name, specialty, email, phone, crm_id) values
('Dr. Alice Smith', 'Cardiology', 'alice@example.com', '+15550101', 'CRM-001'),
('Dr. Bob Jones', 'Dermatology', 'bob@example.com', '+15550102', 'CRM-002'),
('Dr. Carol White', 'Pediatrics', 'carol@example.com', '+15550103', 'CRM-003');
