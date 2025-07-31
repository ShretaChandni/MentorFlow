
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Briefcase, Heart, ArrowLeft, BadgeInfo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MentorProfile {
    uid: string;
    fullName: string;
    professionalTitle: string;
    company: string;
    bio: string;
    experience: string;
    helpWith: string;
    profilePictureUrl?: string;
    rating?: number; 
}

const calculateRating = (experience: string): number => {
    const years = parseInt(experience.replace(/\D/g, ''), 10) || 0;
    if (years >= 15) return 5.0;
    if (years >= 10) return 4.5;
    if (years >= 5) return 4.0;
    return 3.5;
};

const MentorCard = ({ mentor, onConnect, isConnecting }: { mentor: MentorProfile, onConnect: (mentorId: string) => void, isConnecting: boolean }) => {
    const rating = useMemo(() => calculateRating(mentor.experience), [mentor.experience]);
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 flex flex-col">
            <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={mentor.profilePictureUrl} alt={mentor.fullName} />
                        <AvatarFallback>{mentor.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{mentor.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{mentor.professionalTitle}</p>
                         <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({mentor.experience})</span>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{mentor.bio}</p>
                
                <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Can help with</h4>
                    <div className="flex flex-wrap gap-2">
                        {(mentor.helpWith || "").split(',').map((skill, i) => (
                            <Badge key={i} variant="outline">{skill.trim()}</Badge>
                        ))}
                    </div>
                </div>

                <Button className="w-full mt-auto" onClick={() => onConnect(mentor.uid)} disabled={isConnecting}>
                    {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Heart className="mr-2 h-4 w-4" />}
                    {isConnecting ? 'Redirecting...' : 'Connect'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default function CategoryClientPage({ params }: { params: { category: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [connectingMentorId, setConnectingMentorId] = useState<string | null>(null);
    
    const category = useMemo(() => decodeURIComponent(params.category || ''), [params.category]);

    useEffect(() => {
        const fetchMentors = async () => {
            if (!category) return;

            setLoading(true);
            try {
                const mentorsRef = collection(firestore, 'mentors');
                const querySnapshot = await getDocs(mentorsRef); // Query all mentors first
                
                const allMentorsData = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as MentorProfile));
                
                // Client-side filtering
                const filteredMentorsData = allMentorsData.filter(mentor => 
                    mentor.helpWith.toLowerCase().includes(category.toLowerCase())
                );
                
                setMentors(filteredMentorsData);

            } catch (err) {
                console.error("Error fetching mentors: ", err);
                toast({ variant: "destructive", title: "Error", description: "Could not load mentors." });
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, [category, toast]);

    const handleConnect = (mentorId: string) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Please log in to connect.' });
            return;
        }
        setConnectingMentorId(mentorId);
        router.push(`/dashboard/pay/${mentorId}`);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8">
                 <Button asChild variant="ghost" className="-ml-4 mb-4">
                    <Link href="/dashboard/browse">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Categories
                    </Link>
                </Button>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Mentors for {category}</h1>
                <p className="text-muted-foreground mt-2">
                   Here are mentors specializing in {category}.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center flex-grow">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : mentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map(mentor => (
                        <MentorCard 
                            key={mentor.uid} 
                            mentor={mentor} 
                            onConnect={handleConnect}
                            isConnecting={connectingMentorId === mentor.uid} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <Card className="p-8 text-center bg-card/50">
                        <BadgeInfo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold">No Mentors Found</h2>
                        <p className="text-muted-foreground mt-2">There are currently no mentors matching the "{category}" category.</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
