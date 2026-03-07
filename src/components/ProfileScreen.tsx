import React from 'react';
import { Trophy, GraduationCap, X, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { PageWrapper } from './PageWrapper';
import { Avatar } from './Avatar';

export function ProfileScreen({ user, onEdit, onLogout }: { user: User, onEdit: () => void, onLogout: () => void }) {
    return (
        <PageWrapper noTopPadding>
            <header className="sticky top-0 z-50 bg-[#0a0510]/80 backdrop-blur-md border-b border-white/10 px-4 py-4 grid grid-cols-3 items-center">
                <div className="flex justify-start"></div>
                <h1 className="text-lg font-bold tracking-tight text-center">Profile</h1>
                <div className="flex justify-end">
                    <button onClick={onEdit} className="text-purple-500 text-sm font-semibold">Edit</button>
                </div>
            </header>

            <main className="px-4 pb-32">
                <div className="flex flex-col items-center py-8">
                    <div className="relative">
                        <div className="size-32 rounded-full border-4 border-purple-500/20 p-1 bg-white/5">
                            <Avatar src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full" />
                        </div>
                    </div>
                </div>

                <section className="space-y-6">
                    <div
                        onClick={onEdit}
                        className="space-y-4 bg-white/5 border border-dashed border-purple-500/30 rounded-3xl p-6 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.99] group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-4 flex-1">
                                <ProfileField label="Username" value={user.username} />
                                {user.bio && <ProfileField label="Bio" value={user.bio} />}
                                <ProfileField label="Contact Number" value={user.contactNumber} />
                                <ProfileField label="Email" value={user.email} />
                            </div>
                            <ArrowRight className="size-5 text-purple-500/50 group-hover:text-purple-500 transition-colors mt-1" />
                        </div>
                        <p className="text-[10px] text-purple-500/60 font-bold uppercase tracking-widest text-center pt-2 border-t border-white/5">Click to edit login details</p>
                    </div>

                    <div className="space-y-6 pt-4">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Skills to Teach</h2>
                            <div className="flex flex-wrap gap-2">
                                {user.skillsToTeach.map(skill => (
                                    <div key={skill} className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4">Skills to Learn</h2>
                            <div className="flex flex-wrap gap-2">
                                {user.skillsToLearn.map(skill => (
                                    <div key={skill} className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {user.achievements.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h2 className="text-xl font-bold">Achievements</h2>
                            <div className="space-y-3">
                                {user.achievements.map(ach => (
                                    <div key={ach.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-400 flex items-center justify-center">
                                            {ach.type === 'award' ? <Trophy className="size-5" /> : <GraduationCap className="size-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base">{ach.title}</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">{ach.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-8">
                        <button
                            onClick={onLogout}
                            className="w-full bg-white/5 border border-white/10 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <X className="size-5" />
                            Logout from Account
                        </button>
                    </div>
                </section>
            </main>
        </PageWrapper>
    );
}

function ProfileField({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <span className="text-xs font-semibold text-purple-500 mb-1 block uppercase tracking-widest">{label}</span>
            <p className="text-slate-100 text-lg font-medium">{value}</p>
        </div>
    );
}
