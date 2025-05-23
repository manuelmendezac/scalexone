import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userName } = useNeuroState();

  useEffect(() => {
    if (userName && userName !== 'Invitado') {
      window.location.href = '/dashboard';
    }
  }, [userName]);

  // Handlers para login social
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  const handleFacebook = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook' });
  };

  // Login con email/contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl bg-black flex flex-col items-center justify-center shadow-2xl">
        <h1 className="text-cyan-400 font-orbitron text-3xl font-bold mb-2 text-center">CENTRO DE ENTRENAMIENTO IA</h1>
        <h2 className="text-neurolink-coldWhite text-2xl font-semibold mb-2 text-center">Inicia sesión para transformar tu mente</h2>
        <form className="flex flex-col gap-4 w-full mt-6" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-4 py-3 rounded-lg bg-[#181828] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-lg bg-[#181828] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <a href="#" className="text-cyan-400 text-sm hover:underline">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-500 hover:to-blue-700 transition">
            {loading ? 'Cargando...' : 'Comienza a aprender'}
          </button>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </form>
        {/* Botones sociales debajo del formulario */}
        <div className="flex gap-6 mt-8">
          <button
            title="Google"
            onClick={handleGoogle}
            className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black text-2xl font-bold cursor-pointer"
          >
            G
          </button>
          <button
            title="Facebook"
            onClick={handleFacebook}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer"
          >
            f
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 