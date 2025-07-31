
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { handleMentorCloneQuery, MentorCloneQueryInput } from '@/app/actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Send, BrainCircuit, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StatusIndicator } from '@/components/app/status-indicator';

interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  content: string;
}

export default function AICloneChatPage() {
  const { matchId } = useParams() as { matchId: string };
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [mentor, setMentor] = useState<DocumentData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (!user || !matchId) return;

    const fetchMatchAndMentor = async () => {
        setLoading(true);
        try {
            const matchDocRef = doc(firestore, 'matches', matchId);
            const matchDocSnap = await getDoc(matchDocRef);

            if (!matchDocSnap.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Connection not found.' });
                router.push('/dashboard/connections');
                return;
            }

            const matchData = matchDocSnap.data();
            const mentorId = matchData.mentorId;
            
            const mentorDocRef = doc(firestore, 'mentors', mentorId);
            const mentorDocSnap = await getDoc(mentorDocRef);

            if (mentorDocSnap.exists()) {
                const mentorData = mentorDocSnap.data();
                setMentor({ ...mentorData, uid: mentorId });
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Mentor details not found.' });
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load chat details.' });
        } finally {
            setLoading(false);
        }
    };
    
    fetchMatchAndMentor();
  }, [matchId, user, toast, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !mentor || isGenerating || !mentor.aiCloneConfig?.tone) return;
  
    const text = newMessage;
    setNewMessage('');
    setIsGenerating(true);

    const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: text };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
  
    try {
      const input: MentorCloneQueryInput = {
        menteeQuestion: text,
        mentor: {
          fullName: mentor.fullName,
          professionalTitle: mentor.professionalTitle,
          company: mentor.company,
          helpWith: mentor.helpWith,
          aiCloneConfig: mentor.aiCloneConfig,
        },
        chatHistory: currentMessages.map(({role, content}) => ({role, content})),
      };

      const result = await handleMentorCloneQuery(input);

      const modelMessage: ChatMessage = { 
        id: Date.now() + 1, 
        role: 'model', 
        content: result.answer,
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
        console.error("Failed to get response from AI assistant", error);
        const errorMessage: ChatMessage = { id: Date.now() + 1, role: 'model', content: `Sorry, I encountered an error: ${error.message}` };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsGenerating(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isAIConfigured = !!mentor?.aiCloneConfig?.tone;

  return (
    <div className="flex h-full flex-col">
      <Card className="flex h-full flex-col shadow-lg shadow-primary/20">
        <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/chat/${matchId}`}>
              <ArrowLeft />
            </Link>
          </Button>
          {mentor ? (
            <>
              <Avatar>
                <AvatarImage src={mentor.profilePictureUrl} />
                <AvatarFallback>{mentor.fullName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 flex-1">
                <div className="font-medium leading-none flex items-center gap-2">
                    {mentor.fullName}
                </div>
                <StatusIndicator status={isAIConfigured ? 'ai_available' : 'unavailable'} />
              </div>
               <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/chat/${matchId}`}>
                      <User className="mr-2 h-4 w-4" /> Chat with Human
                  </Link>
               </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
           {!isAIConfigured && (
             <div className="text-center text-muted-foreground p-8">
               <BrainCircuit className="mx-auto h-12 w-12 mb-4" />
               <h3 className="font-semibold">AI Assistant Not Configured</h3>
               <p className="text-sm">This mentor has not set up their AI assistant yet. Please check back later or chat with the real mentor.</p>
             </div>
           )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                 <Avatar className="h-8 w-8 self-start">
                    <AvatarImage src={mentor?.profilePictureUrl} />
                    <AvatarFallback><BrainCircuit /></AvatarFallback>
                 </Avatar>
              )}

                <div
                    className={cn(
                    'max-w-xs rounded-lg px-4 py-2 text-sm md:max-w-md',
                    message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

            </div>
          ))}
          {isGenerating && (
            <div className="flex items-end gap-2 justify-start">
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={mentor?.profilePictureUrl} />
                    <AvatarFallback><BrainCircuit /></AvatarFallback>
                 </Avatar>
                 <div className="max-w-xs rounded-lg px-4 py-2 text-sm md:max-w-md bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>AI Assistant is thinking...</span>
                 </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
         <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAIConfigured ? "Ask the AI Assistant a question..." : "AI Assistant not configured"}
              autoComplete="off"
              disabled={isGenerating || !mentor || !isAIConfigured}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || !mentor || isGenerating || !isAIConfigured}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send Message</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
