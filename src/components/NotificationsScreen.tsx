import React from 'react';
import { ChevronLeft, Bell, Camera, Bolt, EyeOff, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { Notification } from '../types';
import { PageWrapper } from './PageWrapper';
import { Avatar } from './Avatar';
import { MediaContent } from './MediaContent';

export function NotificationsScreen({ notifications, onBack, onAccept, onDecline, onViewSwap }: {
    notifications: Notification[],
    onBack: () => void,
    onAccept: (n: Notification) => Promise<void>,
    onDecline: (n: Notification) => Promise<void>,
    onViewSwap: (n: Notification) => Promise<void>
}) {
    return (
        <PageWrapper noTopPadding>
            <header className="sticky top-0 z-50 bg-[#0a0510]/80 backdrop-blur-md border-b border-white/10 px-4 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                        <ChevronLeft className="size-6" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
                </div>
            </header>

            <main className="p-4 flex flex-col gap-5 pb-32">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                        <Bell className="size-16 mb-4 opacity-10" strokeWidth={1.5} />
                        <p className="text-lg font-medium">No new notifications</p>
                        <p className="text-sm text-slate-600 mt-1">We'll notify you when someone wants to swap!</p>
                    </div>
                ) : (
                    notifications.map(notif => {
                        const isSwapMedia = notif.title === 'New Swap Media';

                        return (
                            <div key={notif.id} className="bg-[#120b1a] rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/20">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="relative flex-shrink-0">
                                        <Avatar src={notif.sender.avatarUrl} alt={notif.sender.username} className="size-14 rounded-full border-2 border-purple-500/50" />
                                        <div className="absolute -bottom-1 -right-1 bg-purple-600 size-5 rounded-full flex items-center justify-center border-2 border-[#120b1a]">
                                            {isSwapMedia ? <Camera className="size-3 text-white fill-white" /> : <Bolt className="size-3 text-white fill-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-lg truncate">{notif.sender.username}</h3>
                                            <span className={cn(
                                                "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                                                isSwapMedia ? "text-sky-400 bg-sky-400/10" : "text-purple-500 bg-purple-500/10"
                                            )}>
                                                {isSwapMedia ? 'New Media' : 'New Request'}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">
                                            {isSwapMedia ? `Shared new media: ${notif.content.replace('shared new media: ', '')}` : notif.content}
                                        </p>
                                    </div>
                                </div>

                                {isSwapMedia && notif.media_url && (
                                    <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-white/10 bg-black/40">
                                        <MediaContent src={notif.media_url} alt="Shared preview" className="w-full h-full" preview />
                                    </div>
                                )}

                                {!isSwapMedia && (
                                    <div className="bg-black/20 rounded-xl p-3.5 flex items-start gap-3 mb-5 border border-dashed border-white/10">
                                        <EyeOff className="size-4 text-slate-500 mt-0.5" />
                                        <p className="text-xs text-slate-400 leading-relaxed italic">
                                            Contact info is hidden. Accept to reveal {notif.sender.username}'s email and phone number.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {isSwapMedia ? (
                                        <>
                                            <button
                                                onClick={() => onViewSwap(notif)}
                                                className="flex-1 bg-sky-600 text-white font-bold py-3 rounded-full hover:bg-sky-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye className="size-4" />
                                                View Swap
                                            </button>
                                            <button
                                                onClick={() => onDecline(notif)} // Re-using onDecline as Dismiss
                                                className="px-6 bg-white/5 text-slate-400 font-bold py-3 rounded-full hover:bg-white/10 active:scale-[0.98] transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onAccept(notif)}
                                                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-full hover:bg-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/20"
                                            >
                                                Accept Request
                                            </button>
                                            <button
                                                onClick={() => onDecline(notif)}
                                                className="flex-1 bg-white/5 text-slate-300 font-bold py-3 rounded-full hover:bg-white/10 active:scale-[0.98] transition-all"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </PageWrapper>
    );
}
