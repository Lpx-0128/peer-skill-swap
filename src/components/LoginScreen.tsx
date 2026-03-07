import React, { useState } from 'react';
import { Mail, EyeOff, ChevronLeft, Repeat } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';
import { PageWrapper } from './PageWrapper';
import { InputField } from './InputField';

export function LoginScreen({ onBack, onLoginSuccess, onSignUp }: { onBack: () => void, onLoginSuccess: () => void, onSignUp: () => void }) {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!isFormValid) return;
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const passwordError = password.length > 0 && /[a-zA-Z]/.test(password) ? "Password must only contain numbers" : "";

    const isFormValid = password.trim() !== '' && email.trim() !== '' && !passwordError;

    return (
        <PageWrapper className="pb-12" noTopPadding>
            <div className="flex items-center py-4 justify-between sticky top-0 z-10 bg-[#0a0510]/80 backdrop-blur-md">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-start text-purple-500">
                    <ChevronLeft className="size-6" />
                </button>
                <h2 className="text-white text-xl font-bold tracking-tight flex-1 text-center pr-10">Login</h2>
            </div>

            <div className="pt-8 pb-8 text-center flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                    <div className="relative w-32 h-32 bg-purple-500 rounded-[42px] flex items-center justify-center shadow-2xl shadow-purple-500/40">
                        <Repeat className="text-white size-16" strokeWidth={2.5} />
                    </div>
                </div>
                <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Welcome Back</h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-[320px]">
                    With <span className="font-bold text-slate-200">SkillSwap</span>. Connect with peers and share your expertise today.
                </p>
            </div>

            <div className="space-y-6">
                <InputField label="Email" placeholder="yourname@example.com" type="email" icon={<Mail className="size-5" />} value={email} onChange={setEmail} />
                <InputField
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    icon={<EyeOff className="size-5" />}
                    value={password}
                    onChange={setPassword}
                    error={passwordError}
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    onClick={handleLogin}
                    disabled={!isFormValid || loading}
                    className={cn(
                        "w-full font-bold py-5 rounded-[24px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center mt-6 text-xl",
                        isFormValid && !loading
                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                    )}
                >
                    {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Log In'}
                </button>
            </div>

            <div className="mt-10 text-center">
                <p className="text-slate-500 text-base">
                    Don't have an account?
                    <button onClick={onSignUp} className="text-purple-500 font-bold ml-1 hover:underline">Sign Up</button>
                </p>
            </div>
        </PageWrapper>
    );
}
