import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from '../components/Icons';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { supabase } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isSignUp) {
        if (!periodo) {
            setError('Por favor, informe seu período.');
            setLoading(false);
            return;
        }
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              periodo: parseInt(periodo, 10),
            },
          },
        });
      } else {
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (response.error) throw response.error;
      
      navigate('/');

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <LogoIcon className="w-16 h-16 text-sky-600 mx-auto" />
            <h1 className="text-4xl font-bold text-slate-800 mt-4">OdontoMind</h1>
            <p className="text-slate-600">Sua central de estudos inteligente.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex border-b mb-6">
            <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 font-semibold ${!isSignUp ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
              Entrar
            </button>
            <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 font-semibold ${isSignUp ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
              Criar Conta
            </button>
          </div>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Período (ex: 1, 2, 3...)</label>
                <input
                  type="number"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  required
                  min="1"
                  max="12"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400"
            >
              {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;