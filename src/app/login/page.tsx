
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/app/logo';
import { Shield, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithRedirect, getRedirectResult, User, signInWithPopup } from 'firebase/auth';
import { auth, GoogleAuthProvider, firestore } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        let errorTitle = 'Login Error';

        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorTitle = 'Login Failed';
                errorMessage = 'Invalid email or password. Please try again.';
                break;
            case 'auth/too-many-requests':
                errorTitle = 'Too Many Attempts';
                errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
                break;
        }

        setError(errorMessage);
        toast({
            variant: "destructive",
            title: errorTitle,
            description: errorMessage,
        });
      console.error("Login error:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // We use signInWithRedirect as it is more robust for various environments
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
      setGoogleLoading(false);
    }
  };
  
  if (authLoading || googleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Signing in...</p>
      </div>
    );
  }

  // This check prevents the login page from flashing for authenticated users
  if (user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
      
      <main className="z-10 w-full max-w-sm">
        <Card className="mx-auto w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
            <CardHeader className="space-y-2 text-center">
                <Link href="/" aria-label="Back to landing page" className="inline-block mx-auto">
                    <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                        <Logo className="h-8 w-8" />
                    </div>
                </Link>
                <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">Welcome Back</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="ml-auto inline-block text-sm underline text-primary/80 hover:text-primary">
                    Forgot your password?
                    </Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                {loading ? 'Logging in...' : 'Login'}
                </Button>
                <Button variant="secondary" className="w-full" type="button" onClick={handleGoogleLogin} disabled={loading || googleLoading}>
                {googleLoading ? 'Redirecting...' : 'Login with Google'}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/choose-path" className="underline text-primary/80 hover:text-primary">
                Sign up
                </Link>
            </div>
            </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
            <Link href="/admin/login" className="underline text-muted-foreground hover:text-primary">
                Admin Access
            </Link>
        </div>
      </main>
      <div className="mt-6 text-center">
        <Link href="/" aria-label="Back to landing page" className="text-muted-foreground hover:text-primary transition-colors">
            <Logo className="h-6 w-6 inline-block" />
        </Link>
      </div>
    </div>
  );
}
