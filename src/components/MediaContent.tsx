import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';

export function MediaContent({ src, alt, className, controls = false, preview = false }: { src: string, alt?: string, className?: string, controls?: boolean, preview?: boolean }) {
    const [error, setError] = useState(false);
    const isVideo = src.match(/\.(mp4|mov|webm)(\?|$)|video/i);

    if (error || !src) {
        return (
            <div className={cn("flex flex-col items-center justify-center bg-white/5 text-slate-500", className)}>
                <div className="bg-purple-500/10 p-4 rounded-full mb-3">
                    <UploadCloud className="size-8 text-purple-500/50" />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Media Unavailable</p>
            </div>
        );
    }

    if (isVideo) {
        return (
            <video
                src={src}
                className={cn("object-cover", className)}
                controls={controls}
                muted={preview}
                autoPlay={preview}
                loop={preview}
                playsInline={preview}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn("object-cover", className)}
            onError={() => setError(true)}
        />
    );
}
