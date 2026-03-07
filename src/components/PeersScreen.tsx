import React from 'react';
import { Users, Mail, Phone, Repeat } from 'lucide-react';
import { Peer } from '../types';
import { PageWrapper } from './PageWrapper';
import { Avatar } from './Avatar';

export function PeersScreen({ peers, onSwap }: { peers: Peer[], onSwap: (p: Peer) => void }) {
    return (
        <PageWrapper noTopPadding>
            <header className="sticky top-0 z-50 bg-[#0a0510]/80 backdrop-blur-md border-b border-white/10 px-4 py-5 flex items-center gap-3">
                <Users className="size-6 text-slate-100" />
                <h1 className="text-xl font-bold tracking-tight">My Peers</h1>
            </header>

            <main className="p-4 flex flex-col gap-6 pb-32">
                {peers.map((peer) => (
                    <div key={peer.id} className="bg-[#120b1a] rounded-[2.5rem] border border-white/10 p-6 shadow-lg">
                        <div className="flex items-center gap-4 mb-5">
                            <Avatar src={peer.avatarUrl} alt={peer.username} className="size-16 rounded-full ring-2 ring-purple-500/20" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-xl">{peer.username}</h3>
                                    <span className="text-[10px] uppercase tracking-widest text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">Connected</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-1">
                                    Swap: <span className="text-white font-semibold">{peer.swapOffering?.teach}</span> for <span className="text-white font-semibold">{peer.swapOffering?.learn}</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-black/40 rounded-3xl p-4 flex flex-col gap-3 border border-white/5">
                            <div className="flex items-center gap-3">
                                <Mail className="size-4 text-purple-500" />
                                <a href={`mailto:${peer.email}`} className="text-[15px] font-medium text-slate-100">{peer.email}</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="size-4 text-purple-500" />
                                <a href={`tel:${peer.contactNumber}`} className="text-[15px] font-medium text-slate-100">{peer.contactNumber}</a>
                            </div>
                        </div>
                        <button
                            onClick={() => onSwap(peer)}
                            className="w-full mt-4 bg-purple-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-500 active:scale-[0.98] transition-all"
                        >
                            <Repeat className="size-5" />
                            Swap
                        </button>
                    </div>
                ))}
                {peers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
                        <Users className="size-16 mb-4 opacity-10" />
                        <p className="text-lg font-medium">No connected peers yet</p>
                        <p className="text-sm text-slate-600 mt-1">Start exploring to find people to swap skills with!</p>
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
