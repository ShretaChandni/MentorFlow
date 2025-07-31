
'use client';

import { cn } from '@/lib/utils';

type Status = 'online' | 'ai_available' | 'unavailable';

interface StatusIndicatorProps {
    status: Status;
}

const statusConfig = {
    online: {
        color: 'bg-green-500',
        text: 'Online',
    },
    ai_available: {
        color: 'bg-yellow-500',
        text: 'AI Assistant',
    },
    unavailable: {
        color: 'bg-red-500',
        text: 'AI Unavailable',
    },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
    const { color, text } = statusConfig[status];

    return (
        <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', color)}></span>
            <span className="text-xs font-medium text-muted-foreground">{text}</span>
        </div>
    );
}
