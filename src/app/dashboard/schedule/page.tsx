
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Video } from 'lucide-react';
import { addDays, format } from 'date-fns';

// Placeholder data - in a real app, this would come from a database
const upcomingMeetings = [
    {
        id: '1',
        name: 'Jane Smith',
        role: 'Senior Product Manager',
        avatar: 'https://placehold.co/100x100.png',
        date: addDays(new Date(), 2),
        time: '14:00',
        duration: 30,
    },
    {
        id: '2',
        name: 'Michael Chen',
        role: 'Principal Engineer',
        avatar: 'https://placehold.co/100x100.png',
        date: addDays(new Date(), 5),
        time: '10:30',
        duration: 45,
    }
];

export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <>
            <div className="space-y-1 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">My Schedule</h1>
                <p className="text-muted-foreground">View and manage your upcoming mentorship sessions.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card className="shadow-lg shadow-primary/20">
                        <CardContent className="p-2 sm:p-4 md:p-6">
                             <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md w-full"
                                // In a real app, you'd pass booked dates here
                                // e.g., modifiers={{ booked: [new Date(), addDays(new Date(), 2)] }}
                                // modifiersClassNames={{ booked: "bg-primary/20 text-primary-foreground rounded-md" }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1">
                    <Card className="shadow-lg shadow-primary/20 h-full">
                        <CardHeader>
                            <CardTitle>Upcoming Meetings</CardTitle>
                            <CardDescription>Your next scheduled sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingMeetings.length > 0 ? (
                                <ul className="space-y-4">
                                    {upcomingMeetings.map(meeting => (
                                        <li key={meeting.id} className="p-3 bg-muted/50 rounded-lg flex items-start gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={meeting.avatar} />
                                                <AvatarFallback>{meeting.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{meeting.name}</p>
                                                <p className="text-xs text-muted-foreground">{format(meeting.date, 'eeee, MMM d')}</p>
                                                <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{meeting.time} ({meeting.duration} min)</span>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-primary/10 text-primary rounded-md">
                                                <Video className="w-4 h-4" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No upcoming meetings.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
