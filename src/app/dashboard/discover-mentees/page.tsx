
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Briefcase, MapPin, X, Heart, Search, Loader2, UserCheck, UserX, MessageSquare } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface MenteeProfile {
    uid: string;
    fullName: string;
    currentRole: string;
    goals: string;
    interests: string;
    profilePictureUrl?: string;
}

interface Connection {
    id: string;
    menteeId: string;
    mentorId: string;
    status: 'pending' | 'approved' | 'declined';
}

export default function DiscoverMenteesPage() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allMentees, setAllMentees] = useState<MenteeProfile[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMenteesAndConnections = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const menteesQuery = query(collection(firestore, 'mentees'));
            const connectionsQuery = query(collection(firestore, 'matches'), where('mentorId', '==', user.uid));

            const [menteesSnapshot, connectionsSnapshot] = await Promise.all([
                getDocs(menteesQuery),
                getDocs(connectionsQuery),
            ]);

            const menteesData = menteesSnapshot.docs.map(doc => doc.data() as MenteeProfile);
            setAllMentees(menteesData);

            const connectionsData = connectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection));
            setConnections(connectionsData);

        } catch (err) {
            console.error("Error fetching data: ", err);
            setError("Could not load profiles. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMenteesAndConnections();
    }, [fetchMenteesAndConnections]);

    const filteredMentees = useMemo(() => {
        if (!searchQuery) {
            return allMentees;
        }
        return allMentees.filter(mentee => {
            const searchLower = searchQuery.toLowerCase();
            return (
                mentee.fullName.toLowerCase().includes(searchLower) ||
                mentee.currentRole.toLowerCase().includes(searchLower) ||
                mentee.goals.toLowerCase().includes(searchLower) ||
                mentee.interests.toLowerCase().includes(searchLower)
            );
        });
    }, [searchQuery, allMentees]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [searchQuery]);


    const handleNext = () => {
        if (filteredMentees.length > 0) {
          setCurrentIndex((prev) => (prev + 1) % filteredMentees.length);
        }
    };

    const handleConnect = async (menteeId: string) => {
        if (!user || !userData) return;
        setActionLoading(true);
        const currentMentee = filteredMentees.find(m => m.uid === menteeId);
        if (!currentMentee) return;

        try {
            await addDoc(collection(firestore, 'matches'), {
                mentorId: user.uid,
                menteeId: currentMentee.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            await addDoc(collection(firestore, 'notifications'), {
                userId: currentMentee.uid,
                message: `${userData.fullName} wants to connect with you!`,
                link: `/dashboard/connections`,
                isRead: false,
                createdAt: serverTimestamp(),
            });
            toast({
                title: 'Connection Request Sent!',
                description: `Your request to connect with ${currentMentee.fullName} has been sent.`,
            });
            await fetchMenteesAndConnections(); // Refetch to update status
            handleNext();
        } catch (err) {
            console.error("Error creating match:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send connection request.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccept = async (connection: Connection) => {
        if (!user || !userData) return;
        setActionLoading(true);
        try {
            await updateDoc(doc(firestore, 'matches', connection.id), { status: 'approved' });
            await addDoc(collection(firestore, 'notifications'), {
                userId: connection.menteeId,
                message: `${userData.fullName} accepted your connection request.`,
                link: `/dashboard/chat/${connection.id}`,
                isRead: false,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Connection Accepted!', description: 'You can now start collaborating.' });
            await fetchMenteesAndConnections();
            handleNext();
        } catch (error) {
            console.error('Error accepting connection:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not accept the connection.' });
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleDecline = async (connectionId: string) => {
        setActionLoading(true);
        try {
            await updateDoc(doc(firestore, 'matches', connectionId), { status: 'declined' });
            toast({ title: 'Request Removed', description: 'The request has been successfully removed.' });
            await fetchMenteesAndConnections();
            handleNext();
        } catch (error) {
            console.error('Error declining connection:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove the request.' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold text-destructive">Error</h2>
                <p className="text-muted-foreground">{error}</p>
                 <Button asChild variant="link" className="mt-4 text-primary">
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        )
    }

    const currentMentee = filteredMentees.length > 0 ? filteredMentees[currentIndex] : null;
    const existingConnection = currentMentee ? connections.find(c => c.menteeId === currentMentee.uid && c.status !== 'declined') : null;

    const ActionButtons = () => {
        if (!currentMentee) return null;
        if (actionLoading) {
            return (
                <div className="flex items-center justify-center gap-4 mt-6 h-14">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )
        }

        if (existingConnection) {
            if (existingConnection.status === 'pending') {
                return (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <Button size="lg" className="rounded-full h-14 w-32 bg-green-500 hover:bg-green-600 text-primary-foreground" onClick={() => handleAccept(existingConnection)}>
                            <UserCheck className="mr-2 h-5 w-5" /> Accept
                        </Button>
                        <Button size="lg" className="rounded-full h-14 w-32 bg-red-500 hover:bg-red-600 text-primary-foreground" onClick={() => handleDecline(existingConnection.id)}>
                            <UserX className="mr-2 h-5 w-5" /> Decline
                        </Button>
                    </div>
                )
            }
             if (existingConnection.status === 'approved') {
                return (
                     <div className="flex items-center justify-center gap-4 mt-6">
                        <Button size="lg" className="rounded-full h-14 w-40" asChild>
                           <Link href={`/dashboard/chat/${existingConnection.id}`}>
                                <MessageSquare className="mr-2 h-5 w-5" /> Message
                           </Link>
                        </Button>
                        <Button variant="secondary" size="lg" className="rounded-full h-14 w-28 bg-card/80 hover:bg-card/100 border border-primary/20" onClick={handleNext}>
                           Next
                        </Button>
                    </div>
                )
            }
        }
        
        return (
            <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="secondary" size="lg" className="rounded-full h-14 w-28 bg-card/80 hover:bg-card/100 border border-primary/20" onClick={handleNext}>
                   <X className="mr-2 h-5 w-5"/> Pass
                </Button>
                 <Button size="lg" className="rounded-full h-14 w-32 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleConnect(currentMentee.uid)} disabled={actionLoading}>
                    <Heart className="mr-2 h-5 w-5" /> Connect
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Discover Mentees</h1>
                <p className="text-muted-foreground mt-2">
                   Browse profiles to find your perfect match.
                </p>
            </div>
            
            <div className="max-w-md w-full mx-auto mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, role, or interest..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4">
                <div className="max-w-md w-full mx-auto">
                    
                    {!currentMentee ? (
                         <div className="flex flex-col items-center justify-center h-full text-center">
                            <h2 className="text-2xl font-bold">No Mentees Found</h2>
                            <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
                        </div>
                    ) : (
                        <>
                        <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 text-left p-6 rounded-2xl">
                            <CardContent className="p-0 space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16 text-2xl font-bold bg-primary text-primary-foreground">
                                        <AvatarImage src={currentMentee.profilePictureUrl} alt={currentMentee.fullName} />
                                        <AvatarFallback>{currentMentee.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold">{currentMentee.fullName}</h2>
                                        <p className="text-muted-foreground">{currentMentee.currentRole}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Goals</h3>
                                        <p>{currentMentee.goals}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(currentMentee.interests || "").split(',').map((interest, i) => (
                                                <Badge key={i} variant="secondary" className="bg-primary/20 text-primary-foreground/80 border-none">{interest.trim()}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <ActionButtons />
                        
                         <p className="text-sm text-muted-foreground mt-4">
                            {filteredMentees.length > 0 ? `${currentIndex + 1} of ${filteredMentees.length} profiles` : '0 profiles'}
                        </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
