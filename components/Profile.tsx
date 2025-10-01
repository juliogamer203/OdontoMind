import React from 'react';
import { QuizAttempt } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserCircleIcon } from './Icons';

interface ProfileProps {
  quizAttempts: QuizAttempt[];
}

const Profile: React.FC<ProfileProps> = ({ quizAttempts }) => {
  const attemptsByTopic: { [key: string]: { score: number, total: number } } = {};

  quizAttempts.forEach(attempt => {
    if (!attemptsByTopic[attempt.topic]) {
      attemptsByTopic[attempt.topic] = { score: 0, total: 0 };
    }
    attemptsByTopic[attempt.topic].score += attempt.score;
    attemptsByTopic[attempt.topic].total += attempt.totalQuestions;
  });

  const chartData = Object.keys(attemptsByTopic).map(topic => ({
    name: topic,
    Acertos: Math.round((attemptsByTopic[topic].score / attemptsByTopic[topic].total) * 100),
  }));

  const overallAccuracy = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.reduce((acc, curr) => acc + curr.totalQuestions, 0) * 100)
    : 0;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Meu Perfil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
            <UserCircleIcon className="w-24 h-24 text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Estudante de Odonto</h2>
            <p className="text-slate-500">Nível: Entusiasta</p>
            <div className="mt-6 w-full space-y-4">
                <div className="bg-sky-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-sky-800">Total de Simulados</p>
                    <p className="text-2xl font-bold text-sky-600">{quizAttempts.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Aproveitamento Geral</p>
                    <p className="text-2xl font-bold text-green-600">{overallAccuracy}%</p>
                </div>
            </div>
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-slate-700 mb-6">Desempenho por Tópico (%)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#475569" />
                    <YAxis stroke="#475569" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}/>
                    <Legend />
                    <Bar dataKey="Acertos" fill="#0ea5e9" barSize={30} />
                </BarChart>
            </ResponsiveContainer>
           ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
                <p>Nenhum dado de simulado para exibir.</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
