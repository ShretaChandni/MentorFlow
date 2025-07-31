
import { cn } from "@/lib/utils";
import React from "react";

export const InnerBeingLogo = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 100 125"
      className={cn("fill-current", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="purple-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.7 0"
            result="glow"
          />
          <feComposite in="glow" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
      <path
        d="M50,0C22.4,0,0,22.4,0,50c0,27.6,22.4,50,50,50c13.2,0,25.4-5.1,34.5-13.5l-6.2-6.2C71.3,86.6,61,90,50,90 C27.9,90,10,72.1,10,50S27.9,10,50,10s40,17.9,40,40c0,5.7-1.2,11.1-3.4,16l9.6,9.6C98,67.6,100,59.1,100,50C100,22.4,77.6,0,50,0z"
        className="text-primary"
      />
      <g className="text-primary" filter="url(#purple-glow)">
        <path d="M48,65L48,65c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4l0,0c2.2,0,4-1.8,4-4V69C52,66.8,50.2,65,48,65z" />
        <rect x="42" y="72" width="12" height="2" />
        <rect x="42" y="78" width="12" height="2" />
        <rect x="42" y="84" width="12" height="2" />
        <circle cx="48" cy="115" r="7" className="text-primary" />
      </g>
      
       <circle cx="50" cy="50" r="32" className="fill-muted" filter="url(#purple-glow)" />
       <circle cx="35" cy="35" r="5" className="fill-background/80" />
       <circle cx="45" cy="30" r="2" className="fill-background/80" />
    </svg>
);
