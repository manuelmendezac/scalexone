import React, { useState } from 'react';
import { supabase } from '../supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Login con Google
  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
  };

  // Login con Facebook
  const handleFacebook = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2f] relative overflow-hidden">
      {/* Fondo sci-fi animado (puedes reemplazar por imagen o video) */}
      <div className="absolute inset-0 z-0">
        <img src="/images/sci-fi-bg.jpg" alt="fondo sci-fi" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl bg-black/70 rounded-3xl shadow-2xl overflow-hidden">
        {/* Lado izquierdo: formulario */}
        <div className="flex-1 p-10 flex flex-col justify-center gap-8 min-w-[340px]">
          <div>
            <h1 className="text-cyan-400 font-orbitron text-3xl font-bold mb-2">CENTRO DE ENTRENAMIENTO IA</h1>
            <h2 className="text-neurolink-coldWhite text-2xl font-semibold mb-2">Inicia sesión para transformar tu mente</h2>
            <p className="text-neurolink-coldWhite/70 mb-6">Introduce tus datos o usa un método alternativo</p>
            <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-600 bg-black/80 hover:bg-cyan-900/30 text-white font-semibold transition mb-4">
              <img src="/images/google.svg" alt="Google" className="w-6 h-6" />
              Iniciar sesión con Google
            </button>
            {/* Botón Facebook habilitado */}
            <button onClick={handleFacebook} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-blue-600 bg-black/80 hover:bg-blue-900/30 text-blue-300 font-semibold transition mb-4">
              <img src="/images/facebook.svg" alt="Facebook" className="w-6 h-6" />
              Iniciar sesión con Facebook
            </button>
            {/* Botón Apple (deshabilitado) */}
            <button disabled className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-400 bg-black/80 text-gray-300 font-semibold transition mb-4 opacity-50 cursor-not-allowed">
              <img src="/images/apple.svg" alt="Apple" className="w-6 h-6" />
              Iniciar sesión con Apple (próximamente)
            </button>
            {/* Botón Web3 (Metamask) */}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-yellow-500 bg-black/80 hover:bg-yellow-900/30 text-yellow-300 font-semibold transition mb-4">
              <img src="/images/metamask.svg" alt="Metamask" className="w-6 h-6" />
              Iniciar sesión con Metamask
            </button>
            {/* Botón Web3 (WalletConnect) */}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-blue-400 bg-black/80 hover:bg-blue-900/30 text-blue-300 font-semibold transition mb-4">
              <img src="/images/walletconnect.svg" alt="WalletConnect" className="w-6 h-6" />
              Iniciar sesión con WalletConnect
            </button>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
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
        </div>
        {/* Lado derecho: imagen sci-fi */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-[#181828] to-[#1a1a2f]">
          <img src="/images/astronauta-sci-fi.png" alt="astronauta" className="w-[90%] max-w-md drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
};

export default Login; 