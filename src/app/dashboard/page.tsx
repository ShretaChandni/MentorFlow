
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, BookOpen, UserPlus, Link2, Youtube, Wand2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { Tutorial } from "@/components/app/tutorial";


export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ active: 0, pending: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    const isMentor = userData?.role === 'mentor';
    const displayName = userData?.fullName?.split(' ')[0] || "User";
    
    const featuredPodcasts = [
        { title: 'The Diary Of A CEO', url: 'https://www.youtube.com/@TheDiaryOfACEO' },
        { title: 'Lex Fridman Podcast', url: 'https://www.youtube.com/@lexfridman' },
        { title: 'Huberman Lab', url: 'https://www.youtube.com/@hubermanlab' },
        { title: 'Acquired', url: 'https://www.youtube.com/@AcquiredFM' },
        { title: 'Deep Dive with Ali Abdaal', url: 'https://www.youtube.com/@DeepDive' },
    ];


    const fetchConnectionStats = useCallback(async () => {
        if (!user || !userData) return;
        setLoadingStats(true);

        const queryField = userData.role === 'mentor' ? 'mentorId' : 'menteeId';
        
        try {
            const q = query(collection(firestore, 'matches'), where(queryField, '==', user.uid));
            const querySnapshot = await getDocs(q);
            
            let activeCount = 0;
            let pendingCount = 0;

            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'approved') {
                    activeCount++;
                } else if (data.status === 'pending') {
                    pendingCount++;
                }
            });

            setStats({ active: activeCount, pending: pendingCount });

        } catch (error) {
            console.error("Error fetching connection stats: ", error);
        } finally {
            setLoadingStats(false);
        }
    }, [user, userData]);


    useEffect(() => {
        if (userData) {
             fetchConnectionStats();
        }
    }, [userData, fetchConnectionStats]);

    useEffect(() => {
        // Check if the tutorial has been completed
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (!tutorialCompleted) {
            // Use a small timeout to ensure the rest of the page loads before the modal
            setTimeout(() => setShowTutorial(true), 500);
        }
    }, []);

    const handleTutorialFinish = () => {
        localStorage.setItem('tutorialCompleted', 'true');
        setShowTutorial(false);
    };


    return (
        <>
            <Tutorial isOpen={showTutorial} onFinish={handleTutorialFinish} />
            <Card className="mb-6 shadow-lg shadow-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
                         {authLoading ? <Skeleton className="w-48 h-9" /> : `Welcome back, ${displayName}!`}
                    </CardTitle>
                    <CardDescription>Ready to find your next great connection?</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/connections?tab=pending" className="group">
                    <Card className="shadow-lg shadow-primary/20 h-full transition-transform duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           {loadingStats ? <Skeleton className="w-10 h-8 mt-1" /> : <div className="text-2xl font-bold">{stats.pending}</div>}
                            <p className="text-xs text-muted-foreground">new requests awaiting your review</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/connections" className="group">
                     <Card className="shadow-lg shadow-primary/20 h-full transition-transform duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {loadingStats ? <Skeleton className="w-10 h-8 mt-1" /> : <div className="text-2xl font-bold">{stats.active}</div>}
                            <p className="text-xs text-muted-foreground">active mentorship connections</p>
                        </CardContent>
                    </Card>
                </Link>
                 {isMentor && (
                    <Link href="/mentor-ai-cloning" className="group">
                        <Card className="shadow-lg shadow-primary/20 h-full transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">AI Clone</CardTitle>
                                <Wand2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Me.AI</div>
                                <p className="text-xs text-muted-foreground">Configure your digital twin</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
                 {!isMentor && (
                    <Link href="/mentee-quiz" className="group">
                        <Card className="shadow-lg shadow-primary/20 h-full transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Career Quiz</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Find Your Path</div>
                                <p className="text-xs text-muted-foreground">Discover your career archetype.</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
                <Card className="flex flex-col bg-primary/10 border-primary/20 shadow-lg shadow-primary/20">
                    <CardHeader>
                        <CardTitle>{isMentor ? "Find your Mentee" : "Find your Mentor"}</CardTitle>
                        <CardDescription className="text-primary/80">
                            {isMentor 
                                ? "Start browsing profiles to find your perfect mentee." 
                                : "Start browsing profiles to find your perfect mentor."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={isMentor ? "/dashboard/discover-mentees" : "/dashboard/discover-mentors"}>Browse Profiles <Search className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-6">
                <Card className="shadow-lg shadow-primary/20">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full"><Users className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-medium">New connection with Jane Smith.</p>
                                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full"><Users className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-medium">You matched with Michael Chen.</p>
                                    <p className="text-sm text-muted-foreground">1 day ago</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full"><Search className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-medium">You viewed 5 new profiles.</p>
                                    <p className="text-sm text-muted-foreground">3 days ago</p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="shadow-lg shadow-primary/20">
                    <CardHeader>
                        <CardTitle>Featured Podcasts</CardTitle>
                        <CardDescription>Expand your knowledge with these top-rated shows.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {featuredPodcasts.map((podcast) => (
                                <li key={podcast.title}>
                                    <a href={podcast.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group text-sm font-medium text-foreground hover:text-primary transition-colors">
                                       <div className="p-2 bg-muted rounded-full">
                                          <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                       </div>
                                        <span>{podcast.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
