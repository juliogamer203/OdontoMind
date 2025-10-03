import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PdfManager from '@/components/PdfManager';
import Summaries from '@/components/Summaries';
import Activities from '@/components/Activities';
import RecordedClasses from '@/components/RecordedClasses';
import Profile from '@/components/Profile';
import { Tab, PdfDocument, Summary as SummaryType, RecordedClass as RecordedClassType, QuizAttempt } from '@/types';
import { MenuIcon } from '@/components/Icons';

const Home = () => {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [recordings, setRecordings] = useState<RecordedClassType[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [folders, setFolders] = useState(['Endodontia', 'Periodontia', 'Cirurgia', 'Farmacologia']);

  const addDocument = (doc: PdfDocument) => {
    setDocuments(prev => [...prev, doc]);
  };
  
  const addRecording = (rec: RecordedClassType) => {
    setRecordings(prev => [...prev, rec]);
  };
  
  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [...prev, attempt]);
  };

  const addFolder = (folderName: string): boolean => {
    const trimmedName = folderName.trim();
    if (folders.some(f => f.toLowerCase() === trimmedName.toLowerCase())) {
      return false; // Folder already exists
    }
    setFolders(prev => [...prev, trimmedName]);
    return true; // Success
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
        return <PdfManager addDocument={addDocument} folders={folders} addFolder={addFolder} />;
      case 'resumos':
        return <Summaries summaries={allSummaries} folders={folders} />;
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

  const getPageTitle = (tab: Tab) => {
    const titles: Record<Tab, string> = {
      inicio: 'Início',
      pdfs: 'Meus PDFs',
      resumos: 'Resumos',
      atividades: 'Atividades',
      aulas: 'Aulas Gravadas',
      perfil: 'Meu Perfil',
    };
    return titles[tab];
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-slate-100/80 backdrop-blur-sm z-10 p-4 flex items-center shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-2 -ml-2">
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-slate-800">{getPageTitle(activeTab)}</h1>
          </div>
          <div className="w-6"></div> {/* Spacer to balance the header */}
        </header>
        
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Home;