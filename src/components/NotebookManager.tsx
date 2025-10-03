import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notebook } from '@/types';
import { DocumentIcon } from './Icons';
import Modal from './Modal';

interface NotebookManagerProps {
  notebooks: Notebook[];
  addNotebook: (name: string) => void;
}

const NotebookManager: React.FC<NotebookManagerProps> = ({ notebooks, addNotebook }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const navigate = useNavigate();

  const handleCreateNotebook = () => {
    if (newNotebookName.trim()) {
      addNotebook(newNotebookName.trim());
      setNewNotebookName('');
      setIsModalOpen(false);
    } else {
      alert('O nome do notebook não pode ser vazio.');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Meus Notebooks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition"
        >
          + Novo Notebook
        </button>
      </div>

      {notebooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map(notebook => (
            <div
              key={notebook.id}
              onClick={() => navigate(`/notebook/${notebook.id}`)}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-full mr-3 bg-sky-100">
                  <DocumentIcon className="w-5 h-5 text-sky-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate">{notebook.name}</h3>
              </div>
              <p className="text-slate-500 text-sm">{notebook.documentIds.length} documento(s)</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-slate-500">Você ainda não criou nenhum notebook.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-sky-600 font-semibold hover:underline">
            Crie seu primeiro notebook para começar
          </button>
        </div>
      )}

      {isModalOpen && (
        <Modal title="Criar Novo Notebook" onClose={() => setIsModalOpen(false)}>
          <div className="space-y-4">
            <label htmlFor="notebook-name" className="block text-sm font-medium text-slate-700">
              Nome do Notebook
            </label>
            <input
              id="notebook-name"
              type="text"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              placeholder="Ex: Artigos de Cirurgia"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNotebook}
                className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition"
              >
                Criar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NotebookManager;