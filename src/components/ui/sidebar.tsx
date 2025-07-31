'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        // Simplified to be a static sidebar, always visible on md screens and up
        className={cn('hidden md:flex h-screen w-64 shrink-0 flex-col gap-4 border-r bg-card text-card-foreground', className)}
        {...props}
      />
    );
  }
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex h-14 items-center gap-2 border-b p-2', className)}
        {...props}
      />
    );
  }
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-auto'
        )}
        {...props}
      />
    );
  }
);
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return <div ref={ref} className={cn('mt-auto flex flex-col gap-2 border-t p-2')} {...props} />;
  }
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  (props, ref) => (
    <ul ref={ref} className={cn('flex w-full min-w-0 flex-col gap-1 px-2')} {...props} />
  )
);
SidebarMenu.displayName = 'SidebarMenu';

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
};
