
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-3xl font-bold font-headline">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">1. Introduction</h2>
            <p>
              Welcome to MentorFlow. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. Information We Collect</h2>
            <p>
              We may collect personal information that you provide to us directly, such as your name, email address, professional title, company, and other profile information you choose to share. When you sign in with Google, we receive your basic profile information as permitted by your Google account settings.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. Use of Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Create and manage your account.</li>
              <li>Match mentors and mentees based on profile information.</li>
              <li>Facilitate communication between users.</li>
              <li>Improve our services and user experience.</li>
              <li>Comply with legal obligations.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">5. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at [Your Contact Email Address].
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
