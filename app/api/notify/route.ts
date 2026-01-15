import { NextResponse } from 'next/server';
import { sendNotification, NotificationType } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, message, type } = body;

        if (!to || !message) {
            return NextResponse.json({ error: 'Missing "to" or "message" fields' }, { status: 400 });
        }

        const notificationType: NotificationType = type === 'whatsapp' ? 'whatsapp' : 'sms';

        // Call the mock service
        await sendNotification({ to, message, type: notificationType });

        return NextResponse.json({ success: true, status: 'sent' });
    } catch (error: any) {
        console.error('Notification API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
