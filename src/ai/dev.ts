
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-inventory-report.ts';
import '@/ai/flows/generate-wastage-report.ts';
import '@/ai/flows/process-voice-note.ts';
import '@/ai/flows/update-item-with-voice.ts';
import '@/ai/flows/transcribe-audio.ts';
