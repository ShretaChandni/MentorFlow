
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="tech-background -z-10"></div>
      
      <header className="w-full max-w-4xl mx-auto flex justify-start items-center py-4">
        <Button asChild variant="ghost" className="hover:bg-primary/10">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-3xl bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MentorFlow ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. Description of Service</h2>
            <p>
              MentorFlow is a platform that connects mentors and mentees to facilitate professional growth and knowledge sharing. We provide tools for matching, communication, and scheduling.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. User Responsibilities</h2>
            <p>
              You are responsible for the information you provide in your profile and for your interactions with other users. You agree to act professionally and respectfully. We are not responsible for the conduct of any user.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Disclaimers</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted, secure, or error-free.
            </p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">5. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at [Your Contact Email Address].
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
