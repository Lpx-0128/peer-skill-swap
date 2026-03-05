import React from 'react';
import { cn } from '../lib/utils';

export function PageWrapper({ children, className = "", noTopPadding = false }: { children: React.ReactNode, className?: string, noTopPadding?: boolean }) {
    return (
        <div className={cn(
            "max-w-md mx-auto w-full min-h-screen flex flex-col px-6",
            !noTopPadding && "pt-12",
            className
        )}>
            {children}
        </div>
    );
}
