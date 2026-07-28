"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      loading && setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lime-600 via-emerald-600 to-emerald-700 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos traslúcidos con la paleta verde-amarilla */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-emerald-100 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-emerald-950 font-black shadow-lg border border-yellow-300 transform -rotate-2">
            <ShieldCheck className="h-10 w-10 text-emerald-950" />
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950">
            ControlQR
          </h2>
          <p className="mt-1 text-center text-sm font-semibold text-emerald-800/70">
            Sistema de Control de Ingreso Estudiantil
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 text-sm font-semibold text-red-800 shadow-xs">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1.5">Usuario</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-emerald-600 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 block w-full h-12 rounded-xl border border-emerald-200 text-emerald-950 placeholder-emerald-800/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 sm:text-sm font-medium bg-emerald-50/30 transition-all"
                  placeholder="Administrador"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1.5">Contraseña</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-emerald-600 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 block w-full h-12 rounded-xl border border-emerald-200 text-emerald-950 placeholder-emerald-800/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 sm:text-sm font-medium bg-emerald-50/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all shadow-lg hover:shadow-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-yellow-300" />
              ) : null}
              Iniciar Sesión
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-emerald-100 text-center">
          <p className="text-xs font-semibold text-emerald-800/60">
            ControlQR • Paleta Oficial Verde, Amarillo y Blanco
          </p>
        </div>
      </div>
    </div>
  );
}
