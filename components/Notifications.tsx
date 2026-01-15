'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Notification {
    id: string;
    message: string;
    created_at: string;
    read_status: boolean;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // 1. Initial Fetch
        async function fetchNotifications() {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) setNotifications(data);
            else {
                // Mock
                setNotifications([
                    { id: 'n1', message: 'New appointment booked for tomorrow', created_at: new Date().toISOString(), read_status: false }
                ]);
            }
        }

        fetchNotifications();

        // 2. Realtime Subscription (disabled if no URL, but good to have code ready)
        if (process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')) {
            const channel = supabase
                .channel('realtime-notifications')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                    setNotifications((prev) => [payload.new as Notification, ...prev]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, []);

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6 border-l-4 border-yellow-400">
            <h3 className="font-bold text-gray-800 mb-2">Notifications</h3>
            <ul className="space-y-2">
                {notifications.map((n) => (
                    <li key={n.id} className={`text-sm ${n.read_status ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                        • {n.message} <span className="text-xs text-gray-400">({new Date(n.created_at).toLocaleTimeString()})</span>
                    </li>
                ))}
                {notifications.length === 0 && <li className="text-gray-500 text-sm">No new notifications.</li>}
            </ul>
        </div>
    );
}
