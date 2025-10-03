import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Notebook from '@/pages/Notebook';
import { PdfDocument, Notebook as NotebookType, RecordedClass, QuizAttempt } from '@/types';

function App() {
  const { session } = useAuth();

  // Lifted state
  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [notebooks, setNotebooks] = useState<NotebookType[]>([]);
  const [recordings, setRecordings] = useState<RecordedClass[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  
  // This is a simplified version of folders, can be expanded later
  const allFolders = [
    ...notebooks.map(n => n.name),
    'Aulas Gravadas'
  ];

  const addNotebook = (name: string) => {
    const newNotebook: NotebookType = {
      id: `nb-${Date.now()}`,
      name,
      documentIds: [],
    };
    setNotebooks(prev => [...prev, newNotebook]);
  };

  const addDocument = (doc: PdfDocument, notebookId: string) => {
    setDocuments(prev => [...prev, doc]);
    setNotebooks(prev => prev.map(nb => 
      nb.id === notebookId 
        ? { ...nb, documentIds: [...nb.documentIds, doc.id] }
        : nb
    ));
  };
  
  const addRecording = (rec: RecordedClass) => {
    setRecordings(prev => [...prev, rec]);
  };
  
  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [...prev, attempt]);
  };

  const homeProps = {
    notebooks,
    addNotebook,
    documents,
    recordings,
    addRecording,
    quizAttempts,
    addQuizAttempt,
    folders: allFolders,
  };

  const notebookProps = {
    notebooks,
    documents,
    addDocument,
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/notebook/:notebookId" element={session ? <Notebook {...notebookProps} /> : <Navigate to="/login" />} />
        <Route path="/*" element={session ? <Home {...homeProps} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;