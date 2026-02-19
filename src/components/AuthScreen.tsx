import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Loader2, Globe } from 'lucide-react';

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! You can now sign in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-4 end-4">
        <button onClick={() => setLanguage(isAr ? 'en' : 'ar')} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-white/10">
          <Globe className="w-4 h-4" />
          <span>{isAr ? 'English' : 'عربي'}</span>
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl max-w-md w-full p-8 rounded-3xl shadow-2xl border border-white/10 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{isAr ? 'بوابة الأداء' : 'Performance Portal'}</h1>
          <p className="text-slate-400 mt-2">{isSignUp ? (isAr ? 'إنشاء حساب جديد' : 'Create a new account') : (isAr ? 'تسجيل الدخول' : 'Sign in to your dashboard')}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all" placeholder="user@example.com" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{isAr ? 'كلمة المرور' : 'Password'}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all" placeholder="••••••••" dir="ltr" />
          </div>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-orange-500 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/30 border border-transparent hover:border-orange-400 mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSignUp ? (isAr ? 'إنشاء حساب' : 'Sign Up') : (isAr ? 'تسجيل الدخول' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-slate-400 hover:text-orange-400 transition-colors">
            {isSignUp
              ? (isAr ? 'لديك حساب؟ ' : 'Already have an account? ')
              : (isAr ? 'ليس لديك حساب؟ ' : "Don't have an account? ")}
            <span className="font-semibold">{isSignUp ? (isAr ? 'تسجيل الدخول' : 'Sign In') : (isAr ? 'إنشاء حساب' : 'Sign Up')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
