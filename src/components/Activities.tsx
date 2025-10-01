import React, { useState, useMemo } from 'react';
import { Question, QuizAttempt } from '@/types';
import { CheckCircleIcon, XCircleIcon, ClipboardListIcon } from './Icons';

interface ActivitiesProps {
  documents: { questions?: Question[], folder: string }[];
  addQuizAttempt: (attempt: QuizAttempt) => void;
}

type QuizState = 'selecting' | 'active' | 'finished';

const Activities: React.FC<ActivitiesProps> = ({ documents, addQuizAttempt }) => {
  const [quizState, setQuizState] = useState<QuizState>('selecting');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const availableTopics = useMemo(() => [...new Set(documents.map(d => d.folder))], [documents]);

  const startQuiz = () => {
    const questionsForTopic = (selectedTopic === 'all'
      ? documents.flatMap(d => d.questions || [])
      : documents.filter(d => d.folder === selectedTopic).flatMap(d => d.questions || [])
    ).sort(() => 0.5 - Math.random()); // Shuffle questions

    if (questionsForTopic.length === 0) {
      alert('Não há questões disponíveis para este tópico.');
      return;
    }

    setCurrentQuestions(questionsForTopic);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(questionsForTopic.length).fill(''));
    setScore(0);
    setQuizState('active');
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    if (answer === currentQuestions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        setQuizState('finished');
        addQuizAttempt({
            id: `attempt-${Date.now()}`,
            date: new Date(),
            score: score + (answer === currentQuestions[currentQuestionIndex].correctAnswer ? 1 : 0),
            totalQuestions: currentQuestions.length,
            topic: selectedTopic
        });
      }
    }, 1000);
  };
  
  const resetQuiz = () => {
    setQuizState('selecting');
    setSelectedTopic('all');
  }

  const renderQuizSelector = () => (
    <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-lg">
      <ClipboardListIcon className="w-16 h-16 mx-auto text-amber-500 mb-4"/>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Iniciar Simulado</h2>
      <p className="text-slate-600 mb-6">Escolha um tópico para testar seus conhecimentos.</p>
      <select 
        value={selectedTopic} 
        onChange={e => setSelectedTopic(e.target.value)}
        className="w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 mb-6"
      >
        <option value="all">Todos os Tópicos</option>
        {availableTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
      </select>
      <button onClick={startQuiz} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition">
        Começar
      </button>
    </div>
  );

  const renderActiveQuiz = () => {
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <p className="text-sm text-slate-500 mb-2">Questão {currentQuestionIndex + 1} de {currentQuestions.length}</p>
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map(option => {
            const isSelected = userAnswer === option;
            const isCorrect = question.correctAnswer === option;
            let buttonClass = 'bg-slate-100 hover:bg-slate-200';
            if(isSelected) {
                buttonClass = isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800';
            } else if (userAnswer && isCorrect) {
                buttonClass = 'bg-green-200 text-green-800';
            }

            return (
              <button 
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!userAnswer}
                className={`w-full text-left p-4 rounded-lg font-medium transition duration-300 flex items-center justify-between ${buttonClass}`}
              >
                {option}
                {isSelected && (isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-600"/> : <XCircleIcon className="w-6 h-6 text-red-600"/>)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderQuizFinished = () => (
    <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Simulado Concluído!</h2>
        <p className="text-slate-600 mb-6">Veja seu desempenho:</p>
        <div className="my-8">
            <p className="text-6xl font-bold text-sky-600">{Math.round((score / currentQuestions.length) * 100)}%</p>
            <p className="text-slate-700 font-semibold text-lg mt-2">Você acertou {score} de {currentQuestions.length} questões.</p>
        </div>
        <button onClick={resetQuiz} className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition">
            Fazer outro simulado
        </button>
    </div>
  );

  return (
    <div className="p-8 h-full flex items-center justify-center">
      {quizState === 'selecting' && renderQuizSelector()}
      {quizState === 'active' && renderActiveQuiz()}
      {quizState === 'finished' && renderQuizFinished()}
    </div>
  );
};

export default Activities;