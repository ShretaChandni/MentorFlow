
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Briefcase, MapPin, X, Heart, Search, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

interface MenteeProfile {
    uid: string;
    fullName: string;
    currentRole: string;
    goals: string;
    interests: string;
    profilePictureUrl?: string;
}

export default function DiscoverMenteesPage() {
    const [mentees, setMentees] = useState<MenteeProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMentees = async () => {
            setLoading(true);
            try {
                const q = query(collection(firestore, 'mentees'));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setMentees([]);
                } else {
                    const menteesData = querySnapshot.docs.map(doc => doc.data() as MenteeProfile);
                    setMentees(menteesData);
                }
            } catch (err) {
                console.error("Error fetching mentees: ", err);
                setError("Could not load profiles. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMentees();
    }, []);

    const handleNext = () => {
        if (mentees.length > 0) {
          setCurrentIndex((prev) => (prev + 1) % mentees.length);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="tech-background -z-10"></div>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 overflow-x-hidden items-center justify-center">
                <div className="tech-background -z-10"></div>
                <h2 className="text-2xl font-bold text-destructive">Error</h2>
                <p className="text-muted-foreground">{error}</p>
                 <Button asChild variant="link" className="mt-4 text-primary">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        )
    }

    if (mentees.length === 0) {
      return (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 overflow-x-hidden items-center justify-center">
             <div className="tech-background -z-10"></div>
            <h2 className="text-2xl font-bold">No Mentees Found</h2>
            <p className="text-muted-foreground">Check back later for new mentees!</p>
             <Button asChild variant="link" className="mt-4 text-primary">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
      )
    }

    const currentMentee = mentees[currentIndex];

    return (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 overflow-x-hidden">
            <div className="tech-background -z-10"></div>
            
            <header className="w-full max-w-xl mx-auto flex justify-start items-center py-4">
                <Button asChild variant="ghost" className="hover:bg-primary/10">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                </Button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4">
                <div className="max-w-md w-full mx-auto">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Discover Mentees</h1>
                        <p className="text-muted-foreground mt-2">
                           Swipe through profiles to find your perfect match
                        </p>
                    </div>

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

                    <div className="flex items-center justify-center gap-4 mt-6">
                        <Button variant="secondary" size="lg" className="rounded-full h-14 w-28 bg-card/80 hover:bg-card/100 border border-primary/20" onClick={handleNext}>
                           <X className="mr-2 h-5 w-5"/> Pass
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-14 w-14 bg-card/80 hover:bg-card/100 border border-primary/20">
                           <Search className="h-6 w-6"/>
                        </Button>
                         <Button size="lg" className="rounded-full h-14 w-32 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                           <Link href="/login"><Heart className="mr-2 h-5 w-5" /> Connect</Link>
                        </Button>
                    </div>

                     <p className="text-sm text-muted-foreground mt-4">
                        {currentIndex + 1} of {mentees.length} profiles
                    </p>
                </div>
            </main>
        </div>
    );
}
