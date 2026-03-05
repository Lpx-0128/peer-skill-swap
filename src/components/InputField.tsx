import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export function InputField({ label, placeholder, type = "text", icon, value, onChange, error }: any) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="relative">
            <label className={cn("text-sm font-semibold mb-2 block ml-1 transition-colors", error ? "text-red-500" : "text-slate-300")}>{label}</label>
            <div className="relative group">
                <button
                    type="button"
                    onClick={() => isPassword && setShowPassword(!showPassword)}
                    className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10",
                        error ? "text-red-500" : "text-slate-500 group-focus-within:text-purple-500",
                        isPassword && !error && "hover:text-purple-400"
                    )}
                >
                    {isPassword ? (showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />) : icon}
                </button>
                <input
                    className={cn(
                        "w-full bg-[#16161a] border text-white transition-all outline-none rounded-2xl py-4 pl-12 pr-4",
                        error
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                            : "border-[#2d2d35] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    )}
                    placeholder={placeholder}
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                />
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
}
