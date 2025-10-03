import React, { useState } from 'react';
import { Summary } from '@/types';
import { SparklesIcon } from '@/components/Icons';
import Modal from '@/components/Modal';

interface SummariesProps {
  summaries: Summary[];
  folders: string[];
}

const Summaries: React.FC<SummariesProps> = ({ summaries, folders }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewingSummary, setViewingSummary] = useState<Summary | null>(null);

  const filteredSummaries = selectedFolder === 'all' 
    ? summaries 
    : summaries.filter(s => s.folder === selectedFolder);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Meus Resumos</h1>

      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 border-b border-slate-300 whitespace-nowrap">
          <button 
            onClick={() => setSelectedFolder('all')} 
            className={`px-4 py-2 font-medium text-sm transition ${selectedFolder === 'all' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Todos
          </button>
          {folders.map(folder => (
            <button 
              key={folder}
              onClick={() => setSelectedFolder(folder)} 
              className={`px-4 py-2 font-medium text-sm transition ${selectedFolder === folder ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      {filteredSummaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSummaries.map(summary => (
            <div key={summary.id} onClick={() => setViewingSummary(summary)} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-full mr-3 ${summary.sourceType === 'pdf' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                  <SparklesIcon className={`w-5 h-5 ${summary.sourceType === 'pdf' ? 'text-rose-500' : 'text-sky-500'}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate">{summary.title}</h3>
              </div>
              <p className="text-slate-600 text-sm line-clamp-4">{summary.content}</p>
              <div className="mt-4 text-xs font-semibold text-slate-400">
                <span>{summary.folder}</span> &bull; <span>{summary.sourceType === 'pdf' ? 'PDF' : 'Gravação'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-slate-500">Nenhum resumo encontrado nesta pasta.</p>
        </div>
      )}

      {viewingSummary && (
        <Modal title={viewingSummary.title} onClose={() => setViewingSummary(null)}>
          <div className="prose prose-slate max-w-none text-left">
            <p>{viewingSummary.content}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Summaries;