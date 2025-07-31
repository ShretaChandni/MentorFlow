
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Briefcase, MapPin, X, Heart, Search, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
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


export default function DiscoverMentorsPage() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allMentors, setAllMentors] = useState<MentorProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        const fetchMentors = async () => {
            setLoading(true);
            try {
                const q = query(collection(firestore, 'mentors'));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setAllMentors([]);
                } else {
                    const mentorsData = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as MentorProfile));
                    setAllMentors(mentorsData);
                }
            } catch (err) {
                console.error("Error fetching mentors: ", err);
                setError("Could not load profiles. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = useMemo(() => {
        if (!searchQuery) {
            return allMentors;
        }
        return allMentors.filter(mentor => {
            const searchLower = searchQuery.toLowerCase();
            return (
                mentor.fullName.toLowerCase().includes(searchLower) ||
                mentor.professionalTitle.toLowerCase().includes(searchLower) ||
                mentor.company.toLowerCase().includes(searchLower) ||
                mentor.bio.toLowerCase().includes(searchLower) ||
                mentor.helpWith.toLowerCase().includes(searchLower)
            );
        });
    }, [searchQuery, allMentors]);
    
    useEffect(() => {
        setCurrentIndex(0);
    }, [searchQuery]);


    const handleNext = () => {
        if (filteredMentors.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % filteredMentors.length);
        }
    };

    const handleConnect = async () => {
        if (!user || filteredMentors.length === 0) {
            toast({ variant: 'destructive', title: 'Please log in to connect.' });
            return;
        }
        setIsConnecting(true);
        const currentMentor = filteredMentors[currentIndex];
        router.push(`/dashboard/pay/${currentMentor.uid}`);
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

    const currentMentor = filteredMentors.length > 0 ? filteredMentors[currentIndex] : null;

    return (
        <div className="flex flex-col h-full">
             <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Discover Mentors</h1>
                <p className="text-muted-foreground mt-2">
                   Browse profiles to find your perfect match.
                </p>
            </div>
            
            <div className="max-w-md w-full mx-auto mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, skill, or company..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4">
                <div className="max-w-md w-full mx-auto">
                    {!currentMentor ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <h2 className="text-2xl font-bold">No Mentors Found</h2>
                            <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
                        </div>
                    ) : (
                        <>
                            <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 text-left p-6 rounded-2xl">
                                <CardContent className="p-0 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16 text-2xl font-bold bg-primary text-primary-foreground">
                                            <AvatarImage src={currentMentor.profilePictureUrl} alt={currentMentor.fullName} />
                                            <AvatarFallback>{currentMentor.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold">{currentMentor.fullName}</h2>
                                            <p className="text-muted-foreground">{currentMentor.professionalTitle}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Briefcase className="w-4 h-4" /> <span>{currentMentor.company}</span>
                                            </div>
                                             <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-semibold">{calculateRating(currentMentor.experience).toFixed(1)}</span>
                                                <span className="text-xs text-muted-foreground">({currentMentor.experience})</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Bio</h3>
                                            <p className="line-clamp-3">{currentMentor.bio}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Can Help With</h3>
                                             <div className="flex flex-wrap gap-2">
                                                {(currentMentor.helpWith || "").split(',').map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="bg-primary/20 text-primary-foreground/80 border-none">{skill.trim()}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-center gap-4 mt-6">
                                <Button variant="secondary" size="lg" className="rounded-full h-14 w-28 bg-card/80 hover:bg-card/100 border border-primary/20" onClick={handleNext}>
                                   <X className="mr-2 h-5 w-5"/> Pass
                                </Button>
                                 <Button size="lg" className="rounded-full h-14 w-32 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleConnect} disabled={isConnecting}>
                                    {isConnecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Heart className="mr-2 h-5 w-5" />}
                                    {isConnecting ? "Redirecting..." : "Connect"}
                                </Button>
                            </div>

                             <p className="text-sm text-muted-foreground mt-4">
                                {filteredMentors.length > 0 ? `${currentIndex + 1} of ${filteredMentors.length}` : '0 profiles'}
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
