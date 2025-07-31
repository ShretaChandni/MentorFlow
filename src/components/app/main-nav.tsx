
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, FolderKanban, User, Search, Settings, Compass, CalendarDays, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function MainNav() {
  const pathname = usePathname();
  const { userData } = useAuth();
  const userRole = userData?.role;

  const getBrowsePath = () => {
    if (userRole === 'mentor') {
      return '/dashboard/discover-mentees';
    }
    // For mentees, the main discovery page is now the category browser.
    return '/dashboard/browse';
  };
  
  const getBrowseLabel = () => {
    return userRole === 'mentor' ? 'Discover Mentees' : 'Discover Mentors';
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: getBrowsePath(), label: getBrowseLabel(), icon: Compass },
    { href: '/dashboard/connections', label: 'Connections', icon: Users },
    { href: '/dashboard/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/dashboard/resources', label: 'Resources', icon: FolderKanban },
    ...(userRole === 'mentor' ? [{ href: '/mentor-ai-cloning', label: 'AI Clone', icon: Wand2 }] : []),
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <SidebarMenu>
      {navLinks.map((link) => {
        // Special handling for connections to be active during chat
        const isConnectionsActive = pathname.startsWith('/dashboard/connections') || pathname.startsWith('/dashboard/chat');
        const isBrowseActive = pathname.startsWith('/dashboard/browse') || pathname.startsWith('/dashboard/discover-mentors') || pathname.startsWith('/dashboard/discover-mentees');
        
        let isActive = pathname === link.href;
        if (link.label.includes('Discover') || link.label.includes('Browse')) {
          isActive = isBrowseActive;
        } else if (link.href === '/dashboard/connections') {
          isActive = isConnectionsActive;
        } else if (link.href === '/mentor-ai-cloning') {
          isActive = pathname.startsWith('/mentor-ai-cloning');
        }

        return (
          <li key={link.href}>
            <Button
              asChild
              variant="ghost"
              className={cn(
                'w-full justify-start',
                isActive && 'bg-accent text-accent-foreground'
              )}
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          </li>
        );
      })}
    </SidebarMenu>
  );
}
