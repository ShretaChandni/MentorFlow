
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, DocumentData, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, UserX, MessageSquare, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Connection extends DocumentData {
    id: string;
    otherUser: DocumentData;
}

const ConnectionCard = ({ connection, onAccept, onDecline, status, role, loadingState }: { connection: Connection, onAccept: (id: string, menteeId: string, mentorId: string) => void, onDecline: (id: string) => void, status: 'pending' | 'approved', role?: string, loadingState: { [key: string]: boolean } }) => {
    const isLoading = loadingState[connection.id];
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={connection.otherUser.profilePictureUrl} />
                        <AvatarFallback>{connection.otherUser.fullName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{connection.otherUser.fullName}</p>
                        <p className="text-sm text-muted-foreground">{connection.otherUser.professionalTitle || connection.otherUser.currentRole}</p>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center items-center">
                    {status === 'pending' && role === 'mentor' && (
                        <>
                            <Button size="icon" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={() => onAccept(connection.id, connection.menteeId, connection.mentorId)} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => onDecline(connection.id)} disabled={isLoading}>
                                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                            </Button>
                        </>
                    )}
                     {status === 'pending' && role === 'mentee' && (
                        <>
                           <Button size="icon" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={() => onAccept(connection.id, connection.menteeId, connection.mentorId)} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-500" onClick={() => onDecline(connection.id)} disabled={isLoading}>
                                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                            </Button>
                        </>
                    )}
                     {status === 'approved' && (
                        <Button asChild>
                            <Link href={`/dashboard/chat/${connection.id}`}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function ConnectionsPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
    const [activeConnections, setActiveConnections] = useState<Connection[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [connectionToDecline, setConnectionToDecline] = useState<string | null>(null);

    const defaultTab = searchParams.get('tab') === 'pending' ? 'pending' : 'active';

    const fetchConnections = useCallback(async () => {
        if (!user || !userData) {
            setLoadingData(false);
            return;
        }
        setLoadingData(true);

        try {
            const matchesCollection = collection(firestore, 'matches');
            const queryField = userData.role === 'mentor' ? 'mentorId' : 'menteeId';
            const q = query(matchesCollection, where(queryField, '==', user.uid));
            
            const querySnapshot = await getDocs(q);

            const connectionsPromises = querySnapshot.docs.map(async (matchDoc) => {
                const matchData = matchDoc.data();
                const otherUserId = user.uid === matchData.mentorId ? matchData.menteeId : matchData.mentorId;
                const otherUserRole = user.uid === matchData.mentorId ? 'mentees' : 'mentors';

                if (!otherUserId) return null;
                
                const userDocRef = doc(firestore, otherUserRole, otherUserId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    return { id: matchDoc.id, ...matchData, otherUser: userDocSnap.data() };
                }
                return null;
            });

            const connections = (await Promise.all(connectionsPromises)).filter(c => c !== null) as Connection[];

            setPendingConnections(connections.filter(c => c.status === 'pending' && c.otherUser));
            setActiveConnections(connections.filter(c => c.status === 'approved' && c.otherUser));

        } catch (error) {
            console.error("Error fetching connections: ", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Connections',
                description: 'Could not load your connections. Please try again later.',
            });
        } finally {
            setLoadingData(false);
        }
    }, [user, userData, toast]);


    useEffect(() => {
        if (!authLoading) {
            fetchConnections();
        }
    }, [authLoading, fetchConnections]);

    const handleAccept = async (matchId: string, menteeId: string, mentorId: string) => {
        if (!user || !userData) return;
        setActionLoading(prev => ({ ...prev, [matchId]: true }));
        try {
            await updateDoc(doc(firestore, 'matches', matchId), { status: 'approved' });
            
            // Notify the other user
            const otherUserId = user.uid === mentorId ? menteeId : mentorId;
            await addDoc(collection(firestore, 'notifications'), {
                userId: otherUserId,
                message: `${userData.fullName} accepted your connection request.`,
                link: `/dashboard/chat/${matchId}`,
                isRead: false,
                createdAt: serverTimestamp(),
            });

            toast({ title: 'Connection Accepted!', description: 'You can now start collaborating.' });
            fetchConnections();
        } catch (error) {
            console.error('Error accepting connection:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not accept the connection.' });
        } finally {
            setActionLoading(prev => ({ ...prev, [matchId]: false }));
        }
    };

    const confirmDecline = async () => {
        if (!connectionToDecline) return;
        setActionLoading(prev => ({ ...prev, [connectionToDecline]: true }));
        try {
            await updateDoc(doc(firestore, 'matches', connectionToDecline), { status: 'declined' });
            toast({ title: 'Request Removed', description: 'The request has been successfully removed.' });
            fetchConnections();
        } catch (error) {
            console.error('Error declining connection:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove the request.' });
        } finally {
            setActionLoading(prev => ({ ...prev, [connectionToDecline]: false }));
            setConnectionToDecline(null);
            setDialogOpen(false);
        }
    };

    const openDeclineDialog = (matchId: string) => {
        setConnectionToDecline(matchId);
        setDialogOpen(true);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <>
            <div className="space-y-1 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">Your Connections</h1>
                <p className="text-muted-foreground">Manage your mentorship requests and active connections.</p>
            </div>
            
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="active">
                        Active Connections <Badge className="ml-2">{activeConnections.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending Requests <Badge variant="secondary" className="ml-2">{pendingConnections.length}</Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-6">
                     <Card className="shadow-lg shadow-primary/20">
                        <CardHeader>
                            <CardTitle>Active Connections</CardTitle>
                             <CardDescription>Your approved mentorship pairings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {loadingData ? (
                                <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>
                           ) : activeConnections.length > 0 ? (
                                activeConnections.map(conn => (
                                    <ConnectionCard key={conn.id} connection={conn} status="approved" onAccept={()=>{}} onDecline={()=>{}} loadingState={actionLoading} role={userData?.role} />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm p-4 text-center">You have no active connections yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pending" className="mt-6">
                     <Card className="shadow-lg shadow-primary/20">
                        <CardHeader>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>Review and respond to new mentorship requests.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {loadingData ? (
                                <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>
                             ) : pendingConnections.length > 0 ? (
                                pendingConnections.map(conn => (
                                    <ConnectionCard 
                                        key={conn.id} 
                                        connection={conn} 
                                        onAccept={handleAccept} 
                                        onDecline={openDeclineDialog}
                                        status="pending"
                                        role={userData?.role}
                                        loadingState={actionLoading}
                                    />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm p-4 text-center">You have no pending requests.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This will permanently remove this request. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConnectionToDecline(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDecline} disabled={actionLoading[connectionToDecline!]}>
                            {actionLoading[connectionToDecline!] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

    
