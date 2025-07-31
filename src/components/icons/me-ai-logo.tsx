import { cn } from "@/lib/utils";

export function MeAiLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-24 h-24", className)}
    >
      <path
        d="M32 26C37.5228 26 42 21.5228 42 16C42 10.4772 37.5228 6 32 6C26.4772 6 22 10.4772 22 16C22 21.5228 26.4772 26 32 26Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50.62 50.24C46.68 44.52 40.84 41 32 41C23.16 41 15.32 44.52 11.38 50.24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 24L53.5 28L57 29.5L53.5 31L52 35L50.5 31L47 29.5L50.5 28L52 24Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M58 35L59 38L61 39L59 40L58 43L57 40L55 39L57 38L58 35Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
