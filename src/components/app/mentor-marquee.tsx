
'use client';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface Mentor {
    name: string;
    role: string;
    image: string;
    hint: string;
    skills: string[];
}

const staticMentors: Mentor[] = [
    { name: 'Sarah Lee', role: 'Product Manager, Stripe', image: 'https://placehold.co/150x150.png', hint: 'woman smiling', skills: ['Roadmap Planning', 'User Research', 'Agile'] },
    { name: 'Michael Chen', role: 'Principal Engineer, Netflix', image: 'https://placehold.co/150x150.png', hint: 'man professional', skills: ['System Design', 'Scalability', 'Microservices'] },
    { name: 'David Kim', role: 'UX Lead, Airbnb', image: 'https://placehold.co/150x150.png', hint: 'man asian professional', skills: ['Interaction Design', 'Prototyping', 'Figma'] },
    { name: 'Jessica Rodriguez', role: 'Data Scientist, Spotify', image: 'https://placehold.co/150x150.png', hint: 'woman professional', skills: ['Machine Learning', 'Python', 'SQL'] },
    { name: 'Tom Brier', role: 'Engineering Manager, Vercel', image: 'https://placehold.co/150x150.png', hint: 'man standing', skills: ['Leadership', 'React', 'Next.js'] },
    { name: 'Emily White', role: 'Marketing Director, HubSpot', image: 'https://placehold.co/150x150.png', hint: 'woman glasses', skills: ['SEO', 'Content Strategy', 'Analytics'] },
];

export const MentorCard = ({ name, role, image, hint, skills, className }: Mentor & { className?: string }) => (
    <div className={cn("flip-card w-40 h-48 sm:w-48 sm:h-56 shrink-0", className)}>
        <div className="flip-card-inner">
            <div className="flip-card-front flex flex-col items-center justify-center gap-2 rounded-xl bg-card/60 p-4 shadow-lg shadow-primary/10 border border-primary/20">
                <Avatar className="h-16 w-16 border-2 border-primary/30">
                    <AvatarImage src={image} alt={name} data-ai-hint={hint} />
                    <AvatarFallback>{name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-sm text-center">{name}</h3>
                <p className="text-xs text-muted-foreground text-center">{role}</p>
            </div>
            <div className="flip-card-back flex flex-col items-center justify-center gap-2 rounded-xl bg-primary/90 text-primary-foreground p-4 shadow-lg shadow-primary/20 border border-primary/20">
                 <h3 className="font-bold text-sm text-center">{name}</h3>
                 <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-none text-xs">{skill}</Badge>
                    ))}
                 </div>
            </div>
        </div>
    </div>
);

const MarqueeRow = ({ mentors, reverse = false }: { mentors: Mentor[], reverse?: boolean }) => {
    const showAnimation = mentors.length > 0;
    
    return (
        <div className={cn("flex w-max shrink-0 items-center justify-around gap-4")}>
            <div className={cn(
                "flex w-max shrink-0 items-center justify-around gap-4",
                showAnimation && (reverse ? 'animate-marquee-x-reverse' : 'animate-marquee-x')
            )}>
                {mentors.map((m, i) => (<MentorCard key={`${m.name}-${i}`} {...m} />))}
                {showAnimation && mentors.map((m, i) => (<MentorCard key={`${m.name}-duplicate-${i}`} {...m} aria-hidden="true" />))}
            </div>
        </div>
    );
};


export function MentorMarquee() {
    const [mentors, setMentors] = useState<Mentor[]>(staticMentors);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const mentorsSnapshot = await getDocs(collection(firestore, "mentors"));
                if (mentorsSnapshot.empty) {
                    setMentors(staticMentors);
                    return; 
                }
                const fetchedMentors = mentorsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const skills = (data.helpWith || '').split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
                    return {
                        name: data.fullName,
                        role: `${data.professionalTitle}, ${data.company}`,
                        image: data.profilePictureUrl || 'https://placehold.co/150x150.png',
                        hint: 'professional person', // Generic hint for dynamic data
                        skills: skills.length > 0 ? skills : ['Expertise'],
                    };
                });
                
                let finalMentors = fetchedMentors;
                if (fetchedMentors.length > 0 && fetchedMentors.length < 10) {
                    finalMentors = [...fetchedMentors, ...fetchedMentors, ...fetchedMentors, ...fetchedMentors];
                }
                setMentors(finalMentors.length > 0 ? finalMentors : staticMentors);

            } catch (error) {
                console.error("Error fetching mentors for marquee:", error);
                setMentors(staticMentors);
            }
        };

        fetchMentors();
    }, []);
    
    const mentorList = mentors.length > 0 ? mentors : staticMentors;
    const splitPoint = Math.ceil(mentorList.length / 2);
    const row1 = mentorList.slice(0, splitPoint);
    const row2 = mentorList.slice(splitPoint);

    return (
        <section className="relative w-full overflow-hidden py-8 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
            <MarqueeRow mentors={row1} />
        </section>
    );
}
