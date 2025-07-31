
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { MainNav } from '@/components/app/main-nav';
import { UserNav } from '@/components/app/user-nav';
import { Logo } from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Notifications } from '@/components/app/notifications';


function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex flex-col w-64 border-r bg-card text-card-foreground">
        <header className="flex h-14 items-center gap-2 border-b p-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-24" />
        </header>
        <div className="flex-1 p-2 space-y-1">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <footer className="mt-auto p-2 border-t">
          <Skeleton className="h-12 w-full" />
        </footer>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Skeleton className="w-16 h-16" />
      </main>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Only run logic on the client after ensuring auth state is not loading
        if (isClient && !loading) {
            if (!user) {
                router.push('/login');
            }
        }
    }, [user, loading, router, isClient]);

    if (!isClient || loading) {
        return <DashboardSkeleton />;
    }
    
    // If auth is resolved, but there is no user, we will be redirecting,
    // so we can return a loader or null to prevent flashing the layout.
    if (!user) {
        return <DashboardSkeleton />;
    }

    const DesktopSidebar = () => (
         <Sidebar className="hidden md:flex">
            <SidebarHeader>
                <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
                    <Logo className="w-6 h-6" />
                    <h1 className="text-lg font-semibold font-headline">MentorFlow</h1>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <MainNav />
            </SidebarContent>
            <SidebarFooter>
                <UserNav />
            </SidebarFooter>
        </Sidebar>
    );

    const MobileSidebar = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                 <Sidebar className="flex w-full">
                     <SidebarHeader>
                        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
                             <Logo className="w-6 h-6" />
                             <h1 className="text-lg font-semibold font-headline">MentorFlow</h1>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <MainNav />
                    </SidebarContent>
                    <SidebarFooter>
                        <UserNav />
                    </SidebarFooter>
                </Sidebar>
            </SheetContent>
        </Sheet>
    );


    return (
        <div className="flex min-h-screen">
            <DesktopSidebar />
            <div className="flex flex-1 flex-col">
                 <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:px-6">
                    <MobileSidebar />
                    <div className="flex-1" />
                    <Notifications />
                 </header>
                 <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
                    <div className="flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        <DashboardLayoutContent>
            {children}
        </DashboardLayoutContent>
        <Toaster />
    </AuthProvider>
  );
}
