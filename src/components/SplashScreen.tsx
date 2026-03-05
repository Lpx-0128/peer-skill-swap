import React from 'react';
import { Repeat, ArrowRight } from 'lucide-react';
import { PageWrapper } from './PageWrapper';

export function SplashScreen({ onSignUp, onLogin }: { onSignUp: () => void, onLogin: () => void }) {
    return (
        <PageWrapper noTopPadding className="items-center justify-center text-center overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[20%] w-[70%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[20%] w-[70%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-12">
                <div className="relative group">
                    <div className="absolute inset-0 bg-purple-600/40 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all"></div>
                    <div className="relative w-32 h-32 bg-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-purple-600/40">
                        <Repeat className="text-white size-16" strokeWidth={3} />
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-6xl font-extrabold tracking-tight">
                        Skill<span className="text-purple-500">Swap</span>
                    </h1>
                    <p className="text-xl font-medium text-slate-400 leading-relaxed max-w-[320px] mx-auto">
                        Unlock your potential by teaching what you know and learning what you don't.
                    </p>
                </div>

                <div className="w-full space-y-4 pt-12">
                    <button
                        onClick={onSignUp}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-16 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group text-lg"
                    >
                        <span>Sign Up</span>
                        <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onLogin}
                        className="w-full bg-transparent border-2 border-purple-600/30 text-purple-500 font-bold h-16 rounded-full transition-all hover:bg-purple-600/5 active:scale-[0.98] text-lg"
                    >
                        Log In
                    </button>
                    <div className="pt-8">
                        <p className="text-[12px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                            Join over 50,000+ students today
                        </p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
