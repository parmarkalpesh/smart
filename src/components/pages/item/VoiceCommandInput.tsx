
'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Square, Loader2, TriangleAlert, Wand2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { updateItemWithText } from '@/ai/flows/update-item-with-text';
import { InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface VoiceCommandInputProps {
  itemId: string;
  onUpdate: (updates: Partial<InventoryItem>, command: string) => void;
  onError: (command: string | null, error: string) => void;
}

export default function VoiceCommandInput({ itemId, onUpdate, onError }: VoiceCommandInputProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleTranscribe = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) return;
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await transcribeAudio({ audioDataUri: base64Audio });
        setTranscribedText(result.transcription);
        toast({
          title: 'Transcription Complete',
          description: 'Review the text and click "Apply Update".',
        });
      };
    } catch (error) {
      console.error(error);
      onError(null, 'Transcription Failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscribedText('');
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

  const handleApplyUpdate = async () => {
    if (!transcribedText) return;
    setIsUpdating(true);
    try {
        const result = await updateItemWithText({ command: transcribedText, itemId });
        if (Object.keys(result).length > 0) {
            onUpdate(result, transcribedText);
            setTranscribedText('');
        } else {
            onError(transcribedText, 'Command Unclear');
        }
    } catch (error) {
        console.error(error);
        onError(transcribedText, 'Update Failed');
    } finally {
        setIsUpdating(false);
    }
  }

  const initializeMediaRecorder = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasPermission(false);
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
          setIsRecording(false);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          handleTranscribe(audioBlob);
      };

    } catch (err) {
      console.error("Mic permission denied:", err);
      setHasPermission(false);
    }
  }, []); // Dependencies are stable
  
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

  const isBusy = isRecording || isTranscribing || isUpdating;

  return (
    <div className="space-y-4">
        <Textarea 
            placeholder="Your transcribed command will appear here..."
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            rows={3}
            disabled={isBusy}
        />
        <div className="flex gap-2">
            <Button 
                onClick={handleRecordButtonClick} 
                className="w-full" 
                disabled={isTranscribing || isUpdating} 
                variant={isRecording ? "destructive" : "outline"}
            >
            {isRecording ? (
                <>
                    <Square className="mr-2 h-4 w-4 animate-pulse" />
                    Stop Recording
                </>
            ) : isTranscribing ? (
                 <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing...
                </>
            ) : (
                <>
                    <Mic className="mr-2 h-4 w-4" />
                    Record Command
                </>
            )}
            </Button>
            <Button 
                onClick={handleApplyUpdate}
                className="w-full"
                disabled={!transcribedText || isBusy}
            >
                {isUpdating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                    </>
                ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Apply Update
                    </>
                )}
            </Button>
        </div>
    </div>
  );
}
