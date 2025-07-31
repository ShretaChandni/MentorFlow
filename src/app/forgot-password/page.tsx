
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/app/logo';
import { Mail, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast({
        title: 'Check your email',
        description: `A password reset link has been sent to ${email}.`,
      });
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
      
      <Card className="mx-auto max-w-sm w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
        <CardHeader className="space-y-2 text-center">
            <div className="inline-block mx-auto p-3 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
                <Mail className="h-8 w-8" />
            </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">Forgot Password?</CardTitle>
          <CardDescription>
            {submitted 
                ? "If an account exists, an email will be sent with instructions."
                : "No worries, we'll send you reset instructions."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Please check your inbox (and spam folder) for the password reset link.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
          {!submitted && (
             <div className="mt-4 text-center text-sm">
                 <Link href="/login" className="underline text-primary/80 hover:text-primary">
                    Remembered your password? Log in
                 </Link>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Link href="/" aria-label="Back to landing page" className="text-muted-foreground hover:text-primary transition-colors">
            <Logo className="h-6 w-6 inline-block" />
        </Link>
      </div>
    </div>
  );
}
