import React, { useState } from 'react';
import { generateSummaryFromText, generateQuestionsFromText } from '../services/geminiService';
import { PdfDocument, Question, Summary } from '../types';
import { ArrowPathIcon, CheckCircleIcon, SparklesIcon } from './Icons';

interface PdfManagerProps {
  addDocument: (doc: PdfDocument) => void;
}

const PdfManager: React.FC<PdfManagerProps> = ({ addDocument }) => {
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [folder, setFolder] = useState('Endodontia');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<Summary | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // In a real app, you would use a library like pdf.js to extract text.
      // For this example, we'll inform the user to paste the content.
      setFileContent('');
      alert('Arquivo selecionado! Agora, por favor, cole o conteúdo do PDF na área de texto abaixo.');
    }
  };

  const handleProcess = async () => {
    if (!fileContent.trim() || !fileName.trim()) {
      alert('Por favor, selecione um arquivo e insira o conteúdo.');
      return;
    }
    setIsLoading(true);
    setIsSaved(false);
    setGeneratedSummary(null);
    setGeneratedQuestions([]);

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
    setIsLoading(false);
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

  const resetState = () => {
    setFileName('');
    setFileContent('');
    setFolder('Endodontia');
    setGeneratedSummary(null);
    setGeneratedQuestions([]);
    setIsSaved(false);
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-4xl font-bold text-slate-800 mb-6">Leitor de PDF Inteligente</h1>
      
      {!generatedSummary && !isLoading && (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">1. Faça o upload do seu material</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-1">Nome do Arquivo (do PDF)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Aula 1 - Canais Radiculares.pdf" 
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Simule o upload de um arquivo dando um nome a ele.</p>
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
                <div>
                    <label htmlFor="pdf-content" className="block text-sm font-medium text-slate-700 mb-1">Conteúdo do PDF</label>
                    <textarea
                        id="pdf-content"
                        rows={12}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Copie e cole o texto do seu PDF ou slide aqui..."
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleProcess}
                    disabled={isLoading || !fileContent.trim() || !fileName.trim()}
                    className="w-full flex justify-center items-center bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Processar com IA
                </button>
            </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-20">
          <ArrowPathIcon className="w-12 h-12 text-sky-600 animate-spin mx-auto" />
          <p className="mt-4 text-slate-600 font-semibold text-lg">Analisando o conteúdo... Isso pode levar um momento.</p>
        </div>
      )}

      {generatedSummary && !isLoading && (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Resultados para "{fileName}"</h2>
          
          <div className="mb-8">
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">Resumo Gerado</h3>
              <div className="prose prose-slate max-w-none bg-slate-50 p-4 rounded-md h-64 overflow-y-auto">
                  <p>{generatedSummary.content}</p>
              </div>
          </div>

          <div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">Questões Geradas</h3>
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
          
          <div className="mt-8 flex items-center space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isSaved ? 'Salvo com Sucesso!' : 'Salvar Resumo e Questões'}
            </button>
             <button
              onClick={resetState}
              className="flex-1 bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition duration-300"
            >
              Processar Outro Documento
            </button>
          </div>
          {isSaved && <p className="text-center text-green-700 mt-3 font-medium flex items-center justify-center"><CheckCircleIcon className="w-5 h-5 mr-2" />Seu material foi salvo em Resumos e Atividades.</p>}
        </div>
      )}
    </div>
  );
};

export default PdfManager;
