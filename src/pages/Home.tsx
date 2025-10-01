import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PdfManager from '@/components/PdfManager';
import Summaries from '@/components/Summaries';
import Activities from '@/components/Activities';
import RecordedClasses from '@/components/RecordedClasses';
import Profile from '@/components/Profile';
import { Tab, PdfDocument, Summary as SummaryType, RecordedClass as RecordedClassType, QuizAttempt } from '@/types';

const Home = () => {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [recordings, setRecordings] = useState<RecordedClassType[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  const addDocument = (doc: PdfDocument) => {
    setDocuments(prev => [...prev, doc]);
  };
  
  const addRecording = (rec: RecordedClassType) => {
    setRecordings(prev => [...prev, rec]);
  };
  
  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [...prev, attempt]);
  };

  const allSummaries: SummaryType[] = [
    ...documents.map(d => d.summary).filter((s): s is SummaryType => !!s),
    ...recordings.map(r => r.summary).filter((s): s is SummaryType => !!s),
  ];
  
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Dashboard summaries={allSummaries} quizAttempts={quizAttempts} setActiveTab={setActiveTab} />;
      case 'pdfs':
        return <PdfManager addDocument={addDocument} />;
      case 'resumos':
        return <Summaries summaries={allSummaries} />;
      case 'atividades':
        return <Activities documents={documents} addQuizAttempt={addQuizAttempt} />;
      case 'aulas':
        return <RecordedClasses addRecording={addRecording} />;
      case 'perfil':
        return <Profile quizAttempts={quizAttempts}/>;
      default:
        return <Dashboard summaries={allSummaries} quizAttempts={quizAttempts} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default Home;