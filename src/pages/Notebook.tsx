import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Notebook as NotebookType, PdfDocument, ChatMessage } from '@/types';
import { ArrowPathIcon, DocumentArrowUpIcon, SparklesIcon } from '@/components/Icons';
import { generateChatResponse } from '@/services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for Vite
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const API_KEY_ERROR_MESSAGE = "A chave da API do Gemini não foi configurada. Por favor, adicione sua chave no painel de 'Secrets' à esquerda para usar as funcionalidades de IA.";

interface NotebookProps {
  notebooks: NotebookType[];
  documents: PdfDocument[];
  addDocument: (doc: PdfDocument, notebookId: string) => void;
}

const Notebook: React.FC<NotebookProps> = ({ notebooks, documents, addDocument }) => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const notebook = notebooks.find(n => n.id === notebookId);
  const notebookDocuments = documents.filter(doc => notebook?.documentIds.includes(doc.id));

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Olá! Faça uma pergunta sobre os documentos neste notebook.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || file.type !== 'application/pdf' || !notebookId) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`Lendo ${file.name}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
      }
      
      const newDoc: PdfDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        content: fullText,
        folder: notebook?.name || 'Unknown',
      };
      
      addDocument(newDoc, notebookId);

    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Ocorreu um erro ao processar o PDF.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsAnswering(true);

    try {
      const context = notebookDocuments.map(doc => `--- Documento: ${doc.name} ---\n${doc.content}`).join('\n\n');
      if (context.trim() === '') {
        throw new Error("NO_DOCUMENTS");
      }
      const response = await generateChatResponse(userInput, context);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error: any) {
      let errorMessage = "Desculpe, ocorreu um erro ao tentar responder.";
      if (error.message === "GEMINI_API_KEY_MISSING") {
        errorMessage = API_KEY_ERROR_MESSAGE;
      } else if (error.message === "NO_DOCUMENTS") {
        errorMessage = "Por favor, adicione pelo menos um documento a este notebook antes de fazer uma pergunta.";
      }
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsAnswering(false);
    }
  };

  if (!notebook) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-700">Notebook não encontrado.</h1>
        <Link to="/" className="text-sky-600 hover:underline mt-4 inline-block">Voltar para o Início</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
        <div className="mb-6">
            <Link to="/" className="text-sm text-sky-600 hover:underline">&larr; Voltar para todos os notebooks</Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{notebook.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
          {/* Documents List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md flex flex-col">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Documentos Fonte</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {notebookDocuments.map(doc => (
                <div key={doc.id} className="bg-slate-50 p-3 rounded-lg">
                  <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-center text-slate-600">
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                    <span>{loadingMessage}</span>
                 </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={handleUploadClick}
                className="w-full flex justify-center items-center bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 transition"
              >
                <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                Adicionar PDF
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md flex flex-col">
             <h2 className="text-2xl font-bold text-slate-700 mb-4">Converse com seus documentos</h2>
             <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg p-3 rounded-xl ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isAnswering && (
                  <div className="flex justify-start">
                    <div className="bg-slate-200 text-slate-800 p-3 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce mr-2"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce mr-2 [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>
             <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                <input 
                  type="text" 
                  placeholder="Faça uma pergunta..." 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isAnswering}
                  className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100" 
                />
                <button type="submit" disabled={isAnswering || !userInput.trim()} className="bg-sky-600 text-white p-3 rounded-lg hover:bg-sky-700 transition disabled:bg-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
             </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notebook;