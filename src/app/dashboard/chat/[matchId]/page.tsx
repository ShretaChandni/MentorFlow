
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  writeBatch,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Send, Video, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusIndicator } from '@/components/app/status-indicator';


interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  readBy: string[];
}

// Custom hook for debouncing
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function ChatPage() {
  const { matchId } = useParams() as { matchId: string };
  const { user, userData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [matchData, setMatchData] = useState<DocumentData | null>(null);
  const [otherUser, setOtherUser] = useState<DocumentData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const debouncedIsTyping = useDebounce(isTyping, 2000);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCallAlertOpen, setIsCallAlertOpen] = useState(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const otherUserId = useMemo(() => {
    if (!user || !matchData) return null;
    return user.uid === matchData.mentorId ? matchData.menteeId : matchData.mentorId;
  }, [user, matchData]);
  
  const isOtherUserTyping = matchData?.typing && otherUserId ? matchData.typing[otherUserId] : false;

  const getOtherUser = useCallback(async (match: DocumentData) => {
    if (!user || !match) return;
    const otherId = user.uid === match.mentorId ? match.menteeId : match.mentorId;
    const otherUserRole = user.uid === match.mentorId ? 'mentees' : 'mentors';

    try {
        const userDocRef = doc(firestore, otherUserRole, otherId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            setOtherUser(userDocSnap.data());
        }
    } catch (e) {
        console.error("Failed to fetch other user", e);
    }
  }, [user]);
  
  // Effect for handling typing status updates
  useEffect(() => {
    if (!user || !matchId) return;
    const matchDocRef = doc(firestore, 'matches', matchId);
    updateDoc(matchDocRef, { [`typing.${user.uid}`]: debouncedIsTyping ? false : isTyping });
  }, [isTyping, user, matchId]);

  useEffect(() => {
      if (!user || !matchId) return;
      const matchDocRef = doc(firestore, 'matches', matchId);
      if (debouncedIsTyping) {
        updateDoc(matchDocRef, { [`typing.${user.uid}`]: false });
      }
  }, [debouncedIsTyping, user, matchId]);

  // Effect for fetching data and setting up listeners
  useEffect(() => {
    if (!user || !matchId) return;

    const matchDocRef = doc(firestore, 'matches', matchId);

    // Listen for match data changes (for typing indicator)
    const unsubscribeMatch = onSnapshot(matchDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (user.uid !== data.mentorId && user.uid !== data.menteeId) {
          toast({ variant: 'destructive', title: 'Access Denied', description: 'You are not part of this connection.' });
          router.push('/dashboard/connections');
          return;
        }
        setMatchData(data);
        if (!otherUser) {
           await getOtherUser(data);
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Connection not found.' });
        router.push('/dashboard/connections');
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching match data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load chat details.' });
        setLoading(false);
    });

    const messagesColRef = collection(matchDocRef, 'messages');
    const q = query(messagesColRef, orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(msgs);

      // Mark messages as read
      const batch = writeBatch(firestore);
      let markedAny = false;
      querySnapshot.docs.forEach(doc => {
          const message = doc.data() as Message;
          if (message.senderId !== user.uid && !message.readBy?.includes(user.uid)) {
              batch.update(doc.ref, { readBy: arrayUnion(user.uid) });
              markedAny = true;
          }
      });
      if (markedAny) {
          batch.commit().catch(e => console.error("Failed to mark messages as read", e));
      }

    }, (error) => {
        console.error("Error fetching messages:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load messages.' });
    });

    return () => {
        unsubscribeMatch();
        unsubscribeMessages();
        // When leaving the chat, set typing to false
        if (user) {
            updateDoc(matchDocRef, { [`typing.${user.uid}`]: false });
        }
    };
  }, [matchId, user, getOtherUser, toast, router, otherUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !matchData) return;
  
    const text = newMessage;
    setNewMessage('');
    setIsTyping(false);
  
    const matchDocRef = doc(firestore, 'matches', matchId);
    const messagesColRef = collection(matchDocRef, 'messages');
  
    try {
      // 1. Send the message first. This is the most critical part.
      await addDoc(messagesColRef, {
        text: text,
        senderId: user.uid,
        createdAt: serverTimestamp(),
        readBy: [user.uid], // Sender has implicitly read it
      });
  
      await updateDoc(matchDocRef, { [`typing.${user.uid}`]: false });
  
      // 2. Separately, try to send the notification.
      // This is now more robust and won't block message sending.
      const recipientId = user.uid === matchData.mentorId ? matchData.menteeId : matchData.mentorId;
      if (recipientId && userData?.fullName) {
        try {
            await addDoc(collection(firestore, 'notifications'), {
                userId: recipientId,
                message: `You have a new message from ${userData.fullName}.`,
                link: `/dashboard/chat/${matchId}`,
                isRead: false,
                createdAt: serverTimestamp(),
            });
        } catch (notificationError) {
            // Log the error but don't show a toast to the user,
            // as the message itself was sent successfully.
            console.error("Failed to send notification:", notificationError);
        }
      }
    } catch (e) {
      console.error("Failed to send message", e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
      setNewMessage(text); // Put the message back in the input on failure
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
  }

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const isLastMessageSeen = lastMessage && lastMessage.senderId === user?.uid && lastMessage.readBy?.includes(otherUserId!);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!matchData) {
      return (
        <div className="flex h-full w-full items-center justify-center text-center">
            <div>
                <p className="text-destructive text-lg">Connection not found.</p>
                <Button variant="link" asChild><Link href="/dashboard/connections">Go back to connections</Link></Button>
            </div>
        </div>
      )
  }

  return (
    <>
    <div className="flex h-full flex-col">
      <Card className="flex h-full flex-col shadow-lg shadow-primary/20">
        <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link href="/dashboard/connections">
              <ArrowLeft />
            </Link>
          </Button>
          {otherUser ? (
            <>
              <Avatar>
                <AvatarImage src={otherUser.profilePictureUrl} />
                <AvatarFallback>{otherUser.fullName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 flex-1">
                <p className="font-medium leading-none">{otherUser.fullName}</p>
                <StatusIndicator status="online" />
              </div>
              {userData?.role === 'mentee' && (
                  <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/chat/${matchId}/ai`}>
                          <BrainCircuit className="mr-2 h-4 w-4" /> AI Assistant
                      </Link>
                  </Button>
              )}
               <Button variant="ghost" size="icon" onClick={() => setIsCallAlertOpen(true)}>
                  <Video className="h-5 w-5" />
                  <span className="sr-only">Video Call</span>
               </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading contact...</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.senderId === user?.uid ? 'justify-end' : 'justify-start'
              )}
            >
              {message.senderId !== user?.uid && (
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={otherUser?.profilePictureUrl} />
                    <AvatarFallback>{otherUser?.fullName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                 </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg px-4 py-2 text-sm md:max-w-md',
                  message.senderId === user?.uid
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
         <div className="border-t p-4">
            <div className="h-6 px-2 text-xs text-muted-foreground">
                {isOtherUserTyping && (
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span>Typing...</span>
                    </div>
                )}
                {isLastMessageSeen && !isOtherUserTyping && (
                  <div className="flex justify-end">
                    <span>Seen</span>
                  </div>
                )}
            </div>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              onBlur={() => setIsTyping(false)}
              placeholder="Type a message..."
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || !otherUser}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
      <Toaster />
    </div>
    <AlertDialog open={isCallAlertOpen} onOpenChange={setIsCallAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Feature Coming Soon!</AlertDialogTitle>
                <AlertDialogDescription>
                    The video calling feature is currently under development. We're working hard to bring it to you soon!
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsCallAlertOpen(false)}>Got it!</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
