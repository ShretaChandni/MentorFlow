
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface User {
    uid: string;
    fullName: string;
    role: 'mentor' | 'mentee';
    company?: string;
    email: string;
    status: 'Active' | 'Inactive'; 
    joined: string;
}

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeConnections, setActiveConnections] = useState(0);

    // This effect handles authorization and redirects.
    useEffect(() => {
        // Wait until Firebase auth state is resolved.
        if (authLoading) {
            return;
        }

        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (isAdmin) {
            setIsAuthorized(true);
        } else {
            // If not loading and not an admin, redirect.
            router.push('/admin/login');
        }
    }, [authLoading, router]);

    // This effect fetches data ONLY when authorization is confirmed.
    useEffect(() => {
        // Do not fetch data until authorization is confirmed.
        if (!isAuthorized) {
            return;
        }

        const fetchAdminData = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel for efficiency
                const [mentorsSnapshot, menteesSnapshot, connectionsSnapshot] = await Promise.all([
                    getDocs(collection(firestore, "mentors")),
                    getDocs(collection(firestore, "mentees")),
                    getDocs(query(collection(firestore, "matches"), where("status", "==", "approved")))
                ]);

                setActiveConnections(connectionsSnapshot.size);

                const fetchedUsers: User[] = [];
                
                mentorsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const joinedDate = data.createdAt instanceof Timestamp 
                        ? data.createdAt.toDate().toLocaleDateString() 
                        : 'N/A';

                    fetchedUsers.push({
                        uid: data.uid,
                        fullName: data.fullName,
                        role: 'mentor',
                        company: data.company,
                        email: data.email,
                        status: 'Active',
                        joined: joinedDate,
                    });
                });

                menteesSnapshot.forEach(doc => {
                    const data = doc.data();
                     const joinedDate = data.createdAt instanceof Timestamp 
                        ? data.createdAt.toDate().toLocaleDateString() 
                        : 'N/A';

                    fetchedUsers.push({
                        uid: data.uid,
                        fullName: data.fullName,
                        role: 'mentee',
                        company: data.currentRole, // Mentees have 'currentRole'
                        email: data.email,
                        status: 'Active',
                        joined: joinedDate,
                    });
                });
                
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [isAuthorized]); // This now correctly depends on authorization status.

    const totalMentors = users.filter(u => u.role === 'mentor').length;
    const totalMentees = users.filter(u => u.role === 'mentee').length;

    // Show a single loading spinner until authorization is resolved.
    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
            <div className="tech-background -z-10"></div>
            <header className="w-full max-w-7xl mx-auto flex justify-start items-center py-4">
                <Button asChild variant="outline" className="bg-card text-foreground border-foreground/20 hover:bg-accent">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                </Button>
            </header>
            <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Platform overview and user management.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMentors}</div>
                            <p className="text-xs text-muted-foreground">Verified and active mentors</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMentees}</div>
                            <p className="text-xs text-muted-foreground">Eager learners on the platform</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ongoing Connections</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeConnections}</div>
                            <p className="text-xs text-muted-foreground">Successful mentorship pairs</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card/80 backdrop-blur-sm border-primary/20 flex-grow shadow-lg shadow-primary/20">
                    <CardHeader>
                        <CardTitle>User Database</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="hidden sm:table-cell">Company/Profession</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.uid} className="hover:bg-muted/10">
                                            <TableCell className="font-medium">{user.fullName}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'mentor' ? 'default' : 'secondary'}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">{user.company}</TableCell>
                                            <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                            <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={user.status === 'Active' ? 'border-green-500 text-green-500' : ''}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
