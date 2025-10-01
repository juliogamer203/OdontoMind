export type Tab = 'inicio' | 'pdfs' | 'resumos' | 'atividades' | 'aulas' | 'perfil';

export interface PdfDocument {
  id: string;
  name: string;
  content: string;
  summary?: Summary;
  questions?: Question[];
  folder: string;
}

export interface Summary {
  id: string;
  title: string;
  content: string;
  sourceId: string; // ID of PdfDocument or RecordedClass
  sourceType: 'pdf' | 'recording';
  folder: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: 'multiple-choice' | 'open-ended';
}

export interface RecordedClass {
  id: string;
  title: string;
  date: Date;
  audioUrl?: string; // For simplicity, we won't implement audio saving, but this is for structure
  transcription: string;
  summary?: Summary;
}

export interface QuizAttempt {
    id: string;
    date: Date;
    score: number;
    totalQuestions: number;
    topic: string;
}
