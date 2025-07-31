
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, BadgeInfo, Star, Briefcase, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PaymentPage() {
    const { mentorId } = useParams() as { mentorId: string };
    const { user, userData } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [mentor, setMentor] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!mentorId) return;

        const fetchMentor = async () => {
            setLoading(true);
            try {
                const mentorDocRef = doc(firestore, 'mentors', mentorId);
                const mentorDocSnap = await getDoc(mentorDocRef);
                if (mentorDocSnap.exists()) {
                    setMentor(mentorDocSnap.data());
                } else {
                    toast({ variant: 'destructive', title: 'Mentor not found.' });
                    router.push('/dashboard/browse');
                }
            } catch (error) {
                console.error("Error fetching mentor:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load mentor details.' });
            } finally {
                setLoading(false);
            }
        };

        fetchMentor();
    }, [mentorId, router, toast]);

    const handlePayment = async () => {
        if (!user || !userData || !mentor) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot process payment.' });
            return;
        }
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            await addDoc(collection(firestore, 'matches'), {
                menteeId: user.uid,
                mentorId: mentor.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            await addDoc(collection(firestore, 'notifications'), {
                userId: mentor.uid,
                message: `${userData.fullName} sent you a connection request.`,
                link: `/dashboard/connections`,
                isRead: false,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Connection Request Sent!',
                description: `Your request has been sent to ${mentor.fullName}.`,
            });
            router.push('/dashboard/connections');

        } catch (err) {
            console.error("Error creating match after payment:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send connection request.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const isLeadership = mentor?.helpWith?.toLowerCase().includes('leadership');
    const price = isLeadership ? 899 : 699;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!mentor) {
        return (
             <div className="flex-grow flex items-center justify-center">
                <Card className="p-8 text-center bg-card/50">
                    <BadgeInfo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">Mentor Not Found</h2>
                    <p className="text-muted-foreground mt-2">The mentor you are trying to connect with does not exist.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button asChild variant="ghost" className="-ml-4 mb-4">
                <Link href="/dashboard/browse">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Browse
                </Link>
            </Button>
            <Card className="shadow-lg shadow-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Confirm Connection</CardTitle>
                    <CardDescription>Review the details and complete the payment to connect with your mentor.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                         <Avatar className="w-16 h-16">
                            <AvatarImage src={mentor.profilePictureUrl} alt={mentor.fullName} />
                            <AvatarFallback>{mentor.fullName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg">{mentor.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.professionalTitle}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Briefcase className="w-4 h-4" /> <span>{mentor.company}</span>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Connection Fee</span>
                                    <span>₹{price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Platform Fee (15%)</span>
                                    <span>₹{(price * 0.15).toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>₹{(price * 1.15).toFixed(2)}</span>
                                </div>
                            </div>
                             <p className="text-xs text-muted-foreground mt-4 text-center">
                                This is a simulated payment. No real transaction will occur.
                            </p>
                        </CardContent>
                    </Card>

                    <Button className="w-full text-lg py-6" size="lg" onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                        {isProcessing ? 'Processing...' : `Pay ₹${(price * 1.15).toFixed(2)} & Connect`}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

