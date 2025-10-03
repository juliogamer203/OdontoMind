import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Notebook as NotebookType, PdfDocument, Question, Summary } from '@/types';
import { ArrowPathIcon, DocumentArrowUpIcon, SparklesIcon } from '@/components/Icons';
import { generateSummaryFromText, generateQuestionsFromText } from '@/services/geminiService';
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

      setLoadingMessage(`Analisando ${file.name} com IA...`);
      
      // We can still generate summary/questions on upload, or do it on demand later.
      // For now, let's keep it simple and just add the document.
      // A full implementation would generate these too.
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
             <div className="flex-1 flex items-center justify-center text-center bg-slate-50 rounded-lg">
                <div className="p-8">
                    <SparklesIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600">Interface de Chat em Breve</h3>
                    <p className="text-slate-500">A próxima etapa será ativar esta área para que você possa fazer perguntas à IA sobre os documentos que adicionou.</p>
                </div>
             </div>
             <div className="mt-4">
                <input type="text" placeholder="Sua pergunta..." disabled className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notebook;