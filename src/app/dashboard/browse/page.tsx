
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowRight,
    Briefcase,
    Code,
    Compass,
    Megaphone,
    Palette,
    Rocket,
    BarChart,
    HeartPulse,
    Server,
    Film,
    Scale,
    Landmark,
    BookOpen
} from 'lucide-react';
import Link from 'next/link';

const categories = [
    { name: 'Healthcare', icon: HeartPulse, description: "Medicine, wellness, and life sciences.", href: "/dashboard/browse/Healthcare" },
    { name: 'IT & Engineering', icon: Server, description: "Code, systems, and infrastructure.", href: "/dashboard/browse/Engineering" },
    { name: 'Entertainment', icon: Film, description: "Media, arts, and creative industries.", href: "/dashboard/browse/Entertainment" },
    { name: 'Legal', icon: Scale, description: "Law, compliance, and regulations.", href: "/dashboard/browse/Legal" },
    { name: 'Finance', icon: Landmark, description: "Banking, investment, and accounting.", href: "/dashboard/browse/Finance" },
    { name: 'Education', icon: BookOpen, description: "Academia, teaching, and e-learning.", href: "/dashboard/browse/Education" },
    { name: 'Leadership', icon: Briefcase, description: "Management and team building.", href: "/dashboard/browse/Leadership" },
    { name: 'All Mentors', icon: Compass, description: "View all available mentors.", href: "/dashboard/discover-mentors" },
];

export default function BrowseCategoriesPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Discover Mentors</h1>
                <p className="text-muted-foreground mt-2">
                   Find the right expert by browsing through different professional sectors.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Link key={category.name} href={category.href} className="group">
                        <Card className="h-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 hover:border-primary/50 hover:-translate-y-1 transition-transform duration-300">
                           <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                                        <category.icon className="w-8 h-8"/>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h2 className="text-xl font-bold">{category.name}</h2>
                                <p className="text-muted-foreground mt-1">{category.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
