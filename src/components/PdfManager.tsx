import React, { useState } from 'react';
import { generateSummaryFromText, generateQuestionsFromText } from '@/services/geminiService';
import { PdfDocument, Question, Summary } from '@/types';
import { ArrowPathIcon, CheckCircleIcon, SparklesIcon, DocumentArrowUpIcon } from './Icons';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for Vite
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const API_KEY_ERROR_MESSAGE = "A chave da API do Gemini não foi configurada. Por favor, adicione sua chave no painel de 'Secrets' à esquerda para usar as funcionalidades de IA.";

interface PdfManagerProps {
  addDocument: (doc: PdfDocument) => void;
}

const PdfManager: React.FC<PdfManagerProps> = ({ addDocument }) => {
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [folder, setFolder] = useState('Endodontia');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState<Summary | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Reset file input to allow re-uploading the same file
    if (!file || file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    resetState(false); // Reset previous results but keep folder
    setFileName(file.name);
    setIsLoading(true);
    setLoadingMessage('Lendo o conteúdo do PDF...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n';
      }
      setFileContent(fullText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Ocorreu um erro ao processar o PDF. O arquivo pode estar corrompido.');
      resetState(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleProcess = async () => {
    if (!fileContent.trim() || !fileName.trim()) {
      alert('O conteúdo do PDF não pôde ser lido ou está vazio.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Analisando com IA... Isso pode levar um momento.');
    
    try {
        const [summaryContent, questions] = await Promise.all([
            generateSummaryFromText(fileContent),
            generateQuestionsFromText(fileContent)
        ]);
        
        const docId = `doc-${Date.now()}`;
        
        setGeneratedSummary({
          id: `sum-${docId}`,
          title: `Resumo de ${fileName}`,
          content: summaryContent,
          sourceId: docId,
          sourceType: 'pdf',
          folder: folder
        });

        setGeneratedQuestions(questions);
    } catch (error: any) {
        if (error.message === "GEMINI_API_KEY_MISSING") {
            alert(API_KEY_ERROR_MESSAGE);
        } else {
            console.error("Error processing with AI:", error);
            alert("Ocorreu um erro ao se comunicar com a IA. Tente novamente.");
        }
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };
  
  const handleSave = () => {
      if(!generatedSummary || generatedQuestions.length === 0) return;
      
      const newDoc: PdfDocument = {
          id: generatedSummary.sourceId,
          name: fileName,
          content: fileContent,
          summary: generatedSummary,
          questions: generatedQuestions,
          folder: folder,
      };
      
      addDocument(newDoc);
      setIsSaved(true);
  }

  const resetState = (fullReset: boolean) => {
    setFileName('');
    setFileContent('');
    if (fullReset) setFolder('Endodontia');
    setGeneratedSummary(null);
    setGeneratedQuestions([]);
    setIsSaved(false);
    setIsLoading(false);
    setLoadingMessage('');
  }

  const renderInitialView = () => (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">1. Faça o upload do seu material</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="relative block w-full border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:border-sky-500 transition-colors">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
            <span className="mt-2 block text-sm font-semibold text-slate-700">
              Clique para fazer upload de um PDF
            </span>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
          </label>
        </div>
        <div>
          <label htmlFor="folder" className="block text-sm font-medium text-slate-700 mb-1">Salvar na pasta</label>
          <select id="folder" value={folder} onChange={e => setFolder(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
            <option>Endodontia</option>
            <option>Periodontia</option>
            <option>Cirurgia</option>
            <option>Farmacologia</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderProcessingView = () => (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">2. Gere seu resumo inteligente</h2>
      <div className="bg-slate-50 p-4 rounded-lg mb-4">
        <p className="text-sm font-medium text-slate-600">Arquivo Selecionado:</p>
        <p className="font-semibold text-slate-800 truncate">{fileName}</p>
      </div>
      <div>
        <label htmlFor="folder-process" className="block text-sm font-medium text-slate-700 mb-1">Salvar na pasta</label>
        <select id="folder-process" value={folder} onChange={e => setFolder(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
          <option>Endodontia</option>
          <option>Periodontia</option>
          <option>Cirurgia</option>
          <option>Farmacologia</option>
        </select>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => resetState(true)}
          className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 transition duration-300"
        >
          Trocar Arquivo
        </button>
        <button
          onClick={handleProcess}
          disabled={!fileContent.trim()}
          className="flex-1 flex justify-center items-center bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Processar com IA
        </button>
      </div>
    </div>
  );

  const renderResultsView = () => (
    <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Resultados para "{fileName}"</h2>
      
      <div className="mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mb-1">Resumo Gerado</h3>
          <p className="text-sm text-slate-500 mb-3">Você pode editar o título do resumo antes de salvar.</p>
          
          <input
            type="text"
            value={generatedSummary?.title || ''}
            onChange={(e) => setGeneratedSummary(prev => prev ? { ...prev, title: e.target.value } : null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 mb-3"
            placeholder="Digite um título para o resumo"
          />

          <div className="prose prose-slate max-w-none bg-slate-50 p-4 rounded-md h-64 overflow-y-auto">
              {generatedSummary?.content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
              ))}
          </div>
      </div>

      <div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mb-3">Questões Geradas</h3>
          <div className="space-y-4 h-64 overflow-y-auto pr-2">
              {generatedQuestions.map((q) => (
                  <div key={q.id} className="bg-slate-50 p-4 rounded-md">
                      <p className="font-semibold">{q.question}</p>
                      <ul className="list-disc list-inside mt-2 text-sm text-slate-600">
                          {q.options.map((opt, i) => (
                              <li key={i} className={opt === q.correctAnswer ? 'text-green-600 font-bold' : ''}>
                                  {opt}
                              </li>
                          ))}
                      </ul>
                  </div>
              ))}
          </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleSave}
          disabled={isSaved}
          className="w-full sm:w-auto flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {isSaved ? 'Salvo com Sucesso!' : 'Salvar Resumo e Questões'}
        </button>
         <button
          onClick={() => resetState(true)}
          className="w-full sm:w-auto flex-1 bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition duration-300"
        >
          Processar Outro Documento
        </button>
      </div>
      {isSaved && <p className="text-center text-green-700 mt-3 font-medium flex items-center justify-center"><CheckCircleIcon className="w-5 h-5 mr-2" />Seu material foi salvo em Resumos e Atividades.</p>}
    </div>
  );

  const renderLoadingView = () => (
    <div className="text-center py-20">
      <ArrowPathIcon className="w-12 h-12 text-sky-600 animate-spin mx-auto" />
      <p className="mt-4 text-slate-600 font-semibold text-lg">{loadingMessage}</p>
    </div>
  );

  const renderContent = () => {
    if (isLoading) return renderLoadingView();
    if (generatedSummary) return renderResultsView();
    if (fileName) return renderProcessingView();
    return renderInitialView();
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Leitor de PDF Inteligente</h1>
      {renderContent()}
    </div>
  );
};

export default PdfManager;