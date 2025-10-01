import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { generateSummaryFromText } from '@/services/geminiService';
import { RecordedClass, Summary } from '@/types';
import { MicrophoneIcon, StopIcon, ArrowPathIcon } from './Icons';

// Helper functions for audio encoding. MUST be defined locally.
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] < 0 ? data[i] * 32768 : data[i] * 32767;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const API_KEY_ERROR_MESSAGE = "A chave da API do Gemini não foi configurada. Por favor, adicione sua chave no painel de 'Secrets' à esquerda para usar as funcionalidades de IA.";

const RecordedClasses: React.FC<{
  addRecording: (rec: RecordedClass) => void;
}> = ({ addRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [finalSummary, setFinalSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = async () => {
    try {
      // This check is now inside geminiService, but we can keep a local one for immediate feedback.
      if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
        alert(API_KEY_ERROR_MESSAGE);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setTranscription('');
      setFinalSummary('');
      setError(null);
      setIsRecording(true);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = audioContext.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => prev + text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription(prev => prev + " ");
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setError('Ocorreu um erro durante a gravação.');
            stopRecordingInternal();
          },
          onclose: (e: CloseEvent) => {
            stream.getTracks().forEach(track => track.stop());
            if (scriptProcessorRef.current) {
                scriptProcessorRef.current.disconnect();
                scriptProcessorRef.current = null;
            }
            if (mediaStreamSourceRef.current) {
                mediaStreamSourceRef.current.disconnect();
                mediaStreamSourceRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      if (err.message === "GEMINI_API_KEY_MISSING") {
          alert(API_KEY_ERROR_MESSAGE);
      } else {
        console.error('Failed to start recording:', err);
        setError('Não foi possível iniciar a gravação. Verifique as permissões do microfone.');
      }
      setIsRecording(false);
    }
  };

  const stopRecordingInternal = () => {
    setIsRecording(false);
    sessionPromiseRef.current?.then((session) => {
      session.close();
    });
    sessionPromiseRef.current = null;
  }

  const stopAndSummarize = async () => {
    stopRecordingInternal();
    if (!transcription.trim()) {
        alert("Nenhuma fala foi detectada para resumir.");
        return;
    }
    
    setIsSummarizing(true);
    try {
        const summaryContent = await generateSummaryFromText(transcription);
        setFinalSummary(summaryContent);

        const newRecording: RecordedClass = {
            id: `rec-${Date.now()}`,
            title: `Gravação de ${new Date().toLocaleString()}`,
            date: new Date(),
            transcription,
            summary: {
                id: `sum-rec-${Date.now()}`,
                title: `Resumo da Gravação de ${new Date().toLocaleString()}`,
                content: summaryContent,
                sourceId: `rec-${Date.now()}`,
                sourceType: 'recording',
                folder: 'Aulas Gravadas',
            }
        };
        addRecording(newRecording);
    } catch (error: any) {
        if (error.message === "GEMINI_API_KEY_MISSING") {
            alert(API_KEY_ERROR_MESSAGE);
        } else {
            console.error("Error summarizing transcription:", error);
            alert("Ocorreu um erro ao gerar o resumo da gravação.");
        }
    } finally {
        setIsSummarizing(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold text-slate-800 mb-6">Gravador de Aulas</h1>

      <div className="flex-grow flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex flex-col items-center justify-center w-48 h-48 bg-sky-100 text-sky-700 rounded-full hover:bg-sky-200 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <MicrophoneIcon className="w-16 h-16" />
            <span className="mt-4 text-xl font-bold">Iniciar Gravação</span>
          </button>
        ) : (
          <button
            onClick={stopAndSummarize}
            className="flex flex-col items-center justify-center w-48 h-48 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-all duration-300 shadow-md hover:shadow-xl animate-pulse"
          >
            <StopIcon className="w-16 h-16" />
            <span className="mt-4 text-xl font-bold">Parar & Resumir</span>
          </button>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Transcrição em Tempo Real</h2>
            <div className="h-48 bg-slate-50 p-4 rounded-md overflow-y-auto text-slate-700">
                {transcription || <span className="text-slate-400">Aguardando fala...</span>}
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Resumo da Aula</h2>
            <div className="h-48 bg-slate-50 p-4 rounded-md overflow-y-auto text-slate-700">
                {isSummarizing ? (
                    <div className="flex items-center justify-center h-full">
                        <ArrowPathIcon className="w-8 h-8 text-sky-600 animate-spin" />
                        <p className="ml-3 text-slate-600">Gerando resumo...</p>
                    </div>
                ) : (
                    finalSummary || <span className="text-slate-400">O resumo aparecerá aqui após a gravação.</span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecordedClasses;