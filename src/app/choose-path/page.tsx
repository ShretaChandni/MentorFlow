
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RoleCard = ({ icon: Icon, title, description, features, buttonText, href, className }: { icon: React.ElementType, title: string, description: string, features: string[], buttonText: string, href: string, className?: string }) => (
    <Card className={cn("bg-card/60 backdrop-blur-sm border-primary/20 text-left flex flex-col h-full hover:border-primary/50 transition-all duration-300 shadow-lg shadow-primary/20", className)}>
        <CardHeader className="items-start">
            <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary self-center">
                <Icon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-headline self-center">{title}</h2>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
            <ul className="space-y-3 my-6 text-muted-foreground flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="p-0.5 bg-primary/20 rounded-full mt-1">
                           <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <Button asChild className="w-full mt-auto" size="lg">
                <Link href={href}>{buttonText}</Link>
            </Button>
        </CardContent>
    </Card>
);

export default function ChoosePathPage() {
    return (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 overflow-x-hidden">
            <div className="tech-background -z-10"></div>
            
            <header className="w-full max-w-6xl mx-auto flex justify-start items-center py-4">
                <Button asChild variant="ghost" className="hover:bg-primary/10">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                </Button>
            </header>
            
            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-8 px-4">
                <div className="max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-bold font-headline mb-4">Choose Your Path</h1>
                    <p className="text-lg text-muted-foreground">
                        Are you looking to share your expertise or seeking guidance? Select your role to get started with the perfect mentorship journey.
                    </p>
                </div>

                <div className="w-full max-w-5xl mx-auto grid gap-8 md:grid-cols-2 items-stretch">
                    <RoleCard 
                        icon={GraduationCap}
                        title="I'm a Mentor"
                        description="Share your expertise and guide others in their professional journey"
                        features={[
                            "Help others grow in their careers",
                            "Share your industry knowledge",
                            "Build meaningful connections"
                        ]}
                        buttonText="Create a Mentor Account"
                        href="/create-account/mentor"
                    />
                    <RoleCard 
                        icon={BookOpen}
                        title="I'm a Mentee"
                        description="Learn from experienced professionals and accelerate your growth"
                        features={[
                            "Learn from industry experts",
                            "Accelerate your career growth",
                            "Get personalized guidance"
                        ]}
                        buttonText="Create a Mentee Account"
                        href="/create-account/mentee"
                        className="border-primary/40"
                    />
                </div>
            </main>
        </div>
    );
}
