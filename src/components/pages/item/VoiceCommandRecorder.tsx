
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Mic, Square, Loader2, TriangleAlert } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
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
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecordingAndProcess = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setHasPermission(true);
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size === 0) return;

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

      } catch (err) {
        console.error("Mic permission denied:", err);
        setHasPermission(false);
      }
    };
    initializeMediaRecorder();

    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [itemId, onUpdate, toast]);

  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecordingAndProcess();
    } else {
      if (mediaRecorderRef.current) {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast({ title: 'Listening...', description: 'Please state your command.' });
      }
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
      <Button onClick={handleRecordButtonClick} className="w-full" disabled={isProcessing} variant={isRecording ? "destructive" : "default"}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Command...
            </>
          ) : isRecording ? (
            <>
              <Square className="mr-2 h-4 w-4 animate-pulse" />
              Stop Recording
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Update with Voice Command
            </>
          )}
        </Button>
    </div>
  );
}
