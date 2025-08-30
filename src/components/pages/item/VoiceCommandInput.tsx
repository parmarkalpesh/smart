
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

/**
 * A client component that provides a user interface for:
 * 1. Recording audio from the user's microphone.
 * 2. Sending the audio to an AI service for transcription.
 * 3. Displaying the transcribed text in a textarea.
 * 4. Allowing the user to trigger an update based on the transcribed text.
 */
export default function VoiceCommandInput({ itemId, onUpdate, onError }: VoiceCommandInputProps) {
  const { toast } = useToast();

  // State management for the component's different modes
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Refs to hold browser-specific objects that should not trigger re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);


  // --- Step 3: Transcribe the Audio Blob ---
  const handleTranscribe = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
        onError(null, "Recording was empty.");
        return;
    }
    setIsTranscribing(true);
    try {
      // Use FileReader to convert the Blob to a Base64 data URI
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        // Call the AI flow for transcription
        const result = await transcribeAudio({ audioDataUri: base64Audio });
        setTranscribedText(result.transcription);
        toast({
          title: 'Transcription Complete',
          description: 'Review the text and click "Apply Update" or record again.',
        });
      };
    } catch (error) {
      console.error(error);
      onError(null, 'Transcription Failed');
    } finally {
      setIsTranscribing(false);
    }
  }, [onError, toast]);


  // --- Step 2: Stop the Recording ---
  // This function is memoized with useCallback to prevent re-creation on every render.
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // This will trigger the 'onstop' event handler
    }
     if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  
  // --- Step 1: Initialize MediaRecorder and Start Recording ---
  const startRecording = useCallback(async () => {
    // Reset previous state
    audioChunksRef.current = [];
    setTranscribedText('');

    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream; // Keep a reference to the stream to stop it later
        setHasPermission(true);
        
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;

        // Event handler for when audio data is available
        recorder.ondataavailable = event => {
            if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            }
        };

        // Event handler for when recording is stopped
        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            handleTranscribe(audioBlob);
            // Clean up the stream
             if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        // Start recording
        recorder.start();
        setIsRecording(true);
        toast({ title: 'Listening...', description: 'State your command now.' });

    } catch (err) {
        console.error("Mic permission denied:", err);
        setHasPermission(false);
        onError(null, "Microphone access was denied.");
    }
  }, [handleTranscribe, onError, toast]);


  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- Step 4: Apply the Update Based on Text ---
  const handleApplyUpdate = async () => {
    if (!transcribedText) return;
    setIsUpdating(true);
    try {
        // Call the AI flow that parses text and determines updates
        const result = await updateItemWithText({ command: transcribedText, itemId });
        
        // Check if the AI returned any updates
        if (Object.keys(result).length > 0) {
            // Pass the updates to the parent component
            onUpdate(result, transcribedText);
            setTranscribedText(''); // Clear the text area on success
        } else {
            // The AI determined the command was unclear
            onError(transcribedText, 'Command Unclear');
        }
    } catch (error) {
        console.error(error);
        onError(transcribedText, 'Update Failed');
    } finally {
        setIsUpdating(false);
    }
  }
  
  useEffect(() => {
    // Check for initial microphone permission on component mount
    if (typeof window !== 'undefined' && navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then(permissionStatus => {
            setHasPermission(permissionStatus.state !== 'denied');
            permissionStatus.onchange = () => {
                 setHasPermission(permissionStatus.state !== 'denied');
            }
        });
    } else {
        setHasPermission(null); // Fallback if permissions API is not supported
    }

    // Cleanup tracks on unmount
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  
  if (hasPermission === false) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Microphone Access Denied</AlertTitle>
        <AlertDescription>
          To use voice commands, please enable microphone permissions in your browser's site settings and refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  const isBusy = isTranscribing || isUpdating;

  return (
    <div className="space-y-4">
        <Textarea 
            placeholder="Click 'Record Command' and speak. Your transcribed command will appear here..."
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            rows={3}
            disabled={isBusy || isRecording}
        />
        <div className="flex gap-2">
            <Button 
                onClick={handleRecordButtonClick} 
                className="w-full" 
                disabled={isBusy} 
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
                disabled={!transcribedText || isBusy || isRecording}
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
