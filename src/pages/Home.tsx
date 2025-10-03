import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import NotebookManager from '@/components/NotebookManager';
import Summaries from '@/components/Summaries';
import Activities from '@/components/Activities';
import RecordedClasses from '@/components/RecordedClasses';
import Profile from '@/components/Profile';
import { Tab, PdfDocument, Summary as SummaryType, RecordedClass as RecordedClassType, QuizAttempt, Notebook } from '@/types';
import { MenuIcon } from '@/components/Icons';

interface HomeProps {
  notebooks: Notebook[];
  addNotebook: (name: string) => void;
  documents: PdfDocument[];
  recordings: RecordedClassType[];
  addRecording: (rec: RecordedClassType) => void;
  quizAttempts: QuizAttempt[];
  addQuizAttempt: (attempt: QuizAttempt) => void;
  folders: string[];
}

const Home: React.FC<HomeProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    notebooks, addNotebook, documents, recordings, addRecording,
    quizAttempts, addQuizAttempt, folders
  } = props;

  const allSummaries: SummaryType[] = [
    ...documents.map(d => d.summary).filter((s): s is SummaryType => !!s),
    ...recordings.map(r => r.summary).filter((s): s is SummaryType => !!s),
  ];
  
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Dashboard summaries={allSummaries} quizAttempts={quizAttempts} setActiveTab={setActiveTab} />;
      case 'notebooks':
        return <NotebookManager notebooks={notebooks} addNotebook={addNotebook} />;
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
      notebooks: 'Notebooks',
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