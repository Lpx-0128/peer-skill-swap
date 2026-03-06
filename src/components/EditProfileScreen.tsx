import React, { useState } from 'react';
import { X, Camera, Plus, Trash2, Trophy, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';
import { User } from '../types';
import { PageWrapper } from './PageWrapper';
import { Avatar } from './Avatar';

export function EditProfileScreen({ user, onBack, onSave }: { user: User, onBack: () => void, onSave: () => void }) {
    const [editedUser, setEditedUser] = useState<User>({ ...user });
    const [showPassword, setShowPassword] = useState(false);
    const [isAddingAchievement, setIsAddingAchievement] = useState(false);
    const [newAch, setNewAch] = useState({ title: '', subtitle: '', type: 'award' as 'award' | 'education' });
    const [loading, setLoading] = useState(false);

    const handleAddAchievement = () => {
        if (newAch.title && newAch.subtitle) {
            setEditedUser({
                ...editedUser,
                achievements: [
                    ...editedUser.achievements,
                    { ...newAch, id: Math.random().toString(36).substr(2, 9) }
                ]
            });
            setNewAch({ title: '', subtitle: '', type: 'award' });
            setIsAddingAchievement(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoading(true);
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                setEditedUser({ ...editedUser, avatarUrl: publicUrl });
            } catch (err: any) {
                alert(err.message || 'Error uploading photo');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    name: editedUser.name,
                    bio: editedUser.bio,
                    contact_number: editedUser.contactNumber,
                    university_email: editedUser.universityEmail,
                    avatar_url: editedUser.avatarUrl
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update skills (delete and re-insert for simplicity)
            await supabase.from('skills').delete().eq('profile_id', user.id);

            const skillsToInsert = [
                ...editedUser.skillsToTeach.map(s => ({ profile_id: user.id, skill_name: s, type: 'teach' })),
                ...editedUser.skillsToLearn.map(s => ({ profile_id: user.id, skill_name: s, type: 'learn' }))
            ];

            if (skillsToInsert.length > 0) {
                await supabase.from('skills').insert(skillsToInsert);
            }

            // Update achievements (delete and re-insert)
            await supabase.from('achievements').delete().eq('profile_id', user.id);

            const achsToInsert = editedUser.achievements.map(a => ({
                profile_id: user.id,
                title: a.title,
                subtitle: a.subtitle,
                type: a.type
            }));

            if (achsToInsert.length > 0) {
                await supabase.from('achievements').insert(achsToInsert);
            }

            onSave();
        } catch (err: any) {
            alert(err.message || 'Error saving profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper noTopPadding>
            <header className="sticky top-0 z-50 bg-[#0a0510]/80 backdrop-blur-md border-b border-white/10 px-4 py-4 grid grid-cols-3 items-center">
                <div className="flex justify-start">
                    <button onClick={onBack} className="text-slate-400">
                        <X className="size-6" />
                    </button>
                </div>
                <h1 className="text-lg font-bold tracking-tight text-center">Edit Profile</h1>
                <div className="flex justify-end">
                    <button onClick={handleSave} disabled={loading} className="text-purple-500 text-sm font-bold">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>


            <main className="pb-32 px-4">
                <div className="py-8">
                    <div className="relative border-2 border-dashed border-sky-500/50 rounded-2xl p-8 flex flex-col items-center gap-4 bg-sky-500/5">
                        <div className="relative">
                            <div className="size-32 rounded-full border-4 border-purple-500/20 p-1 bg-white/5">
                                <Avatar src={editedUser.avatarUrl} alt="Profile" className="w-full h-full rounded-full" />
                            </div>
                            <label
                                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2.5 rounded-full shadow-lg border-4 border-[#0a0510] hover:scale-105 transition-transform cursor-pointer"
                            >
                                <Camera className="size-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Change Profile Photo</p>
                    </div>
                </div>

                <section className="space-y-8">
                    <div className="space-y-8">
                        <SkillEditor
                            label="Skills to Teach"
                            skills={editedUser.skillsToTeach}
                            onRemove={(s) => setEditedUser({ ...editedUser, skillsToTeach: editedUser.skillsToTeach.filter(sk => sk !== s) })}
                            onAdd={(s) => {
                                if (!editedUser.skillsToTeach.includes(s)) {
                                    setEditedUser({ ...editedUser, skillsToTeach: [...editedUser.skillsToTeach, s] });
                                }
                            }}
                        />
                        <SkillEditor
                            label="Skills to Learn"
                            skills={editedUser.skillsToLearn}
                            onRemove={(s) => setEditedUser({ ...editedUser, skillsToLearn: editedUser.skillsToLearn.filter(sk => sk !== s) })}
                            onAdd={(s) => {
                                if (!editedUser.skillsToLearn.includes(s)) {
                                    setEditedUser({ ...editedUser, skillsToLearn: [...editedUser.skillsToLearn, s] });
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-6">
                        <EditField
                            label="Full Name"
                            value={editedUser.name}
                            onChange={(v) => setEditedUser({ ...editedUser, name: v })}
                        />
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">Bio</label>
                            <textarea
                                className="w-full bg-[#1a1625] border-none rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px] resize-none"
                                value={editedUser.bio}
                                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                            />
                        </div>
                        <EditField
                            label="Contact Number"
                            value={editedUser.contactNumber}
                            onChange={(v) => setEditedUser({ ...editedUser, contactNumber: v })}
                        />
                        <EditField
                            label="University Email"
                            value={editedUser.universityEmail}
                            onChange={(v) => setEditedUser({ ...editedUser, universityEmail: v })}
                        />
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">Change Password</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-[#1a1625] border-none rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none pr-12"
                                    type={showPassword ? "text" : "password"}
                                    defaultValue="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                                >
                                    {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Achievements</h2>
                            <button
                                onClick={() => setIsAddingAchievement(true)}
                                className="text-purple-500 text-sm font-bold flex items-center gap-1"
                            >
                                <Plus className="size-4" /> Add Achievement
                            </button>
                        </div>

                        {isAddingAchievement && (
                            <div className="bg-white/5 border border-purple-500/30 p-4 rounded-2xl space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Title</label>
                                    <input
                                        className="w-full bg-black/20 border-none rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                                        placeholder="e.g. Dean's List"
                                        value={newAch.title}
                                        onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Subtitle</label>
                                    <input
                                        className="w-full bg-black/20 border-none rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                                        placeholder="e.g. Academic Year 2023"
                                        value={newAch.subtitle}
                                        onChange={(e) => setNewAch({ ...newAch, subtitle: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewAch({ ...newAch, type: 'award' })}
                                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", newAch.type === 'award' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-400")}
                                    >
                                        Award
                                    </button>
                                    <button
                                        onClick={() => setNewAch({ ...newAch, type: 'education' })}
                                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", newAch.type === 'education' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-400")}
                                    >
                                        Education
                                    </button>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleAddAchievement}
                                        className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-xl text-sm"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setIsAddingAchievement(false)}
                                        className="flex-1 bg-white/5 text-slate-400 font-bold py-2 rounded-xl text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {editedUser.achievements.map(ach => (
                                <div key={ach.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400 flex items-center justify-center">
                                            {ach.type === 'award' ? <Trophy className="size-5" /> : <GraduationCap className="size-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base">{ach.title}</h3>
                                            <p className="text-xs text-slate-400 mt-1">{ach.subtitle}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEditedUser({ ...editedUser, achievements: editedUser.achievements.filter(a => a.id !== ach.id) })}
                                        className="text-red-400/80 hover:text-red-400 p-2"
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </PageWrapper>
    );
}

function EditField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">{label}</label>
            <input
                className="w-full bg-[#1a1625] border-none rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function SkillEditor({ label, skills, onRemove, onAdd }: { label: string, skills: string[], onRemove: (s: string) => void, onAdd: (s: string) => void }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const handleAdd = () => {
        const trimmed = newSkill.trim();
        if (trimmed && !skills.includes(trimmed)) {
            onAdd(trimmed);
            setNewSkill('');
            setIsAdding(false);
        } else if (skills.includes(trimmed)) {
            setNewSkill('');
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">{label}</label>
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-purple-500 text-[10px] font-bold flex items-center gap-1 border border-purple-500/30 rounded-full px-3 py-1 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                >
                    <Plus className="size-3" /> Add Skill
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2 pb-2">
                            <input
                                autoFocus
                                className="flex-1 bg-[#1a1625] border border-purple-500/30 rounded-xl py-2 px-4 text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                placeholder="Enter skill..."
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd();
                                    if (e.key === 'Escape') setIsAdding(false);
                                }}
                            />
                            <button
                                onClick={handleAdd}
                                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="bg-white/5 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                    <div key={skill} className="bg-purple-600 text-white pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
                        <span>{skill}</span>
                        <button onClick={() => onRemove(skill)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                            <X className="size-3.5" />
                        </button>
                    </div>
                ))}
                {skills.length === 0 && !isAdding && (
                    <p className="text-xs text-slate-500 italic px-1">No skills added yet</p>
                )}
            </div>
        </div>
    );
}
