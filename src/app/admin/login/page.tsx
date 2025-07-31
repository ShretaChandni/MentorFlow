
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/app/logo';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'shally2009@gmail.com';
const ADMIN_PASSWORD = 'Ohm@5555';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('isAdmin', 'true');
        }
        toast({
            title: "Admin Login Successful",
            description: "Redirecting to the dashboard...",
        });
        router.push('/admin');
    } else {
        setError('Invalid admin credentials.');
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Please check your email and password.",
        });
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
      <div className="tech-background -z-10"></div>
      
      <Card className="mx-auto max-w-sm w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
        <CardHeader className="space-y-2 text-center">
            <div className="inline-block mx-auto p-3 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
                <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">Admin Access</CardTitle>
            <CardDescription>Please log in to continue to the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Admin'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Not an admin?{' '}
            <Link href="/login" className="underline text-primary/80 hover:text-primary">
              User login
            </Link>
          </div>
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
