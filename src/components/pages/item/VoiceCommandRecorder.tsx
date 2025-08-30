
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Mic, MicOff, Square, Loader2, TriangleAlert } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { updateItemWithVoice } from '@/ai/flows/update-item-with-voice';
import { InventoryItem } from '@/lib/types';

interface VoiceCommandRecorderProps {
  itemId: string;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export default function VoiceCommandRecorder({ itemId, onUpdate }: VoiceCommandRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setHasPermission(true);
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            setIsProcessing(true);
            try {
              const result = await updateItemWithVoice({ 
                audioDataUri: base64Audio,
                itemId: itemId,
              });
              
              if (Object.keys(result).length > 0) {
                onUpdate(result);
              } else {
                 toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: 'Could not understand the command. Please try again.',
                 });
              }

            } catch (error) {
              console.error(error);
              toast({
                variant: 'destructive',
                title: 'Processing Failed',
                description: 'Could not process the voice command. Please try again.',
              });
            } finally {
              setIsProcessing(false);
            }
          };
          audioChunksRef.current = [];
        };
      })
      .catch(err => {
        console.error("Mic permission denied:", err);
        setHasPermission(false);
      });
  }, [itemId, onUpdate, toast]);

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Listening...', description: 'Please state your command.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  if (hasPermission === null) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Checking microphone permissions...</span>
        </div>
      )
  }

  if (!hasPermission) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Microphone Access Denied</AlertTitle>
        <AlertDescription>
          Please enable microphone permissions in your browser settings to use the voice command feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {isRecording ? (
        <Button onClick={stopRecording} className="w-full" variant="destructive">
          <Square className="mr-2 h-4 w-4 animate-glow" />
          Stop Recording
        </Button>
      ) : (
        <Button onClick={startRecording} className="w-full" disabled={isProcessing}>
           {isProcessing ? (
             <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Command...
             </>
           ) : (
             <>
                <Bot className="mr-2 h-4 w-4" />
                Update with Voice Command
            </>
           )}
        </Button>
      )}
    </div>
  );
}

