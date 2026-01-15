// lib/notifications.ts

export type NotificationType = 'sms' | 'whatsapp';

interface SendNotificationParams {
    to: string;
    message: string;
    type: NotificationType;
}

export async function sendNotification({ to, message, type }: SendNotificationParams): Promise<boolean> {
    console.log(`[Mock Notification Service] Sending ${type.toUpperCase()} to ${to}: "${message}"`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In a real app, this is where you'd use Twilio SDK:
    // await twilioClient.messages.create({ body: message, to, from: ... })

    return true;
}
