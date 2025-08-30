
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Mic, Square, Loader2, TriangleAlert, Wand2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { updateItemWithVoice } from '@/ai/flows/update-item-with-voice';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { InventoryItem } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface VoiceCommandInputProps {
  itemId: string;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export default function VoiceCommandInput({ itemId, onUpdate }: VoiceCommandInputProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [commandText, setCommandText] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);


  const handleRecordButtonClick = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      if (mediaRecorderRef.current) {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setCommandText('');
        toast({ title: 'Listening...', description: 'Please state your command.' });
      }
    }
  };

  const handleApplyUpdate = async () => {
    if (!commandText.trim()) {
        toast({
            variant: 'destructive',
            title: 'Empty Command',
            description: 'Please enter or dictate a command before applying an update.',
        });
        return;
    }
    setIsUpdating(true);
    try {
        const result = await updateItemWithVoice({
            command: commandText,
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
            title: 'Update Error',
            description: 'Could not process the update command. Please try again.',
        });
    } finally {
        setIsUpdating(false);
    }
  }

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
            setIsRecording(false);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            if (audioBlob.size === 0) return;

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                
                setIsTranscribing(true);
                try {
                const result = await transcribeAudio({ audioDataUri: base64Audio });
                setCommandText(result.transcription);
                toast({
                    title: 'Transcription Complete',
                    description: 'Review the text and apply the update.',
                });
                } catch (error) {
                console.error(error);
                toast({
                    variant: 'destructive',
                    title: 'Transcription Failed',
                    description: 'Could not transcribe the audio. Please try again.',
                });
                } finally {
                setIsTranscribing(false);
                }
            };
            audioChunksRef.current = [];
        };

      } catch (err) {
        console.error("Mic permission denied:", err);
        setHasPermission(false);
      }
    };
    
    if (hasPermission === null) {
        initializeMediaRecorder();
    }
    
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [hasPermission, toast]);

  
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
          Please enable microphone permissions in your browser settings to use this feature.
        </AlertDescription>
      </Alert>
    );
  }

  const isProcessing = isRecording || isTranscribing || isUpdating;

  return (
    <div className="space-y-4">
       <Textarea
            placeholder='Say "Change status to wasted" or "Update quantity to 25"'
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            rows={3}
            disabled={isProcessing}
        />
        <div className="flex gap-2">
            <Button 
                onClick={handleRecordButtonClick} 
                className="w-full" 
                disabled={isTranscribing || isUpdating} 
                variant={isRecording ? "destructive" : "default"}
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
                Dictate Command
                </>
            )}
            </Button>
            <Button
                onClick={handleApplyUpdate}
                className="w-full"
                disabled={isProcessing || !commandText.trim()}
                variant="secondary"
            >
                {isUpdating ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                    </>
                ) : (
                     <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Apply Update from Text
                    </>
                )}
            </Button>
      </div>
    </div>
  );
}
