import React from 'react';
import { Summary, QuizAttempt, Tab } from '@/types';
import { SparklesIcon, ClipboardListIcon } from './Icons';

interface DashboardProps {
  summaries: Summary[];
  quizAttempts: QuizAttempt[];
  setActiveTab: (tab: Tab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ summaries, quizAttempts, setActiveTab }) => {
  const recentSummaries = summaries.slice(-3).reverse();
  const recentAttempts = quizAttempts.slice(-3).reverse();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-2">Bem-vindo(a) ao OdontoMind!</h1>
      <p className="text-slate-600 mb-10">Sua central de estudos inteligente. Pronto para começar?</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Summaries */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <SparklesIcon className="w-7 h-7 text-sky-500" />
            <h2 className="text-2xl font-bold text-slate-700 ml-3">Resumos Recentes</h2>
          </div>
          {recentSummaries.length > 0 ? (
            <ul className="space-y-3">
              {recentSummaries.map(summary => (
                <li key={summary.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition" onClick={() => setActiveTab('resumos')}>
                  <p className="font-semibold text-slate-800">{summary.title}</p>
                  <p className="text-sm text-slate-500">Pasta: {summary.folder}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Nenhum resumo gerado ainda.</p>
                <button onClick={() => setActiveTab('pdfs')} className="mt-4 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition">Gerar meu primeiro resumo</button>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <ClipboardListIcon className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-700 ml-3">Atividades Recentes</h2>
          </div>
          {recentAttempts.length > 0 ? (
            <ul className="space-y-3">
              {recentAttempts.map(attempt => (
                <li key={attempt.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition" onClick={() => setActiveTab('atividades')}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800">Simulado: {attempt.topic}</p>
                      <p className="text-sm text-slate-500">{new Date(attempt.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-bold text-lg ${attempt.score / attempt.totalQuestions >= 0.7 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center py-8 px-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Nenhuma atividade realizada.</p>
                <button onClick={() => setActiveTab('atividades')} className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition">Começar um simulado</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;