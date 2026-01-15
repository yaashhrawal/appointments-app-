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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {notifications.length} New
                </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No new notifications
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                            <li key={notif.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <p className="text-sm text-slate-700 leading-relaxed">{notif.message}</p>
                                <span className="text-xs text-slate-400 mt-2 block font-medium">
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
