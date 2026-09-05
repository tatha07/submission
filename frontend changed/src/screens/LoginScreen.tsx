import React, { useState } from 'react';
import { Leaf, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'farmer' | 'fieldworker'>('fieldworker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, fullName, role);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F5F2ED]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2D4F1E] flex items-center justify-center mb-3 shadow-lg">
            <Leaf className="w-7 h-7 text-[#D4A373]" />
          </div>
          <h1 className="text-xl font-black text-gray-900">PashuDrishti</h1>
          <p className="text-xs text-gray-500 mt-1">Livestock Breed Intelligence</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'login' ? 'bg-[#2D4F1E] text-white' : 'text-gray-600'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'signup' ? 'bg-[#2D4F1E] text-white' : 'text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                    <UserIcon className="w-3.5 h-3.5 text-[#2D4F1E]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2D4F1E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">I am a</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        role === 'farmer'
                          ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      Farmer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('fieldworker')}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        role === 'fieldworker'
                          ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      Field Worker
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#2D4F1E]" />
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2D4F1E]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-[#2D4F1E]" />
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2D4F1E]"
              />
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] bg-[#2D4F1E] hover:bg-[#1E3514] text-white font-bold text-sm py-3 rounded-xl shadow-xs disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
