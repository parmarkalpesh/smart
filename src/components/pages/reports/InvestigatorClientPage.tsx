
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { investigateInventory } from '@/ai/flows/investigate-inventory';
import { MessageSquareHeart, Send, TriangleAlert, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { marked } from 'marked';
import type { History } from '@/lib/types';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function InvestigatorClientPage() {
  const { items } = useInventory();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    setError(null);
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const history: History = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const result = await investigateInventory({
          query: input,
          inventoryData: JSON.stringify(items),
          history: history,
        });
        
        const modelMessage: Message = { role: 'model', content: result };
        setMessages((prev) => [...prev, modelMessage]);

      } catch (e: any) {
        console.error(e);
        const errorMessage = `Failed to get response. Please try again later.`;
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
        // Remove the user's message if the call fails
        setMessages(prev => prev.slice(0, -1));
      }
    });
  };
  
  const renderMessageContent = (content: string) => {
    const html = marked(content);
    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html as string }} />;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MessageSquareHeart className="h-6 w-6" />
            AI Investigator
        </CardTitle>
        <CardDescription>
          Chat with your inventory data. Ask questions to get insights, summaries, and recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                 {messages.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No conversation yet. Start by asking a question below.</p>
                        <p className="text-xs mt-2">Examples: "Which items are low on stock?", "Summarize my electronics inventory", "Are any items expiring this month?"</p>
                    </div>
                )}
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'model' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg p-3 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            {renderMessageContent(message.content)}
                        </div>
                         {message.role === 'user' && (
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                 {isPending && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                         <div className="rounded-lg p-3 bg-muted">
                            <Skeleton className="h-5 w-24" />
                         </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        
        {error && (
            <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your inventory..."
            className="flex-1"
            rows={1}
            disabled={isPending}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e);
                }
            }}
          />
          <Button type="submit" disabled={isPending || !input.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
