
'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Square, Loader2, TriangleAlert } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { updateItemWithVoice, UpdateItemWithVoiceOutput } from '@/ai/flows/update-item-with-voice';
import { InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandProcessorProps {
  itemId: string;
  onUpdate: (updates: Partial<InventoryItem>, transcription: string) => void;
  onError: (transcription: string | null, error: string) => void;
}

export default function VoiceCommandProcessor({ itemId, onUpdate, onError }: VoiceCommandProcessorProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Listening...', description: 'State your command now.' });
    }
  };

  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const initializeMediaRecorder = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasPermission(false);
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
          setIsRecording(false);
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
                    itemId: itemId
                });
                
                // Exclude transcription from the updates passed to the form
                const { transcription, ...updates } = result;

                if (Object.keys(updates).length > 0) {
                    onUpdate(updates, transcription);
                } else {
                    onError(transcription, 'Command Unclear');
                }

              } catch (error) {
                  console.error(error);
                  onError(null, 'Processing Failed');
              } finally {
                  setIsProcessing(false);
              }
          };
      };

    } catch (err) {
      console.error("Mic permission denied:", err);
      setHasPermission(false);
    }
  }, [itemId, onUpdate, onError]);
  
  useEffect(() => {
    if (hasPermission === null) {
        initializeMediaRecorder();
    }
    
    return () => {
        stopRecording();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [hasPermission, initializeMediaRecorder, stopRecording]);

  
  if (hasPermission === null) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Initializing microphone...</span>
        </div>
      )
  }

  if (!hasPermission) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Microphone Access Denied</AlertTitle>
        <AlertDescription>
          Please enable microphone permissions in your browser settings to use voice commands.
        </AlertDescription>
      </Alert>
    );
  }

  const isBusy = isRecording || isProcessing;

  return (
    <div className="space-y-4">
        <Button 
            onClick={handleRecordButtonClick} 
            className="w-full" 
            disabled={isProcessing} 
            variant={isRecording ? "destructive" : "default"}
        >
        {isRecording ? (
            <>
            <Square className="mr-2 h-4 w-4 animate-pulse" />
            Stop Recording
            </>
        ) : isProcessing ? (
             <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
            </>
        ) : (
            <>
            <Mic className="mr-2 h-4 w-4" />
            Dictate Command
            </>
        )}
        </Button>
    </div>
  );
}
