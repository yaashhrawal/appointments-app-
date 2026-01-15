import BookingForm from '@/components/BookingForm';

export default function BookPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-8 text-blue-800">Hospital Appointment Booking</h1>
            <BookingForm />
        </div>
    );
}
