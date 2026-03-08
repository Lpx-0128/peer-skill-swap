import React, { useState } from 'react';
import { Search, Bell, X, Trophy, GraduationCap, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Peer } from '../types';
import { PageWrapper } from './PageWrapper';
import { Avatar } from './Avatar';

export function ExploreScreen({ peers, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, onNotifications, unreadCount, onConnect }: any) {
    const [expandedPeerId, setExpandedPeerId] = useState<string | null>(null);

    const filteredPeers = peers.filter((peer: Peer) => {
        if (peer.connected) return false;

        const matchesSearch = (peer.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            peer.skillsToTeach?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
            peer.skillsToLearn?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = activeCategory === 'All Students' ||
            peer.skillsToTeach?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase())) ||
            (peer.badge && peer.badge.toLowerCase().includes(activeCategory.toLowerCase()));

        return (matchesSearch || false) && (matchesCategory || false);
    });

    return (
        <PageWrapper noTopPadding>
            <header className="sticky top-0 z-20 bg-[#0a0510]/80 backdrop-blur-md px-6 pt-6 pb-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-6">
                    <div className="w-10"></div>
                    <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
                    <button
                        onClick={onNotifications}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
                    >
                        <Bell className="size-5 text-slate-300" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold size-4 rounded-full flex items-center justify-center border-2 border-[#0a0510]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-500 transition-all outline-none"
                        placeholder="Search skills, students..."
                        type="text"
                    />
                </div>
            </header>

            <main className="px-6 pb-32">
                <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                    {categories.map((cat: string) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                                activeCategory === cat
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 auto-rows-min">
                    {filteredPeers.map((peer: Peer) => (
                        <PeerCard
                            key={peer.id}
                            peer={peer}
                            isExpanded={expandedPeerId === peer.id}
                            onToggle={() => setExpandedPeerId(expandedPeerId === peer.id ? null : peer.id)}
                            onConnect={onConnect}
                        />
                    ))}
                </div>
            </main>
        </PageWrapper>
    );
}

function PeerCard({ peer, isExpanded, onToggle, onConnect }: { peer: Peer, isExpanded: boolean, onToggle: () => void, onConnect: (id: string) => void, key?: string }) {
    return (
        <motion.div
            layout
            onClick={() => !isExpanded && onToggle()}
            className={cn(
                "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col transition-all cursor-pointer h-full relative",
                isExpanded ? "col-span-2 ring-2 ring-purple-500/50 z-10" : "col-span-1 hover:bg-white/10"
            )}
        >
            {isExpanded && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors z-20"
                >
                    <X className="size-4 text-slate-400" />
                </button>
            )}

            <div className={cn("flex gap-3 mb-4", isExpanded ? "flex-col items-center text-center mt-4" : "items-center")}>
                <Avatar src={peer.avatarUrl} alt={peer.username} className={cn("rounded-full border border-purple-500/30", isExpanded ? "size-20" : "w-9 h-9")} />
                <div className="flex-1">
                    <span className={cn("font-bold block", isExpanded ? "text-xl mt-2" : "text-sm truncate")}>{peer.username}</span>
                    {!isExpanded && (peer.ratingCount ?? 0) > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-amber-400">{peer.averageRating?.toFixed(1)}</span>
                            <span className="text-[10px] text-slate-600 ml-0.5">({peer.ratingCount})</span>
                        </div>
                    )}
                    {isExpanded && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                            {(peer.ratingCount ?? 0) > 0 ? (
                                <>
                                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-bold text-amber-400">{peer.averageRating?.toFixed(1)}</span>
                                    <span className="text-xs text-slate-500">· {peer.ratingCount} {peer.ratingCount === 1 ? 'rating' : 'ratings'}</span>
                                </>
                            ) : (
                                <span className="text-xs text-slate-600">No ratings yet</span>
                            )}
                        </div>
                    )}
                    {isExpanded && peer.badge && (
                        <div className={cn(
                            "inline-block px-2 py-0.5 rounded border mt-1",
                            peer.badge.includes('Coder') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                peer.badge.includes('Design') ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                    peer.badge.includes('Speaker') ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                        "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        )}>
                            <span className="text-[10px] font-bold">{peer.badge}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn("space-y-4", isExpanded ? "mt-2" : "mb-4")}>
                {isExpanded && peer.bio && (
                    <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">About</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{peer.bio}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">Teaches</p>
                        <div className="flex flex-wrap gap-1.5">
                            {isExpanded ? (
                                peer.skillsToTeach.map(skill => (
                                    <span key={skill} className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-full border border-purple-400/20">{skill}</span>
                                ))
                            ) : (
                                <p className="text-xs font-semibold text-purple-400">{peer.skillsToTeach[0]}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">Wants</p>
                        <div className="flex flex-wrap gap-1.5">
                            {isExpanded ? (
                                peer.skillsToLearn.map(skill => (
                                    <span key={skill} className="text-xs font-semibold text-slate-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">{skill}</span>
                                ))
                            ) : (
                                <p className="text-xs font-semibold">{peer.skillsToLearn[0]}</p>
                            )}
                        </div>
                    </div>
                </div>

                {isExpanded && peer.achievements && peer.achievements.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-3">Achievements</p>
                        <div className="space-y-2 text-left">
                            {peer.achievements.map(ach => (
                                <div key={ach.id} className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                                    <div className="bg-purple-500/10 p-1.5 rounded-lg text-purple-400">
                                        {ach.type === 'award' ? <Trophy className="size-3.5" /> : <GraduationCap className="size-3.5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-100 truncate">{ach.title}</h4>
                                        <p className="text-[10px] text-slate-500 truncate">{ach.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={cn("mt-auto", isExpanded ? "pt-6" : "")}>
                {!isExpanded && peer.badge && (
                    <div className={cn(
                        "inline-block px-2 py-0.5 rounded border mb-4",
                        peer.badge.includes('Coder') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            peer.badge.includes('Design') ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                peer.badge.includes('Speaker') ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                    "bg-purple-500/10 border-purple-500/20 text-purple-400"
                    )}>
                        <span className="text-[9px] font-bold">{peer.badge}</span>
                    </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onConnect(peer.id); }}
                    disabled={peer.requestSent}
                    className={cn(
                        "w-full font-bold py-2.5 rounded-xl transition-all active:scale-95",
                        isExpanded ? "text-sm py-3.5" : "text-xs",
                        peer.requestSent
                            ? "bg-slate-800 text-slate-400 cursor-default"
                            : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                    )}
                >
                    {peer.requestSent ? 'Request Sent' : 'Connect'}
                </button>
            </div>
        </motion.div>
    );
}
