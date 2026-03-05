import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function Avatar({ src, alt, className }: { src?: string, alt?: string, className?: string }) {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [src]);

    return (
        <div className={cn("overflow-hidden flex items-center justify-center bg-white/5", className)}>
            {!src || error ? (
                <UserIcon className="size-1/2 text-slate-500/50" />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            )}
        </div>
    );
}
