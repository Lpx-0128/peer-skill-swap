import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function SkillSelector({ label, color, suggestions, activeSkills: initialSkills, onChange }: any) {
    const [skills, setSkills] = useState<string[]>(initialSkills || []);
    const [inputValue, setInputValue] = useState('');
    const colorClass = color === 'emerald' ? 'emerald' : 'purple';

    const addSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !skills.includes(trimmed) && skills.length < 5) {
            const newSkills = [...skills, trimmed];
            setSkills(newSkills);
            onChange?.(newSkills);
        }
        setInputValue('');
    };

    const removeSkill = (skill: string) => {
        const newSkills = skills.filter(s => s !== skill);
        setSkills(newSkills);
        onChange?.(newSkills);
    };

    return (
        <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold mb-3 block text-slate-300 ml-1 flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", colorClass === 'emerald' ? "bg-emerald-500" : "bg-purple-500")}></span>
                {label}
            </label>
            <div className="bg-[#16161a] border border-[#2d2d35] rounded-2xl p-4">
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
                        {skills.map((skill: string) => (
                            <span key={skill} className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold",
                                colorClass === 'emerald' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                            )}>
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="hover:bg-white/10 rounded-full p-0.5"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-bold">Suggested Options</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s: string) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => addSkill(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full bg-[#0a0a0c] border border-[#2d2d35] text-xs text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-all",
                                    (skills.includes(s) || skills.length >= 5) && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={skills.includes(s) || skills.length >= 5}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative border-t border-[#2d2d35] pt-3">
                    <input
                        className={cn(
                            "w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-white placeholder:text-slate-600 outline-none",
                            skills.length >= 5 && "cursor-not-allowed opacity-50"
                        )}
                        placeholder={skills.length >= 5 ? "Maximum skills reached" : "Add a skill..."}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={skills.length >= 5}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill(inputValue);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
