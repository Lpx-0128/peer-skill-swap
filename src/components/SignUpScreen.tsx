import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, EyeOff, Repeat, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';
import { PageWrapper } from './PageWrapper';
import { InputField } from './InputField';
import { SkillSelector } from './SkillSelector';

export function SignUpScreen({ onBack, onSignUpSuccess, onLogin }: { onBack: () => void, onSignUpSuccess: () => void, onLogin: () => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [teachSkills, setTeachSkills] = useState<string[]>([]);
    const [learnSkills, setLearnSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordError = password.length > 0 && /[a-zA-Z]/.test(password) ? "Password must only contain numbers" : "";
    const phoneError = phone.length > 0 && /[a-zA-Z]/.test(phone) ? "Contact number must only contain numbers" : "";

    const isFormValid = username.trim() !== '' &&
        password.trim() !== '' &&
        email.trim() !== '' &&
        phone.trim() !== '' &&
        !passwordError &&
        !phoneError;

    const handleCreateAccount = async () => {
        if (!isFormValid) return;
        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Give the trigger a moment to create the profile
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Update profile with phone
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ contact_number: phone })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;

                // Insert skills
                const skillsToInsert = [
                    ...teachSkills.map(s => ({ profile_id: authData.user!.id, skill_name: s, type: 'teach' })),
                    ...learnSkills.map(s => ({ profile_id: authData.user!.id, skill_name: s, type: 'learn' }))
                ];

                if (skillsToInsert.length > 0) {
                    const { error: skillsError } = await supabase
                        .from('skills')
                        .insert(skillsToInsert);

                    if (skillsError) throw skillsError;
                }

                onSignUpSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper className="pb-8" noTopPadding>
            <header className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500 rounded-[28%] mb-6 shadow-xl shadow-purple-500/40">
                    <Repeat className="text-white size-10" strokeWidth={3} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Skill<span className="text-purple-500">Swap</span></h1>
                <p className="text-slate-400 text-base max-w-[280px] mx-auto">Master new skills by teaching what you love. For students, by students.</p>
            </header>

            <div className="space-y-6 flex-grow">
                <div className="space-y-4">
                    <InputField
                        label="Username"
                        placeholder="john_doe"
                        icon={<UserIcon className="size-5" />}
                        value={username}
                        onChange={setUsername}
                    />
                    <InputField label="Email" placeholder="john@example.com" type="email" icon={<Mail className="size-5" />} value={email} onChange={setEmail} />
                    <InputField
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        icon={<EyeOff className="size-5" />}
                        value={password}
                        onChange={setPassword}
                        error={passwordError}
                    />
                    <InputField
                        label="Contact Number"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        icon={<Phone className="size-5" />}
                        value={phone}
                        onChange={setPhone}
                        error={phoneError}
                    />
                </div>

                <SkillSelector label="Skills I Can Teach" color="emerald" suggestions={['Science', 'Sports', 'Music', 'Art', 'Coding']} activeSkills={teachSkills} onChange={setTeachSkills} />
                <SkillSelector label="Skills I Want to Learn" color="purple" suggestions={['Writing', 'Design', 'Marketing', 'Fitness', 'Finance']} activeSkills={learnSkills} onChange={setLearnSkills} />

                <div className="pt-6 space-y-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        onClick={handleCreateAccount}
                        disabled={!isFormValid || loading}
                        className={cn(
                            "w-full font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 h-[60px]",
                            isFormValid && !loading
                                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                        )}
                    >
                        {loading ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                        {!loading && <ArrowRight className="size-5" />}
                    </button>
                    <p className="text-center text-slate-500 text-sm">
                        Already have an account?
                        <button onClick={onLogin} className="text-purple-500 font-bold hover:underline ml-1">Log In</button>
                    </p>
                </div>
            </div>

            <footer className="mt-8 text-center pb-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] leading-relaxed">
                    By signing up, you agree to our <br />
                    <a href="#" className="underline text-slate-400 hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
                </p>
            </footer>
        </PageWrapper>
    );
}
